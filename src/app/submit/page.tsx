'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitPrompt } from '@/app/actions/prompts'
import ImageUploadField from '@/components/ImageUploadField'
import RichTextEditor from '@/components/RichTextEditor'
import ModelCategorySelector from '@/components/ModelCategorySelector'
import AiPromptEnhancer from '@/components/AiPromptEnhancer'

export default function SubmitPage() {
    const supabase = createClient()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [fullPrompt, setFullPrompt] = useState('')

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
            } else {
                setUser(user)
            }
        }
        fetchUser()
    }, [router, supabase.auth])

    if (!user) return null;

    // We no longer block buyers from submitting prompts.
    // They will be set to 'pending' automatically by the server action.

    return (
        <div className="w-full max-w-2xl px-5 py-8 flex flex-col gap-8 mx-auto mt-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Submit a Prompt</h1>
                <p className="text-muted-foreground mt-2">
                    Share your best AI prompts with the community.
                </p>
            </div>

            <form action={submitPrompt} className="flex flex-col gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required placeholder="e.g. Masterful Blog Post Creator" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description (Explain your prompt in detail)</Label>
                    <RichTextEditor name="description" />
                </div>

                <ModelCategorySelector />

                <div className="grid gap-2">
                    <Label htmlFor="price">Price (USD) - Optional</Label>
                    <Input id="price" name="price" type="number" step="0.01" min="0" placeholder="0.00" />
                </div>

                <ImageUploadField />

                <div className="grid gap-2 border p-4 rounded-xl bg-muted/10 shadow-sm border-dashed">
                    <Label htmlFor="preview_video_file" className="text-foreground">Upload Video Preview (Optional)</Label>
                    <Input id="preview_video_file" name="preview_video_file" type="file" accept="video/mp4,video/webm" className="cursor-pointer bg-background" />
                    <p className="text-xs text-muted-foreground">Max 10MB. MP4 or WebM formats supported. Plays automatically on marketplace hover.</p>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="full_prompt">The Prompt Itself</Label>
                    <Textarea
                        id="full_prompt"
                        name="full_prompt"
                        required
                        placeholder="Enter the exact prompt text here..."
                        rows={6}
                        className="font-mono text-sm"
                        value={fullPrompt}
                        onChange={(e) => setFullPrompt(e.target.value)}
                    />
                    <AiPromptEnhancer fullPrompt={fullPrompt} onUpdate={setFullPrompt} />
                </div>

                <Button type="submit" size="lg" className="w-full">
                    Submit for Review
                </Button>
            </form>
        </div>
    )
}
