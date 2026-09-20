'use client';

// app/login/page.tsx — modal login dashboard, tema neo-brutalism portofolio.
// Satu file: server action-nya diimpor dari ./actions.

import { useActionState } from 'react';
import { login, type LoginState } from './actions';

const input =
    'w-full border-2 border-black bg-white px-3 py-3 font-mono text-sm text-black placeholder-gray-400 transition-all focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[3px_3px_0_0_#0A0A0A]';
const lab = 'mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500';

export default function LoginPage() {
    const [state, action, pending] = useActionState<LoginState, FormData>(login, {});

    return (
        <main
            className="grid min-h-screen place-items-center bg-[#F5F5F5] p-6"
            style={{
                backgroundImage:
                    'linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)',
                backgroundSize: '32px 32px',
            }}
        >
            <div className="w-full max-w-md border-[3px] border-black bg-white shadow-[10px_10px_0_0_#0A0A0A]">
                {/* strip hitam: penanda area admin */}
                <div className="flex items-center justify-between border-b-[3px] border-black bg-black px-6 py-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Admin</span>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-gray-400">00</span>
                </div>

                <form action={action} className="space-y-5 p-7">
                    <div>
                        <h1 className="text-3xl font-black uppercase leading-none tracking-tight text-black">
                            Login
                        </h1>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
                            Dashboard konten portofolio
                        </p>
                    </div>

                    <div>
                        <label className={lab} htmlFor="username">Username</label>
                        <input
                            id="username"
                            name="username"
                            className={input}
                            autoComplete="username"
                            autoFocus
                            required
                            maxLength={64}
                            placeholder="username"
                        />
                    </div>

                    <div>
                        <label className={lab} htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className={input}
                            autoComplete="current-password"
                            required
                            maxLength={128}
                            placeholder="••••••••"
                        />
                    </div>

                    {state.error && (
                        <p
                            role="alert"
                            aria-live="polite"
                            className="border-2 border-red-600 bg-red-50 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-red-600"
                        >
                            {state.error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full border-2 border-black bg-black px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_0_#0A0A0A] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        {pending ? 'Memeriksa...' : 'Masuk'}
                    </button>
                </form>
            </div>
        </main>
    );
}
