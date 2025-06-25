'use client';

import Link from "next/link";
import Image from "next/image"; // Impor komponen Image
import { motion } from "framer-motion";
import { VT323 } from "next/font/google"; // Mengimpor font pixel VT323
import React from 'react';

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

    // Fungsi untuk menangani smooth scroll
    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        // Cek jika href adalah untuk ke atas halaman
        if (href === "/#") {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            return;
        }
        // Cari elemen target berdasarkan ID
        const targetId = href.replace(/.*#/, "");
        const elem = document.getElementById(targetId);
        elem?.scrollIntoView({
            behavior: "smooth",
        });
    };

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
                <motion.a
                    href="/#"
                    onClick={(e) => handleScroll(e, "/#")}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="flex items-center justify-center bg-background rounded-full w-9 h-9 cursor-pointer"
                >
                    <Image src="/assets/image/logo-g.png" alt="Logo" width={20} height={20} />
                </motion.a>

                {/* Nav Items */}
                {navItems.map((item) => (
                    <motion.a
                        key={item.name}
                        href={item.href}
                        onClick={(e) => handleScroll(e, item.href)}
                        whileHover={{ scaleX: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className={`flex items-center justify-center bg-background rounded-full px-5 py-1.5 text-white transition-colors hover:bg-gray-800 ${vt323.className} text-lg tracking-wider cursor-pointer`}
                    >
                        {item.name}
                    </motion.a>
                ))}
            </motion.div>
        </nav>
    );
}
