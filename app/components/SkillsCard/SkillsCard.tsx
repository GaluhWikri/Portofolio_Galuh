// app/components/SkillsCard/SkillsCard.tsx
'use client';

import * as THREE from 'three';
import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Billboard, Image as DreiImage } from '@react-three/drei';
import useIsMobile from '@/app/hooks/useIsMobile';

const SKILLS_LIST = [
    { name: 'Figma', icon: '/assets/icon/icons8-figma-48.png' },
    { name: 'Git', icon: '/assets/icon/icons8-git-48.png' },
    { name: 'Docker', icon: '/assets/icon/icons8-docker-48.png' },
    { name: 'Canva', icon: '/assets/icon/icons8-canva-48.png' },
    { name: 'AndroidStudio', icon: '/assets/icon/icons8-android-studio-48.png' },
    { name: 'Photoshop', icon: '/assets/icon/icons8-photoshop-48.png' },
    { name: 'MySQL', icon: '/assets/icon/icons8-mysql-48.png' },
    { name: 'TypeScript', icon: '/assets/icon/icons8-typescript-48.png' },
    { name: 'VS Code', icon: '/assets/icon/icons8-visual-studio-code-2019-48.png' },
    { name: 'Postman', icon: '/assets/icon/icons8-postman-inc-50.png' },
    { name: 'Tailwind', icon: '/assets/icon/icons8-tailwindcss-48.png' },
    { name: 'PHP', icon: '/assets/icon/icons8-php-50.png' },
    { name: 'Bootstrap', icon: '/assets/icon/icons8-bootstrap-48.png' },
    { name: 'ReactJS', icon: '/assets/icon/icons8-react-30.png' },
    { name: 'NodeJS', icon: '/assets/icon/icons8-node-js-48.png' }
];

function Cloud({ radius = 20, isManualActive }: { radius?: number, isManualActive: boolean }) {
    const groupRef = useRef<THREE.Group>(null!);
    
    // Menyimpan informasi drag (posisi awal dan rotasi awal)
    const dragInfo = useRef<{
        startPointer: { x: number; y: number };
        startRotation: { x: number; y: number };
    } | null>(null);

    const points = useMemo(() => {
        const numPoints = SKILLS_LIST.length;
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
    }, [radius]);

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
                        url={SKILLS_LIST[i].icon}
                        scale={9}
                        transparent
                    />
                </Billboard>
            ))}
        </group>
    );
}

export default function SkillsCard() {
    const isMobile = useIsMobile();
    // State untuk mengontrol apakah mouse sedang ditekan
    const [isPointerDown, setIsPointerDown] = useState(false);
    
    // Event handler disederhanakan
    const handlePointerDown = () => !isMobile && setIsPointerDown(true);
    const handlePointerUp = () => !isMobile && setIsPointerDown(false);
    const handlePointerOut = () => !isMobile && setIsPointerDown(false);

    return (
        <div 
            className="bg-gray-800 rounded-2xl h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerOut={handlePointerOut} // Menggunakan onPointerOut untuk kasus kursor keluar area
        >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(45, 212, 191, 0.15), transparent 70%)' }} />
            <div className="relative p-4 w-full h-full flex flex-col justify-center items-center">
                <h3 className="absolute top-4 left-4 text-xl font-bold z-10">Skills</h3>
                <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 35], fov: 90 }}>
                    <fog attach="fog" args={['#0D1117', 15, 60]} />
                    <Cloud radius={isMobile ? 14 : 18} isManualActive={isPointerDown} />
                </Canvas>
            </div>
        </div>
    );
}