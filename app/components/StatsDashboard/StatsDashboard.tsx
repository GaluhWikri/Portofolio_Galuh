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
    <div className="flex items-start gap-3 text-gray-300">
        <div className="mt-1">{icon}</div>
        <div>
            <p className="font-bold text-lg text-white">
                <AnimatedNumber value={value} /> {subLabel && <span className='text-base'>{subLabel}</span>}
            </p>
            <p className="text-xs text-gray-400">{label}</p>
        </div>
    </div>
);

const GradientStatCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={`relative bg-gray-800 rounded-2xl p-6 overflow-hidden ${className}`}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(45, 212, 191, 0.15), transparent 70%)' }} />
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
            <div className="lg:col-span-1 h-96 lg:h-auto lg:row-span-2">
                <SkillsCard />
            </div>

            <GradientStatCard className="lg:col-span-2">
                <h3 className="text-xl font-bold">Coding Time Since</h3>
                <p className="text-6xl font-bold text-green-400 mt-4">
                    <AnimatedNumber value={codingHours} /> <span className="text-3xl text-gray-400">Hrs</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">March 2, 2022</p>
            </GradientStatCard>

            <GradientStatCard className="lg:col-span-2">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">GitHub Stats</h3>
                    <FaGithub className="w-8 h-8 text-gray-500" />
                </div>
                {loading ? (
                    <p className="text-gray-400 mt-4">Fetching live data from GitHub...</p>
                ) : error ? (
                    <p className="text-red-400 mt-4">Error: {error}</p>
                ) : stats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 mt-4">
                        <StatItem icon={<FolderGit2 size={20} />} value={stats.publicRepos} label="Public Repositories" />
                        <StatItem icon={<GitCommit size={20} />} value={stats.commits} label="Commits" />
                        <StatItem icon={<GitPullRequest size={20} />} value={stats.pullRequests} label="Pull Requests" />
                        <StatItem icon={<CircleDot size={20} />} value={stats.issues} label="Issues" />
                        <StatItem icon={<History size={20} />} value={stats.contributedTo} label="Contributed to" />
                    </div>
                ) : (
                    <p className="text-red-400 mt-4">No stats available.</p>
                )}
            </GradientStatCard>
        </div>
    );
};

export default StatsDashboard;