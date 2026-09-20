'use client';

/* eslint-disable @next/next/no-img-element */

// app/dashboard/page.tsx — CRUD semua konten portofolio.
// Perubahan ditahan di state dulu, tombol "Simpan Perubahan" yang menulis ke Supabase.
// Tampilan mengikuti tema portofolio (neo-brutalism: putih, border 3px hitam, shadow offset keras).

import { useEffect, useRef, useState } from 'react';
import type { Experience, ProfileDoc } from '@/lib/content';
import type { Project, Skill } from '@/lib/supabase';
import { loadAll, saveAll, uploadImage } from './actions';
import { logout } from '../login/actions';

type Tab = 'about' | 'education' | 'experience' | 'contact' | 'softskills' | 'skills' | 'projects';

// Baris yang belum disimpan belum punya id.
type Draft<T> = Omit<T, 'id'> & { id?: number };
type SkillRow = Draft<Skill>;
type ProjectRow = Draft<Project>;

const TABS: { id: Tab; label: string }[] = [
    { id: 'about', label: 'About Me' },
    { id: 'education', label: 'Education' },
    { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact & Social' },
    { id: 'softskills', label: 'Soft Skills' },
    { id: 'skills', label: 'Skills & Tools' },
    { id: 'projects', label: 'Projects' },
];

// Token tema portofolio (lihat app/globals.css): hitam #0A0A0A, border 3px, shadow offset tanpa blur.
const box = 'border-[3px] border-black bg-white shadow-[4px_4px_0_0_#0A0A0A]';
const input = 'w-full border-2 border-black bg-white px-3 py-2.5 text-black placeholder-gray-400 transition-all focus:outline-none focus:-translate-x-[2px] focus:-translate-y-[2px] focus:shadow-[3px_3px_0_0_#0A0A0A]';
const lab = 'mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500';
const blackBtn = 'border-2 border-black bg-black px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_0_#0A0A0A] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-none';
const whiteBtn = 'border-2 border-black bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-black transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_0_#0A0A0A]';
const check = 'h-4 w-4 shrink-0 accent-black';

// Daftar filter skill — harus sama dengan SKILL_FILTERS di app/ClientHomePage.tsx
const SKILL_FILTERS = ['Programming Languages', 'Primary Stack', 'Also Working With', 'Systems & Design', 'Tools'];

const toggleFilter = (current: string, f: string) => {
    const on = current.split(',').map((x) => x.trim()).filter(Boolean);
    return (on.includes(f) ? on.filter((x) => x !== f) : [...on, f]).join(', ');
};

// Sidik jari state, buat tahu ada perubahan yang belum disimpan.
const fingerprint = (p: ProfileDoc, s: SkillRow[], pr: ProjectRow[]) => JSON.stringify([p, s, pr]);

function Row({ children }: { children: React.ReactNode }) {
    return <div className={`${box} space-y-3 p-4`}>{children}</div>;
}

function UpDown({ onUp, onDown }: { onUp: () => void; onDown: () => void }) {
    const cls = 'grid h-6 w-7 place-items-center border-2 border-black bg-white text-[10px] leading-none transition-colors hover:bg-black hover:text-white';
    return (
        <div className="flex flex-col gap-1">
            <button type="button" className={cls} onClick={onUp} title="Naikkan">▲</button>
            <button type="button" className={cls} onClick={onDown} title="Turunkan">▼</button>
        </div>
    );
}

function Remove({ onClick }: { onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} title="Hapus"
            className="shrink-0 self-start border-2 border-red-600 bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-red-600 transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:bg-red-600 hover:text-white hover:shadow-[4px_4px_0_0_#0A0A0A]">
            Hapus
        </button>
    );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <label className="flex cursor-pointer items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em]">
            <input type="checkbox" className={check} checked={checked} onChange={(e) => onChange(e.target.checked)} />
            {label}
        </label>
    );
}

