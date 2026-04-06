'use client'

import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitPrompt } from '@/app/actions/prompts'
import { Badge } from '@/components/ui/badge'
import ImageUploadField from '@/components/ImageUploadField'
import RichTextEditor from '@/components/RichTextEditor'
import ModelCategorySelector from '@/components/ModelCategorySelector'
import AiPromptEnhancer from '@/components/AiPromptEnhancer'
import { SubmitButton } from '@/components/SubmitButton'
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

export default function SubmitPage() {
    const supabase = createClient()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [fullPrompt, setFullPrompt] = useState('')

    const [accumulatedFiles, setAccumulatedFiles] = useState<File[]>([])

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

    // Advanced Form Action interceptor to append our dynamically tracked files
    // without relying on the mobile-unfriendly DataTransfer API
    const handleAction = async (formData: FormData) => {
        // Append all collected files to the payload under the expected key
        accumulatedFiles.forEach(file => {
            formData.append('preview_files', file)
        })
        
        // Pass to the server action
        await submitPrompt(formData)
    }

    return (
        <div className="w-full max-w-2xl px-5 py-8 flex flex-col gap-8 mx-auto mt-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Submit a Prompt</h1>
                <p className="text-muted-foreground mt-2">
                    Share your best AI prompts with the community.
                </p>
            </div>

            <form action={handleAction} className="flex flex-col gap-6">
                <Suspense fallback={null}>
                    <FormMessages />
                </Suspense>

                <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required placeholder="e.g. Masterful Blog Post Creator" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description (Explain your prompt in detail)</Label>
                    <RichTextEditor name="description" />
                </div>

                <ModelCategorySelector />

                <div className="grid gap-2 opacity-60">
                    <Label htmlFor="price" className="flex items-center gap-2">
                        Price (USD)
                        <Badge variant="outline" className="text-[10px] uppercase tracking-tighter py-0 h-4">Coming Soon</Badge>
                    </Label>
                    <Input id="price" name="price" type="number" step="0.01" min="0" disabled placeholder="Currently Free" className="bg-muted/50 cursor-not-allowed" />
                    <p className="text-[10px] text-muted-foreground">Pricing features are currently disabled. All prompts are free for the community right now.</p>
                </div>

                <ImageUploadField onFilesUpdate={setAccumulatedFiles} />

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
                    <p className="text-xs text-muted-foreground">Max 4MB. MP4 or WebM formats supported. Plays automatically on marketplace hover.</p>
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
                        placeholder="Enter the exact prompt text here..."
                        rows={6}
                        className="font-mono text-sm"
                        value={fullPrompt}
                        onChange={(e) => setFullPrompt(e.target.value)}
                    />
                    <AiPromptEnhancer fullPrompt={fullPrompt} onUpdate={setFullPrompt} />
                </div>

                {/* Extended padding bottom to ensure buttons are completely clickable on mobile without overlapping the system OS navigation bar */}
                <div className="pb-24 md:pb-0 pt-4">
                    <SubmitButton
                        defaultText="Submit for Review"
                        loadingText="Uploading & Submitting..."
                        size="lg"
                        className="w-full"
                    />
                </div>
            </form>
        </div>
    )
}
