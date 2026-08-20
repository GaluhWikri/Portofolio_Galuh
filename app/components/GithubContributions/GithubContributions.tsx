'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FaGithub } from 'react-icons/fa';
import { ExternalLink, Calendar, RefreshCw } from 'lucide-react';
import AnimatedNumber from '../AnimatedNumber/AnimatedNumber';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface GithubContributionsProps {
  username?: string;
  className?: string;
}

const MONTH_NAMES_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function GithubContributions({
  username = 'GaluhWikri',
  className = '',
}: GithubContributionsProps) {
  const [data, setData] = useState<ContributionDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch GitHub contribution data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/github-contributions?username=${username}`);
      if (!res.ok) throw new Error('Failed to load GitHub activity');
      const json = await res.json();
      if (json.contributions && json.contributions.length > 0) {
        setData(json.contributions);
      } else {
        throw new Error('No contribution data found');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching contributions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  // Process data into 52-53 weeks (7 rows per week)
  const { weeks, monthBuckets, stats, dateRangeStr } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        weeks: [],
        monthBuckets: [],
        stats: { total: 0, activeDays: 0, maxCount: 0, streak: 0 },
        dateRangeStr: '',
      };
    }

    // Organize into weeks (Sunday = 0 to Saturday = 6)
    const weeksArr: (ContributionDay | null)[][] = [];
    let currentWeek: (ContributionDay | null)[] = [];

    // Identify start and end dates
    const startDate = new Date(data[0].date);
    const endDate = new Date(data[data.length - 1].date);

    // Pad before first day if it does not start on Sunday
    const firstDayOfWeek = startDate.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    let activeDaysCount = 0;
    let totalContributions = 0;
    let maxDailyCount = 0;
    let currentStreak = 0;
    let tempStreak = 0;

    data.forEach((day) => {
      totalContributions += day.count;
      if (day.count > 0) {
        activeDaysCount++;
        tempStreak++;
        if (tempStreak > currentStreak) currentStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
      if (day.count > maxDailyCount) maxDailyCount = day.count;

      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArr.push(currentWeek);
    }

    // Group contributions into distinct chronological months spanning this period
    const monthlyMap: { [key: string]: { label: string; count: number; year: number; monthNum: number; weekIndices: number[] } } = {};

    weeksArr.forEach((week, wIdx) => {
      const day = week.find((d) => d !== null);
      if (day) {
        const dObj = new Date(day.date);
        const y = dObj.getFullYear();
        const m = dObj.getMonth();
        const key = `${y}-${m}`;
        if (!monthlyMap[key]) {
          monthlyMap[key] = {
            label: MONTH_NAMES_SHORT[m],
            count: 0,
            year: y,
            monthNum: m,
            weekIndices: [],
          };
        }
        if (!monthlyMap[key].weekIndices.includes(wIdx)) {
          monthlyMap[key].weekIndices.push(wIdx);
        }
      }
    });

    // Sum monthly counts accurately
    data.forEach((day) => {
      const dObj = new Date(day.date);
      const y = dObj.getFullYear();
      const m = dObj.getMonth();
      const key = `${y}-${m}`;
      if (monthlyMap[key]) {
        monthlyMap[key].count += day.count;
      }
    });

    const monthBucketsArr = Object.values(monthlyMap);

    // Format date range: e.g. "17 Aug 2025 to 21 Aug 2026"
    const startFormatted = `${startDate.getDate()} ${MONTH_NAMES_SHORT[startDate.getMonth()]} ${startDate.getFullYear()}`;
    const endFormatted = `${endDate.getDate()} ${MONTH_NAMES_SHORT[endDate.getMonth()]} ${endDate.getFullYear()}`;
    const rangeStr = `${startFormatted} to ${endFormatted}`;

    return {
      weeks: weeksArr,
      monthBuckets: monthBucketsArr,
      stats: {
        total: totalContributions,
        activeDays: activeDaysCount,
        maxCount: maxDailyCount,
        streak: currentStreak,
      },
      dateRangeStr: rangeStr,
    };
  }, [data]);

  // Determine which month is active based on hoveredDay or hoveredMonthIndex
  const activeMonthIdx = useMemo(() => {
    if (hoveredMonthIndex !== null) return hoveredMonthIndex;
    if (!hoveredDay) return null;
    const d = new Date(hoveredDay.date);
    const m = d.getMonth();
    const y = d.getFullYear();
    const foundIdx = monthBuckets.findIndex(
      (mb) => mb.monthNum === m && mb.year === y
    );
    return foundIdx !== -1 ? foundIdx : null;
  }, [hoveredDay, hoveredMonthIndex, monthBuckets]);

  // Max count among months for bar chart scaling
  const maxMonthCount = useMemo(() => {
    if (monthBuckets.length === 0) return 1;
    return Math.max(...monthBuckets.map((m) => m.count), 1);
  }, [monthBuckets]);

  // Helper to format footer / tooltip status text
  const statusInfo = useMemo(() => {
    if (hoveredDay) {
      const dObj = new Date(hoveredDay.date);
      const dayName = DAY_NAMES[dObj.getDay()];
      const dayNum = dObj.getDate();
      const monthStr = MONTH_NAMES_SHORT[dObj.getMonth()];
      const year = dObj.getFullYear();
      return `${dayNum} ${monthStr} ${year} · ${dayName} · ${hoveredDay.count} contribution${hoveredDay.count === 1 ? '' : 's'}`;
    }

    if (data.length > 0) {
      const lastDay = data[data.length - 1];
      const dObj = new Date(lastDay.date);
      const dayName = DAY_NAMES[dObj.getDay()];
      const dayNum = dObj.getDate();
      const monthStr = MONTH_NAMES_SHORT[dObj.getMonth()];
      const year = dObj.getFullYear();
      return `${dayNum} ${monthStr} ${year} · ${dayName} · ${lastDay.count} contribution${lastDay.count === 1 ? '' : 's'}`;
    }

    return 'Hover over any square or bar to inspect activity';
  }, [hoveredDay, data]);

  // Helper for square style & size based on level/count in Neo-Brutalism theme
  const getCellVisual = (day: ContributionDay | null) => {
    if (!day) return { sizeClass: 'w-1.5 h-1.5 opacity-0', bgClass: 'bg-transparent' };

    const count = day.count;
    if (count === 0) {
      return {
        sizeClass: 'w-1.5 h-1.5 rounded-[1px]',
        bgClass: 'bg-[#ebedf0] border border-gray-300/80 group-hover/cell:bg-gray-300 group-hover/cell:border-gray-500',
      };
    }
    if (count <= 2) {
      return {
        sizeClass: 'w-2.5 h-2.5 rounded-[1.5px]',
        bgClass: 'bg-[#a7f3d0] border border-[#6ee7b7] group-hover/cell:border-black',
      };
    }
    if (count <= 5) {
      return {
        sizeClass: 'w-3.5 h-3.5 rounded-[2px]',
        bgClass: 'bg-[#4ade80] border border-[#22c55e] shadow-[1px_1px_0px_#000] group-hover/cell:border-black',
      };
    }
    if (count <= 9) {
      return {
        sizeClass: 'w-4 h-4 rounded-[2.5px]',
        bgClass: 'bg-[#22c55e] border-2 border-black shadow-[1.5px_1.5px_0px_#000] group-hover/cell:border-black',
      };
    }
    // High activity (Level 4): Noticeably bigger and vibrant bright green
    return {
      sizeClass: 'w-[18px] h-[18px] rounded-[3px] z-10',
      bgClass: 'bg-[#00ff66] border-2 border-black shadow-[2.5px_2.5px_0px_#000] group-hover/cell:scale-110',
    };
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Outer Neo-Brutalism Card */}
      <div className="w-full bg-white border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col">
        
        {/* Header Bar */}
        <div className="bg-gray-50 border-b-4 border-black p-4 flex flex-wrap justify-between items-center gap-4 select-none">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 bg-black border-2 border-black inline-block shadow-[1px_1px_0px_#000]"></span>
            <span className="font-extrabold text-xs uppercase tracking-wider text-black">
              GITHUB ACTIVITY // 12 MONTHS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="neo-button text-xs py-1 px-3 flex items-center gap-1.5 font-bold"
            >
              <FaGithub size={14} />
              <span>@{username}</span>
              <ExternalLink size={12} />
            </a>

            <button
              onClick={fetchData}
              title="Refresh contributions"
              className="neo-button text-xs py-1 px-2.5 flex items-center justify-center"
              aria-label="Refresh"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          
          {/* Activity Title & Stats Subtitle */}
          <div>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-2">
              12 Months of Activity
            </h3>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm font-mono">
              <span className="font-black text-black bg-black text-white px-2 py-0.5 shadow-[2px_2px_0px_#ccc]">
                <AnimatedNumber value={stats.total} /> CONTRIBUTIONS
              </span>
              <span className="text-black font-bold">·</span>
              <span className="font-bold text-gray-800">
                {stats.activeDays} ACTIVE DAYS
              </span>
              <span className="text-black font-bold">·</span>
              <span className="text-gray-500 font-semibold">
                {dateRangeStr || 'LAST 365 DAYS'}
              </span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-600 font-mono text-xs">
              <RefreshCw size={24} className="animate-spin text-black" />
              <span>Loading GitHub activity stream...</span>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-4 bg-red-50 border-2 border-red-500 rounded text-red-700 font-mono text-xs flex items-center justify-between">
              <span>Error: {error}</span>
              <button onClick={fetchData} className="underline text-red-900 font-bold hover:text-black">
                Retry
              </button>
            </div>
          )}

          {/* Visualization Board */}
          {!loading && data.length > 0 && (
            <div
              ref={containerRef}
              className="w-full overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 select-none"
            >
              <div className="min-w-[760px] flex flex-col gap-6">
                
                {/* 1. Heatmap Grid (7 rows x ~53 cols) */}
                <div className="flex items-start gap-1 justify-between">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1 items-center">
                      {week.map((day, dayIndex) => {
                        const { sizeClass, bgClass } = getCellVisual(day);
                        const isHovered = hoveredDay && day && hoveredDay.date === day.date;

                        return (
                          <div
                            key={dayIndex}
                            onMouseEnter={() => day && setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            className="w-3.5 h-3.5 flex items-center justify-center cursor-pointer group/cell relative"
                          >
                            <div
                              className={`transition-all duration-150 ${sizeClass} ${bgClass} ${
                                isHovered
                                  ? '!scale-150 !border-2 !border-black !bg-[#22c55e] !shadow-[3px_3px_0px_#000] z-20'
                                  : ''
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* 2. Monthly Bar Chart & Month Indicators */}
                <div className="relative pt-3 border-t-2 border-gray-200">
                  <div className="grid grid-flow-col auto-cols-fr gap-2 items-end">
                    {monthBuckets.map((m, idx) => {
                      const isActive = activeMonthIdx === idx;
                      const barHeightRatio = m.count / maxMonthCount;
                      // Height scale: 0 count -> 3px, max count -> 50px
                      const barHeightPx = m.count === 0 ? 3 : Math.max(8, Math.round(barHeightRatio * 50));

                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredMonthIndex(idx)}
                          onMouseLeave={() => setHoveredMonthIndex(null)}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group/month"
                        >
                          {/* Monthly contribution count */}
                          <span
                            className={`text-[10px] font-mono font-bold transition-all duration-150 ${
                              isActive
                                ? 'text-emerald-700 scale-110 font-black'
                                : m.count > 0
                                ? 'text-gray-700'
                                : 'text-gray-300'
                            }`}
                          >
                            {m.count}
                          </span>

                          {/* Bar Graphic */}
                          <div className="w-full flex items-end justify-center h-[54px]">
                            <div
                              style={{ height: `${barHeightPx}px` }}
                              className={`w-full max-w-[22px] border-2 border-black transition-all duration-200 ${
                                isActive
                                  ? 'bg-[#00ff66] shadow-[3px_3px_0px_#000]'
                                  : m.count > 0
                                  ? 'bg-[#22c55e] group-hover/month:bg-[#00ff66] group-hover/month:shadow-[2px_2px_0px_#000]'
                                  : 'bg-gray-100 border-gray-300'
                              }`}
                            />
                          </div>

                          {/* Month Label */}
                          <span
                            className={`text-[11px] font-mono tracking-wider font-extrabold transition-colors duration-150 ${
                              isActive
                                ? 'text-black underline decoration-2'
                                : 'text-gray-500 group-hover/month:text-black'
                            }`}
                          >
                            {m.label}
                          </span>

                          {/* Focus Bracket Indicator */}
                          <div className="h-2.5 w-full flex items-center justify-center">
                            {isActive ? (
                              <div className="w-full flex items-center justify-center">
                                <span className="w-full border-b-2 border-l-2 border-r-2 border-black h-2"></span>
                              </div>
                            ) : (
                              <div className="w-full h-2"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Footer Bar: Real-time Hover Detail Inspector & Legend */}
          <div className="pt-4 border-t-2 border-black flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            {/* Dynamic Hover Status */}
            <div className="flex items-center gap-2 text-black bg-gray-100 border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000]">
              <Calendar size={14} className="text-emerald-700" />
              <span className="font-bold">{statusInfo}</span>
            </div>

            {/* Level Legend */}
            <div className="flex items-center gap-2 text-gray-700 text-xs font-bold">
              <span>LESS</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-[1px] bg-[#ebedf0] border border-gray-300/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-[1.5px] bg-[#a7f3d0] border border-[#6ee7b7] inline-block" />
                <span className="w-3.5 h-3.5 rounded-[2px] bg-[#4ade80] border border-[#22c55e] shadow-[1px_1px_0px_#000] inline-block" />
                <span className="w-4 h-4 rounded-[2.5px] bg-[#22c55e] border-2 border-black shadow-[1.5px_1.5px_0px_#000] inline-block" />
                <span className="w-[18px] h-[18px] rounded-[3px] bg-[#00ff66] border-2 border-black shadow-[2px_2px_0px_#000] inline-block" />
              </div>
              <span>MORE</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
