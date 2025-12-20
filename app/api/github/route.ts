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
  // Token checker (Optional for debugging)
  const hasToken = !!process.env.GITHUB_TOKEN;
  console.log(`GitHub Token Present: ${hasToken}`);


  try {
    // 1. Ambil data profil pengguna untuk Public Repos
    const userPromise = octokit.users.getByUsername({
      username: GITHUB_USERNAME,
    });

    // 2. Gunakan Search API untuk menghitung Total Commits
    // Note: Search Commits API memiliki rate limit terpisah dan mungkin tidak 100% akurat real-time, tapi lebih baik dari static.
    const commitsPromise = octokit.search.commits({
      q: `author:${GITHUB_USERNAME}`,
    });

    // 3. Gunakan Search API untuk menghitung Total PRs
    const prsPromise = octokit.search.issuesAndPullRequests({
      q: `type:pr author:${GITHUB_USERNAME}`,
    });

    // 4. Gunakan Search API untuk menghitung Total Issues
    const issuesPromise = octokit.search.issuesAndPullRequests({
      q: `type:issue author:${GITHUB_USERNAME}`,
    });

    // Jalankan semua requests secara paralel agar cepat
    const [user, commits, prs, issues] = await Promise.all([
      userPromise,
      commitsPromise,
      prsPromise,
      issuesPromise
    ]);

    const stats = {
      publicRepos: user.data.public_repos,
      commits: commits.data.total_count,
      pullRequests: prs.data.total_count,
      issues: issues.data.total_count,
      contributedTo: 7, // Data ini sangat kompleks untuk diambil via REST API, tetap gunakan static/estimasi
    };

    return NextResponse.json(stats);

  } catch (error: any) {
    console.error("Gagal mengambil data dari API GitHub:", error.message);
    // Jika terjadi error (misalnya token salah atau rate limit), kirim data fallback
    const fallbackStats = {
      publicRepos: 37,
      commits: 403,
      pullRequests: 71,
      issues: 3,
      contributedTo: 7,
    };
    return NextResponse.json(fallbackStats, { status: 200 });
  }
}