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
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* Kolom Kiri: About, Education, Socials */}
          <motion.div className="md:col-span-2 text-left space-y-8" variants={sectionAnimation}>
            <div>
              <h2 className="text-4xl font-bold mb-4">
                About Me
              </h2>
              <p className="text-gray-400 font-sans leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-bold mb-4">
                Education
              </h2>
              <p className="text-gray-400 font-sans leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever.
              </p>
            </div>

            <div className="flex gap-6 items-center">
              {/* Ganti href dengan link sosial media Anda */}
              <a href="#" aria-label="Instagram" className="text-white hover:text-gray-400 transition-colors">
                {/* Anda bisa menggunakan library ikon seperti react-icons */}
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c-4.048 0-4.555.018-6.138.09-1.584.072-2.67.34-3.62.74-1.02.422-1.802 1.204-2.224 2.224-.398.95-.668 2.036-.74 3.62C-.023 7.445 0 7.952 0 12s.018 4.555.09 6.138c.072 1.584.34 2.67.74 3.62.422 1.02 1.204 1.802 2.224 2.224.95.398 2.036.668 3.62.74 1.583.072 2.09.09 6.138.09s4.555-.018 6.138-.09c1.584-.072 2.67-.34 3.62-.74 1.02-.422 1.802-1.204 2.224-2.224.398-.95.668-2.036.74-3.62.072-1.583.09-2.09.09-6.138s-.018-4.555-.09-6.138c-.072-1.584-.34-2.67-.74-3.62-.422-1.02-1.204-1.802-2.224-2.224-.95-.398-2.036-.668-3.62-.74C16.87 2.018 16.362 2 12.315 2zm0 1.802c4.002 0 4.48.016 6.062.088 1.46.066 2.258.324 2.88.582.752.312 1.28.84 1.594 1.594.258.622.516 1.42.582 2.88.072 1.582.088 2.06.088 6.062s-.016 4.48-.088 6.062c-.066 1.46-.324 2.258-.582 2.88-.312.752-.84 1.28-1.594 1.594-.622.258-1.42.516-2.88.582-1.582.072-2.06.088-6.062.088s-4.48-.016-6.062-.088c-1.46-.066-2.258-.324-2.88-.582-.752-.312-1.28-.84-1.594-1.594-.258-.622-.516-1.42-.582-2.88-.072-1.582-.088-2.06-.088-6.062s.016-4.48.088-6.062c.066-1.46.324-2.258.582-2.88.312-.752.84-1.28 1.594-1.594.622-.258 1.42.516 2.88.582C7.835 3.82 8.313 3.802 12.315 3.802zM12 8.12A3.88 3.88 0 1012 15.88 3.88 3.88 0 0012 8.12zm0 6.162A2.28 2.28 0 1112 9.72a2.28 2.28 0 010 4.562zm6.36-7.832a.908.908 0 100-1.816.908.908 0 000 1.816z" clipRule="evenodd" /></svg>
              </a>
              <a href="#" aria-label="GitHub" className="text-white hover:text-gray-400 transition-colors">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.564 9.564 0 012.503.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.397.1 2.65.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="text-white hover:text-gray-400 transition-colors">
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

        {/* Footer */}
        <footer className="text-center py-8 text-gray-700 text-sm font-sans">
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.8 }}
            variants={sectionAnimation}
          >
            <RotatingText texts={[`© ${new Date().getFullYear()} Galuh Wikri. All Rights Reserved.`]} auto={false} staggerDuration={0.01} splitBy="words" />
          </motion.p>
        </footer>
      </main>
    </>
  );
}