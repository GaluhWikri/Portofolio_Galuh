// app/api/data/route.ts

import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import fs from 'fs/promises';
import path from 'path';

// Pastikan direktori untuk upload ada
const ensureDirectoryExistence = async (filePath: string) => {
    const dirname = path.dirname(filePath);
    try {
        await fs.access(dirname);
    } catch (e) {
        await fs.mkdir(dirname, { recursive: true });
    }
};

// --- GET (Mengambil data) ---
export async function GET() {
    let connection;
    try {
        connection = await pool.getConnection();
        const [settingsRows]: any = await connection.query('SELECT * FROM portfolio_settings');
        const [toolsRows]: any = await connection.query('SELECT * FROM tools');
        const [projectsRows]: any = await connection.query('SELECT * FROM projects');

        const responseData = {
            aboutMe: settingsRows.find((s:any) => s.setting_key === 'aboutMe')?.setting_value || '',
            education: {
                university: settingsRows.find((s:any) => s.setting_key === 'education_university')?.setting_value || '',
                major: settingsRows.find((s:any) => s.setting_key === 'education_major')?.setting_value || '',
                period: settingsRows.find((s:any) => s.setting_key === 'education_period')?.setting_value || '',
            },
            tools: toolsRows.map((t: any) => ({
                id: t.id, name: t.name, icon: t.icon_path
            })),
            // Sekarang imgSrc langsung berisi path, tidak perlu konversi
            projects: projectsRows.map((p: any) => ({
                id: p.id,
                title: p.title,
                tech: p.tech ? p.tech.split(',').map((tech: string) => tech.trim()) : [],
                imgSrc: p.imgSrc 
            })),
        };
        
        return NextResponse.json(responseData);
    } catch (error: any) {
        console.error('API GET Error:', error);
        return NextResponse.json({ message: `Database Error: ${error.message}` }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

// --- POST (Menyimpan data) ---
export async function POST(request: Request) {
    let connection;
    try {
        connection = await pool.getConnection();
        const data = await request.json();
        
        await connection.beginTransaction();

        // 1. Update settings (Tidak berubah)
        await connection.query('UPDATE portfolio_settings SET setting_value = ? WHERE setting_key = ?', [data.aboutMe, 'aboutMe']);
        // ... query lain untuk education ...

        // 2. Logika CRUD untuk Tools (Tidak berubah)
        const [existingTools]: any = await connection.query('SELECT id FROM tools');
        const incomingToolIds = data.tools.map((t: any) => t.id).filter(Boolean);
        const toolsToDelete = existingTools.map((t: any) => t.id).filter((id: number) => !incomingToolIds.includes(id));
        if (toolsToDelete.length > 0) {
            await connection.query('DELETE FROM tools WHERE id IN (?)', [toolsToDelete]);
        }
        for (const tool of data.tools) {
            if (tool.id) {
                await connection.query('UPDATE tools SET name = ?, icon_path = ? WHERE id = ?', [tool.name, tool.icon, tool.id]);
            } else {
                await connection.query('INSERT INTO tools (name, icon_path) VALUES (?, ?)', [tool.name, tool.icon]);
            }
        }

        // 3. Logika CRUD untuk Projects (DIPERBARUI)
        const [existingProjects]: any = await connection.query('SELECT id FROM projects');
        const incomingProjectIds = data.projects.map((p: any) => p.id).filter(Boolean);
        const projectsToDelete = existingProjects.map((p: any) => p.id).filter((id: number) => !incomingProjectIds.includes(id));
        
        if (projectsToDelete.length > 0) {
            // Hapus juga file gambar dari server jika proyek dihapus
            const [projectsData]: any = await connection.query('SELECT imgSrc FROM projects WHERE id IN (?)', [projectsToDelete]);
            for (const proj of projectsData) {
                if (proj.imgSrc) {
                    const oldPath = path.join(process.cwd(), 'public', proj.imgSrc);
                    try {
                        await fs.unlink(oldPath);
                    } catch (err) {
                        console.error("Gagal hapus file lama:", err);
                    }
                }
            }
            await connection.query('DELETE FROM projects WHERE id IN (?)', [projectsToDelete]);
        }

        for (const project of data.projects) {
            const techString = project.tech.join(', ');
            let imagePath = project.imgSrc;

            // Jika imgSrc adalah data base64 (file baru), simpan sebagai file
            if (project.imgSrc && project.imgSrc.startsWith('data:image')) {
                const base64Data = project.imgSrc.split(';base64,').pop();
                if (base64Data) {
                    const buffer = Buffer.from(base64Data, 'base64');
                    const fileExtension = project.imgSrc.substring(project.imgSrc.indexOf('/') + 1, project.imgSrc.indexOf(';'));
                    const filename = `${Date.now()}-${project.title.replace(/\s+/g, '-').toLowerCase()}.${fileExtension}`;
                    const savePath = path.join(process.cwd(), 'public', 'uploads', 'projects', filename);
                    
                    await ensureDirectoryExistence(savePath);
                    await fs.writeFile(savePath, buffer);
                    
                    imagePath = `/uploads/projects/${filename}`; // Simpan path ini ke DB
                }
            }

            if (project.id) {
                await connection.query('UPDATE projects SET title = ?, tech = ?, imgSrc = ? WHERE id = ?', [project.title, techString, imagePath, project.id]);
            } else {
                await connection.query('INSERT INTO projects (title, tech, imgSrc) VALUES (?, ?, ?)', [project.title, techString, imagePath]);
            }
        }

        await connection.commit();
        return NextResponse.json({ message: 'Data berhasil disimpan!' });
    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error('API POST Error:', error);
        return NextResponse.json({ message: `Database Error: ${error.message}` }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}