import { getActiveBattle, getBattleEntries } from '@/app/actions/battles'
import { createClient } from '@/utils/supabase/server'
import ArenaDashboard from './ArenaDashboard'
import { ShieldAlert } from 'lucide-react'

// This component runs on the server and fetches all necessary initial data
export default async function ArenaPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch the active battle
    const { battle, error: battleError } = await getActiveBattle()

    if (battleError) {
        return (
            <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <ShieldAlert className="w-12 h-12 mb-4 text-red-500" />
                <h2 className="text-xl font-bold">Error Loading Arena</h2>
                <p>{battleError}</p>
            </div>
        )
    }

    if (!battle) {
        return (
            <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <h2 className="text-2xl font-bold text-foreground">The Arena is Quiet...</h2>
                <p>There are no active battles right now. Check back soon!</p>
            </div>
        )
    }

    // Fetch entries for the active battle
    const { entries, error: entriesError } = await getBattleEntries(battle.id)

    // Check if current user has already submitted to this battle
    let userHasEntered = false;
    if (user && entries) {
        userHasEntered = entries.some(entry => entry.user_id === user.id)
    }

    return (
        <div className="w-full bg-background min-h-screen">
            {/* The client-side dashboard that handles interactions */}
            <ArenaDashboard
                battle={battle}
                entries={entries || []}
                userHasEntered={userHasEntered}
                isLoggedIn={!!user}
            />
        </div>
    )
}
