'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, TrackballControls, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import useIsMobile from '@/app/hooks/useIsMobile';

interface SkillItem {
    name: string;
    icon: string;
}

// Komponen kartu logo individual yang selalu menghadap kamera
const SkillBadge = ({ icon, name, position }: { icon: string; name: string; position: THREE.Vector3 }) => {
    const map = useTexture(icon);
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    useFrame(() => {
        if (groupRef.current) {
            const s = hovered ? 1.25 : 1.0;
            groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.15);
        }
    });

    return (
        <Billboard position={position}>
            <group
                ref={groupRef}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={(e) => {
                    e.stopPropagation();
                    setHovered(false);
                }}
            >
                {/* Bayangan Neo-Brutalism (Latar belakang hitam, sedikit offset) */}
                <mesh position={[0.06, -0.06, -0.01]}>
                    <planeGeometry args={[1.5, 1.5]} />
                    <meshBasicMaterial color="#0A0A0A" />
                </mesh>

                {/* Bingkai Luar Hitam */}
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[1.5, 1.5]} />
                    <meshBasicMaterial color="#0A0A0A" />
                </mesh>

                {/* Latar Belakang Kartu Putih */}
                <mesh position={[0, 0, 0.002]}>
                    <planeGeometry args={[1.4, 1.4]} />
                    <meshBasicMaterial color="white" />
                </mesh>

                {/* Gambar Ikon Skill (Sangat Tajam & Tidak Terdistorsi) */}
                <mesh position={[0, 0, 0.01]}>
                    <planeGeometry args={[1.0, 1.0]} />
                    <meshBasicMaterial map={map} transparent={true} toneMapped={false} />
                </mesh>

                {/* Teks Nama Keahlian Saat Hover */}
                {hovered && (
                    <group position={[0, -1.1, 0.02]}>
                        <mesh position={[0, 0, -0.005]}>
                            <planeGeometry args={[name.length * 0.15 + 0.4, 0.4]} />
                            <meshBasicMaterial color="#0A0A0A" />
                        </mesh>
                        <Text
                            fontSize={0.2}
                            color="white"
                            anchorX="center"
                            anchorY="middle"
                            fontWeight="bold"
                        >
                            {name.toUpperCase()}
                        </Text>
                    </group>
                )}
            </group>
        </Billboard>
    );
};

// Komponen Globe yang berputar sendiri dengan entrance animation
const SkillGlobeGroup = ({ skills, radius }: { skills: SkillItem[]; radius: number }) => {
    const groupRef = useRef<THREE.Group>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [entranceScale, setEntranceScale] = useState(0);

    // Memicu perubahan skala saat komponen dipasang (mount)
    React.useEffect(() => {
        setEntranceScale(1.0);
    }, []);

    // Algoritma Fibonacci Sphere untuk distribusi merata di permukaan bola
    const badges = useMemo(() => {
        const count = skills.length;
        return skills.map((skill, i) => {
            const y = 1 - (i / (count - 1)) * 2;
            const r = Math.sqrt(1 - y * y);
            const phi = i * 2.3999632; // Golden angle

            const x = Math.cos(phi) * r;
            const z = Math.sin(phi) * r;

            const position = new THREE.Vector3(x * radius, y * radius, z * radius);
            return { skill, position };
        });
    }, [skills, radius]);

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Lerp skala grup dari 0 ke 1 secara halus
            groupRef.current.scale.lerp(new THREE.Vector3(entranceScale, entranceScale, entranceScale), 0.08);

            if (!isHovered) {
                // Berputar sendiri secara perlahan
                groupRef.current.rotation.y += delta * 0.12;
                groupRef.current.rotation.x += delta * 0.04;
            }
        }
    });

    return (
        <group
            ref={groupRef}
            scale={[0, 0, 0]} // Mulai dari ukuran 0
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
        >
            {badges.map(({ skill, position }, i) => (
                <SkillBadge
                    key={skill.name || i}
                    icon={skill.icon}
                    name={skill.name}
                    position={position}
                />
            ))}
        </group>
    );
};

export default function PhysicsSkills({ skills }: { skills: SkillItem[] }) {
    const isMobile = useIsMobile();
    const validSkills = useMemo(() => skills.filter(s => s.icon && s.icon.length > 0), [skills]);

    if (validSkills.length === 0) return <div>No skills data</div>;

    const globeRadius = isMobile ? 2.4 : 3.0;
    const cameraDistance = 12.0;

    return (
        <div className="w-full h-[400px] md:h-[500px] bg-white relative overflow-hidden">
            <Canvas camera={{ position: [0, 0, cameraDistance], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                
                <SkillGlobeGroup skills={validSkills} radius={globeRadius} />
                
                <TrackballControls 
                    noPan={true}
                    noZoom={true}
                    staticMoving={false}
                    dynamicDampingFactor={0.1}
                    rotateSpeed={2.5}
                />
            </Canvas>
        </div>
    );
}
