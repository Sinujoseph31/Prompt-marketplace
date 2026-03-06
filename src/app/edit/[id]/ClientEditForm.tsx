'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ImageUploadField from '@/components/ImageUploadField'
import RichTextEditor from '@/components/RichTextEditor'
import ModelCategorySelector from '@/components/ModelCategorySelector'
import AiPromptEnhancer from '@/components/AiPromptEnhancer'
import { updatePrompt } from '@/app/actions/prompts'

function FormMessages() {
    const searchParams = useSearchParams()
    const message = searchParams.get('message')
    if (!message) return null
    return (
        <div className="p-4 bg-destructive/15 text-destructive border border-destructive/30 rounded-lg text-sm font-medium animate-in fade-in zoom-in-95 duration-300">
            {message}
        </div>
    )
}

export default function ClientEditForm({ prompt }: { prompt: any }) {
    const [fullPrompt, setFullPrompt] = useState(prompt.full_prompt)

    return (
        <form action={updatePrompt} className="flex flex-col gap-6">
            <Suspense fallback={null}>
                <FormMessages />
            </Suspense>

            <input type="hidden" name="prompt_id" value={prompt.id} />

            <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required defaultValue={prompt.title} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Description (Explain your prompt in detail)</Label>
                <RichTextEditor name="description" defaultValue={prompt.description} />
            </div>

            <ModelCategorySelector defaultCategory={prompt.category} defaultSubcategory={prompt.subcategory} />

            <div className="grid gap-2">
                <Label htmlFor="price">Price (USD) - Optional</Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={prompt.price} />
            </div>

            <div className="border p-4 rounded-xl bg-muted/20 flex flex-col gap-4">
                <div className="text-sm font-medium">Images</div>
                <p className="text-xs text-muted-foreground">
                    Your prompt currently has {prompt.preview_images?.length || (prompt.preview_image ? 1 : 0)} image(s) saved.
                    If you leave this section blank, your existing images will remain exactly as they are.
                    If you select new files or URLs below, ALL previous images will be permanently replaced.
                </p>
                <ImageUploadField />
            </div>

            <div className="grid gap-2 border p-4 rounded-xl bg-muted/10 shadow-sm border-dashed">
                <Label htmlFor="preview_video_file" className="text-foreground">Upload Video Preview (Optional)</Label>
                <Input id="preview_video_file" name="preview_video_file" type="file" accept="video/mp4,video/webm" className="cursor-pointer bg-background" />
                <p className="text-xs text-muted-foreground">
                    {prompt.preview_video ? "You currently have a video saved. Uploading a new one replaces it." : "Max 10MB. MP4 or WebM formats supported. Plays automatically on marketplace hover."}
                </p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="full_prompt">The Prompt Itself</Label>
                <Textarea
                    id="full_prompt"
                    name="full_prompt"
                    required
                    defaultValue={prompt.full_prompt}
                    rows={6}
                    className="font-mono text-sm"
                    value={fullPrompt}
                    onChange={(e) => setFullPrompt(e.target.value)}
                />
                <AiPromptEnhancer fullPrompt={fullPrompt} onUpdate={setFullPrompt} />
            </div>

            <div className="flex gap-4">
                <Button type="button" variant="outline" className="w-full" asChild>
                    <a href={`/prompt/${prompt.id}`}>Cancel</a>
                </Button>
                <Button type="submit" size="lg" className="w-full">
                    Save Changes
                </Button>
            </div>
        </form>
    )
}
