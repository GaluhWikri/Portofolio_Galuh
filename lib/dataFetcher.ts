// lib/dataFetcher.ts
// Utility untuk fetch data portofolio: konten dari Supabase Storage, skills & projects dari Supabase,
// dengan fallback ke data.json kalau Supabase tidak tersedia.

import { getSkills, getProjects } from '@/lib/supabase';
import { readProfile } from '@/lib/content';
import fs from 'fs/promises';
import path from 'path';

interface Tool {
    name: string;
    icon: string;
    // ponytail: filter skill (mis. "Primary Stack, Tools") numpang di kolom skills.category
    // yang tadinya nganggur — nggak perlu kolom/tabel baru buat sesuatu yang cuma label.
    filters?: string;
}

interface Project {
    id: number;
    title: string;
    category: string;
    tech: string[];
    imgSrc: string | null;
    link?: string;
    description?: string;
    github?: string;
}

interface PortfolioData {
    aboutMe: string;
    education: {
        university: string;
        major: string;
        period: string;
    };
    experience?: {
        company: string;
        position: string;
        period: string;
        description: string;
    }[];
    contact: { location: string; email: string; phone: string };
    socials: { github: string; linkedin: string; instagram: string };
    softSkills: string[];
    tools: Tool[];
    projects: Project[];
}

const readLocalData = async () => {
    try {
        return JSON.parse(await fs.readFile(path.join(process.cwd(), 'data.json'), 'utf-8'));
    } catch (error) {
        console.error('❌ Error reading data.json:', error);
        return {};
    }
};

/**
 * Fetch portfolio data dari Supabase dengan fallback ke data.json
 */
export async function getPortfolioData(): Promise<PortfolioData> {
    const [profile, localData] = await Promise.all([readProfile(), readLocalData()]);

    let tools: Tool[] = localData.tools || [];
    let projects: Project[] = localData.projects || [];

    try {
        const supabaseSkills = await getSkills();
        if (supabaseSkills.length > 0) {
            tools = supabaseSkills.map((skill) => ({ name: skill.name, icon: skill.icon_url, filters: skill.category }));
        }

        const supabaseProjects = await getProjects();
        if (supabaseProjects.length > 0) {
            projects = supabaseProjects.map((project) => ({
                id: project.id,
                title: project.title,
                category: project.category,
                tech: project.tech,
                imgSrc: project.image_url,
                link: project.link,
                description: project.description,
                github: project.github || undefined,
            }));
        }
    } catch (supabaseError) {
        console.error('❌ Supabase fetch error, falling back to data.json:', supabaseError);
    }

    return { ...profile, tools, projects };
}

/**
 * Fetch only skills/tools from Supabase with fallback
 */
export async function getTools(): Promise<Tool[]> {
    try {
        const skills = await getSkills();
        if (skills.length > 0) return skills.map((skill) => ({ name: skill.name, icon: skill.icon_url, filters: skill.category }));
    } catch (error) {
        console.error('Error fetching tools:', error);
    }
    return (await readLocalData()).tools || [];
}

/**
 * Fetch only projects from Supabase with fallback
 */
export async function getProjectsData(): Promise<Project[]> {
    try {
        const supabaseProjects = await getProjects();
        if (supabaseProjects.length > 0) {
            return supabaseProjects.map((project) => ({
                id: project.id,
                title: project.title,
                category: project.category,
                tech: project.tech,
                imgSrc: project.image_url,
                link: project.link,
                description: project.description,
                github: project.github || undefined,
            }));
        }
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
    return (await readLocalData()).projects || [];
}
