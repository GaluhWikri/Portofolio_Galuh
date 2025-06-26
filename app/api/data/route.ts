// app/api/data/route.ts

import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

// Helper function untuk mengubah Buffer ke Base64 string
const bufferToBase64 = (buffer: Buffer | null) => {
    if (!buffer) return null;
    // Mendeteksi tipe mime dasar (ini bisa diperluas jika perlu)
    let mimeType = 'image/jpeg'; // default
    if (buffer.subarray(0, 4).toString('hex') === '89504e47') mimeType = 'image/png';
    if (buffer.subarray(0, 2).toString('hex') === 'ffd8') mimeType = 'image/jpeg';
    if (buffer.subarray(0, 4).toString('utf8') === 'RIFF' && buffer.subarray(8, 12).toString('utf8') === 'WEBP') mimeType = 'image/webp';
    if (buffer.subarray(0, 4).toString('utf8').includes('SVG')) mimeType = 'image/svg+xml';


    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

// Helper function untuk mengubah Base64 string ke Buffer
const base64ToBuffer = (base64: string | null) => {
    if (!base64 || !base64.startsWith('data:')) return null;
    // Menghapus prefix "data:image/png;base64,"
    const data = base64.split(',')[1];
    return Buffer.from(data, 'base64');
}

// Method GET: Mengambil data dan mengubah BLOB ke Base64
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
                id: t.id,
                name: t.name,
                icon: bufferToBase64(t.icon_path) // Konversi BLOB ke Base64
            })),
            projects: projectsRows.map((p: any) => ({
                id: p.id,
                title: p.title,
                tech: p.tech ? p.tech.split(',').map((tech: string) => tech.trim()) : [],
                imgSrc: bufferToBase64(p.imgSrc) // Konversi BLOB ke Base64
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

// Method POST: Menerima Base64 dan menyimpannya sebagai BLOB
export async function POST(request: Request) {
    let connection;
    try {
        connection = await pool.getConnection();
        const data = await request.json();
        
        await connection.beginTransaction();

        // 1. Update settings
        await connection.query('UPDATE portfolio_settings SET setting_value = ? WHERE setting_key = ?', [data.aboutMe, 'aboutMe']);
        // ... (query lain untuk education) ...

        // 2. Logika CRUD untuk Tools
        const [existingTools]: any = await connection.query('SELECT id FROM tools');
        const incomingToolIds = data.tools.map((t: any) => t.id).filter(Boolean);
        const toolsToDelete = existingTools.map((t: any) => t.id).filter((id: number) => !incomingToolIds.includes(id));
        if (toolsToDelete.length > 0) {
            await connection.query('DELETE FROM tools WHERE id IN (?)', [toolsToDelete]);
        }
        for (const tool of data.tools) {
            const iconBuffer = base64ToBuffer(tool.icon); // Konversi Base64 ke Buffer
            if (tool.id) {
                await connection.query('UPDATE tools SET name = ?, icon_path = ? WHERE id = ?', [tool.name, iconBuffer, tool.id]);
            } else {
                await connection.query('INSERT INTO tools (name, icon_path) VALUES (?, ?)', [tool.name, iconBuffer]);
            }
        }

        // 3. Logika CRUD untuk Projects
        const [existingProjects]: any = await connection.query('SELECT id FROM projects');
        const incomingProjectIds = data.projects.map((p: any) => p.id).filter(Boolean);
        const projectsToDelete = existingProjects.map((p: any) => p.id).filter((id: number) => !incomingProjectIds.includes(id));
        if (projectsToDelete.length > 0) {
            await connection.query('DELETE FROM projects WHERE id IN (?)', [projectsToDelete]);
        }
        for (const project of data.projects) {
            const techString = project.tech.join(', ');
            const imageBuffer = base64ToBuffer(project.imgSrc); // Konversi Base64 ke Buffer
            if (project.id) {
                await connection.query('UPDATE projects SET title = ?, tech = ?, imgSrc = ? WHERE id = ?', [project.title, techString, imageBuffer, project.id]);
            } else {
                await connection.query('INSERT INTO projects (title, tech, imgSrc) VALUES (?, ?, ?)', [project.title, techString, imageBuffer]);
            }
        }

        await connection.commit();
        return NextResponse.json({ message: 'Data berhasil disimpan ke database!' });
    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error('API POST Error:', error);
        return NextResponse.json({ message: `Database Error: ${error.message}` }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}