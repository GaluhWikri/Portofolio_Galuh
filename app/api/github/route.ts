// app/api/github/route.ts

import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const GITHUB_USERNAME = "GaluhWikri";

export const dynamic = "force-dynamic";

export async function GET() {
  // Pastikan token ada untuk menghindari error
  if (!process.env.GITHUB_TOKEN) {
    console.error("GITHUB_TOKEN tidak ditemukan.");
    // Kembalikan data fallback jika token tidak ada
    const fallbackStats = {
      publicRepos: 37,
      commits: 403,
      pullRequests: 71,
      issues: 3,
      contributedTo: 7,
    };
    return NextResponse.json(fallbackStats);
  }

  try {
    // 1. Ambil data profil pengguna (ini adalah panggilan API yang sangat cepat)
    const user = await octokit.users.getByUsername({
      username: GITHUB_USERNAME,
    });

    // 2. Kombinasikan data dinamis yang cepat dengan data statis untuk yang lambat
    // Ini adalah kunci agar dashboard memuat secara instan.
    const stats = {
      publicRepos: user.data.public_repos || 0, // <-- Data ini dinamis dari akun Anda
      // Gunakan nilai statis yang representatif untuk data yang lambat
      commits: 403,
      pullRequests: 71,
      issues: 3,
      contributedTo: 7,
    };

    return NextResponse.json(stats);

  } catch (error: any) {
    console.error("Gagal mengambil data dari API GitHub:", error.message);
    // Jika terjadi error (misalnya token salah), kirim data fallback
    const fallbackStats = {
      publicRepos: 37,
      commits: 403,
      pullRequests: 71,
      issues: 3,
      contributedTo: 7,
    };
    return NextResponse.json(fallbackStats, { status: 500 });
  }
}