'use client';

import React from 'react';
import { FaGithub, FaLinkedinIn, FaInstagram, FaDribbble } from 'react-icons/fa';
import { HiOutlineExternalLink } from 'react-icons/hi';

interface NavItem {
    id: string;
    label: string;
    number: string;
}

const navItems: NavItem[] = [
    { id: 'home', label: 'Home', number: '01' },
    { id: 'about', label: 'About', number: '02' },
    { id: 'projects', label: 'Projects', number: '03' },
    { id: 'skills', label: 'Skills', number: '04' },
    { id: 'contact', label: 'Contact', number: '05' },
];

interface LeftNavigationProps {
    activeSection: string;
    onNavigate: (sectionId: string) => void;
}

const LeftNavigation: React.FC<LeftNavigationProps> = ({ activeSection, onNavigate }) => {
    return (
        <nav className="left-panel">
            {/* Logo */}
            <div>
                <a
                    href="#home"
                    onClick={(e) => {
                        e.preventDefault();
                        onNavigate('home');
                    }}
                    className="nav-logo"
                >
                    GALUH WIKRI
                </a>
            </div>

            {/* Navigation Menu */}
            <div className="nav-menu flex flex-col gap-1">
                {navItems.map((item) => (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onNavigate(item.id);
                        }}
                        className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                    >
                        <span className="nav-number">[{item.number}]</span>
                        <span>{item.label}</span>
                    </a>
                ))}
            </div>

            {/* Social Links & Resume */}
            <div className="flex flex-col gap-4">
                <div className="social-links">
                    <a
                        href="https://github.com/GaluhWikworworwa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                        aria-label="GitHub"
                    >
                        <FaGithub size={18} />
                    </a>
                    <a
                        href="https://linkedin.com/in/galuhwikri"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                        aria-label="LinkedIn"
                    >
                        <FaLinkedinIn size={18} />
                    </a>
                    <a
                        href="https://instagram.com/galuhwikri_"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                        aria-label="Instagram"
                    >
                        <FaInstagram size={18} />
                    </a>
                    <a
                        href="https://dribbble.com/galuhwikri"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                        aria-label="Dribbble"
                    >
                        <FaDribbble size={18} />
                    </a>
                </div>

                {/* Status */}
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Available for work
                </div>
            </div>
        </nav>
    );
};

export default LeftNavigation;
