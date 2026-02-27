import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updatePrompt } from '@/app/actions/prompts'
import ImageUploadField from '@/components/ImageUploadField'
import ModelCategorySelector from '@/components/ModelCategorySelector'

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params
    const id = resolvedParams.id

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    const { data: prompt } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', id)
        .single()

    if (!prompt) {
        notFound()
    }

    // Verify ownership or admin
    if (prompt.seller_id !== user.id && profile?.role !== 'admin') {
        redirect('/')
    }

    return (
        <div className="w-full max-w-2xl px-5 py-8 flex flex-col gap-8 mx-auto mt-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Prompt</h1>
                <p className="text-muted-foreground mt-2">
                    Update the details of your prompt. Note: uploading new images will replace the existing ones.
                </p>
            </div>

            <form action={updatePrompt} className="flex flex-col gap-6">
                <input type="hidden" name="prompt_id" value={prompt.id} />

                <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required defaultValue={prompt.title} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required defaultValue={prompt.description} rows={3} />
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
                    <Textarea id="full_prompt" name="full_prompt" required defaultValue={prompt.full_prompt} rows={6} className="font-mono text-sm" />
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
        </div>
    )
}
