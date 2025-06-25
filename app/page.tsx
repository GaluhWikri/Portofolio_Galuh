'use client';

// Impor FontAwesome atau library ikon lain jika Anda ingin menggunakan ikon SVG
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faInstagram, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

import Navbar from "./components/Navbar/navbar";
import { motion } from "framer-motion";
import RotatingText from "./components/RotatingText/RotatingText";
import React from "react";
import dynamic from 'next/dynamic';
import Lanyard from "./components/Lanyard/Lanyard";

// Komponen diimpor secara dinamis
const TextPressure = dynamic(
  () => import('./components/TextPressure/TextPressure'),
  { ssr: false }
);

// Definisi animasi section
const sectionAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.6,
      ease: "easeOut"
    }
  })
};

// Varian animasi untuk container kalimat
const sentenceAnimation = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04, // Jeda antar kata
    },
  },
};

// Varian animasi untuk setiap kata (efek "reveal")
const wordAnimation = {
  hidden: { y: '100%' }, // Mulai dari bawah (tersembunyi)
  visible: {
    y: '0%', // Pindah ke posisi asli (terlihat)
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};


// Komponen ProjectCard
const ProjectCard = ({ title, description, tech }: { title: string, description: string, tech: string[] }) => (
  <motion.div
    className="border border-gray-800 bg-black bg-opacity-20 p-6 rounded-lg transition-all hover:border-gray-700 hover:bg-opacity-30"
    variants={sectionAnimation}
  >
    <h3 className="text-2xl font-bold mb-2 text-gray-100">
      <RotatingText texts={[title]} auto={false} staggerDuration={0.03} />
    </h3>
    <p className="text-gray-400 mb-4 font-sans">
      <RotatingText texts={[description]} auto={false} staggerDuration={0.01} splitBy="words" />
    </p>
    <div className="flex flex-wrap gap-2 font-sans">
      {tech.map(t => (
        <span key={t} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md">{t}</span>
      ))}
    </div>
  </motion.div>
);


export default function Home() {
  const aboutMeText = "I'm passionate about programming and software development, always eager to learn and build new things. A self-proclaimed expert in “Google Searching” and “Copy-Pasting” — because sometimes, the right snippet at the right time is all you need. Feel free to browse through my repositories. Let’s explore the digital world together with the power of Ctrl+C and Ctrl+V! 💻";
  const educationText = "Currently pursuing a degree in Informatic Engineering at Universitas Pasundan, focusing on software development and web technologies.";

  return (
    <>
      <Navbar />
      <main className="px-4 md:px-8">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
          <div
            className="absolute top-0 right-[-100px] lg:right-[-200px] w-[400px] md:w-[700px] lg:w-[900px] h-full z-10"
            style={{ transform: 'translateY(-10%)' }}
          >
            <Lanyard position={[0, 0, 14]} gravity={[0, -40, 0]} />
          </div>
          <div className="w-full max-w-5xl h-56">
            <TextPressure text="PORTOFOLIO" />
          </div>
        </section>

        {/* About Section - TELAH DIRAPIKAN SESUAI WIREFRAME */}
        <motion.section
          id="about"
          className="py-24 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 items-start"
        >
          {/* Kolom Kiri: About, Education, Socials */}
          <motion.div
            className="md:col-span-2 text-left space-y-8"
            variants={sectionAnimation}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <div>
              <h2 className="text-4xl font-bold mb-4">
                About Me
              </h2>
              <motion.p
                className="text-gray-400 font-sans leading-relaxed"
                variants={sentenceAnimation}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.5 }} // PERUBAHAN UTAMA DI SINI
              >
                {aboutMeText.split(" ").map((word, index) => (
                  <span key={word + "-" + index} className="inline-block overflow-hidden pb-1">
                    <motion.span
                      variants={wordAnimation}
                      className="inline-block"
                    >
                      {word}{"\u00A0"}
                    </motion.span>
                  </span>
                ))}
              </motion.p>
            </div>

            <div>
              <h2 className="text-4xl font-bold mb-4">
                Education
              </h2>
              <motion.p
                className="text-gray-400 font-sans leading-relaxed"
                variants={sentenceAnimation}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.5 }} // DAN DI SINI
              >
                {educationText.split(" ").map((word, index) => (
                  <span key={word + "-" + index} className="inline-block overflow-hidden pb-1">
                    <motion.span
                      variants={wordAnimation}
                      className="inline-block"
                    >
                      {word}{"\u00A0"}
                    </motion.span>
                  </span>
                ))}
              </motion.p>
            </div>

            <div className="flex gap-6 items-center">
              {/* Ganti href dengan link sosial media Anda */}
              <a href="https://www.instagram.com/galuh.wikri/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white hover:text-gray-400 transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163m0-1.802C8.72 0 8.337.012 7.053.072 2.695.272.273 2.69.073 7.052.013 8.337 0 8.72 0 12s.013 3.663.072 4.947c.2 4.358 2.618 6.78 6.98 6.98C8.337 23.988 8.72 24 12 24s3.663-.013 4.947-.072c4.354-.2 6.782-2.618 6.979-6.98.06-1.284.072-1.66.072-4.947s-.012-3.663-.072-4.947c-.197-4.358-2.625-6.78-6.98-6.979C15.663.012 15.28 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" /></svg>
              </a>
              <a href="https://github.com/GaluhWikri" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="text-white hover:text-gray-400 transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.564 9.564 0 012.503.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.397.1 2.65.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg>
              </a>
              <a href="https://www.linkedin.com/in/galuhwikri/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-white hover:text-gray-400 transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </a>
            </div>

          </motion.div>

          {/* Kolom Kanan: Kartu Tools & Skills */}
          <motion.div variants={sectionAnimation} custom={1}>
            <div className="bg-white text-black h-full min-h-[300px] rounded-2xl p-8 flex flex-col items-center justify-center text-center">
              <h3 className="text-3xl font-bold mb-4">
                TOOL ICON
              </h3>
              <p className="text-2xl font-bold">
                UI UX DESIGN
              </p>
            </div>
          </motion.div>
        </motion.section>

        {/* Project Section */}
        <motion.section
          id="project"
          className="py-24 max-w-5xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.2 }}
        >
          <motion.h2 className="text-5xl font-bold text-center mb-12" variants={sectionAnimation}>
            <RotatingText texts={["PROJECTS"]} auto={false} staggerDuration={0.08} />
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ProjectCard title="Project A" description="Deskripsi singkat proyek A." tech={["React", "Next.js"]} />
            <ProjectCard title="Project B" description="Eksplorasi dalam desain dan fungsionalitas." tech={["Three.js", "TypeScript"]} />
            <ProjectCard title="Project C" description="Proyek ketiga yang menakjubkan." tech={["Figma", "UI/UX"]} />
            <ProjectCard title="Project D" description="Deskripsi singkat proyek D." tech={["Node.js", "Express"]} />
            <ProjectCard title="Project E" description="Eksplorasi backend dan database." tech={["PostgreSQL", "Prisma"]} />
            <ProjectCard title="Project F" description="Proyek mobile-first dengan PWA." tech={["React Native", "Expo"]} />
          </div>
        </motion.section>



        {/* Contact Section */}
        <motion.section
          id="contact"
          className="py-24 text-center max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 className="text-5xl font-bold mb-6" variants={sectionAnimation}>
            <RotatingText texts={["CONTACT"]} auto={false} staggerDuration={0.08} />
          </motion.h2>
          <motion.p className="text-xl text-gray-400 mb-8 font-sans" variants={sectionAnimation} custom={1}>
            <RotatingText texts={["Tertarik untuk berkolaborasi? Hubungi saya."]} auto={false} staggerDuration={0.02} splitBy="words" />
          </motion.p>
          <motion.div variants={sectionAnimation} custom={2}>
            <a
              href="mailto:emailanda@example.com"
              className="inline-block border border-gray-500 text-white font-bold px-10 py-4 rounded-md transition-all hover:bg-white hover:text-black"
            >
              <RotatingText texts={["Say Hello"]} auto={false} />
            </a>
          </motion.div>
        </motion.section>


      </main>
    </>
  );
}
