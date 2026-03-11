import { Loader2 } from 'lucide-react'

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-4 bg-card/50 p-6 rounded-2xl shadow-sm border">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide">Loading...</p>
            </div>
        </div>
    )
}
