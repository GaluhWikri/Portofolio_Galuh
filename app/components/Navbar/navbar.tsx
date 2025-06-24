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
                className="flex items-center gap-8"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="text-sm text-gray-400 hover:text-white transition-colors tracking-wider"
                    >
                        {item.name}
                    </Link>
                ))}
            </motion.div>
        </nav>
    );
}