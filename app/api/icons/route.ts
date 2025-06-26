// app/api/icons/route.ts

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Pastikan halaman ini tidak di-cache agar selalu mendapatkan daftar file terbaru
export const dynamic = "force-dynamic";

export async function GET() {
  // Tentukan path ke direktori ikon Anda
  const iconsDirectory = path.join(process.cwd(), "public", "assets", "icon");

  try {
    // Baca semua nama item di dalam direktori
    const filenames = await fs.readdir(iconsDirectory);

    // Filter lanjutan untuk memastikan setiap item adalah file gambar yang valid
    const fileChecks = await Promise.all(
      filenames.map(async (filename) => {
        try {
          const filePath = path.join(iconsDirectory, filename);
          const stat = await fs.stat(filePath);
          
          // Cek apakah itu file (bukan direktori)
          if (stat.isFile()) {
            const isHiddenFile = /^\./.test(filename) || filename.toLowerCase() === 'thumbs.db';
            const isImageFile = /\.(svg|png|jpg|jpeg|gif|webp)$/i.test(filename);

            if (isImageFile && !isHiddenFile) {
              return filename; // Kembalikan nama file jika valid
            }
          }
        } catch (err) {
            console.error(`Could not stat file: ${filename}`, err);
            return null;
        }
        return null; // Abaikan item jika itu direktori atau tidak valid
      })
    );

    // Hapus semua hasil null dari array
    const imageFiles = fileChecks.filter((file): file is string => file !== null);

    // Kirim daftar nama file yang sudah bersih sebagai response JSON
    return NextResponse.json({ icons: imageFiles });
  } catch (error) {
    console.error("Gagal membaca direktori ikon:", error);
    // Kirim pesan error jika direktori tidak ditemukan atau ada masalah lain
    return NextResponse.json(
      { message: "Direktori ikon tidak ditemukan atau gagal dibaca." },
      { status: 500 }
    );
  }
}
