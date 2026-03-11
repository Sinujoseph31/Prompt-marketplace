'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        redirect('/login')
    }

    const name = formData.get('name') as string
    const bio = formData.get('bio') as string
    const avatarFile = formData.get('avatar') as File | null

    let avatar_url: string | undefined = undefined

    // Upload new avatar if provided
    if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split('.').pop()
        // We use a timestamp to prevent browser caching of the old image URL
        const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatarFile, { upsert: true })

        if (uploadError) {
            console.error('Avatar upload error:', uploadError)
            return redirect('/profile?error=Uh oh! We had a problem uploading your avatar.')
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
            
        avatar_url = publicUrl
    }

    const updatePayload: any = { name, bio }
    if (avatar_url) {
        updatePayload.avatar_url = avatar_url
    }

    const { error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)

    if (updateError) {
        console.error('Profile update error:', updateError)
        return redirect('/profile?error=Oops! We couldn’t save your profile details.')
    }

    revalidatePath('/profile')
    // Also revalidate the user's public portfolio page so updates show immediately
    revalidatePath(`/user/${user.id}`)
    
    redirect('/profile?message=Profile updated successfully!')
}
