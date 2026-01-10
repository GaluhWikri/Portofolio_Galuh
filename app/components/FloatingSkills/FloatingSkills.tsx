'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface SkillItem {
    name: string;
    icon: string;
}

interface FloatingSkillsProps {
    skills: SkillItem[];
}

const FloatingSkillIcon = ({
    skill,
    index
}: {
    skill: SkillItem;
    index: number;
}) => {
    return (
        <motion.div
            className="floating-skill-icon"
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
                duration: 0.4,
                delay: index * 0.05,
                type: 'spring',
                stiffness: 200
            }}
            whileHover={{
                scale: 1.15,
                y: -5,
                transition: { duration: 0.2 }
            }}
        >
            <div className="skill-bubble">
                {skill.icon && (
                    <Image
                        src={skill.icon}
                        alt={skill.name || 'Skill'}
                        width={36}
                        height={36}
                        className="skill-bubble-icon"
                    />
                )}
                {/* Tooltip - closer to icon */}
                <span className="skill-tooltip">{skill.name || 'Skill'}</span>
            </div>
        </motion.div>
    );
};

export default function FloatingSkills({ skills }: FloatingSkillsProps) {
    const validSkills = skills.filter(s => s.icon);

    if (validSkills.length === 0) {
        return (
            <div className="floating-skills-container">
                <p className="text-gray-500 text-center">No skills data available</p>
            </div>
        );
    }

    return (
        <div className="floating-skills-container">
            {/* Organized Grid of Skills */}
            <div className="skills-organized-grid">
                {validSkills.map((skill, index) => (
                    <FloatingSkillIcon
                        key={skill.name || index}
                        skill={skill}
                        index={index}
                    />
                ))}
            </div>
        </div>
    );
}
