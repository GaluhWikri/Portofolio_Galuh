import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, isValidSession } from '@/lib/auth';

// /dashboard menulis ke Supabase pakai service role key, jadi wajib login.
// Tanpa cookie sesi yang sah -> dilempar ke /login (bukan lagi prompt Basic Auth).
export async function middleware(req: NextRequest) {
    if (await isValidSession(req.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();

    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
