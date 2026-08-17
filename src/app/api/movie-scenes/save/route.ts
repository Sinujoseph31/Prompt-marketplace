import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    try {
        const { sceneId, action } = await req.json();

        if (!sceneId) {
            return new NextResponse(JSON.stringify({ error: 'Missing sceneId' }), { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return new NextResponse(JSON.stringify({ error: 'Please log in to save scenes.' }), { status: 401 });
        }

        if (action === 'unsave') {
            const { error } = await supabase
                .from('saved_scenes')
                .delete()
                .eq('user_id', user.id)
                .eq('scene_id', sceneId);

            if (error) {
                console.warn('Saved scenes DB delete notice:', error.message);
            }
            return NextResponse.json({ success: true, saved: false });
        } else {
            // save
            const { error } = await supabase
                .from('saved_scenes')
                .insert({
                    user_id: user.id,
                    scene_id: sceneId
                });

            if (error && error.code !== '23505') { // ignore duplicate
                console.warn('Saved scenes DB insert notice:', error.message);
            }
            return NextResponse.json({ success: true, saved: true });
        }
    } catch (error: any) {
        console.error('Save Scene API Error:', error);
        return new NextResponse(
            JSON.stringify({ error: error.message || 'Failed to update saved scene' }),
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ savedSceneIds: [] });
        }

        const { data, error } = await supabase
            .from('saved_scenes')
            .select('scene_id')
            .eq('user_id', user.id);

        if (error) {
            return NextResponse.json({ savedSceneIds: [] });
        }

        const ids = (data || []).map((row: any) => row.scene_id);
        return NextResponse.json({ savedSceneIds: ids });
    } catch (error: any) {
        return NextResponse.json({ savedSceneIds: [] });
    }
}
