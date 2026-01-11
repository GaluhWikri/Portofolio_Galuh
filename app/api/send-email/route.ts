// app/api/send-email/route.ts
// API Route untuk mengirim email dari contact form

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, message } = body;

        // Validasi input
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Semua field harus diisi' },
                { status: 400 }
            );
        }

        // Validasi email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Format email tidak valid' },
                { status: 400 }
            );
        }

        // Kirim email menggunakan Resend
        const { data, error } = await resend.emails.send({
            from: 'Portfolio Contact <onboarding@resend.dev>', // Ganti dengan domain Anda jika sudah verified
            to: ['galuhwikri05@gmail.com'],
            replyTo: email,
            subject: `[Portfolio] Pesan baru dari ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #000; color: #fff; padding: 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">📬 Pesan Baru dari Portfolio</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9; border: 3px solid #000;">
                        <h2 style="margin-top: 0; color: #000;">Detail Pengirim:</h2>
                        <p style="margin: 10px 0;"><strong>Nama:</strong> ${name}</p>
                        <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        
                        <h2 style="margin-top: 30px; color: #000;">Pesan:</h2>
                        <div style="background: #fff; padding: 20px; border: 2px solid #000; white-space: pre-wrap;">
                            ${message}
                        </div>
                    </div>
                    <div style="background: #000; color: #888; padding: 15px; text-align: center; font-size: 12px;">
                        Pesan ini dikirim dari form kontak portfolio Anda
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json(
                { error: 'Gagal mengirim email. Silakan coba lagi.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Email berhasil dikirim!' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}
