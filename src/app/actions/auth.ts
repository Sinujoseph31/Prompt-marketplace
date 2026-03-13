'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in production, use a library like zod to validate the form
    let email = formData.get('email') as string
    if (email.toLowerCase() === 'admin') {
        email = 'admin@example.com'
    }

    const data = {
        email,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error('Login error:', error)
        redirect(`/login?message=Could not authenticate user: ${error.message}`)
    }

    // Check if password reset is required right away
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('must_change_password').eq('id', user.id).maybeSingle()
        if (profile?.must_change_password) {
            revalidatePath('/', 'layout')
            redirect('/reset-password')
        }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            data: {
                full_name: formData.get('name') as string,
            }
        }
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
        console.error('Signup error:', error)
        redirect(`/signup?message=Could not authenticate user: ${error.message}`)
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Account created successfully. Please log in to continue.')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function sendMagicLink(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) {
        redirect('/login?message=Email is required for magic link.')
    }

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            // Usually we'd infer the host from headers, but for safety we'll point exactly to the callback.
            // In production, ensure NEXT_PUBLIC_SITE_URL is set in Vercel.
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        console.error('Magic link error:', error)
        redirect(`/login?message=Could not send magic link: ${error.message}`)
    }

    redirect('/login?message=Check your email for the magic link! You can close this window.')
}

export async function resetPasswordForEmail(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) {
        redirect('/forgot-password?message=Email is required.')
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
    })

    if (error) {
        console.error('Password reset error:', error)
        redirect(`/forgot-password?message=Could not send reset link: ${error.message}`)
    }

    redirect('/forgot-password?message=Password reset link sent! Please check your email to continue.')
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string

    if (!password) {
        redirect('/update-password?message=Password is required.')
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        console.error('Update password error:', error.message)
        redirect(`/update-password?message=Failed to update password: ${error.message}`)
    }

    // Optionally check if we need to remove the "must_change_password" flag introduced in Phase 2
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id)
    }

    redirect('/login?message=Password updated successfully. Please log in with your new password.')
}
