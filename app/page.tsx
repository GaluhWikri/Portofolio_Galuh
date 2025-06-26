// app/page.tsx

import ClientHomePage from './ClientHomePage';
import pool from '../lib/db';

// PERBAIKAN: Memaksa halaman untuk menjadi dinamis agar data selalu terbaru.
export const revalidate = 0;

/**
 * PERBAIKAN: Helper function untuk mengubah data Buffer dari database ke Base64 string.
 * Fungsi ini harus ada di sini agar bisa digunakan oleh getPortfolioData.
 */
const bufferToBase64 = (buffer: Buffer | null) => {
    if (!buffer || buffer.length === 0) return null;
    // Deteksi tipe MIME dasar untuk kompatibilitas
    let mimeType = 'image/jpeg'; // Default
    const signature = buffer.subarray(0, 4).toString('hex');
    if (signature === '89504e47') mimeType = 'image/png';
    else if (signature.startsWith('47494638')) mimeType = 'image/gif'; // GIF
    else if (buffer.subarray(0, 2).toString('hex') === 'ffd8') mimeType = 'image/jpeg';
    else if (buffer.toString('utf8', 0, 4).includes('SVG')) mimeType = 'image/svg+xml';


    return `data:${mimeType};base64,${buffer.toString('base64')}`;
}


interface Project {
  id: number;
  title: string;
  tech: string[];
  imgSrc: string | null; // Diubah untuk menerima string Base64 atau null
}

interface Tool {
  id: number;
  name: string;
  icon: string | null; // Diubah untuk menerima string Base64 atau null
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

        // PERBAIKAN: Gunakan helper bufferToBase64 di sini
        const projects: Project[] = Array.isArray(projectsRows) ? projectsRows.map((p: any) => ({
            id: p.id,
            title: p.title,
            tech: p.tech ? p.tech.split(',').map((t: string) => t.trim()) : [],
            imgSrc: bufferToBase64(p.imgSrc) // Konversi BLOB ke Base64
        })) : [];

        // PERBAIKAN: Gunakan helper bufferToBase64 di sini
        const tools: Tool[] = Array.isArray(toolsRows) ? toolsRows.map((t: any) => ({
            id: t.id,
            name: t.name,
            icon: bufferToBase64(t.icon_path) // Konversi BLOB ke Base64
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
        // Mengembalikan data default jika terjadi error
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
    // Ambil data dari server yang sudah dalam format benar
    const data = await getPortfolioData();
    // Kirim data ke komponen client untuk ditampilkan
    return <ClientHomePage data={data} />;
}
