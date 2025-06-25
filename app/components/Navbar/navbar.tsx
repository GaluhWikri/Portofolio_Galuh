'use client';

import Link from "next/link";
import Image from "next/image"; // Impor komponen Image
import { motion } from "framer-motion";
import { VT323 } from "next/font/google"; // Mengimpor font pixel VT323

// Konfigurasi untuk font VT323
const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
});

export default function Navbar() {
    // Urutan item disesuaikan dengan gambar
    const navItems = [
        { name: "PROJECT", href: "#project" },
        { name: "ABOUT", href: "#about" },
        { name: "CONTACT", href: "#contact" },
    ];

    return (
        <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
            <motion.div
                // Padding container luar dikurangi menjadi p-1
                className="flex items-center gap-1.5 p-1 bg-white rounded-full shadow-lg"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                {/* Logo */}
                <motion.div
                    whileHover={{ scale: 1.1 }} // Logo tetap membesar secara proporsional
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <Link href="/" className="flex items-center justify-center bg-background rounded-full w-9 h-9">
                        {/* Ukuran logo diperkecil */}
                        <Image src="/assets/image/logo-g.png" alt="Logo" width={20} height={20} />
                    </Link>
                </motion.div>

                {/* Nav Items */}
                {navItems.map((item) => (
                    <motion.div
                        key={item.name}
                        whileHover={{ scaleX: 1.05 }} // PERUBAHAN DI SINI: Animasi hanya pada sumbu X
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <Link
                            href={item.href}
                            // Padding vertikal (py) dan font-size dikurangi
                            className={`flex items-center justify-center bg-background rounded-full px-5 py-1.5 text-white transition-colors hover:bg-gray-800 ${vt323.className} text-lg tracking-wider`}
                        >
                            {item.name}
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </nav>
    );
}
