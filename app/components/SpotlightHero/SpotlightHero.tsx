// app/components/SpotlightHero/SpotlightHero.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function SpotlightHero() {
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { currentTarget: target } = e;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        target.style.setProperty("--mouse-x", `${x}px`);
        target.style.setProperty("--mouse-y", `${y}px`);
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            className="relative h-screen flex items-center justify-center overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gray-900/50 z-10" />
            <div className="spotlight-bg" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="text-center z-20 px-4"
            >
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                    Passionate Front-End Developer
                </h1>
                <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300">
                    Experience creating visually stunning and user-friendly websites. Proficient in modern front-end frameworks and libraries like React, Next.js, Tailwind CSS, and Framer Motion.
                </p>
            </motion.div>
        </div>
    );
}