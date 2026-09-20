// lib/content.ts — dokumen konten portofolio yang bisa diedit dari /dashboard.
// ponytail: disimpan sebagai 1 file JSON di Supabase Storage (bucket `portofolio`) supaya
// tidak perlu bikin tabel baru. Upgrade path: pindah ke tabel `profile` (1 baris, kolom jsonb)
// kalau nanti butuh query/relasi.
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const BUCKET = 'portofolio';
const DOC = 'content/profile.json';

export interface Experience {
    company: string;
    position: string;
    period: string;
    description: string;
}

export interface ProfileDoc {
    aboutMe: string;
    education: { university: string; major: string; period: string };
    experience: Experience[];
    contact: { location: string; email: string; phone: string };
    socials: { github: string; linkedin: string; instagram: string };
    softSkills: string[];
}

// Nilai default = isi yang sebelumnya hardcode di ClientHomePage.
export const DEFAULT_PROFILE: ProfileDoc = {
    aboutMe: '',
    education: { university: '', major: '', period: '' },
    experience: [],
    contact: { location: 'Bandung, Indonesia', email: 'galuhwikri05@gmail.com', phone: '+62 812 **** ****' },
    socials: {
        github: 'https://github.com/GaluhWikri',
        linkedin: 'https://www.linkedin.com/in/galuhwikri/',
        instagram: 'https://www.instagram.com/galuh.wikri/',
    },
    softSkills: [
        'Problem Solving', 'Communication', 'Team Leadership', 'Time Management', 'Design Thinking',
        'Critical Thinking', 'Adaptability', 'Creativity', 'Collaboration', 'Empathy', 'Flexibility',
        'Innovation', 'Leadership', 'Motivation', 'Organization', 'Planning',
        'Project Management', 'Teamwork',
    ],
};

// Service role: hanya boleh dipakai di server (route/action). Jangan diimpor komponen klien.
export const adminClient = () =>
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        { auth: { persistSession: false } },
    );

export async function readProfile(): Promise<ProfileDoc> {
    // Fetch langsung (bukan storage.download) supaya bisa pakai cache-buster:
    // CDN Supabase menyajikan versi lama sampai cache-control-nya habis.
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${BUCKET}/${DOC}?v=${Date.now()}`;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    try {
        const res = await fetch(url, {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
            cache: 'no-store',
        });
        if (res.ok) return { ...DEFAULT_PROFILE, ...(await res.json()) };
    } catch (error) {
        console.error('Gagal baca profile.json:', error);
    }

    // Belum pernah disimpan dari dashboard → pakai data.json (perilaku lama).
    try {
        const local = JSON.parse(await fs.readFile(path.join(process.cwd(), 'data.json'), 'utf-8'));
        return { ...DEFAULT_PROFILE, aboutMe: local.aboutMe, education: local.education, experience: local.experience };
    } catch {
        return DEFAULT_PROFILE;
    }
}

export async function writeProfile(doc: ProfileDoc): Promise<void> {
    const { error } = await adminClient()
        .storage.from(BUCKET)
        .upload(DOC, JSON.stringify({ ...DEFAULT_PROFILE, ...doc }, null, 2), {
            upsert: true,
            contentType: 'application/json',
            cacheControl: '0',
        });

    if (error) throw new Error(`Gagal menyimpan konten: ${error.message}`);
}
