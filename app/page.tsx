// app/page.tsx

import ClientHomePage from './ClientHomePage';
import pool from '../lib/db';

export const revalidate = 0;

async function getPortfolioData() {
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

        const projects = Array.isArray(projectsRows) ? projectsRows.map((p: any) => ({
            id: p.id,
            title: p.title,
            tech: p.tech ? p.tech.split(',').map((t: string) => t.trim()) : [],
            imgSrc: p.imgSrc // Langsung gunakan path dari DB
        })) : [];

        const tools = Array.isArray(toolsRows) ? toolsRows.map((t: any) => ({
            id: t.id,
            name: t.name,
            icon: t.icon_path
        })) : [];
        
        const data = {
            aboutMe: settingsRows.find((s:any) => s.setting_key === 'aboutMe')?.setting_value || '',
            education: education,
            tools: tools,
            projects: projects,
        };

        return data;

    } catch (error) {
        console.error("Gagal mengambil data untuk halaman utama:", error);
        return {
            aboutMe: 'Gagal memuat data.',
            education: { university: '', major: '', period: '' },
            tools: [],
            projects: []
        };
    } finally {
        if (connection) connection.release();
    }
}

export default async function Page() {
    const data = await getPortfolioData();
    return <ClientHomePage data={data} />;
}