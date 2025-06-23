'use client';

import Lanyard from "./components/Lanyard/Lanyard";
import Navbar from "./components/Navbar/Navbar";
import { motion } from "framer-motion";

// Definisi animasi (tetap sama)
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

// Kartu Proyek dengan gaya baru
const ProjectCard = ({ title, description, tech }: { title: string, description: string, tech: string[] }) => (
  <motion.div
    // Gaya kartu diubah agar sesuai tema
    className="border border-gray-800 bg-black bg-opacity-20 p-6 rounded-lg transition-all hover:border-gray-700 hover:bg-opacity-30"
    variants={sectionAnimation}
  >
    <h3 className="text-2xl font-bold mb-2 text-gray-100">{title}</h3>
    <p className="text-gray-400 mb-4 font-sans">{description}</p>
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
            className="absolute top-0 right-0 md:right-8 lg:right-16 w-80 md:w-96 lg:w-[500px] h-full z-10"
            style={{ transform: 'translateY(-10%)' }} // Sesuaikan posisi vertikal sedikit
          >
            {/* Lanyard digunakan sebagai placeholder untuk kartu Yugioh */}
            <Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
          </div>
          
          <motion.h1
            className="text-8xl md:text-[9rem] font-black tracking-wider" // Ubah gaya teks
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            PORTFOLIO
          </motion.h1>
        </section>

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
            PROJECTS
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProjectCard title="Project A" description="Deskripsi singkat tentang proyek A yang sangat keren dan inovatif." tech={["React", "Next.js", "Tailwind CSS"]} />
            <ProjectCard title="Project B" description="Ini adalah proyek B, sebuah eksplorasi dalam desain dan fungsionalitas web modern." tech={["Three.js", "Framer Motion", "TypeScript"]} />
          </div>
        </motion.section>

        {/* About Section */}
        <motion.section
          id="about"
          className="py-24 max-w-3xl mx-auto text-center font-sans" // Tambah font-sans
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
           <motion.h2 className="text-5xl font-bold mb-8 font-serif" variants={sectionAnimation}>ABOUT ME</motion.h2>
           <motion.div className="text-lg text-gray-400 leading-relaxed space-y-4" variants={sectionAnimation} custom={1}>
              <p>
                Halo! Saya adalah seorang pengembang web dengan hasrat untuk menciptakan pengalaman digital yang unik dan interaktif.
              </p>
           </motion.div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          id="contact"
          className="py-24 text-center max-w-3xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2 className="text-5xl font-bold mb-6" variants={sectionAnimation}>CONTACT</motion.h2>
          <motion.p className="text-xl text-gray-400 mb-8 font-sans" variants={sectionAnimation} custom={1}>
            Tertarik untuk berkolaborasi? Hubungi saya.
          </motion.p>
          <motion.div variants={sectionAnimation} custom={2}>
            {/* Tombol diubah gayanya */}
            <a 
              href="mailto:emailanda@example.com" 
              className="inline-block border border-gray-500 text-white font-bold px-10 py-4 rounded-md transition-all hover:bg-white hover:text-black"
            >
              Say Hello
            </a>
          </motion.div>
        </motion.section>

        <footer className="text-center py-8 text-gray-700 text-sm font-sans">
            <p>&copy; {new Date().getFullYear()} Your Name. All Rights Reserved.</p>
        </footer>
      </main>
    </>
  );
}