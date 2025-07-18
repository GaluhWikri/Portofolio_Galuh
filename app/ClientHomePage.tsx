// app/ClientHomePage.tsx

'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Navbar from "./components/Navbar/navbar";
import RotatingText from "./components/RotatingText/RotatingText";
import Image from "next/image";



import ClientOnly from "./components/ClientOnly";
import Lanyard from "./components/Lanyard/Lanyard";
import TextPressure from "./components/TextPressure/TextPressure";
import StatsDashboard from "./components/StatsDashboard/StatsDashboard";
import ScrollReveal from "./components/ScrollReveal/ScrollReveal";
import VelocityScroll from "./components/VelocityScroll/VelocityScroll";

// Interface untuk tipe data Project
interface Project {
    id: number;
    title: string;
    tech: string[];
    imgSrc: string | null;
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

// Komponen Kartu Proyek (ProjectCard)
const ProjectCard = ({ title, tech, imgSrc, onClick }: { title: string, tech: string[], imgSrc: string | null, onClick: () => void }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    const cardVariants: Variants = {
        initial: { opacity: 0, y: 20 },
        inView: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };
    const overlayVariants: Variants = { hover: { opacity: 1 }, initial: { opacity: 0 } };
    const textVariants: Variants = { hover: { y: 0, opacity: 1 }, initial: { y: 10, opacity: 0 } };

    // --- PERBAIKAN: Memastikan kartu tanpa gambar tetap muncul ---
    useEffect(() => {
        if (!imgSrc) {
            setIsLoaded(true);
        }
    }, [imgSrc]);

    return (
        <motion.div
            className="relative rounded-lg overflow-hidden group h-80 shadow-lg cursor-pointer bg-gray-800"
            variants={cardVariants}
            onClick={onClick}
            initial="initial"
            // --- PERBAIKAN: Menggunakan whileInView untuk memicu animasi saat terlihat ---
            // Ini memastikan kartu itu sendiri selalu muncul.
            whileInView="inView"
            viewport={{ once: true, amount: 0.3 }}
        >
            {imgSrc && (
                <Image
                    src={imgSrc}
                    alt={title}
                    fill // Use fill to cover the parent container
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Helps Next.js pick the right image size
                    className="object-cover object-top transition-all duration-300"
                    onLoad={() => setIsLoaded(true)}
                    style={{ 
                        opacity: isLoaded ? 1 : 0, 
                        transform: isLoaded ? 'scale(1)' : 'scale(1.1)',
                        transition: 'opacity 0.5s ease-in-out, transform 0.5s ease-in-out'
                    }}
                />
            )}
            {/* Tampilkan overlay dan teks hanya setelah gambar dimuat (atau jika tidak ada gambar) */}
            {isLoaded && (
                <motion.div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg" variants={overlayVariants} initial="initial" whileHover="hover" transition={{ duration: 0.3 }}>
                    <div className="p-6 h-full flex flex-col justify-end">
                        <motion.h3 className="text-2xl font-bold text-white mb-2" variants={textVariants} transition={{ delay: 0.1 }}>{title}</motion.h3>
                        <motion.div className="flex flex-wrap gap-2" variants={textVariants} transition={{ delay: 0.2 }}>
                            {tech.map(t => (<span key={t} className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded-full">{t}</span>))}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default function ClientHomePage({ data }: { data: any }) {
    const [isCvVisible, setIsCvVisible] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const cvPath = "/assets/cv/Galuh Wikri Ramadhan.pdf";
    const { aboutMe, education, projects } = data;

    const handleProjectClick = (project: Project) => {
        if (project.imgSrc) {
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
                        <div className="absolute top-0 right-[-100px] lg:right-[-200px] w-[400px] md:w-[700px] lg:w-[900px] h-full z-10" style={{ transform: 'translateY(-10%)' }}>
                            <Lanyard position={[0, 0, 14]} gravity={[0, -40, 0]} />
                        </div>
                        <div className="w-full max-w-5xl h-56">
                            <TextPressure text="PORTOFOLIO" />
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
                        <motion.button onClick={() => setIsCvVisible(true)} className="mt-8 px-6 py-2 border border-gray-500 text-white font-semibold rounded-lg transition-all hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Lihat CV</motion.button>
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
                            <StatsDashboard />
                        </ClientOnly>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center pt-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.2 }}
                        variants={sectionAnimation}
                    >
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Education</h2>
                            <div className="flex justify-between items-start font-sans text-lg">
                                <div>
                                    <p className="font-semibold text-white">{education.university}</p>
                                    <p className="text-gray-400">{education.major}</p>
                                </div>
                                <p className="text-gray-400 text-right">{education.period}</p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-center justify-center md:justify-end">
                            <motion.a variants={sectionAnimation} href="https://www.instagram.com/galuh.wikri/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white hover:text-gray-400 transition-colors"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664 4.771 4.919 4.919C8.416 2.175 8.796 2.163 12 2.163m0-1.802C8.72 0 8.337.012 7.053.072 2.695.272.273 2.69.073 7.052.013 8.337 0 8.72 0 12s.013 3.663.072 4.947c.2 4.358 2.618 6.78 6.98 6.98C8.337 23.988 8.72 24 12 24s3.663-.013 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.06-1.284.072-1.66.072-4.947s-.012-3.663-.072-4.947c-.197-4.358-2.625-6.78-6.98-6.979C15.663.012 15.28 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" /></svg></motion.a>
                            <motion.a variants={sectionAnimation} href="https://github.com/GaluhWikri" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-white hover:text-gray-400 transition-colors"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.564 9.564 0 012.503.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.397.1 2.65.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg></motion.a>
                            <motion.a variants={sectionAnimation} href="https://www.linkedin.com/in/galuhwikri/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white hover:text-gray-400 transition-colors"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></motion.a>
                        </div>
                    </motion.div>
                </section>

                <motion.section id="project" className="py-24 max-w-5xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.2 }}>
                    <motion.h2 className="text-5xl font-bold text-center mb-12" variants={sectionAnimation}>
                        <RotatingText texts={["PROJECTS"]} auto={false} staggerDuration={0.08} />
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project: Project) => (
                            <ProjectCard
                                key={project.title}
                                title={project.title}
                                tech={project.tech}
                                imgSrc={project.imgSrc}
                                onClick={() => handleProjectClick(project)}
                            />
                        ))}
                    </div>
                </motion.section>

                <motion.section id="contact" className="py-24 text-center max-w-3xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }}>
                    <motion.h2 className="text-5xl font-bold mb-6" variants={sectionAnimation}>
                        <RotatingText texts={["CONTACT"]} auto={false} staggerDuration={0.08} />
                    </motion.h2>
                    <motion.p className="text-xl text-gray-400 mb-8 font-sans" variants={sectionAnimation} custom={1}>
                        <RotatingText texts={["Tertarik untuk berkolaborasi? Hubungi saya."]} auto={false} staggerDuration={0.02} splitBy="words" />
                    </motion.p>
                    <motion.div variants={sectionAnimation} custom={2}>
                        <a
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=galuhwikri05@gmail.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block border border-gray-500 text-white font-bold px-10 py-4 rounded-md transition-all hover:bg-white hover:text-black"
                        >
                            <RotatingText texts={["Say Hello"]} auto={false} />
                        </a>
                    </motion.div>
                </motion.section>
            </main>

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
                                    <div className="relative w-full h-auto">
                                        <img
                                            src={selectedProject.imgSrc}
                                            alt={`Tampilan Proyek ${selectedProject.title}`}
                                            className="object-contain w-full h-auto rounded-lg shadow-2xl"
                                            loading="lazy"
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
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
