'use client';

// Optimized Projects Section with Performance Enhancements
// Path: app/components/Projects/ProjectsSection.tsx

import { type Project } from '@/lib/supabase';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

interface ProjectCardProps {
    project: Project;
    index: number;
}

function ProjectCard({ project, index }: ProjectCardProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    // Priority untuk 6 gambar pertama (2 baris di desktop)
    const shouldPrioritize = index < 6;

    const handleClick = () => {
        if (project.link) {
            window.open(project.link, '_blank');
        }
    };

    return (
        <div
            onClick={handleClick}
            className="relative rounded-2xl overflow-hidden group h-96 shadow-2xl cursor-pointer bg-[#0C0A09] border border-white/5 hover:border-white/20 transition-all"
        >
            {/* Loading Skeleton */}
            {!isLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 animate-pulse" />
            )}

            {/* Image Container */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                <Image
                    src={project.image_url}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover object-top transition-all duration-700 ease-in-out group-hover:scale-105 ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
                        }`}
                    priority={shouldPrioritize}
                    loading={shouldPrioritize ? undefined : 'lazy'}
                    onLoad={() => setIsLoaded(true)}
                    quality={85}
                />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                {/* Arrow Icon */}
                <div className="absolute top-6 right-6 translate-x-4 -translate-y-4 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white text-black p-3 rounded-full shadow-lg">
                        <ArrowUpRight size={24} />
                    </div>
                </div>

                {/* Text Content */}
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
                        {project.title}
                    </h3>
                    {project.description && (
                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                            {project.description}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech) => (
                            <span
                                key={tech}
                                className="text-xs font-medium bg-white/10 backdrop-blur-sm text-gray-200 px-3 py-1.5 rounded-full border border-white/10"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ProjectsSectionProps {
    projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
    // Separate by category
    const uiuxProjects = projects.filter((p) => p.category === 'UI/UX');
    const webProjects = projects.filter((p) => p.category === 'WEB');

    return (
        <section id="project" className="py-24 max-w-7xl mx-auto px-4">
            <h2 className="text-5xl font-bold text-center mb-16 text-white">
                Projects
            </h2>

            {/* UI/UX Projects */}
            {uiuxProjects.length > 0 && (
                <div className="mb-20">
                    <h3 className="text-3xl font-semibold mb-8 text-white border-b border-white/10 pb-4">
                        UI/UX Design
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {uiuxProjects.map((project, index) => (
                            <ProjectCard key={project.id} project={project} index={index} />
                        ))}
                    </div>
                </div>
            )}

            {/* Web Projects */}
            {webProjects.length > 0 && (
                <div>
                    <h3 className="text-3xl font-semibold mb-8 text-white border-b border-white/10 pb-4">
                        Web Development
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {webProjects.map((project, index) => (
                            <ProjectCard key={project.id} project={project} index={index + uiuxProjects.length} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {projects.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-400 text-lg">No projects found.</p>
                </div>
            )}
        </section>
    );
}
