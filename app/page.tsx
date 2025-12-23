// app/page.tsx

import ClientHomePage from './ClientHomePage';
import { getPortfolioData } from '@/lib/dataFetcher';

// ISR (Incremental Static Regeneration)
// Development: Revalidate setiap 30 detik (untuk testing cepat)
// Production: Revalidate setiap 1 jam (untuk performa optimal)
// Untuk update instant, gunakan: http://localhost:3000/api/revalidate?secret=dev123
export const revalidate = process.env.NODE_ENV === 'development' ? 30 : 3600;

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