'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

export default function SearchBar() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [query, setQuery] = useState(searchParams.get('q') || '')
    const isFirstRender = useRef(true)

    // Debounced search trigger when user types
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        const timer = setTimeout(() => {
            const currentParams = new URLSearchParams(Array.from(searchParams.entries()))
            if (query.trim()) {
                currentParams.set('q', query.trim())
            } else {
                currentParams.delete('q')
            }
            router.push(`/search?${currentParams.toString()}`)
        }, 300)

        return () => clearTimeout(timer)
    }, [query, router]) // Intentional: Do not include searchParams to avoid loop

    // Hydrate the visual search bar if the URL changes externally (e.g. Back button)
    useEffect(() => {
        const q = searchParams.get('q') || ''
        setQuery(q)
    }, [searchParams])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        // The debounce will handle the actual search, but if user explicitly hits enter, we can do it immediately:
        const currentParams = new URLSearchParams(Array.from(searchParams.entries()))
        if (query.trim()) {
            currentParams.set('q', query.trim())
        } else {
            currentParams.delete('q')
        }
        router.push(`/search?${currentParams.toString()}`)
    }

    return (
        <form onSubmit={handleSearch} className="relative w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search prompts..."
                className="w-full h-10 pl-10 pr-4 rounded-full border border-input bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
        </form>
    )
}