export default function Dashboard() {
    const [profile, setProfile] = useState<ProfileDoc | null>(null);
    const [skills, setSkills] = useState<SkillRow[]>([]);
    const [projects, setProjects] = useState<ProjectRow[]>([]);
    const [deletedSkills, setDeletedSkills] = useState<number[]>([]);
    const [deletedProjects, setDeletedProjects] = useState<number[]>([]);
    const [icons, setIcons] = useState<string[]>([]);
    const [pickerFor, setPickerFor] = useState<number | null>(null);
    const [tab, setTab] = useState<Tab>('about');
    const [busy, setBusy] = useState(false);
    const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
    const [q, setQ] = useState('');
    const [saved, setSaved] = useState('');

    const dirty = !!profile && fingerprint(profile, skills, projects) !== saved;

    const load = async () => {
        try {
            const res = await loadAll();
            setProfile(res.profile);
            setSkills(res.skills);
            setProjects(res.projects);
            setSaved(fingerprint(res.profile, res.skills, res.projects));
            setDeletedSkills([]);
            setDeletedProjects([]);
            const ic = await fetch('/api/icons').then((r) => r.json()).catch(() => ({ icons: [] }));
            setIcons(ic.icons || []);
        } catch (e: any) {
            setStatus({ ok: false, text: e.message });
        }
    };

    useEffect(() => { load(); }, []);

    const setP = (patch: Partial<ProfileDoc>) => setProfile((p) => (p ? { ...p, ...patch } : p));

    const move = <T,>(arr: T[], i: number, dir: -1 | 1) => {
        const j = i + dir;
        if (j < 0 || j >= arr.length) return arr;
        const copy = [...arr];
        [copy[i], copy[j]] = [copy[j], copy[i]];
        return copy;
    };

    const remove = <T extends { id?: number }>(arr: T[], i: number, mark: (id: number) => void) => {
        const item = arr[i];
        if (item.id) mark(item.id);
        return arr.filter((_, idx) => idx !== i);
    };

    const upload = async (file: File, folder: string) => {
        const fd = new FormData();
        fd.set('file', file);
        fd.set('folder', folder);
        return uploadImage(fd);
    };

    const save = async () => {
        if (!profile) return;
        setBusy(true);
        setStatus(null);
        try {
            const res = await saveAll({ profile, skills, projects, deletedSkills, deletedProjects });
            setProfile(res.profile);
            setSkills(res.skills);
            setProjects(res.projects);
            setSaved(fingerprint(res.profile, res.skills, res.projects));
            setDeletedSkills([]);
            setDeletedProjects([]);
            setStatus({ ok: true, text: 'Tersimpan. Portofolio langsung ter-update.' });
        } catch (e: any) {
            setStatus({ ok: false, text: e.message });
        } finally {
            setBusy(false);
            setTimeout(() => setStatus(null), 6000);
        }
    };

    // Ctrl/Cmd+S buat nyimpen — handler-nya dipasang sekali, jadi simpan versi terbaru di ref.
    const saveRef = useRef(save);
    saveRef.current = save;
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                saveRef.current();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Peringatan kalau nutup tab dengan perubahan yang belum disimpan.
    useEffect(() => {
        const warn = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty]);

    if (!profile) {
        return (
            <div className="grid h-screen place-items-center bg-white text-black">
                <p className="border-[3px] border-black px-6 py-4 text-[11px] font-bold uppercase tracking-[0.14em] shadow-[4px_4px_0_0_#0A0A0A]">
                    {status ? `Error: ${status.text}` : 'Memuat dashboard...'}
                </p>
            </div>
        );
    }

    const counts: Partial<Record<Tab, number>> = {
        experience: profile.experience.length,
        softskills: profile.softSkills.length,
        skills: skills.length,
        projects: projects.length,
    };
    const current = TABS.find((t) => t.id === tab)!;
    const shown = skills.map((s, i) => ({ s, i })).filter(({ s }) => s.name.toLowerCase().includes(q.toLowerCase()));

    return (
        <div className="flex h-screen bg-white text-black">
            <aside className="flex w-[280px] shrink-0 flex-col border-r-[3px] border-black bg-white p-5">
                <div className="mb-6 border-b-[3px] border-black pb-4">
                    <p className="text-2xl font-black uppercase italic leading-none tracking-tight">Dashboard</p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">Galuh Wikri — Portfolio</p>
                </div>

                <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
                    {TABS.map((t, i) => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            aria-current={tab === t.id}
                            className={`flex w-full items-center gap-3 border-2 border-black px-3 py-2.5 text-left transition-all ${tab === t.id
                                ? 'bg-black text-white'
                                : 'bg-white hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_0_#0A0A0A]'}`}>
                            <span className={`text-xl font-black italic leading-none ${tab === t.id ? 'opacity-40' : 'opacity-25'}`}>
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="flex-1 text-[11px] font-bold uppercase tracking-[0.08em]">{t.label}</span>
                            {counts[t.id] !== undefined && <span className="text-[10px] font-bold opacity-50">{counts[t.id]}</span>}
                        </button>
                    ))}
                </nav>

                <a href="/" target="_blank" rel="noopener noreferrer"
                    className="mt-5 border-2 border-black px-3 py-3 text-center text-[11px] font-bold uppercase tracking-[0.1em] transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:bg-black hover:text-white hover:shadow-[4px_4px_0_0_#0A0A0A]">
                    Lihat Portofolio ↗
                </a>
            </aside>

            <main className="flex flex-1 flex-col overflow-hidden">
                <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b-[3px] border-black bg-white px-8 py-5">
                    <div>
                        <h1 className="text-3xl font-black uppercase leading-none tracking-tight">{current.label}</h1>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
                            {busy ? 'Menyimpan...' : dirty ? '● Ada perubahan belum disimpan' : '✓ Semua perubahan tersimpan'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <form action={logout}>
                            <button className={whiteBtn}>Keluar</button>
                        </form>
                        <button onClick={load} disabled={busy || !dirty} className={whiteBtn}>Batal</button>
                        <button onClick={save} disabled={busy || !dirty} className={blackBtn}>
                            {busy ? 'Menyimpan...' : 'Simpan (Ctrl+S)'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 space-y-6 overflow-y-auto p-8">
                    {tab === 'about' && (
                        <div className="max-w-4xl">
                            <label className={lab}>Tentang kamu — tampil di section About</label>
                            <textarea className={input} rows={14} value={profile.aboutMe}
                                onChange={(e) => setP({ aboutMe: e.target.value })} placeholder="Tentang kamu..." />
                        </div>
                    )}

                    {tab === 'education' && (
                        <div className="max-w-xl space-y-4">
                            {(['university', 'major', 'period'] as const).map((f) => (
                                <div key={f}>
                                    <label className={lab}>{f}</label>
                                    <input className={input} value={profile.education[f]}
                                        onChange={(e) => setP({ education: { ...profile.education, [f]: e.target.value } })} />
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'experience' && (
                        <>
                            <button className={blackBtn}
                                onClick={() => setP({ experience: [...profile.experience, { company: '', position: '', period: '', description: '' }] })}>
                                + Tambah Pengalaman
                            </button>
                            {profile.experience.map((exp, i) => (
                                <Row key={i}>
                                    <div className="flex gap-3">
                                        <UpDown onUp={() => setP({ experience: move(profile.experience, i, -1) })}
                                            onDown={() => setP({ experience: move(profile.experience, i, 1) })} />
                                        <div className="flex-1 space-y-3">
                                            <div className="grid gap-3 md:grid-cols-3">
                                                <div>
                                                    <label className={lab}>Perusahaan</label>
                                                    <input className={input} value={exp.company}
                                                        onChange={(e) => setP({ experience: patch(profile.experience, i, { company: e.target.value }) })} />
                                                </div>
                                                <div>
                                                    <label className={lab}>Posisi</label>
                                                    <input className={input} value={exp.position}
                                                        onChange={(e) => setP({ experience: patch(profile.experience, i, { position: e.target.value }) })} />
                                                </div>
                                                <div>
                                                    <label className={lab}>Periode</label>
                                                    <input className={input} placeholder="Jul 2024 - May 2025" value={exp.period}
                                                        onChange={(e) => setP({ experience: patch(profile.experience, i, { period: e.target.value }) })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={lab}>Deskripsi</label>
                                                <textarea className={input} rows={3} value={exp.description}
                                                    onChange={(e) => setP({ experience: patch(profile.experience, i, { description: e.target.value }) })} />
                                            </div>
                                        </div>
                                        <Remove onClick={() => setP({ experience: profile.experience.filter((_, x) => x !== i) })} />
                                    </div>
                                </Row>
                            ))}
                        </>
                    )}

                    {tab === 'contact' && (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className={`${box} space-y-4 p-5`}>
                                <h2 className="border-b-2 border-black pb-2 text-sm font-black uppercase tracking-[0.1em]">Contact</h2>
                                {(['location', 'email', 'phone'] as const).map((f) => (
                                    <div key={f}>
                                        <label className={lab}>{f}</label>
                                        <input className={input} value={profile.contact[f]}
                                            onChange={(e) => setP({ contact: { ...profile.contact, [f]: e.target.value } })} />
                                    </div>
                                ))}
                            </div>
                            <div className={`${box} space-y-4 p-5`}>
                                <h2 className="border-b-2 border-black pb-2 text-sm font-black uppercase tracking-[0.1em]">Social Links</h2>
                                {(['github', 'linkedin', 'instagram'] as const).map((f) => (
                                    <div key={f}>
                                        <label className={lab}>{f}</label>
                                        <input className={input} value={profile.socials[f]}
                                            onChange={(e) => setP({ socials: { ...profile.socials, [f]: e.target.value } })} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'softskills' && (
                        <>
                            <button className={blackBtn} onClick={() => setP({ softSkills: [...profile.softSkills, ''] })}>
                                + Tambah Soft Skill
                            </button>
                            <div className="grid gap-3 md:grid-cols-3">
                                {profile.softSkills.map((s, i) => (
                                    <div key={i} className="flex gap-2">
                                        <input className={input} value={s}
                                            onChange={(e) => setP({ softSkills: patch(profile.softSkills, i, e.target.value) })} />
                                        <Remove onClick={() => setP({ softSkills: profile.softSkills.filter((_, x) => x !== i) })} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {tab === 'skills' && (
                        <>
                            <div className="flex flex-wrap items-center gap-3">
                                <button className={blackBtn}
                                    onClick={() => setSkills([...skills, { name: '', icon_url: '', category: 'Also Working With', order_index: skills.length, is_active: true }])}>
                                    + Tambah Skill
                                </button>
                                <input className={`${input} max-w-xs`} placeholder="Cari skill..." value={q}
                                    onChange={(e) => setQ(e.target.value)} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
                                    {shown.length} / {skills.length} skill
                                </span>
                            </div>
                            <div className="grid gap-4 xl:grid-cols-2">
                                {shown.map(({ s, i }) => (
                                    <Row key={s.id ?? `new-${i}`}>
                                        <div className="flex gap-3">
                                            <UpDown onUp={() => setSkills(move(skills, i, -1))} onDown={() => setSkills(move(skills, i, 1))} />
                                            <img src={s.icon_url || '/assets/icon/icons8-code-48.png'} alt="" width={48} height={48}
                                                className="h-12 w-12 shrink-0 border-2 border-black bg-white object-contain p-1" />
                                            <div className="flex-1 space-y-2">
                                                <div className="grid gap-3 md:grid-cols-2">
                                                    <div>
                                                        <label className={lab}>Nama</label>
                                                        <input className={input} value={s.name}
                                                            onChange={(e) => setSkills(patch(skills, i, { name: e.target.value }))} />
                                                    </div>
                                                    <div>
                                                        <label className={lab}>Icon URL</label>
                                                        <input className={input} value={s.icon_url}
                                                            onChange={(e) => setSkills(patch(skills, i, { icon_url: e.target.value }))} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className={lab}>Filter di portofolio (boleh lebih dari satu)</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {SKILL_FILTERS.map((f) => {
                                                            const on = s.category.split(',').map((x) => x.trim()).includes(f);
                                                            return (
                                                                <label key={f} className={`flex cursor-pointer items-center gap-2 border-2 border-black px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] transition-colors ${on ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}>
                                                                    <input type="checkbox" className="peer sr-only" checked={on}
                                                                        onChange={() => setSkills(patch(skills, i, { category: toggleFilter(s.category, f) }))} />
                                                                    <span className={`grid h-3.5 w-3.5 shrink-0 place-items-center border-2 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black ${on ? 'border-white' : 'border-black'}`}>
                                                                        {on && <span className="h-1.5 w-1.5 bg-white" />}
                                                                    </span>
                                                                    {f}
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                    <p className="mt-2 text-[10px] text-gray-500">
                                                        Kosong = otomatis masuk <b>Also Working With</b>.
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 border-t-2 border-black pt-3">
                                                    <Toggle checked={s.is_active} label="Tampil" onChange={(v) => setSkills(patch(skills, i, { is_active: v }))} />
                                                    <button type="button" onClick={() => setPickerFor(i)} className={whiteBtn}>Pilih Ikon</button>
                                                    <label className={`${whiteBtn} cursor-pointer`}>
                                                        Upload Ikon
                                                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                            const f = e.target.files?.[0];
                                                            if (!f) return;
                                                            try { setSkills(patch(skills, i, { icon_url: await upload(f, 'skills') })); }
                                                            catch (err: any) { setStatus({ ok: false, text: err.message }); }
                                                        }} />
                                                    </label>
                                                </div>
                                            </div>
                                            <Remove onClick={() => setSkills(remove(skills, i, (id) => setDeletedSkills((d) => [...d, id])))} />
                                        </div>
                                    </Row>
                                ))}
                            </div>
                        </>
                    )}

                    {tab === 'projects' && (
                        <>
                            <button className={blackBtn}
                                onClick={() => setProjects([...projects, { title: '', category: 'WEB', tech: [], image_url: '', order_index: projects.length, is_featured: false, is_active: true }])}>
                                + Tambah Project
                            </button>
                            {projects.map((p, i) => (
                                <Row key={p.id ?? `new-${i}`}>
                                    <div className="flex gap-3">
                                        <UpDown onUp={() => setProjects(move(projects, i, -1))} onDown={() => setProjects(move(projects, i, 1))} />
                                        <div className="grid flex-1 gap-3 md:grid-cols-2">
                                            <div>
                                                <label className={lab}>Judul</label>
                                                <input className={input} value={p.title}
                                                    onChange={(e) => setProjects(patch(projects, i, { title: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label className={lab}>Kategori</label>
                                                <select className={input} value={p.category}
                                                    onChange={(e) => setProjects(patch(projects, i, { category: e.target.value as Project['category'] }))}>
                                                    <option value="WEB">WEB</option>
                                                    <option value="UI/UX">UI/UX</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className={lab}>Tech (pisah pakai koma)</label>
                                                <input className={input} value={(p.tech || []).join(', ')}
                                                    onChange={(e) => setProjects(patch(projects, i, { tech: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))} />
                                            </div>
                                            <div>
                                                <label className={lab}>Link demo</label>
                                                <input className={input} value={p.link || ''}
                                                    onChange={(e) => setProjects(patch(projects, i, { link: e.target.value }))} />
                                            </div>
                                            <div>
                                                <label className={lab}>Link GitHub</label>
                                                <input className={input} value={p.github || ''}
                                                    onChange={(e) => setProjects(patch(projects, i, { github: e.target.value }))} />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className={lab}>Gambar URL</label>
                                                <input className={input} value={p.image_url || ''}
                                                    onChange={(e) => setProjects(patch(projects, i, { image_url: e.target.value }))} />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className={lab}>Deskripsi</label>
                                                <textarea className={input} rows={3} value={p.description || ''}
                                                    onChange={(e) => setProjects(patch(projects, i, { description: e.target.value }))} />
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 border-t-2 border-black pt-3 md:col-span-2">
                                                <img src={p.image_url || '/assets/image/placeholder.png'} alt="" width={120} height={72}
                                                    className="h-[72px] w-[120px] border-2 border-black bg-white object-cover" />
                                                <label className={`${whiteBtn} cursor-pointer`}>
                                                    Upload Gambar
                                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                        const f = e.target.files?.[0];
                                                        if (!f) return;
                                                        try { setProjects(patch(projects, i, { image_url: await upload(f, 'projects') })); }
                                                        catch (err: any) { setStatus({ ok: false, text: err.message }); }
                                                    }} />
                                                </label>
                                                <Toggle checked={p.is_featured} label="Featured" onChange={(v) => setProjects(patch(projects, i, { is_featured: v }))} />
                                                <Toggle checked={p.is_active} label="Tampil" onChange={(v) => setProjects(patch(projects, i, { is_active: v }))} />
                                            </div>
                                        </div>
                                        <Remove onClick={() => setProjects(remove(projects, i, (id) => setDeletedProjects((d) => [...d, id])))} />
                                    </div>
                                </Row>
                            ))}
                        </>
                    )}
                </div>
            </main>

            {status && (
                <div className={`fixed bottom-6 right-6 z-50 border-[3px] border-black px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] shadow-[6px_6px_0_0_#0A0A0A] ${status.ok ? 'bg-black text-white' : 'bg-white text-red-600'}`}>
                    {status.text}
                </div>
            )}

            {pickerFor !== null && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onClick={() => setPickerFor(null)}>
                    <div className={`${box} w-full max-w-4xl p-6`} onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between border-b-[3px] border-black pb-3">
                            <h3 className="text-xl font-black uppercase tracking-tight">Pilih Ikon</h3>
                            <button type="button" onClick={() => setPickerFor(null)} className={whiteBtn}>Tutup</button>
                        </div>
                        <div className="grid max-h-[60vh] grid-cols-4 gap-3 overflow-y-auto p-1 md:grid-cols-8 lg:grid-cols-10">
                            {icons.map((icon) => (
                                <button key={icon} type="button" title={icon}
                                    onClick={() => { setSkills(patch(skills, pickerFor, { icon_url: `/assets/icon/${icon}` })); setPickerFor(null); }}
                                    className="grid aspect-square place-items-center border-2 border-black bg-white p-2 transition-all hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_0_#0A0A0A]">
                                    <img src={`/assets/icon/${icon}`} alt={icon} className="h-8 w-8 object-contain" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Ganti satu field pada item array tanpa mengubah item lain.
function patch<T>(arr: T[], index: number, value: T | Partial<T>): T[] {
    const copy = [...arr];
    copy[index] = typeof value === 'object' && value !== null && !Array.isArray(value)
        ? { ...copy[index], ...value }
        : (value as T);
    return copy;
}
