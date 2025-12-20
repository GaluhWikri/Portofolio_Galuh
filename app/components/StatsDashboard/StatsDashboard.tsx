// app/components/StatsDashboard/StatsDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import SkillsCard from '../SkillsCard/SkillsCard';
import { FolderGit2, GitCommit, GitPullRequest, CircleDot, History } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import AnimatedNumber from '../AnimatedNumber/AnimatedNumber';

interface GitHubStats {
    publicRepos: number;
    commits: number;
    pullRequests: number;
    issues: number;
    contributedTo: number;
}

const StatItem = ({ icon, value, label, subLabel }: { icon: React.ReactNode, value: number, label: string, subLabel?: string }) => (
    <div className="flex items-center gap-4 text-gray-300">
        <div className="mt-1 p-2 bg-white/5 rounded-lg">{icon}</div>
        <div>
            <p className="font-bold text-2xl text-white leading-none mb-1">
                <AnimatedNumber value={value} /> {subLabel && <span className='text-lg text-gray-400'>{subLabel}</span>}
            </p>
            <p className="text-sm font-medium text-gray-400">{label}</p>
        </div>
    </div>
);

const GradientStatCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={`relative bg-[#0C0A09] border border-[#EAEAEA]/10 rounded-2xl p-6 overflow-hidden ${className}`}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.05), transparent 70%)' }} />
            <div className="relative">
                {children}
            </div>
        </div>
    );
};

const StatsDashboard = () => {
    const [stats, setStats] = useState<GitHubStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Nilai jam akan tetap dihitung secara dinamis di sisi klien
    const [codingHours, setCodingHours] = useState(0);

    useEffect(() => {
        const startDate = new Date('2022-03-02T00:00:00Z');
        const now = new Date();
        const diffMs = now.getTime() - startDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        setCodingHours(diffHours);

        const fetchGitHubStats = async () => {
            try {
                const response = await fetch('/api/github');
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Gagal mengambil data GitHub');
                }
                setStats(result);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
                setStats(null);
            } finally {
                setLoading(false);
            }
        };

        fetchGitHubStats();
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Left Column: Skills (Spans 2 rows, takes 2/3 width) */}
            <div className="lg:col-span-2 h-full min-h-[400px] lg:row-span-2">
                <SkillsCard />
            </div>

            {/* Right Column Top: Coding Time (Takes 1/3 width) */}
            <GradientStatCard className="lg:col-span-1 flex flex-col items-center justify-center text-center py-10">
                <p className="text-7xl lg:text-8xl font-bold mb-2 text-white flex items-baseline gap-2">
                    <AnimatedNumber value={codingHours} /> <span className="text-3xl font-bold text-white/70">Hrs</span>
                </p>
                <div className="text-gray-400 font-medium text-lg">Coding Time Since</div>
                <div className="text-gray-500 text-sm mt-1">March 2, 2022</div>
            </GradientStatCard>

            {/* Right Column Bottom: GitHub Stats (Takes 1/3 width) */}
            <GradientStatCard className="lg:col-span-1">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">GitHub Stats</h3>
                        <p className="text-gray-500 text-xs">Based on real-time data</p>
                    </div>
                    <FaGithub className="w-10 h-10 text-white opacity-80" />
                </div>

                {loading ? (
                    <div className="animate-pulse flex flex-col gap-3">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                    </div>
                ) : error ? (
                    <p className="text-red-400">Error: {error}</p>
                ) : stats ? (
                    <div className="flex flex-col gap-5">
                        <StatItem icon={<FolderGit2 size={24} className="text-white" />} value={stats.publicRepos} label="Public Repositories" />
                        <StatItem icon={<GitCommit size={24} className="text-white" />} value={stats.commits} label="Commits (2025)" />
                        <StatItem icon={<GitPullRequest size={24} className="text-white" />} value={stats.pullRequests} label="Pull Requests" />
                        <StatItem icon={<CircleDot size={24} className="text-white" />} value={stats.issues} label="Issues" />
                        <StatItem icon={<History size={24} className="text-white" />} value={stats.contributedTo} label="Contributed to" />
                    </div>
                ) : (
                    <p className="text-gray-400">No stats available.</p>
                )}
            </GradientStatCard>
        </div>
    );
};

export default StatsDashboard;