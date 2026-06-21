// app/ClientHomePage.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ArrowUpRight, Download, Mail, ExternalLink, Copy, Check, MapPin, Phone, User, FolderOpen, Zap, Home, Menu, X, Briefcase } from 'lucide-react';
import { FaGithub, FaLinkedinIn, FaInstagram, FaDribbble } from 'react-icons/fa';
import InteractiveBackground from './components/InteractiveBackground/InteractiveBackground';
import ClientOnly from './components/ClientOnly';
import dynamic from 'next/dynamic';

import FloatingSkills from './components/FloatingSkills/FloatingSkills';

import AnimatedNumber from './components/AnimatedNumber/AnimatedNumber';

// Interfaces
interface Project {
    id: number;
    title: string;
    tech: string[];
    imgSrc: string | null;
    category: string;
    link?: string;
    description?: string;
    github?: string;
}

interface SkillItem {
    name: string;
    icon: string;
}

interface NavItem {
    id: string;
    label: string;
    number: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    { id: 'home', label: 'HOME', number: '01', icon: <Home size={18} /> },
    { id: 'about', label: 'ABOUT ME', number: '02', icon: <User size={18} /> },
    { id: 'experience', label: 'EXPERIENCE', number: '03', icon: <Briefcase size={18} /> },
    { id: 'projects', label: 'PROJECTS', number: '04', icon: <FolderOpen size={18} /> },
    { id: 'skills', label: 'SKILLS', number: '05', icon: <Zap size={18} /> },
    { id: 'contact', label: 'CONTACT', number: '06', icon: <Mail size={18} /> },
];

