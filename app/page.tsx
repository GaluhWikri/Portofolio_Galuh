import fs from 'fs';
import path from 'path';
import ClientHomePage from './ClientHomePage';

/**
 * Membersihkan nama file menjadi nama yang lebih mudah dibaca.
 * Contoh: "icons8-figma-48.png" akan menjadi "Figma".
 * @param fileName - Nama file asli dari direktori.
 * @returns Nama yang sudah dibersihkan.
 */
function cleanFileName(fileName: string): string {
    return fileName
        .replace(/icons8-|-48\.png|-2019/g, ' ') // Hapus prefix/suffix yang umum
        .replace(/-/g, ' ') // Ganti tanda hubung dengan spasi
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Kapitalisasi setiap kata
        .join(' ')
        .trim();
}

/**
 * Ini adalah Server Component utama.
 * Ia membaca data di sisi server lalu memberikannya ke Client Component untuk ditampilkan.
 */
export default function Page() {
    // Tentukan path absolut ke direktori ikon
    const iconDirectory = path.join(process.cwd(), 'public/assets/icon');
    
    // Baca semua nama file dari direktori ikon secara sinkron
    const iconFileNames = fs.readdirSync(iconDirectory);

    // Buat array 'tools' secara dinamis dari nama file yang ada
    const tools = iconFileNames.map(fileName => ({
        name: cleanFileName(fileName),
        icon: `/assets/icon/${fileName}`
    }));

    // Render komponen Client dan teruskan data 'tools' sebagai props
    return <ClientHomePage tools={tools} />;
}