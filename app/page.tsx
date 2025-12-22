// app/page.tsx

import ClientHomePage from './ClientHomePage';
import { getPortfolioData } from '@/lib/dataFetcher';

// ISR (Incremental Static Regeneration) - Revalidate setiap 1 jam
// Halaman akan di-cache dan hanya refetch dari Supabase setiap 3600 detik (1 jam)
// Ini membuat halaman load INSTANT untuk semua user, sambil tetap update otomatis
export const revalidate = 3600; // 1 hour cache

/**
 * Main page component
 * Fetches portfolio data from Supabase with automatic fallback to data.json
 * 
 * Data flow:
 * 1. Try to fetch skills & projects from Supabase
 * 2. If Supabase fails/not configured, use local data.json
 * 3. aboutMe & education always from data.json (rarely change)
 */
export default async function Page() {
    // Fetch data from Supabase (with fallback to data.json)
    const data = await getPortfolioData();

    return <ClientHomePage data={data} />;
}