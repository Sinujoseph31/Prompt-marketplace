'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Define types
export type Battle = {
    id: string;
    theme_name: string;
    theme_description: string;
    starts_at: string;
    ends_at: string | null;
    is_active: boolean;
}

export type BattleEntry = {
    id: string;
    battle_id: string;
    user_id: string;
    prompt_text: string;
    image_url: string | null;
    votes_count: number;
    created_at: string;
    profiles: {
        name: string;
    } | null;
    user_has_voted?: boolean; // Hydrated on the client side
}

/**
 * Fetch the currently active battle
 */
export async function getActiveBattle(): Promise<{ battle: Battle | null, error: string | null }> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('battles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
        console.error("Error fetching active battle:", error)
        return { battle: null, error: "Failed to fetch active battle." }
    }

    return { battle: data as Battle | null, error: null }
}

/**
 * Fetch leaderboard entries for a specific battle
 */
export async function getBattleEntries(battleId: string): Promise<{ entries: BattleEntry[] | null, error: string | null }> {
    const supabase = await createClient()

    // Get the current user to check if they've voted
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Fetch entries with profile data
    const { data: entriesData, error: entriesError } = await supabase
        .from('battle_entries')
        .select('*, profiles(name)')
        .eq('battle_id', battleId)
        .order('votes_count', { ascending: false })
        .order('created_at', { ascending: false })

    if (entriesError) {
        console.error("Error fetching battle entries:", entriesError)
        return { entries: null, error: "Failed to load leaderboard." }
    }

    let entries = entriesData as BattleEntry[];

    // 2. If user is logged in, attach their vote status
    if (user && entries.length > 0) {
        const entryIds = entries.map(e => e.id);

        const { data: userVotes, error: votesError } = await supabase
            .from('battle_votes')
            .select('entry_id')
            .eq('user_id', user.id)
            .in('entry_id', entryIds)

        if (!votesError && userVotes) {
            const votedEntryIds = new Set(userVotes.map(v => v.entry_id));
            entries = entries.map(entry => ({
                ...entry,
                user_has_voted: votedEntryIds.has(entry.id)
            }))
        }
    }

    return { entries, error: null }
}

/**
 * Submit a new prompt entry to a battle
 */
export async function submitBattleEntry(battleId: string, promptText: string, imageUrl?: string): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "You must be logged in to enter the battle." }
    }

    if (!promptText.trim()) {
        return { error: "Prompt text cannot be empty." }
    }

    // Check if user already submitted to this battle
    const { count } = await supabase
        .from('battle_entries')
        .select('*', { count: 'exact', head: true })
        .eq('battle_id', battleId)
        .eq('user_id', user.id)

    if (count && count > 0) {
        return { error: "You have already submitted an entry for this battle!" }
    }

    const { error } = await supabase
        .from('battle_entries')
        .insert({
            battle_id: battleId,
            user_id: user.id,
            prompt_text: promptText,
            image_url: imageUrl || null
        })

    if (error) {
        console.error("Error submitting entry:", error)
        return { error: error.message || "Failed to submit entry." }
    }

    revalidatePath('/arena')
    return { error: null }
}

/**
 * Toggle an upvote on an entry
 */
export async function toggleUpvote(entryId: string): Promise<{ error: string | null }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "You must be logged in to vote." }
    }

    // Call the RPC function we made in the migration
    const { error } = await supabase.rpc('toggle_battle_vote', {
        p_entry_id: entryId,
        p_user_id: user.id
    })

    if (error) {
        console.error("Error toggling vote:", error)
        return { error: "Failed to register vote." }
    }

    revalidatePath('/arena')
    return { error: null }
}
