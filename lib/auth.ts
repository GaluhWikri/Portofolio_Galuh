// lib/auth.ts — sesi login dashboard.
// Edge-safe (Web Crypto saja) karena dipakai middleware.ts yang jalan di Edge runtime.
export const SESSION_COOKIE = 'porto_session';

const enc = new TextEncoder();

export const credentials = () => ({
    user: process.env.ADMIN_USER || 'galuh',
    pass: process.env.ADMIN_PASSWORD || '',
});

// Perbandingan waktu-tetap, biar tidak bisa ditebak lewat beda waktu respons.
export function same(a: string, b: string) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

// Nilai cookie = SHA-256(user:pass). Tidak bisa dipalsukan tanpa tahu password,
// dan password-nya sendiri tidak pernah ikut ke browser.
export async function expectedToken() {
    const { user, pass } = credentials();
    if (!pass) return '';
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(`${user}:${pass}`));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function isValidSession(value: string | undefined) {
    const want = await expectedToken();
    return !!want && !!value && same(want, value);
}
