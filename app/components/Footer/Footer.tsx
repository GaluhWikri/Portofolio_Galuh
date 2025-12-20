'use client';

import React from 'react';
import { FaInstagram, FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="w-full bg-[#0C0A09] border-t border-[#EAEAEA]/10 py-8 mt-20">
            <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-6">

                {/* Social Links */}
                <div className="flex items-center gap-8">
                    <a
                        href="https://www.instagram.com/galuh.wikri/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#f2f2f2] transition-all duration-300 transform hover:scale-110"
                        aria-label="Instagram"
                    >
                        <FaInstagram size={24} />
                    </a>
                    <a
                        href="https://github.com/GaluhWikri"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#f2f2f2] transition-all duration-300 transform hover:scale-110"
                        aria-label="GitHub"
                    >
                        <FaGithub size={24} />
                    </a>
                    <a
                        href="https://www.linkedin.com/in/galuhwikri/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#f2f2f2] transition-all duration-300 transform hover:scale-110"
                        aria-label="LinkedIn"
                    >
                        <FaLinkedin size={24} />
                    </a>
                </div>

                {/* Copyright/Credit - Minimalist */}
                <p className="text-[#EAEAEA]/20 text-sm font-light">
                    © {new Date().getFullYear()} Galuh Wikri. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
