// app/ClientHomePage.tsx

'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import useIsMobile from '@/app/hooks/useIsMobile';
import Navbar from "./components/Navbar/navbar";
import RotatingText from "./components/RotatingText/RotatingText";
import Image from "next/image";



import ClientOnly from "./components/ClientOnly";
import Lanyard from "./components/Lanyard/Lanyard";
import TextPressure from "./components/TextPressure/TextPressure";
import StatsDashboard from "./components/StatsDashboard/StatsDashboard";
import ScrollReveal from "./components/ScrollReveal/ScrollReveal";
import VelocityScroll from "./components/VelocityScroll/VelocityScroll";
import Footer from "./components/Footer/Footer";

// Interface untuk tipe data Project
interface Project {
    id: number;
    title: string;
    tech: string[];
    imgSrc: string | null;
    category: string;
    link?: string;
}

// Variabel untuk animasi Framer Motion
const sectionAnimation: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" }
    })
};

import { ArrowUpRight } from 'lucide-react';

// Komponen Kartu Proyek (ProjectCard) Modern
const ProjectCard = ({ title, tech, imgSrc, onClick, priority = false }: {
    title: string,
    tech: string[],
    imgSrc: string | null,
    onClick: () => void,
    priority?: boolean // Add priority prop for above-fold images
}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    // Varian animasi untuk card container
    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    // Pastikan card tetap dirender jika tidak ada gambar
    useEffect(() => {
        if (!imgSrc) setIsLoaded(true);
    }, [imgSrc]);

    return (
        <motion.div
            className="relative rounded-2xl overflow-hidden group h-96 shadow-2xl cursor-pointer bg-[#0C0A09] border border-white/5"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            onClick={onClick}
        >
            {/* Image Container with Zoom Effect */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
                {imgSrc && (
                    <Image
                        src={imgSrc}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-top transition-transform duration-700 ease-in-out group-hover:scale-105 will-change-transform"
                        onLoad={() => setIsLoaded(true)}
                        priority={priority} // Priority for above-fold images
                        loading={priority ? undefined : "lazy"} // Lazy load for below-fold
                        style={{
                            opacity: isLoaded ? 1 : 0,
                            transition: 'opacity 0.5s ease-in-out'
                        }}
                    />
                )}
            </div>

            {/* Gradient Overlay - Always present at bottom for text contrast, strengthens on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content Container */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                {/* Arrow Icon - Top Right (Visible on hover) */}
                <div className="absolute top-6 right-6 translate-x-4 -translate-y-4 opacity-0 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white text-black p-3 rounded-full shadow-lg">
                        <ArrowUpRight size={24} />
                    </div>
                </div>

                {/* Text Content - Slides up slightly on hover */}
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-bold text-white mb-3 leading-tight">{title}</h3>
                    <div className="flex flex-wrap gap-2">
                        {tech.map(t => (
                            <span
                                key={t}
                                className="text-xs font-medium bg-white/10 backdrop-blur-sm text-gray-200 px-3 py-1.5 rounded-full border border-white/10"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function ClientHomePage({ data }: { data: any }) {
    const isMobile = useIsMobile();
    const [isCvVisible, setIsCvVisible] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [activeTab, setActiveTab] = useState<'UI/UX' | 'WEB'>('UI/UX');
    const [showToast, setShowToast] = useState(false); // State for custom toast
    const [isImageLoading, setIsImageLoading] = useState(false); // State for modal image loading
    const cvPath = "/assets/cv/Galuh Wikri Ramadhan.pdf";
    const { aboutMe, education, projects, tools } = data;

    const handleProjectClick = (project: Project) => {
        // Jika project memiliki link eksternal (khususnya Web), buka link tersebut
        if (project.link) {
            window.open(project.link, '_blank');
            return;
        }

        // Jika tidak, buka modal detail seperti biasa (untuk UX Case Study dll)
        // Jika tidak, buka modal detail seperti biasa (untuk UX Case Study dll)
        if (project.imgSrc) {
            setIsImageLoading(true);
            setSelectedProject(project);
        }
    };

    return (
        <>
            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <Navbar />
            <main className="px-4 md:px-8">
                {/* Hero Section */}
                <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
                    <ClientOnly>
                        <div className="hidden lg:block absolute top-0 right-[-100px] lg:right-[-200px] w-[400px] md:w-[700px] lg:w-[900px] h-full z-10" style={{ transform: 'translateY(-10%)' }}>
                            <Lanyard position={[0, 0, 14]} gravity={[0, -40, 0]} />
                        </div>
                        <div className="relative w-full max-w-5xl h-[500px] md:h-[800px] flex items-center justify-center">
                            {/* GIF Background with Responsive Mask */}
                            <div
                                className="absolute inset-0 z-0 opacity-60"
                                style={{
                                    maskImage: isMobile
                                        ? 'radial-gradient(circle, black 35%, transparent 70%)'
                                        : 'radial-gradient(ellipse at center, black 10%, transparent 100%)',
                                    WebkitMaskImage: isMobile
                                        ? 'radial-gradient(circle, black 35%, transparent 70%)'
                                        : 'radial-gradient(ellipse at center, black 30%, transparent 44%)'
                                }}
                            >
                                <Image
                                    src="/giff/mc.gif"
                                    alt="Background Animation"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>

                            <div className="relative z-10 w-full h-full flex items-center justify-center">
                                <div className="w-full h-40">
                                    <TextPressure text="Hello, I’m Galuh." />
                                </div>
                            </div>
                        </div>
                    </ClientOnly>
                </section>

                {/* Velocity Scroll Section */}
                <section className="relative py-16">
                    <ClientOnly>
                        <VelocityScroll />
                    </ClientOnly>
                </section>

                {/* About Me Section */}
                <section
                    id="about"
                    className="py-32 flex flex-col items-center justify-center text-center"
                >
                    <motion.div
                        className="max-w-4xl"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.2 }}
                        variants={sectionAnimation}
                    >
                        <div className="text-gray-400 font-sans leading-relaxed text-3xl md:text-4xl">
                            <ScrollReveal textClassName="text-3xl md:text-4xl">
                                {aboutMe}
                            </ScrollReveal>
                        </div>
                        <motion.button onClick={() => setIsCvVisible(true)} className="mt-8 px-6 py-2 border border-gray-500 text-white font-semibold rounded-lg transition-all hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>View Résumé</motion.button>
                    </motion.div>
                </section>

                {/* Section untuk Statistik, Edukasi, dan Lainnya */}
                <section className="py-24 max-w-7xl mx-auto space-y-16">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.1 }}
                        variants={sectionAnimation}
                    >
                        <ClientOnly>
                            <StatsDashboard skills={tools} />
                        </ClientOnly>
                    </motion.div>

                    <motion.div
                        className="pt-8 w-full"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.2 }}
                        variants={sectionAnimation}
                    >
                        <div>
                            <h2 className="text-3xl font-bold mb-6 border-b border-gray-800 pb-4">Education</h2>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center font-sans text-lg gap-2">
                                <div>
                                    <p className="font-semibold text-white text-xl">{education.university}</p>
                                    <p className="text-[#f2f2f2] opacity-80">{education.major}</p>
                                </div>
                                <p className="text-gray-500 font-mono text-sm md:text-base border border-gray-800 px-3 py-1 rounded-full">{education.period}</p>
                            </div>
                        </div>
                    </motion.div>
                </section>

                <motion.section id="project" className="py-24 max-w-5xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }}>
                    <motion.h2 className="text-5xl font-bold text-center mb-12" variants={sectionAnimation}>
                        <RotatingText texts={["PROJECTS"]} auto={false} staggerDuration={0.08} />
                    </motion.h2>

                    {/* Tab Selection */}
                    <div className="flex justify-center gap-6 mb-12">
                        {['UI/UX', 'WEB'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as 'UI/UX' | 'WEB')}
                                className={`px-8 py-3 rounded-full text-sm font-bold tracking-wider transition-all duration-300 border ${activeTab === tab
                                    ? "bg-[#EAEAEA] text-[#0C0A09] border-[#EAEAEA] scale-105 shadow-[0_0_20px_rgba(234,234,234,0.1)]"
                                    : "bg-transparent text-[#EAEAEA]/40 border-[#EAEAEA]/10 hover:border-[#EAEAEA]/30 hover:text-[#EAEAEA]"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects
                            .filter((project: Project) => project.category === activeTab)
                            .map((project: Project, index: number) => (
                                <ProjectCard
                                    key={project.id || project.title}
                                    title={project.title}
                                    tech={project.tech}
                                    imgSrc={project.imgSrc}
                                    onClick={() => handleProjectClick(project)}
                                    priority={index < 3} // Priority load for first 3 cards (above-the-fold)
                                />
                            ))}
                    </div>
                </motion.section>

                <motion.section id="contact" className="py-24 max-w-4xl mx-auto px-4" initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }}>
                    <motion.div
                        className="relative bg-[#0C0A09] border border-white/10 rounded-[2.5rem] p-8 md:p-16 overflow-hidden md:text-left text-center"
                        variants={sectionAnimation}
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="space-y-6 max-w-2xl">
                                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.1]">
                                    Let's make something <br className="hidden md:block" />
                                    <span className="text-gray-500">amazing together.</span>
                                </h2>
                                <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-lg mx-auto md:mx-0">
                                    Have a project in mind? I'm currently available for freelance work and open to new opportunities. Let's turn your ideas into reality.
                                </p>
                            </div>

                            <div className="flex flex-col gap-4 w-full md:w-auto min-w-[240px]">
                                <a
                                    href="https://mail.google.com/mail/?view=cm&fs=1&to=galuhwikri05@gmail.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative px-8 py-4 bg-white text-black font-bold rounded-full text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3"
                                >
                                    <span className="relative z-10">Start a project</span>
                                    <div className="relative z-10 bg-black text-white p-1 rounded-full transition-transform group-hover:rotate-45">
                                        <ArrowUpRight size={18} />
                                    </div>
                                </a>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText('galuhwikri05@gmail.com');
                                        setShowToast(true);
                                        setTimeout(() => setShowToast(false), 2000);
                                    }}
                                    className="relative px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-full text-base md:text-lg hover:bg-white/10 transition-all hover:border-white/20 flex items-center justify-center backdrop-blur-sm group/copy"
                                >

                                    <span>galuhwikri05@gmail.com</span>
                                    <svg className="absolute right-6 w-5 h-5 text-gray-400 group-hover/copy:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.section>
            </main>
            <Footer />

            <AnimatePresence>
                {isCvVisible && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center" onClick={() => setIsCvVisible(false)}>
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="relative w-[90vw] h-[90vh] bg-gray-900 rounded-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <object data={cvPath} type="application/pdf" className="w-full h-full"><p className="text-white text-center p-4">Browser Anda tidak dapat menampilkan PDF. Silakan unduh CV <a href={cvPath} download className="text-blue-400 hover:underline"> di sini</a>.</p></object>
                            <button onClick={() => setIsCvVisible(false)} className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center text-2xl hover:bg-opacity-75 transition-all" aria-label="Tutup">&times;</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedProject && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setSelectedProject(null)}
                    >
                        <div className="w-full h-full overflow-y-auto hide-scrollbar" onClick={(e) => e.stopPropagation()}>
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 50, opacity: 0 }}
                                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                                className="relative w-full max-w-6xl mx-auto my-12 space-y-8"
                            >
                                <div className="text-center text-white">
                                    <h2 className="text-3xl md:text-5xl font-bold mb-3 drop-shadow-lg">{selectedProject.title}</h2>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {selectedProject.tech.map(t => (
                                            <span key={t} className="text-sm bg-black/20 backdrop-blur-sm text-white/90 px-3 py-1 rounded-full">{t}</span>
                                        ))}
                                    </div>
                                </div>
                                {selectedProject.imgSrc && (
                                    <div className="relative w-full h-auto min-h-[300px] flex items-center justify-center bg-white/5 rounded-lg overflow-hidden">
                                        {isImageLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                                <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        <Image
                                            src={selectedProject.imgSrc}
                                            alt={`Tampilan Proyek ${selectedProject.title}`}
                                            width={1200}
                                            height={800}
                                            className={`object-contain w-full h-auto rounded-lg shadow-2xl transition-all duration-500 ${isImageLoading ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}
                                            priority
                                            sizes="90vw"
                                            onLoad={() => setIsImageLoading(false)}
                                        />
                                    </div>
                                )}
                            </motion.div>
                        </div>
                        <button
                            onClick={() => setSelectedProject(null)}
                            className="fixed top-6 right-6 text-white bg-black/50 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center text-2xl hover:bg-opacity-75 transition-all"
                            aria-label="Tutup"
                        >
                            &times;
                        </button>
                    </motion.div >
                )
                }
            </AnimatePresence >

            {/* Custom Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        transition={{ duration: 0.3 }}
                        className="fixed bottom-10 left-1/2 z-[70] flex items-center gap-3 px-6 py-3 bg-[#1c1c1c] border border-white/10 rounded-full shadow-2xl backdrop-blur-md"
                    >
                        <div className="bg-green-500/20 text-green-400 p-1 rounded-full">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span className="text-white font-medium text-sm">Email copied to clipboard!</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
