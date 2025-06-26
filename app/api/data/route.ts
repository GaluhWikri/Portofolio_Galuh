import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

// Fungsi untuk mengambil semua data (Method: GET)
export async function GET() {
    let connection;
    try {
        connection = await pool.getConnection();

        const [settingsRows]: any = await connection.query('SELECT * FROM portfolio_settings');
        const [toolsRows]: any = await connection.query('SELECT * FROM tools');
        const [projectsRows]: any = await connection.query('SELECT * FROM projects');

        const education = {
            university: settingsRows.find((s:any) => s.setting_key === 'education_university')?.setting_value || '',
            major: settingsRows.find((s:any) => s.setting_key === 'education_major')?.setting_value || '',
            period: settingsRows.find((s:any) => s.setting_key === 'education_period')?.setting_value || '',
        };
        const projects = projectsRows.map((p: any) => ({
            ...p,
            tech: p.tech.split(',').map((t: string) => t.trim())
        }));
        const responseData = {
            aboutMe: settingsRows.find((s:any) => s.setting_key === 'aboutMe')?.setting_value || '',
            education: education,
            tools: toolsRows,
            projects: projects,
        };
        
        return NextResponse.json(responseData);

    } catch (error: any) {
        console.error('API GET Error:', error);
        return NextResponse.json({ message: `Database Error: ${error.message}` }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}

// Fungsi untuk menyimpan semua data (Method: POST)
export async function POST(request: Request) {
    let connection;
    try {
        connection = await pool.getConnection();
        const data = await request.json();
        
        await connection.beginTransaction();

        // 1. Update settings
        await connection.query('UPDATE portfolio_settings SET setting_value = ? WHERE setting_key = ?', [data.aboutMe, 'aboutMe']);
        await connection.query('UPDATE portfolio_settings SET setting_value = ? WHERE setting_key = ?', [data.education.university, 'education_university']);
        await connection.query('UPDATE portfolio_settings SET setting_value = ? WHERE setting_key = ?', [data.education.major, 'education_major']);
        await connection.query('UPDATE portfolio_settings SET setting_value = ? WHERE setting_key = ?', [data.education.period, 'education_period']);

        // 2. Update tools (Hapus semua, lalu masukkan yang baru)
        await connection.query('DELETE FROM tools');
        for (const tool of data.tools) {
            // PERBAIKAN: Jika tool.icon kosong, simpan sebagai string kosong ''
            await connection.query('INSERT INTO tools (name, icon_path) VALUES (?, ?)', [tool.name, tool.icon || '']);
        }

        // 3. Update projects (Hapus semua, lalu masukkan yang baru)
        await connection.query('DELETE FROM projects');
        for (const project of data.projects) {
            const techString = project.tech.join(', ');
            // PERBAIKAN: Jika project.imgSrc kosong, simpan sebagai string kosong ''
            await connection.query('INSERT INTO projects (title, tech, imgSrc) VALUES (?, ?, ?)', [project.title, techString, project.imgSrc || '']);
        }

        await connection.commit();

        return NextResponse.json({ message: 'Data saved successfully to database!' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('API POST Error:', error);
        return NextResponse.json({ message: 'Error saving data to database' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
