// Server Component Wrapper for Projects Section
// Path: app/components/Projects/ProjectsSectionWrapper.tsx

import { getProjects } from '@/lib/supabase';
import ProjectsSection from './ProjectsSection';

export default async function ProjectsSectionWrapper() {
    // Fetch all projects from Supabase
    const projects = await getProjects();

    return <ProjectsSection projects={projects} />;
}
