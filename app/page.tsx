// app/page.tsx

import ClientHomePage from './ClientHomePage';
import fs from 'fs/promises';
import path from 'path';

export const revalidate = 0; // Memastikan data selalu yang terbaru saat build

// Fungsi ini akan membaca data dari file data.json
async function getPortfolioData() {
    try {
        // Tentukan path ke file data.json
        const filePath = path.join(process.cwd(), 'data.json');
        
        // Baca isi file
        const fileContent = await fs.readFile(filePath, 'utf-8');
        
        // Parse konten JSON menjadi objek JavaScript
        const data = JSON.parse(fileContent);

        return data;

    } catch (error) {
        console.error("Gagal membaca file data.json:", error);
        // Kembalikan data default jika terjadi error
        return {
            aboutMe: 'Gagal memuat data. Pastikan file data.json ada di root proyek.',
            education: { university: '', major: '', period: '' },
            tools: [],
            projects: []
        };
    }
}

export default async function Page() {
    const data = await getPortfolioData();
    return <ClientHomePage data={data} />;
}