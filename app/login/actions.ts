'use server';

// app/login/actions.ts — login/logout dashboard.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, credentials, expectedToken, same } from '@/lib/auth';

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
    const user = String(formData.get('username') || '').trim();
    const pass = String(formData.get('password') || '');
    const ok = credentials();

    if (!ok.pass) return { error: 'ADMIN_PASSWORD belum di-set di .env.local.' };
    if (!user || !pass) return { error: 'Username dan password wajib diisi.' };
    if (!same(user, ok.user) || !same(pass, ok.pass)) return { error: 'Username atau password salah.' };

    (await cookies()).set(SESSION_COOKIE, await expectedToken(), {
        httpOnly: true,                       // tidak bisa dibaca JS di browser
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 8,
    });

    redirect('/dashboard');
}

export async function logout() {
    (await cookies()).delete(SESSION_COOKIE);
    redirect('/login');
}
