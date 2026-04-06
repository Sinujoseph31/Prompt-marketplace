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
import { Badge } from '@/components/ui/badge'
import { SubmitButton } from '@/components/SubmitButton'
import { updatePrompt } from '@/app/actions/prompts'
import { ExternalLink } from 'lucide-react'
import { getAiInterfaceUrl } from '@/utils/ai-interfaces'

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
    const [accumulatedFiles, setAccumulatedFiles] = useState<File[]>([])

    // Advanced Form Action interceptor to append our dynamically tracked files
    // without relying on the mobile-unfriendly DataTransfer API
    const handleAction = async (formData: FormData) => {
        // Append all collected files to the payload under the expected key
        accumulatedFiles.forEach(file => {
            formData.append('preview_files', file)
        })
        
        // Pass to the server action
        await updatePrompt(formData)
    }

    return (
        <form action={handleAction} className="flex flex-col gap-6">
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

            <div className="grid gap-2 opacity-60">
                <Label htmlFor="price" className="flex items-center gap-2">
                    Price (USD) 
                    <Badge variant="outline" className="text-[10px] uppercase tracking-tighter py-0 h-4">Coming Soon</Badge>
                </Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={prompt.price} disabled placeholder="Managed by platform" className="bg-muted/50 cursor-not-allowed" />
                <p className="text-[10px] text-muted-foreground">Monetization is coming in the next phase. Currently all prompts are free.</p>
            </div>

            <div className="border p-4 rounded-xl bg-muted/20 flex flex-col gap-4">
                <div className="text-sm font-medium">Images</div>
                <p className="text-xs text-muted-foreground">
                    Your prompt currently has {prompt.preview_images?.length || (prompt.preview_image ? 1 : 0)} image(s) saved.
                    If you leave this section blank, your existing images will remain exactly as they are.
                    If you select new files or URLs below, ALL previous images will be permanently replaced.
                </p>
                <ImageUploadField 
                    defaultUrls={prompt.preview_images || (prompt.preview_image ? [prompt.preview_image] : [])} 
                    onFilesUpdate={setAccumulatedFiles}
                />
            </div>

            <div className="grid gap-2 border p-4 rounded-xl bg-muted/10 shadow-sm border-dashed">
                <Label htmlFor="preview_video_file" className="text-foreground">Upload Video Preview (Optional)</Label>
                <Input 
                    id="preview_video_file" 
                    name="preview_video_file" 
                    type="file" 
                    accept="video/mp4,video/webm" 
                    className="cursor-pointer bg-background" 
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.size > 4 * 1024 * 1024) {
                            alert("Please select a video file under 4MB to ensure successful upload.");
                            e.target.value = '';
                        }
                    }}
                />
                <p className="text-xs text-muted-foreground">
                    {prompt.preview_video ? "You currently have a video saved. Uploading a new one replaces it." : "Max 4MB. MP4 or WebM formats supported. Plays automatically on marketplace hover."}
                </p>
            </div>

            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="full_prompt">The Prompt Itself</Label>
                    {fullPrompt.trim() && (
                        <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-[10px] uppercase font-black tracking-widest text-primary hover:text-primary hover:bg-primary/10 gap-1.5"
                            onClick={() => {
                                const url = getAiInterfaceUrl(fullPrompt);
                                if (url) window.open(url, '_blank');
                            }}
                        >
                            <ExternalLink className="w-3 h-3" />
                            Try on AI
                        </Button>
                    )}
                </div>
                <Textarea
                    id="full_prompt"
                    name="full_prompt"
                    required
                    rows={6}
                    className="font-mono text-sm"
                    value={fullPrompt}
                    onChange={(e) => setFullPrompt(e.target.value)}
                />
                <AiPromptEnhancer fullPrompt={fullPrompt} onUpdate={setFullPrompt} />
            </div>

            {/* Extended padding bottom to ensure buttons are completely clickable on mobile without overlapping the system OS navigation bar */}
            <div className="flex flex-col-reverse md:flex-row gap-4 pb-24 md:pb-0 pt-4">
                <Button type="button" variant="outline" className="w-full md:w-auto md:flex-1" asChild>
                    <a href={`/prompt/${prompt.id}`}>Cancel</a>
                </Button>
                <SubmitButton
                    defaultText="Save Changes"
                    loadingText="Saving..."
                    size="lg"
                    className="w-full md:w-auto md:flex-1"
                />
            </div>
        </form>
    )
}
