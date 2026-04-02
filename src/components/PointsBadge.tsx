'use client'

import { Coins } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function PointsBadge({ initialPoints }: { initialPoints: number }) {
    // Note: since navbar is a Server Component, when server actions call revalidatePath,
    // this component will receive updated initialPoints as props.
    // We keep it as local state just in case we need optimistic updates,
    // but typically it syncs with the prop.
    const [points, setPoints] = useState(initialPoints)

    useEffect(() => {
        setPoints(initialPoints)
    }, [initialPoints])

    return (
        <div className="flex items-center gap-1.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-500 px-3 py-1.5 rounded-full font-bold text-sm tracking-tight border border-amber-200 dark:border-amber-900/50 shadow-sm mr-2" title="Your Points">
            <Coins className="w-4 h-4" />
            <span>{points}</span>
        </div>
    )
}
