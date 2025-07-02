// app/components/SkillsCard/SkillsCard.tsx
'use client';

import * as THREE from 'three'; // <-- KESALAHAN ADA DI SINI, SEKARANG SUDAH DIPERBAIKI
import { useRef, useMemo } from 'react';
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

// Komponen Cloud 3D yang dioptimalkan
function Cloud({ radius = 20 }: { radius?: number }) {
    const groupRef = useRef<THREE.Group>(null!);
    const isMobile = useIsMobile();

    const points = useMemo(() => {
        const numPoints = SKILLS_LIST.length;
        return new Array(numPoints).fill(0).map((_, i) => {
            const phi = Math.acos(1 - (2 * i) / (numPoints -1));
            const theta = Math.sqrt(numPoints * Math.PI) * phi;
            return new THREE.Vector3().setFromSphericalCoords(radius, phi, theta);
        });
    }, [radius]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        
        // Animasi untuk desktop
        if (!isMobile) {
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, state.pointer.y * 0.1, 0.05);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, -state.pointer.x * 0.2, 0.05);
        } else {
            // Animasi putaran otomatis ringan untuk mobile
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
    
    return (
        <div className="bg-gray-800 rounded-2xl h-full relative overflow-hidden cursor-grab active:cursor-grabbing">
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(45, 212, 191, 0.15), transparent 70%)' }} />
            <div className="relative p-4 w-full h-full flex flex-col justify-center items-center">
                <h3 className="absolute top-4 left-4 text-xl font-bold z-10">Skills</h3>
                <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 35], fov: 90 }}>
                    <fog attach="fog" args={['#0D1117', 15, 60]} />
                    <Cloud radius={isMobile ? 14 : 18} />
                </Canvas>
            </div>
        </div>
    );
}