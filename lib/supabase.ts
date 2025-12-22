import { createClient } from '@supabase/supabase-js';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Please check your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Skill {
    id: number;
    name: string;
    icon_url: string;
    category: string;
    order_index: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Project {
    id: number;
    title: string;
    category: 'UI/UX' | 'WEB';
    description?: string;
    tech: string[];
    image_url: string;
    link?: string;
    order_index: number;
    is_featured: boolean;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

// API Functions
export const getSkills = async (): Promise<Skill[]> => {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('⚠️ Supabase not configured, skipping fetch');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('skills')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching skills:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching skills:', error);
        return [];
    }
};

export const getProjects = async (category?: 'UI/UX' | 'WEB'): Promise<Project[]> => {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('⚠️ Supabase not configured, skipping fetch');
        return [];
    }

    try {
        let query = supabase
            .from('projects')
            .select('*')
            .eq('is_active', true);

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query.order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching projects:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching projects:', error);
        return [];
    }
};

export const getFeaturedProjects = async (): Promise<Project[]> => {
    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('⚠️ Supabase not configured, skipping fetch');
        return [];
    }

    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('is_active', true)
            .eq('is_featured', true)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('Error fetching featured projects:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Unexpected error fetching featured projects:', error);
        return [];
    }
};

export const getProjectById = async (id: number): Promise<Project | null> => {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

    if (error) {
        console.error('Error fetching project:', error);
        return null;
    }

    return data;
};
