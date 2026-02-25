'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const newPassword = formData.get('password') as string

    // 1. Update the password in Auth
    const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
    })

    if (authError) {
        console.error('Password reset auth error:', authError)
        redirect('/reset-password?message=' + encodeURIComponent(authError.message))
    }

    // 2. Clear the must_change_password flag
    const { error: dbError } = await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', user.id)

    if (dbError) {
        console.error('Password reset db error:', dbError)
        redirect('/reset-password?message=Failed to update profile flags')
    }

    revalidatePath('/admin')
    redirect('/admin')
}
