import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'File tidak ditemukan di dalam request.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `${uniqueSuffix}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const publicPath = `/uploads/${filename}`;
    return NextResponse.json({ success: true, path: publicPath });

  } catch (error: any) {
    console.error(">>> UPLOAD API CRASHED:", error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Terjadi eror tidak diketahui di server saat upload.' 
    }, { status: 500 });
  }
}
