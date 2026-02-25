'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addComment(promptId: string, content: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('You must be logged in to comment')
    }

    if (!content.trim()) {
        throw new Error('Comment cannot be empty')
    }

    const { error } = await supabase.from('comments').insert({
        prompt_id: promptId,
        user_id: user.id,
        content: content.trim()
    })

    if (error) {
        console.error('Error adding comment:', error)
        throw new Error('Failed to add comment')
    }

    revalidatePath(`/prompt/${promptId}`)
}
