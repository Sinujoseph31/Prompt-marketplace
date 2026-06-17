import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server'

export async function proxy(request: NextRequest) {
    const supabaseResponse = await updateSession(request)

    // Check if user is logged in
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        const { data: profile } = await supabase.from('profiles').select('must_change_password').eq('id', user.id).maybeSingle()

        const path = request.nextUrl.pathname

        if (profile?.must_change_password && !path.startsWith('/reset-password')) {
            return NextResponse.redirect(new URL('/reset-password', request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|ads.txt|app-ads.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
