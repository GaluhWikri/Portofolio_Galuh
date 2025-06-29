// app/api/data/route.ts

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Path ke file data.json di root direktori proyek
const dataFilePath = path.join(process.cwd(), 'data.json');

// Pastikan direktori untuk upload gambar ada
const ensureDirectoryExistence = async (filePath: string) => {
    const dirname = path.dirname(filePath);
    try {
        await fs.access(dirname);
    } catch (e) {
        await fs.mkdir(dirname, { recursive: true });
    }
};

// --- GET (Mengambil data dari data.json) ---
export async function GET() {
    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('API GET Error (data.json):', error);
        if (error.code === 'ENOENT') {
            return NextResponse.json({ message: 'File data.json tidak ditemukan.' }, { status: 404 });
        }
        return NextResponse.json({ message: `Gagal membaca file: ${error.message}` }, { status: 500 });
    }
}

// --- POST (Menyimpan data ke data.json) ---
export async function POST(request: Request) {
    try {
        const newData = await request.json();

        // Logika untuk menyimpan gambar proyek baru (jika ada)
        for (const project of newData.projects) {
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
                    
                    // Ganti imgSrc dari base64 menjadi path ke file yang disimpan
                    project.imgSrc = `/uploads/projects/${filename}`; 
                }
            }
        }
        
        // Tulis data yang sudah diperbarui kembali ke file data.json
        await fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2));

        return NextResponse.json({ message: 'Data berhasil disimpan di data.json!' });
    } catch (error: any) {
        console.error('API POST Error (data.json):', error);
        return NextResponse.json({ message: `Gagal menyimpan data: ${error.message}` }, { status: 500 });
    }
}