'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function submitPrompt(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const subcategory = formData.get('subcategory') as string
    const full_prompt = formData.get('full_prompt') as string
    const priceStr = formData.get('price') as string
    const price = priceStr ? parseFloat(priceStr) : 0
    // Process manually entered URLs
    const urlsString = formData.get('preview_image_urls') as string || ''
    const manualUrls = urlsString.split(',').map(s => s.trim()).filter(s => s.length > 0)

    // Process uploaded files
    const uploadedUrls: string[] = []
    const preview_files = formData.getAll('preview_files') as File[]

    if (preview_files.length > 0) {
        for (const file of preview_files) {
            if (file.size > 0 && file.name) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
                const filePath = `${user.id}/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('prompt-images')
                    .upload(filePath, file)

                if (uploadError) {
                    console.error('File upload error:', uploadError)
                    redirect('/submit?message=Failed to upload one or more images')
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('prompt-images')
                    .getPublicUrl(filePath)

                uploadedUrls.push(publicUrl)
            }
        }
    }

    // Process primary image selection
    const primaryType = formData.get('primary_image_type') as string || 'file'
    const primaryIndexStr = formData.get('primary_image_index') as string || '0'
    const primaryIndex = parseInt(primaryIndexStr, 10)

    let allPreviewImages = [...uploadedUrls, ...manualUrls]

    // Determine the primary image and move it to index 0
    let primaryUrl = ''

    if (primaryType === 'file' && uploadedUrls.length > primaryIndex) {
        primaryUrl = uploadedUrls[primaryIndex]
    } else if (primaryType === 'url' && manualUrls.length > primaryIndex) {
        primaryUrl = manualUrls[primaryIndex]
    }

    // Attempt to reorder so primary image is first
    if (primaryUrl) {
        allPreviewImages = [
            primaryUrl,
            ...allPreviewImages.filter(url => url !== primaryUrl)
        ]
    }

    // Process video file
    let preview_video = null;
    const preview_video_file = formData.get('preview_video_file') as File;

    if (preview_video_file && preview_video_file.size > 0 && preview_video_file.name) {
        const fileExt = preview_video_file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}_video.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: videoUploadError } = await supabase.storage
            .from('prompt-images')
            .upload(filePath, preview_video_file);

        if (!videoUploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('prompt-images')
                .getPublicUrl(filePath);
            preview_video = publicUrl;
        } else {
            console.error('Video upload error:', videoUploadError);
        }
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

    // Gemini AI Moderation (Basic check for NSFW/Dangerous content)
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (apiKey) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey)
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

            const moderationPrompt = `
            Analyze this prompt listing for a marketplace. If it contains highly offensive, explicit NSFW, illegal acts, or dangerous content, respond strictly with 'UNSAFE'. Otherwise respond with 'SAFE'. 
            Title: ${title}
            Description: ${description.replace(/<[^>]*>?/gm, '')}
            Prompt text: ${full_prompt}
            `

            const response = await model.generateContent(moderationPrompt)
            const text = response.response.text();

            if (text.includes('UNSAFE')) {
                // Return them to submit page with a specific error
                redirect('/submit?message=Violation: Your prompt contains unsafe content flagged by moderation.')
            }
        } catch (error: any) {
            console.error('Moderation Failed:', error);
            // If moderation logic fails, we can let it proceed to "pending" or block it. 
            // We'll proceed to pending so human admin can review.
        }
    }

    const { data: newPrompt, error } = await supabase.from('prompts').insert({
        seller_id: user.id,
        title,
        description,
        category,
        subcategory,
        full_prompt,
        price,
        preview_image: allPreviewImages.length > 0 ? allPreviewImages[0] : null,
        preview_images: allPreviewImages,
        preview_video,
        status: profile?.role === 'admin' ? 'approved' : 'pending'
    }).select('id').single()

    if (error || !newPrompt) {
        console.error('Submit error:', error)
        redirect('/submit?message=Failed to submit prompt')
    }

    revalidatePath('/')
    revalidatePath('/admin')
    redirect(`/prompt/${newPrompt.id}`)
}

export async function updatePrompt(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const promptId = formData.get('prompt_id') as string
    if (!promptId) redirect('/')

    // Verify ownership or admin status before updating
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const { data: existingPrompt } = await supabase.from('prompts').select('*').eq('id', promptId).single()

    if (!existingPrompt) redirect('/')
    if (existingPrompt.seller_id !== user.id && profile?.role !== 'admin') {
        redirect('/')
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const subcategory = formData.get('subcategory') as string
    const full_prompt = formData.get('full_prompt') as string
    const priceStr = formData.get('price') as string
    const price = priceStr ? parseFloat(priceStr) : 0

    // Process manually entered URLs
    const urlsString = formData.get('preview_image_urls') as string || ''
    const manualUrls = urlsString.split(',').map(s => s.trim()).filter(s => s.length > 0)

    // Process uploaded files
    const uploadedUrls: string[] = []
    const preview_files = formData.getAll('preview_files') as File[]

    let hasNewImages = false

    if (preview_files.length > 0) {
        for (const file of preview_files) {
            if (file.size > 0 && file.name) {
                hasNewImages = true
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
                const filePath = `${user.id}/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('prompt-images')
                    .upload(filePath, file)

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('prompt-images')
                        .getPublicUrl(filePath)
                    uploadedUrls.push(publicUrl)
                }
            }
        }
    }

    if (manualUrls.length > 0) hasNewImages = true

    // Process video file
    const preview_video_file = formData.get('preview_video_file') as File;
    let new_preview_video: string | null = null;
    let hasNewVideo = false;

    if (preview_video_file && preview_video_file.size > 0 && preview_video_file.name) {
        hasNewVideo = true;
        const fileExt = preview_video_file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}_video.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: videoUploadError } = await supabase.storage
            .from('prompt-images')
            .upload(filePath, preview_video_file);

        if (!videoUploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('prompt-images')
                .getPublicUrl(filePath);
            new_preview_video = publicUrl;
        } else {
            console.error('Video upload error:', videoUploadError);
        }
    }

    // Prepare update payload
    const updateData: any = {
        title,
        description,
        category,
        subcategory,
        full_prompt,
        price,
    }

    if (hasNewVideo && new_preview_video) {
        updateData.preview_video = new_preview_video;
    }

    // Only update images if the user provided new ones; otherwise, leave them alone
    if (hasNewImages) {
        const primaryType = formData.get('primary_image_type') as string || 'file'
        const primaryIndexStr = formData.get('primary_image_index') as string || '0'
        const primaryIndex = parseInt(primaryIndexStr, 10)

        let allPreviewImages = [...uploadedUrls, ...manualUrls]
        let primaryUrl = ''

        if (primaryType === 'file' && uploadedUrls.length > primaryIndex) {
            primaryUrl = uploadedUrls[primaryIndex]
        } else if (primaryType === 'url' && manualUrls.length > primaryIndex) {
            primaryUrl = manualUrls[primaryIndex]
        }

        if (primaryUrl) {
            allPreviewImages = [
                primaryUrl,
                ...allPreviewImages.filter(url => url !== primaryUrl)
            ]
        }

        updateData.preview_image = allPreviewImages.length > 0 ? allPreviewImages[0] : null
        updateData.preview_images = allPreviewImages
    }

    const { error } = await supabase.from('prompts').update(updateData).eq('id', promptId)

    if (error) {
        console.error('Update error:', error)
        redirect(`/edit/${promptId}?message=Failed to update prompt`)
    }

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath(`/prompt/${promptId}`)
    redirect(`/prompt/${promptId}`)
}
