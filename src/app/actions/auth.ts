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
