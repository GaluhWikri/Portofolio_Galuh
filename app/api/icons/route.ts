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
    // Baca semua nama file di dalam direktori
    const filenames = await fs.readdir(iconsDirectory);

    // Filter untuk hanya menyertakan file gambar yang umum (opsional tapi bagus)
    const imageFiles = filenames.filter((file) =>
      /\.(svg|png|jpg|jpeg|gif|webp)$/i.test(file)
    );

    // Kirim daftar nama file sebagai response JSON
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