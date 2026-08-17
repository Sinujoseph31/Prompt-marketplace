import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const rightsConfirmed = formData.get('rightsConfirmed') === 'true';

        if (!rightsConfirmed) {
            return new NextResponse(
                JSON.stringify({ error: 'You must confirm that you have the rights or permission to use this video clip.' }),
                { status: 400 }
            );
        }

        if (!file || file.size === 0) {
            return new NextResponse(
                JSON.stringify({ error: 'Please provide a valid video file.' }),
                { status: 400 }
            );
        }

        // Validate MIME type
        const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v'];
        if (!allowedTypes.includes(file.type)) {
            return new NextResponse(
                JSON.stringify({ error: 'Invalid video format. Supported formats: MP4, WebM, MOV.' }),
                { status: 400 }
            );
        }

        // Limit file size to 50MB
        const maxSizeBytes = 50 * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            return new NextResponse(
                JSON.stringify({ error: 'File size exceeds the 50MB limit.' }),
                { status: 400 }
            );
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const fileExt = file.name.split('.').pop() || 'mp4';
        const fileName = `user_clips/${user ? user.id : 'guest'}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

        // Attempt Supabase storage upload
        const { error: uploadError } = await supabase.storage
            .from('prompt-images')
            .upload(fileName, file, { contentType: file.type, upsert: true });

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('prompt-images')
                .getPublicUrl(fileName);

            return NextResponse.json({
                success: true,
                url: publicUrl,
                fileName: file.name,
                size: file.size,
                rightsStatus: 'user_uploaded'
            });
        }

        // If storage bucket isn't set up yet, provide a base64 or temporary client blob fallback message
        console.warn('Storage upload fallback:', uploadError.message);
        return NextResponse.json({
            success: true,
            fallbackClientUpload: true,
            fileName: file.name,
            size: file.size,
            rightsStatus: 'user_uploaded'
        });

    } catch (error: any) {
        console.error('Video clip upload error:', error);
        return new NextResponse(
            JSON.stringify({ error: error.message || 'Video upload failed.' }),
            { status: 500 }
        );
    }
}
