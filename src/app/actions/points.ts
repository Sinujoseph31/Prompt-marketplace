'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUserPoints() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error fetching points:', error)
        return { success: false, error: 'Failed to fetch points' }
    }

    return { success: true, points: data.points }
}

export async function awardPoints(amount: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase.rpc('award_points_rpc', { p_amount: amount })

    if (error) {
        console.error('Error awarding points:', error)
        return { success: false, error: 'Failed to award points' }
    }

    revalidatePath('/')
    
    return { success: true, ...data }
}

export async function checkRevealStatus(promptId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return { success: false, revealed: false }
    }

    const { data: prompt } = await supabase
        .from('prompts')
        .select('seller_id')
        .eq('id', promptId)
        .single()
        
    if (prompt?.seller_id === user.id) {
        return { success: true, revealed: true } // sellers always see their own
    }

    const { data, error } = await supabase
        .from('prompt_reveals')
        .select('id')
        .eq('user_id', user.id)
        .eq('prompt_id', promptId)
        .maybeSingle()

    if (error) {
        console.error('Error checking reveal status:', error)
        return { success: false, error: 'Failed to check status' }
    }

    return { success: true, revealed: !!data }
}

export async function revealPrompt(promptId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    const { data, error } = await supabase.rpc('reveal_prompt_rpc', { p_prompt_id: promptId })

    if (error) {
        console.error('Error revealing prompt:', error)
        return { success: false, error: error.message || 'Failed to reveal prompt' }
    }

    revalidatePath(`/prompt/${promptId}`)
    
    return { success: true, ...data }
}
