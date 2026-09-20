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

    for (const [table, rows, deleted] of [
        ['skills', input.skills, input.deletedSkills],
        ['projects', input.projects, input.deletedProjects],
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
