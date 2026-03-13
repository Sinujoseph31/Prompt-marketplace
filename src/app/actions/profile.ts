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
    const removeAvatar = formData.get('remove_avatar') as string | null

    let avatar_url: string | null | undefined = undefined

    // Handle explicit avatar removal request
    if (removeAvatar === 'true') {
        avatar_url = null
    }

    // Upload new avatar if one was provided by the client interceptor
    if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split('.').pop() || 'jpeg'
        // Timestamp in filename prevents browser caching of old avatar
        const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, avatarFile, { upsert: true })

        if (uploadError) {
            console.error('Avatar upload error:', uploadError)
            return redirect('/profile?error=Uh oh! We had a problem uploading your avatar. Please try again with a smaller image.')
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
            
        avatar_url = publicUrl
    }

    const updatePayload: any = { name, bio }
    if (avatar_url !== undefined) {
        updatePayload.avatar_url = avatar_url
    }

    const { error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)

    if (updateError) {
        console.error('Profile update error:', updateError)
        return redirect('/profile?error=Oops! We couldn\'t save your profile details. Please try again.')
    }

    revalidatePath('/profile')
    revalidatePath(`/user/${user.id}`)
    
    redirect('/profile?message=Profile updated successfully!')
}
