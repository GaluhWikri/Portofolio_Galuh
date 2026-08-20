import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface MonthlyData {
  month: string; // e.g. "AUG"
  year: number;
  count: number;
  monthIndex: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || 'GaluhWikri';

  try {
    // Attempt to fetch live contributions from public GitHub contributions API
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, {
      headers: {
        'User-Agent': 'Portfolio-App',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`GitHub Contributions API returned status ${res.status}`);
    }

    const data = await res.json();
    const contributions: ContributionDay[] = data.contributions || [];
    const totalLastYear = data.total?.lastYear ?? contributions.reduce((acc, curr) => acc + curr.count, 0);

    return NextResponse.json({
      success: true,
      username,
      total: totalLastYear,
      contributions,
    });
  } catch (error: any) {
    console.warn('Live GitHub contribution fetch failed, falling back to simulated data:', error.message);
    
    // Fallback data generator (365 days) if offline or external API blocked
    const fallbackDays: ContributionDay[] = [];
    const today = new Date();
    let totalCount = 0;

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Simulate realistic activity pattern for GaluhWikri
      const dayOfWeek = d.getDay();
      const month = d.getMonth();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let count = 0;
      const rand = Math.random();
      if (month === 7 || month === 0) { // Aug / Jan peak
        if (rand > 0.4) count = Math.floor(Math.random() * 8) + 1;
      } else if (rand > 0.7 && !isWeekend) {
        count = Math.floor(Math.random() * 5) + 1;
      } else if (rand > 0.85) {
        count = Math.floor(Math.random() * 3) + 1;
      }

      let level = 0;
      if (count >= 10) level = 4;
      else if (count >= 6) level = 3;
      else if (count >= 3) level = 2;
      else if (count >= 1) level = 1;

      totalCount += count;
      fallbackDays.push({
        date: dateStr,
        count,
        level,
      });
    }

    return NextResponse.json({
      success: true,
      username,
      total: totalCount || 508,
      contributions: fallbackDays,
      isFallback: true,
    });
  }
}
