'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not logged in')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') throw new Error('Not admin')

    return supabase
}

export async function approveUser(userId: string) {
    const supabase = await checkAdmin()
    await supabase.from('profiles').update({ approved: true }).eq('id', userId)
    revalidatePath('/admin')
}

export async function updatePromptStatus(promptId: string, status: 'approved' | 'rejected') {
    const supabase = await checkAdmin()
    await supabase.from('prompts').update({ status }).eq('id', promptId)
    revalidatePath('/admin')
    revalidatePath('/')
}

export async function deletePrompt(promptId: string) {
    const supabase = await checkAdmin()
    await supabase.from('prompts').delete().eq('id', promptId)
    revalidatePath('/admin')
    revalidatePath('/')
}

export async function makeSeller(userId: string) {
    const supabase = await checkAdmin()
    await supabase.from('profiles').update({ role: 'seller', approved: true }).eq('id', userId)
    revalidatePath('/admin')
}

export async function makeAdmin(userId: string) {
    const supabase = await checkAdmin()
    await supabase.from('profiles').update({ role: 'admin', approved: true }).eq('id', userId)
    revalidatePath('/admin')
}
