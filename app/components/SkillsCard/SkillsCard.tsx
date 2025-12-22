// app/components/SkillsCard/SkillsCard.tsx
'use client';

import * as THREE from 'three';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Billboard, Image as DreiImage } from '@react-three/drei';
import useIsMobile from '@/app/hooks/useIsMobile';

// Interface for skill item
interface SkillItem {
    name: string;
    icon: string;
}

// Props interface for Cloud component
interface CloudProps {
    radius?: number;
    isManualActive: boolean;
    skills: SkillItem[];
}

function Cloud({ radius = 20, isManualActive, skills }: CloudProps) {
    const groupRef = useRef<THREE.Group>(null!);

    // Menyimpan informasi drag (posisi awal dan rotasi awal)
    const dragInfo = useRef<{
        startPointer: { x: number; y: number };
        startRotation: { x: number; y: number };
    } | null>(null);

    const points = useMemo(() => {
        const numPoints = skills.length;
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const angleIncrement = Math.PI * 2 * goldenRatio;

        return Array.from({ length: numPoints }, (_, i) => {
            const t = i / numPoints;
            const inclination = Math.acos(1 - 2 * t);
            const azimuth = angleIncrement * i;

            const x = radius * Math.sin(inclination) * Math.cos(azimuth);
            const y = radius * Math.sin(inclination) * Math.sin(azimuth);
            const z = radius * Math.cos(inclination);

            return new THREE.Vector3(x, y, z);
        });
    }, [radius, skills]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // --- PERUBAHAN UTAMA: Logika Drag yang Disederhanakan ---
        if (isManualActive) {
            // Jika mode manual aktif dan ini adalah frame pertama drag
            if (!dragInfo.current) {
                // Simpan posisi pointer dan rotasi grup saat drag dimulai
                dragInfo.current = {
                    startPointer: { x: state.pointer.x, y: state.pointer.y },
                    startRotation: { x: groupRef.current.rotation.x, y: groupRef.current.rotation.y },
                };
            } else {
                // Jika drag sedang berlangsung
                const deltaX = state.pointer.x - dragInfo.current.startPointer.x;
                const deltaY = state.pointer.y - dragInfo.current.startPointer.y;

                // Hitung rotasi baru berdasarkan rotasi awal + pergerakan mouse
                groupRef.current.rotation.y = dragInfo.current.startRotation.y + deltaX * 2; // Sesuaikan sensitivitas
                groupRef.current.rotation.x = dragInfo.current.startRotation.x + deltaY * 2;
            }
        } else {
            // Jika mode manual tidak aktif (mouse dilepas)
            if (dragInfo.current) {
                // Reset informasi drag saat mouse dilepas
                dragInfo.current = null;
            }
            // Lanjutkan rotasi otomatis
            groupRef.current.rotation.y += delta * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {points.map((pos, i) => (
                <Billboard key={i} position={pos}>
                    <DreiImage
                        url={skills[i].icon}
                        scale={9}
                        transparent
                    />
                </Billboard>
            ))}
        </group>
    );
}

// Props interface for SkillsCard
interface SkillsCardProps {
    skills?: SkillItem[];
}

export default function SkillsCard({ skills = [] }: SkillsCardProps) {
    const isMobile = useIsMobile();
    // State untuk mengontrol apakah mouse sedang ditekan
    const [isPointerDown, setIsPointerDown] = useState(false);

    // Event handler disederhanakan
    const handlePointerDown = () => !isMobile && setIsPointerDown(true);
    const handlePointerUp = () => !isMobile && setIsPointerDown(false);
    const handlePointerOut = () => !isMobile && setIsPointerDown(false);

    // Don't render if no skills
    if (!skills || skills.length === 0) {
        return (
            <div className="bg-[#0C0A09] border border-[#EAEAEA]/10 rounded-2xl h-full relative overflow-hidden flex items-center justify-center">
                <p className="text-gray-500">No skills data available</p>
            </div>
        );
    }

    return (
        <div
            className="bg-[#0C0A09] border border-[#EAEAEA]/10 rounded-2xl h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerOut={handlePointerOut} // Menggunakan onPointerOut untuk kasus kursor keluar area
        >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.06), transparent 70%)' }} />
            <div className="relative p-4 w-full h-full flex flex-col justify-center items-center">
                <h3 className="absolute top-6 left-6 text-3xl font-bold z-10 text-[#ffff]">Skills</h3>
                <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 35], fov: 90 }}>
                    <fog attach="fog" args={['#0C0A09', 15, 60]} />
                    <Cloud radius={isMobile ? 13 : 15} isManualActive={isPointerDown} skills={skills} />
                </Canvas>
            </div>
        </div>
    );
}