import { NextRequest, NextResponse } from 'next/server';

// /dashboard menulis ke Supabase pakai service role key, jadi dikunci HTTP Basic Auth.
// Set ADMIN_PASSWORD di .env.local (lokal) atau env Vercel (produksi).
// Kalau ADMIN_PASSWORD kosong, dashboard terbuka (perilaku lama).
export function middleware(req: NextRequest) {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) return NextResponse.next();

    const encoded = (req.headers.get('authorization') || '').split(' ')[1];
    const decoded = encoded ? atob(encoded) : '';

    if (decoded === `admin:${password}`) return NextResponse.next();

    return new NextResponse('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Dashboard"' },
    });
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