// Neo-Brutalism Project Card Component
// Neo-Brutalism Project Card Component
const NeoProjectCard = ({
    project,
    onClick,
    index
}: {
    project: Project;
    onClick: () => void;
    index: number;
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const shouldPrioritize = index < 6;

    return (
        <motion.div
            className="project-card group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={onClick}
        >
            {project.imgSrc && !hasError ? (
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                    <Image
                        src={project.imgSrc}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={`project-image object-cover transition-all duration-500 group-hover:scale-105 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                            }`}
                        onLoad={() => setIsLoaded(true)}
                        onError={() => {
                            setHasError(true);
                            setIsLoaded(true);
                        }}
                        priority={shouldPrioritize}
                        loading={shouldPrioritize ? undefined : 'lazy'}
                    />
                    {!isLoaded && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                    {/* Hover arrow indicator */}
                    <div className="absolute top-4 right-4 opacity-0 translate-x-4 -translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 z-10">
                        <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                            <ArrowUpRight size={18} />
                        </div>
                    </div>
                </div>
            ) : (
                // Fallback UI when image fails or is missing
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-50 border-b-3 border-black flex items-center justify-center p-6">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_#000]">
                            <span className="text-2xl font-black">{project.title.charAt(0)}</span>
                        </div>
                        <p className="font-bold text-gray-400 uppercase tracking-widest text-sm">Preview Unavailable</p>
                    </div>
                    {/* Hover arrow indicator */}
                    <div className="absolute top-4 right-4 opacity-0 translate-x-4 -translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 z-10">
                        <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
                            <ArrowUpRight size={18} />
                        </div>
                    </div>
                </div>
            )}
            <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <div className="project-tags">
                    {project.tech.map((t) => (
                        <span key={t} className="project-tag">
                            {t}
                        </span>
                    ))}
                </div>
            </div>

        </motion.div>
    );
};

// Skill Item Component
const SkillItem = ({ skill }: { skill: SkillItem }) => (
    <div className="skill-item group">
        {skill.icon && (
            <Image
                src={skill.icon}
                alt={skill.name || 'Skill'}
                width={32}
                height={32}
                className="skill-icon transition-transform duration-200 group-hover:scale-110"
            />
        )}
        {skill.name && <span className="skill-name">{skill.name}</span>}
    </div>
);

export default function ClientHomePage({ data }: { data: any }) {
    const [activeSection, setActiveSection] = useState('home');
    const [activeTab, setActiveTab] = useState<'ALL' | 'UI/UX' | 'WEB'>('ALL');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showCv, setShowCv] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Contact form states
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formMessage, setFormMessage] = useState('');

    const contentRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

    const { aboutMe, education, experience, projects, tools } = data;
    const cvPath = '/assets/cv/Galuh Wikri Ramadhan_cv.pdf';

    // Scroll spy effect
    useEffect(() => {
        const handleScroll = () => {
            if (!contentRef.current) return;

            const scrollPosition = contentRef.current.scrollTop + 200;

            for (const item of navItems) {
                const section = sectionRefs.current[item.id];
                if (section) {
                    const offsetTop = section.offsetTop;
                    const offsetHeight = section.offsetHeight;

                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(item.id);
                        break;
                    }
                }
            }
        };

        const content = contentRef.current;
        if (content) {
            content.addEventListener('scroll', handleScroll);
            return () => content.removeEventListener('scroll', handleScroll);
        }
    }, []);

    // Navigation handler
    const handleNavigate = useCallback((sectionId: string) => {
        const section = sectionRefs.current[sectionId];
        if (section && contentRef.current) {
            contentRef.current.scrollTo({
                top: section.offsetTop,
                behavior: 'smooth',
            });
        }
        setMobileMenuOpen(false); // Close mobile menu after navigation
    }, []);

    // Project click handler
    const handleProjectClick = (project: Project) => {
        if (project.category === 'WEB') {
            setIsImageLoading(true);
            setSelectedProject(project);
            return;
        }

        if (project.link) {
            window.open(project.link, '_blank');
            return;
        }
        if (project.imgSrc) {
            setIsImageLoading(true);
            setSelectedProject(project);
        }
    };

    // Copy email handler
    const handleCopyEmail = () => {
        navigator.clipboard.writeText('galuhwikri05@gmail.com');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Calculate coding hours
    const startDate = new Date('2022-03-02T00:00:00Z');
    const now = new Date();
    const codingHours = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60));

    return (
        <>
            {/* Interactive Background */}
            <ClientOnly>
                <InteractiveBackground />
            </ClientOnly>

            {/* Mobile Hamburger Button */}
            <button
                className="mobile-menu-button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
            >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Left Navigation Panel - Outside split-layout for mobile */}
            <nav className={`left-panel ${mobileMenuOpen ? 'open' : ''}`}>
                {/* Mobile Close Button */}
                <button
                    className="mobile-close-button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                >
                    <X size={24} />
                </button>

                {/* Header - Name & Role */}
                <div className="nav-header-section">
                    <div className="nav-name-card">
                        <a
                            href="#home"
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavigate('home');
                            }}
                            className="nav-name-text"
                        >
                            GALUH<br />WIKRI_
                        </a>
                    </div>

                    {/* Desktop Badges */}
                    <div className="nav-role-badges">
                        <span className="nav-role-badge">UI/UX DESIGNER</span>
                        <span className="nav-role-badge">WEB DEVELOPER</span>
                    </div>

                    {/* Mobile Badges */}
                    <div className="nav-role-badges-mobile">
                        <span className="nav-role-badge-mobile">UI/UX DESIGNER</span>
                        <span className="nav-role-badge-mobile">WEB DEVELOPER</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="nav-divider"></div>

                {/* Navigation Label */}
                <div className="nav-label">
                    <span>NAVIGATION</span>
                    <span className="nav-label-arrow">▼</span>
                </div>

                {/* Navigation Menu */}
                <div className="nav-menu-new">
                    {navItems.map((item, index) => (
                        <a
                            key={item.id}
                            href={`#${item.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                handleNavigate(item.id);
                            }}
                            className={`nav-item-new ${activeSection === item.id ? 'active' : ''}`}
                        >
                            <span className="nav-item-number">{item.number}</span>
                            <span className="nav-item-icon">{item.icon}</span>
                            <span className="nav-item-label">{item.label}</span>
                        </a>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className="nav-bottom-section">
                    {/* Section Progress Boxes */}
                    <div className="nav-color-selector">
                        {navItems.map((item, index) => (
                            <span
                                key={item.id}
                                className={`color-box ${activeSection === item.id ? 'filled' : ''}`}
                            ></span>
                        ))}
                    </div>

                    {/* Section Indicator */}
                    <div className="nav-section-indicator">
                        <span className="indicator-label">SECTION</span>
                        <span className="indicator-value">
                            {String(navItems.findIndex(i => i.id === activeSection) + 1).padStart(2, '0')}/
                            {String(navItems.length).padStart(2, '0')}
                        </span>
                    </div>

                    {/* Copyright */}
                    <div className="nav-copyright">
                        © {new Date().getFullYear()} — ALL RIGHTS RESERVED
                    </div>
                </div>
            </nav>

            <div className="split-layout">
                {/* Right Content Panel */}
                <main className="right-panel" ref={contentRef}>
                    <div className="content-wrapper">

                        {/* Home Section */}
                        <section
                            id="home"
                            ref={(el) => { sectionRefs.current['home'] = el; }}
                            className="section"
                            style={{ minHeight: '100vh' }}
                        >
                            <div className="max-w-3xl">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-none mb-6 tracking-tighter">
                                        Hello,<br />
                                        I'm <span className="relative inline-block">
                                            Galuh wikri
                                            <span className="absolute -bottom-2 left-0 w-full h-3 bg-black -z-10"></span>
                                        </span>
                                    </h1>
                                    <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-xl leading-relaxed">
                                        UI/UX Designer & Frontend Developer crafting
                                        digital experiences that matter.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <button
                                            onClick={() => handleNavigate('projects')}
                                            className="neo-button neo-button-dark"
                                        >
                                            <span>View Projects</span>
                                            <ArrowUpRight size={18} />
                                        </button>
                                        <button
                                            onClick={() => setShowCv(true)}
                                            className="neo-button"
                                        >
                                            <Download size={18} />
                                            <span>Download CV</span>
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </section>

                        {/* About Section */}
                        <section
                            id="about"
                            ref={(el) => { sectionRefs.current['about'] = el; }}
                            className="section"
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.6 }}
                                className="max-w-3xl"
                            >
                                <h2 className="section-title">About Me</h2>
                                <p className="text-lg md:text-xl leading-relaxed text-gray-700 mb-8">
                                    {aboutMe}
                                </p>

                                {/* Education */}
                                <div className="neo-card">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold uppercase">{education.university}</h3>
                                            <p className="text-gray-600">{education.major}</p>
                                        </div>
                                        <span className="inline-block px-4 py-2 border-2 border-black text-sm font-mono uppercase">
                                            {education.period}
                                        </span>
                                    </div>
                                </div>



                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                                    <div className="stats-card">
                                        <p className="stat-number">
                                            <AnimatedNumber value={codingHours} />
                                        </p>
                                        <p className="stat-label">Hours Coding</p>
                                    </div>
                                    <div className="stats-card">
                                        <p className="stat-number">
                                            <AnimatedNumber value={projects.length} />
                                        </p>
                                        <p className="stat-label">Projects</p>
                                    </div>
                                    <div className="stats-card">
                                        <p className="stat-number">
                                            <AnimatedNumber value={tools.length} />
                                        </p>
                                        <p className="stat-label">Tools</p>
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* Experience Section */}
                        <section
                            id="experience"
                            ref={(el) => { sectionRefs.current['experience'] = el; }}
                            className="section"
                            style={{ minHeight: 'auto', paddingBottom: '4rem' }}
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="section-title">Experience</h2>
                                {experience && experience.length > 0 ? (
                                    <div className="flex flex-col gap-6">
                                        {experience.map((exp: any, index: number) => (
                                            <div key={index} className="neo-card hover:-translate-y-1 transition-transform duration-300">
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                                                    <div>
                                                        <h3 className="text-2xl font-black uppercase text-black">{exp.position}</h3>
                                                        <p className="text-xl font-bold text-gray-600 mt-1">{exp.company}</p>
                                                    </div>
                                                    <span className="inline-block px-5 py-2 border-2 border-black bg-black text-white text-sm font-mono uppercase shadow-[4px_4px_0px_#ccc]">
                                                        {exp.period}
                                                    </span>
                                                </div>
                                                <div className="w-full h-0.5 bg-gray-200 my-4"></div>
                                                <p className="text-lg text-gray-700 leading-relaxed">
                                                    {exp.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xl text-gray-500 italic">No experience added yet.</p>
                                )}
                            </motion.div>
                        </section>

                        {/* Projects Section */}
                        <section
                            id="projects"
                            ref={(el) => { sectionRefs.current['projects'] = el; }}
                            className="section"
                            style={{ minHeight: 'auto', paddingBottom: '4rem' }}
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="section-title">Projects</h2>

                                {/* Tab Navigation */}
                                <div className="neo-tabs mb-8 inline-flex">
                                    {(['ALL', 'UI/UX', 'WEB'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`neo-tab ${activeTab === tab ? 'active' : ''}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>

                                {/* Projects Grid */}
                                <AnimatePresence mode="sync">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        {projects
                                            .filter((project: Project) => activeTab === 'ALL' || project.category === activeTab)
                                            .map((project: Project, index: number) => (
                                                <NeoProjectCard
                                                    key={project.id || project.title}
                                                    project={project}
                                                    onClick={() => handleProjectClick(project)}
                                                    index={index}
                                                />
                                            ))}
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>
                        </section>

                        {/* Skills Section */}
                        <section
                            id="skills"
                            ref={(el) => { sectionRefs.current['skills'] = el; }}
                            className="section"
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="section-title">Skills & Tools</h2>
                                <div className="w-full">
                                    <FloatingSkills skills={tools} />
                                </div>

                                {/* Soft Skills Section */}
                                <div className="soft-skills-section mt-8">
                                    <h3 className="soft-skills-title">SOFT SKILLS_</h3>
                                    <div className="soft-skills-divider"></div>
                                    <div className="soft-skills-grid">
                                        {['Problem Solving', 'Communication', 'Team Leadership', 'Time Management', 'Design Thinking',
                                            'Critical Thinking', 'Adaptability', 'Creativity', 'Collaboration', 'Empathy', 'Flexibility',
                                            'Innovation', 'Leadership', 'Motivation', 'Organization', 'Planning',
                                            'Project Management', 'Teamwork'].map((skill, index) => (
                                                <span key={index} className="soft-skill-tag">{skill}</span>
                                            ))}
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* Contact Section */}
                        <section
                            id="contact"
                            ref={(el) => { sectionRefs.current['contact'] = el; }}
                            className="section"
                            style={{ minHeight: 'auto' }}
                        >
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6 }}
                                className="w-full"
                            >
                                {/* Header - GET IN TOUCH */}
                                <div className="contact-header">
                                    <h2 className="contact-header-title">
                                        GET IN<br />TOUCH_
                                    </h2>
                                </div>

                                {/* Content Grid */}
                                <div className="contact-grid">
                                    {/* Left - Send Message Form */}
                                    <div className="contact-form-card">
                                        <h3 className="contact-card-title">SEND MESSAGE_</h3>
                                        <div className="contact-card-divider"></div>

                                        <form className="contact-form" onSubmit={async (e) => {
                                            e.preventDefault();
                                            if (formStatus === 'loading') return;

                                            setFormStatus('loading');
                                            setFormMessage('');

                                            try {
                                                const response = await fetch('/api/send-email', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(formData),
                                                });

                                                const result = await response.json();

                                                if (response.ok) {
                                                    setFormStatus('success');
                                                    setFormMessage('Pesan berhasil dikirim! 🎉');
                                                    setFormData({ name: '', email: '', message: '' });
                                                    setTimeout(() => setFormStatus('idle'), 5000);
                                                } else {
                                                    setFormStatus('error');
                                                    setFormMessage(result.error || 'Gagal mengirim pesan');
                                                }
                                            } catch (error) {
                                                setFormStatus('error');
                                                setFormMessage('Terjadi kesalahan. Silakan coba lagi.');
                                            }
                                        }}>
                                            <div className="form-group">
                                                <label className="form-label">NAME</label>
                                                <input
                                                    type="text"
                                                    placeholder="Your name..."
                                                    className="form-input"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                    disabled={formStatus === 'loading'}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">EMAIL</label>
                                                <input
                                                    type="email"
                                                    placeholder="your@email.com"
                                                    className="form-input"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                    disabled={formStatus === 'loading'}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">MESSAGE</label>
                                                <textarea
                                                    placeholder="Your message..."
                                                    className="form-textarea"
                                                    rows={5}
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                    required
                                                    disabled={formStatus === 'loading'}
                                                ></textarea>
                                            </div>

                                            {/* Status Message */}
                                            {formMessage && (
                                                <div className={`form-status ${formStatus === 'success' ? 'success' : 'error'}`}>
                                                    {formMessage}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                className="send-button"
                                                disabled={formStatus === 'loading'}
                                            >
                                                {formStatus === 'loading' ? (
                                                    <>
                                                        <span className="loading-spinner"></span>
                                                        <span>SENDING...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Mail size={18} />
                                                        <span>SEND MESSAGE</span>
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Right Column */}
                                    <div className="contact-right-column">
                                        {/* Contact Info Card */}
                                        <div className="contact-info-card">
                                            <h3 className="contact-info-title">CONTACT INFO_</h3>
                                            <div className="contact-info-divider"></div>

                                            <div className="contact-info-list">
                                                <div className="contact-info-item">
                                                    <MapPin size={18} />
                                                    <span>Bandung, Indonesia</span>
                                                </div>
                                                <div className="contact-info-item">
                                                    <Mail size={18} />
                                                    <span>galuhwikri05@gmail.com</span>
                                                </div>
                                                <div className="contact-info-item">
                                                    <Phone size={18} />
                                                    <span>+62 812 **** ****</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Social Links Card */}
                                        <div className="social-links-card">
                                            <h3 className="contact-card-title">SOCIAL LINKS_</h3>
                                            <div className="contact-card-divider"></div>

                                            <div className="social-links-grid">
                                                <a href="https://github.com/GaluhWikri" target="_blank" rel="noopener noreferrer" className="social-link-box">
                                                    <FaGithub size={22} />
                                                </a>
                                                <a href="https://www.linkedin.com/in/galuhwikri/" target="_blank" rel="noopener noreferrer" className="social-link-box">
                                                    <FaLinkedinIn size={22} />
                                                </a>
                                                <a href="https://www.instagram.com/galuh.wikri/" target="_blank" rel="noopener noreferrer" className="social-link-box">
                                                    <FaInstagram size={22} />
                                                </a>
                                            </div>
                                        </div>

                                        {/* Available for Work */}
                                        <div className="available-card">
                                            <span className="available-indicator"></span>
                                            <span className="available-text">AVAILABLE FOR WORK</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="contact-footer">
                                    <p>© {new Date().getFullYear()} Galuh Wikri. All rights reserved.</p>
                                </div>
                            </motion.div>
                        </section>

                    </div>
                </main>
            </div >

            {/* Mobile Bottom Tab Bar */}
            <div className="mobile-bottom-tabs">
                {navItems.map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            handleNavigate(item.id);
                        }}
                        className={`mobile-tab ${activeSection === item.id ? 'active' : ''}`}
                    >
                        {item.number}
                    </a>
                ))}
            </div>

            {/* CV Modal */}
            <AnimatePresence>
                {
                    showCv && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="modal-overlay"
                            onClick={() => setShowCv(false)}
                        >
                            <button
                                onClick={() => setShowCv(false)}
                                className="modal-close"
                                aria-label="Close"
                            >
                                ×
                            </button>
                            <motion.div
                                initial={{ scale: 0.9, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 50 }}
                                className="modal-content"
                                style={{ height: '90vh' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <object
                                    data={cvPath}
                                    type="application/pdf"
                                    className="w-full h-full"
                                >
                                    <p className="text-center p-8">
                                        Unable to display PDF.{' '}
                                        <a href={cvPath} download className="underline font-bold">
                                            Download here
                                        </a>
                                    </p>
                                </object>
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Project Modal */}
            <AnimatePresence>
                {
                    selectedProject && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="modal-overlay"
                            onClick={() => setSelectedProject(null)}
                        >
                            <button
                                onClick={() => setSelectedProject(null)}
                                className="modal-close"
                                aria-label="Close"
                            >
                                ×
                            </button>
                            <motion.div
                                initial={{ scale: 0.9, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 50 }}
                                className="modal-content p-0 overflow-y-auto modal-scrollbar bg-white border-4 border-black shadow-[8px_8px_0px_#000]"
                                style={{ maxHeight: '85vh', maxWidth: '800px', width: '90%' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-8 border-b-4 border-black">
                                    <h2 className="text-4xl font-black uppercase mb-4 tracking-tight">{selectedProject.title}</h2>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {selectedProject.tech.map((t) => (
                                            <span key={t} className="project-tag px-4 py-2 bg-gray-100 border-2 border-black font-bold text-sm uppercase shadow-[2px_2px_0px_#000]">{t}</span>
                                        ))}
                                    </div>
                                    
                                    {selectedProject.description && (
                                        <div className="mb-6 p-5 bg-[#FAFAFA] border-2 border-black border-dashed">
                                            <p className="text-black text-lg leading-relaxed font-medium">{selectedProject.description}</p>
                                        </div>
                                    )}
                                    
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {selectedProject.link && (
                                            <a href={selectedProject.link} target="_blank" rel="noopener noreferrer" className="neo-button flex-1 justify-center py-4 text-lg">
                                                <ExternalLink size={20} />
                                                <span>View Live Project</span>
                                            </a>
                                        )}
                                        {selectedProject.github ? (
                                            <a href={selectedProject.github} target="_blank" rel="noopener noreferrer" className="neo-button neo-button-dark flex-1 justify-center py-4 text-lg">
                                                <FaGithub size={20} />
                                                <span>Github Source</span>
                                            </a>
                                        ) : (
                                            <button disabled className="neo-button flex-1 justify-center py-4 text-lg bg-gray-200 text-gray-500 border-gray-400 cursor-not-allowed" title="Tambahkan link github di Supabase">
                                                <FaGithub size={20} />
                                                <span>Github Source</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {selectedProject.imgSrc && (
                                    <div className="relative w-full bg-gray-100 p-6 flex justify-center">
                                        <div className="w-full border-4 border-black shadow-[6px_6px_0px_#000] overflow-hidden bg-white relative">
                                            {isImageLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                                                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
                                                </div>
                                            )}
                                            <Image
                                                src={selectedProject.imgSrc}
                                                alt={selectedProject.title}
                                                width={1200}
                                                height={800}
                                                className={`w-full h-auto transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                                onLoad={() => setIsImageLoading(false)}
                                                priority
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Copy Toast */}
            <AnimatePresence>
                {
                    copied && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-black text-white border-3 border-white flex items-center gap-2 shadow-[4px_4px_0px_#fff]"
                        >
                            <Check size={18} />
                            <span className="font-medium">Email copied!</span>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </>
    );
}
