import ClientHomePage from './ClientHomePage';
import pool from '../lib/db';

// PERINTAH PENTING: Memaksa halaman ini untuk selalu dinamis (tidak di-cache).
export const revalidate = 0;

// Tipe data untuk menjaga konsistensi
interface Project {
  id: number;
  title: string;
  tech: string[];
  imgSrc: string;
}
interface Tool {
  id: number;
  name: string;
  icon_path: string; // Sesuai nama kolom di database
}

/**
 * Fungsi ini berjalan di server untuk mengambil semua data portofolio dari database.
 */
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

        const projects: Project[] = Array.isArray(projectsRows) ? projectsRows.map((p: any) => ({
            ...p,
            tech: p.tech ? p.tech.split(',').map((t: string) => t.trim()) : []
        })) : [];

        // Mengubah nama kolom 'icon_path' menjadi 'icon' agar konsisten dengan komponen client
        const tools = Array.isArray(toolsRows) ? toolsRows.map((t: Tool) => ({
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
            aboutMe: 'Gagal memuat data. Silakan cek koneksi database.',
            education: { university: '', major: '', period: '' },
            tools: [],
            projects: []
        };
    } finally {
        if (connection) connection.release();
    }
}

/**
 * Komponen Page sekarang async karena ia menunggu data dari database sebelum render.
 */
export default async function Page() {
    const data = await getPortfolioData();
    // Kirim data yang sudah diambil ke komponen client untuk ditampilkan
    return <ClientHomePage data={data} />;
}
