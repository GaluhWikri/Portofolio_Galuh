// app/page.tsx

import ClientHomePage from './ClientHomePage';
import { getPortfolioData } from '@/lib/dataFetcher';

// Dynamic Rendering - Data selalu fresh dari Supabase
// Setiap kali halaman diakses, data akan diambil langsung dari database
// Ini memastikan data yang baru di-insert langsung tampil
export const dynamic = 'force-dynamic';
export const revalidate = 0; // No caching


export default async function Page() {
    // Fetch data from Supabase (with fallback to data.json)
    const data = await getPortfolioData();

    return <ClientHomePage data={data} />;
}