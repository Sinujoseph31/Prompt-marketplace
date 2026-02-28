import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ImageUploadField from '@/components/ImageUploadField'
import RichTextEditor from '@/components/RichTextEditor'
import ModelCategorySelector from '@/components/ModelCategorySelector'
import ClientEditForm from './ClientEditForm'

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

            <ClientEditForm prompt={prompt} />
        </div>
    )
}
