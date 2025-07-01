// app/components/StatsDashboard/StatsDashboard.tsx
'use client';

import React from 'react';
import SkillsCard from '../SkillsCard/SkillsCard';
import { FolderGit2, GitCommit, GitPullRequest, CircleDot, History } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import AnimatedNumber from '../AnimatedNumber/AnimatedNumber';

const staticStats = {
    publicRepos: 37,
    commits: 403,
    pullRequests: 71,
    issues: 3,
    contributedTo: 7,
};

const StatItem = ({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) => (
    <div className="flex items-start gap-3 text-gray-300">
        <div className="mt-1">{icon}</div>
        <div>
            <p className="font-bold text-lg text-white">
                <AnimatedNumber value={value} />
            </p>
            <p className="text-xs text-gray-400">{label}</p>
        </div>
    </div>
);

// --- Komponen kartu dengan efek gradien statis ---
const GradientStatCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div
            className={`relative bg-gray-800 rounded-2xl p-6 overflow-hidden ${className}`}
        >
            {/* Efek gradien statis */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, rgba(45, 212, 191, 0.15), transparent 70%)',
                }}
            />
            {/* Konten kartu */}
            <div className="relative">
                {children}
            </div>
        </div>
    );
};

const StatsDashboard = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            <div className="lg:col-span-1 h-96 lg:h-auto lg:row-span-2">
                <SkillsCard />
            </div>
            
            <GradientStatCard className="lg:col-span-2">
                <h3 className="text-xl font-bold">Coding Time Since</h3>
                <p className="text-6xl font-bold text-green-400 mt-4">
                    <AnimatedNumber value={1222} /> <span className="text-3xl text-gray-400">Hrs</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">March 2, 2022</p>
            </GradientStatCard>

            <GradientStatCard className="lg:col-span-2">
                 <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold">GitHub Stats</h3>
                    <FaGithub className="w-8 h-8 text-gray-500" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 mt-4">
                    <StatItem icon={<FolderGit2 size={20} />} value={staticStats.publicRepos} label="Public Repositories" />
                    <div className="flex items-start gap-3 text-gray-300">
                        <div className="mt-1"><GitCommit size={20} /></div>
                        <div>
                            <p className="font-bold text-lg text-white">
                                <AnimatedNumber value={staticStats.commits} /> (2025)
                            </p>
                            <p className="text-xs text-gray-400">Commits</p>
                        </div>
                    </div>
                    <StatItem icon={<GitPullRequest size={20} />} value={staticStats.pullRequests} label="Pull Requests" />
                    <StatItem icon={<CircleDot size={20} />} value={staticStats.issues} label="Issues" />
                    <StatItem icon={<History size={20} />} value={staticStats.contributedTo} label="Contributed to" />
                </div>
            </GradientStatCard>
        </div>
    );
};

export default StatsDashboard;
