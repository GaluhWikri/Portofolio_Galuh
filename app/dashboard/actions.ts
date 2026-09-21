'use server';

// app/dashboard/actions.ts — semua tulis-baca konten dashboard lewat sini (server-side, service role).
import { revalidatePath } from 'next/cache';
import { adminClient, readProfile, writeProfile, type ProfileDoc } from '@/lib/content';
import type { Skill, Project } from '@/lib/supabase';

const BUCKET = 'portofolio';

export async function loadAll() {
    const sb = adminClient();
    const [profile, skills, projects] = await Promise.all([
        readProfile(),
        sb.from('skills').select('*').order('order_index', { ascending: true }),
        sb.from('projects').select('*').order('order_index', { ascending: true }),
    ]);

    if (skills.error) throw new Error(`Gagal memuat skills: ${skills.error.message}`);
    if (projects.error) throw new Error(`Gagal memuat projects: ${projects.error.message}`);

    return {
        profile,
        skills: (skills.data || []) as Skill[],
        projects: (projects.data || []) as Project[],
    };
}

export async function saveAll(input: {
    profile: ProfileDoc;
    skills: (Omit<Skill, 'id'> & { id?: number })[];
    projects: (Omit<Project, 'id'> & { id?: number })[];
    deletedSkills: number[];
    deletedProjects: number[];
}) {
    const sb = adminClient();

    await writeProfile(input.profile);

    // URL gambar dari host luar di-mirror ke Storage dulu, biar tidak kena blokir CORS di globe.
    const skills = await Promise.all(
        input.skills.map(async (s) => {
            try {
                return { ...s, icon_url: await mirrorImage(s.icon_url) };
            } catch (e: any) {
                throw new Error(`Skill "${s.name || '(tanpa nama)'}": ${e.message}`);
            }
        }),
    );
    const projects = await Promise.all(
        input.projects.map(async (p) => {
            try {
                return { ...p, image_url: await mirrorImage(p.image_url) };
            } catch (e: any) {
                throw new Error(`Project "${p.title || '(tanpa judul)'}": ${e.message}`);
            }
        }),
    );

    for (const [table, rows, deleted] of [
        ['skills', skills, input.deletedSkills],
        ['projects', projects, input.deletedProjects],
    ] as const) {
        if (deleted.length) {
            const { error } = await sb.from(table).delete().in('id', deleted);
            if (error) throw new Error(`Gagal menghapus ${table}: ${error.message}`);
        }

        // order_index selalu mengikuti urutan tampil di dashboard
        const clean = rows.map((row, i) => ({ ...row, order_index: i }));
        const existing = clean.filter((row) => row.id);
        let fresh = clean.filter((row) => !row.id);

        if (existing.length) {
            const { error } = await sb.from(table).upsert(existing);
            if (error) throw new Error(`Gagal menyimpan ${table}: ${error.message}`);
        }

        if (fresh.length) {
            // ponytail: sequence id tabel ini ketinggalan (row lama diinsert pakai id manual),
            // jadi id baru dihitung dari max(id) di DB. Hapus blok ini kalau sequence-nya sudah di-restart.
            const { data: ids } = await sb.from(table).select('id');
            let nextId = Math.max(0, ...(ids || []).map((r: { id: number }) => r.id)) + 1;
            fresh = fresh.map((row) => ({ ...row, id: nextId++ }));

            const { error } = await sb.from(table).insert(fresh);
            if (error) throw new Error(`Gagal menambah ${table}: ${error.message}`);
        }
    }

    revalidatePath('/');
    return loadAll();
}

// Gambar dari host luar di-mirror ke Storage. Banyak CDN ikon (dashboardicons.com, simpleicons)
// tidak mengirim header CORS, sedangkan tekstur WebGL wajib CORS-clean — tanpa ini globe gagal
// memuatnya. Bonus: ikon jadi tidak bergantung pada layanan pihak ketiga.
async function mirrorImage(url?: string) {
    const raw = (url || '').trim();
    if (!raw || raw.startsWith('/')) return url; // kosong atau file lokal repo: biarkan apa adanya

    let u: URL;
    try {
        u = new URL(raw);
    } catch {
        throw new Error(`URL gambar tidak valid: ${raw}`);
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('URL gambar harus http/https.');

    const sb = adminClient();
    if (u.host === new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host) return raw; // sudah di Storage sendiri

    // ponytail: tolak alamat internal (SSRF). Kalau nanti perlu lebih ketat, resolusi DNS-nya dulu.
    const host = u.hostname;
    if (
        /^(localhost$|127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
        host.endsWith('.local') ||
        host.endsWith('.internal')
    ) {
        throw new Error('URL gambar mengarah ke alamat internal.');
    }

    const res = await fetch(u, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`gagal ambil gambar (HTTP ${res.status}).`);

    const type = (res.headers.get('content-type') || '').split(';')[0].trim();
    if (!type.startsWith('image/')) throw new Error(`URL bukan gambar (${type || 'tipe tidak dikenal'}).`);

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 5_000_000) throw new Error('gambar terlalu besar (maks 5 MB).');

    const ext = (type.split('/')[1] || 'png').replace('svg+xml', 'svg').replace('jpeg', 'jpg');
    const key = `mirror/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await sb.storage.from(BUCKET).upload(key, buf, { contentType: type, cacheControl: '31536000' });
    if (error) throw new Error(`gagal simpan gambar: ${error.message}`);

    return sb.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
}

export async function uploadImage(formData: FormData) {
    const file = formData.get('file') as File | null;
    if (!file || !file.size) throw new Error('File kosong.');

    const folder = (formData.get('folder') as string) || 'uploads';
    const ext = (file.name.split('.').pop() || 'png').toLowerCase();
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

    const sb = adminClient();
    const { error } = await sb.storage.from(BUCKET).upload(key, file, {
        contentType: file.type || 'image/png',
        cacheControl: '31536000',
    });
    if (error) throw new Error(`Gagal upload: ${error.message}`);

    return sb.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
}
