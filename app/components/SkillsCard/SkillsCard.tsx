// app/components/SkillsCard/SkillsCard.tsx
'use client';

import * as THREE from 'three';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Image as DreiImage } from '@react-three/drei'; // Rename import untuk menghindari konflik
import useIsMobile from '@/app/hooks/useIsMobile'; // Impor hook yang baru dibuat
import Image from 'next/image'; // Impor Next/Image untuk versi mobile

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

// Komponen Cloud 3D (tidak ada perubahan)
function Cloud({ radius = 15 }) {
    const groupRef = useRef<THREE.Group>(null!);
    const count = SKILLS_LIST.length;

    const points = useMemo(() => {
        const pts = new Array(count).fill(0).map((_, i) => {
            const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
            const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
            return new THREE.Vector3(
                Math.cos(theta) * Math.sin(phi),
                Math.sin(theta) * Math.sin(phi),
                Math.cos(phi)
            ).multiplyScalar(radius);
        });
        return pts;
    }, [count, radius]);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, state.pointer.x * (Math.PI / 10), 0.05);
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, state.pointer.y * (Math.PI / 10), 0.05);
        }
    });

    return (
        <group ref={groupRef}>
            {points.map((pos, i) => (
                <DreiImage key={i} position={pos} url={SKILLS_LIST[i].icon} scale={9} transparent />
            ))}
        </group>
    );
}


// Komponen utama dengan rendering kondisional
export default function SkillsCard() {
    const isMobile = useIsMobile(); // Gunakan hook untuk cek ukuran layar

    return (
        <div
            className="bg-gray-800 rounded-2xl h-full relative overflow-hidden"
        >
            {/* Efek gradien tetap ada untuk kedua versi */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, rgba(45, 212, 191, 0.15), transparent 70%)',
                }}
            />
            {/* Konten kartu */}
            <div className="relative p-4 w-full h-full flex flex-col">
                <h3 className="text-xl font-bold z-10 px-2 pt-2">Skills</h3>
                {isMobile ? (
                    // === VERSI MOBILE: GRID 2D SEDERHANA & RINGAN ===
                    <div className="grid grid-cols-4 gap-4 p-4 overflow-y-auto flex-1">
                        {SKILLS_LIST.map((skill) => (
                            <div key={skill.name} className="flex flex-col items-center justify-center text-center">
                                <Image
                                    src={skill.icon}
                                    alt={skill.name}
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                />
                                <p className="text-xs mt-2 text-gray-300">{skill.name}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    // === VERSI DESKTOP: CANVAS 3D INTERAKTIF ===
                    <div className="flex-1 cursor-grab active:cursor-grabbing">
                        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 30], fov: 90 }}>
                            <fog attach="fog" args={['#0D1117', 0, 80]} />
                            <Cloud radius={15} />
                        </Canvas>
                    </div>
                )}
            </div>
        </div>
    );
}