// lib/dataFetcher.ts
// Utility untuk fetch data dari Supabase dengan fallback ke data.json

import { getSkills, getProjects } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';

// Interface untuk compatibility dengan existing code
interface Tool {
    name: string;
    icon: string;
}

interface Project {
    id: number;
    title: string;
    category: string;
    tech: string[];
    imgSrc: string | null;
    link?: string;
}

interface PortfolioData {
    aboutMe: string;
    education: {
        university: string;
        major: string;
        period: string;
    };
    tools: Tool[];
    projects: Project[];
}

/**
 * Fetch portfolio data dari Supabase dengan fallback ke data.json
 */
export async function getPortfolioData(): Promise<PortfolioData> {
    try {
        // Read local data.json untuk aboutMe dan education
        const filePath = path.join(process.cwd(), 'data.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const localData = JSON.parse(fileContent);

        let tools: Tool[] = [];
        let projects: Project[] = [];

        // Try to fetch from Supabase
        try {
            console.log('🔄 Fetching data from Supabase...');

            // Fetch skills (tools) from Supabase
            const supabaseSkills = await getSkills();

            if (supabaseSkills && supabaseSkills.length > 0) {
                console.log(`✅ Loaded ${supabaseSkills.length} skills from Supabase`);
                tools = supabaseSkills.map((skill) => ({
                    name: skill.name,
                    icon: skill.icon_url, // Map icon_url to icon for compatibility
                }));
            } else {
                console.log('⚠️ No skills from Supabase, using local data.json');
                tools = localData.tools || [];
            }

            // Fetch projects from Supabase
            const supabaseProjects = await getProjects();

            if (supabaseProjects && supabaseProjects.length > 0) {
                console.log(`✅ Loaded ${supabaseProjects.length} projects from Supabase`);
                projects = supabaseProjects.map((project) => ({
                    id: project.id,
                    title: project.title,
                    category: project.category,
                    tech: project.tech,
                    imgSrc: project.image_url, // Map image_url to imgSrc for compatibility
                    link: project.link,
                }));
            } else {
                console.log('⚠️ No projects from Supabase, using local data.json');
                projects = localData.projects || [];
            }

        } catch (supabaseError) {
            console.error('❌ Supabase fetch error, falling back to data.json:', supabaseError);
            // Fallback to local data
            tools = localData.tools || [];
            projects = localData.projects || [];
        }

        return {
            aboutMe: localData.aboutMe,
            education: localData.education,
            tools,
            projects,
        };

    } catch (error) {
        console.error('❌ Error reading data.json:', error);
        // Return minimum data structure if everything fails
        return {
            aboutMe: 'Failed to load data. Please check your configuration.',
            education: { university: '', major: '', period: '' },
            tools: [],
            projects: [],
        };
    }
}

/**
 * Fetch only skills/tools from Supabase with fallback
 */
export async function getTools(): Promise<Tool[]> {
    try {
        const skills = await getSkills();
        return skills.map((skill) => ({
            name: skill.name,
            icon: skill.icon_url,
        }));
    } catch (error) {
        console.error('Error fetching tools:', error);
        // Fallback to data.json
        const filePath = path.join(process.cwd(), 'data.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const localData = JSON.parse(fileContent);
        return localData.tools || [];
    }
}

/**
 * Fetch only projects from Supabase with fallback
 */
export async function getProjectsData(): Promise<Project[]> {
    try {
        const supabaseProjects = await getProjects();
        return supabaseProjects.map((project) => ({
            id: project.id,
            title: project.title,
            category: project.category,
            tech: project.tech,
            imgSrc: project.image_url,
            link: project.link,
        }));
    } catch (error) {
        console.error('Error fetching projects:', error);
        // Fallback to data.json
        const filePath = path.join(process.cwd(), 'data.json');
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const localData = JSON.parse(fileContent);
        return localData.projects || [];
    }
}
