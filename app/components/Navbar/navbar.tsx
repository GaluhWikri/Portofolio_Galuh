'use client';

import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
    const navItems = [
        { name: "About", href: "#about" },
        { name: "Projects", href: "#project" },
        { name: "Contact", href: "#contact" },
    ];

    return (
        <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
            <motion.div
                // Jarak antar menu (gap) juga sedikit ditambah
                className="flex items-center gap-12 px-8 py-4 bg-black/30 border border-white/10 rounded-full backdrop-blur-md"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        // --- PERUBAHAN DI SINI ---
                        // Ukuran font diubah dari text-base menjadi text-lg
                        className="text-lg text-gray-400 hover:text-white transition-colors tracking-wider"
                    >
                        {item.name}
                    </Link>
                ))}
            </motion.div>
        </nav>
    );
}