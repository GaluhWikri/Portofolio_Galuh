'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture, Environment, Float } from '@react-three/drei';
import { Physics, RigidBody, BallCollider, RapierRigidBody, CuboidCollider } from '@react-three/rapier';
import * as THREE from 'three';
import useIsMobile from '@/app/hooks/useIsMobile';

interface SkillItem {
    name: string;
    icon: string;
}

const SkillBall = ({ icon, position, r, name }: { icon: string; position: [number, number, number]; r: number; name: string }) => {
    // Load texture
    const map = useTexture(icon);
    const api = useRef<RapierRigidBody>(null);
    const vec = new THREE.Vector3();

    // Random rotation speed
    const [rotSpeed] = useState(() => (Math.random() - 0.5) * 0.02);

    useFrame((_state, delta) => {
        if (!api.current) return;

        // Apply force to center (Attraction)
        // Agar bola selalu kembali berkumpul ke tengah (0,0,0)
        const currentPos = api.current.translation();
        vec.set(currentPos.x, currentPos.y, currentPos.z).negate().multiplyScalar(1); // Strength of attraction
        api.current.applyImpulse(vec, true);

        // Linear damping (air resistance)
        api.current.setLinearDamping(2);
        api.current.setAngularDamping(2);
    });

    return (
        <RigidBody
            ref={api}
            colliders="ball"
            restitution={1}
            friction={0.1}
            position={position}
            linearDamping={2}
            angularDamping={2}
        >
            {/* Putih di belakang icon agar icon transparan terlihat jelas */}
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[r, 32, 32]} />
                <meshStandardMaterial color="white" roughness={0.5} metalness={0.1} />
            </mesh>

            {/* Decal Icon seolah-olah print di bola */}
            <mesh position={[0, 0, r + 0.01]} rotation={[0, 0, 0]}>
                {/* Ini teknik simple wrapping - sebenarnya texture full sphere lebih mudah */}
            </mesh>

            {/* Mari pakai mapping langsung saja, sphere putih dengan icon */}
            <mesh>
                <sphereGeometry args={[r + 0.01, 32, 32]} />
                <meshStandardMaterial map={map} transparent opacity={1} roughness={0.2} />
            </mesh>
        </RigidBody>
    );
};

// Mouse Interactor - Mengusir bola saat mouse bergerak (Repulsion)
const MouseInvader = () => {
    const { mouse, viewport } = useThree();
    const api = useRef<RapierRigidBody>(null);

    useFrame(() => {
        if (api.current) {
            // Konversi mouse (-1 s/d 1) ke posisi viewport world
            const x = (mouse.x * viewport.width) / 2;
            const y = (mouse.y * viewport.height) / 2;

            // Gerakkan rigid body ke posisi mouse
            api.current.setNextKinematicTranslation({ x, y, z: 0 });
        }
    });

    return (
        <RigidBody ref={api} type="kinematicPosition" colliders={false}>
            {/* Invisible forceful collider */}
            <BallCollider args={[2]} />
        </RigidBody>
    );
};

export default function PhysicsSkills({ skills }: { skills: SkillItem[] }) {
    const isMobile = useIsMobile();
    // Filter skill yang punya icon path valid
    const validSkills = useMemo(() => skills.filter(s => s.icon && s.icon.length > 0), [skills]);

    if (validSkills.length === 0) return <div>No skills data</div>;

    return (
        <div className="w-full h-[500px] md:h-[600px] bg-black relative rounded-xl border-4 border-black overflow-hidden shadow-[8px_8px_0px_#000]">
            <div className="absolute top-4 left-4 z-10 bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_#000]">
                <span className="font-bold text-xs">INTERACTIVE GRAVITY</span>
            </div>

            <Canvas camera={{ position: [0, 0, 20], fov: 35 }}>
                <ambientLight intensity={1.5} />
                <spotLight position={[20, 20, 20]} angle={0.25} penumbra={1} intensity={2} />
                <spotLight position={[-20, -20, 20]} angle={0.25} penumbra={1} intensity={2} color="blue" />

                {/* Physics World dengan Gravity 0 karena kita pakai custom attraction */}
                <Physics gravity={[0, 0, 0]}>
                    <MouseInvader />

                    {/* Invisible walls agar tidak meledak keluar viewport terlalu jauh */}
                    <CuboidCollider position={[0, -15, 0]} args={[20, 1, 5]} />
                    <CuboidCollider position={[0, 15, 0]} args={[20, 1, 5]} />
                    <CuboidCollider position={[-15, 0, 0]} args={[1, 20, 5]} />
                    <CuboidCollider position={[15, 0, 0]} args={[1, 20, 5]} />
                    <CuboidCollider position={[0, 0, -5]} args={[20, 20, 1]} />
                    <CuboidCollider position={[0, 0, 5]} args={[20, 20, 1]} />

                    {validSkills.map((skill, i) => (
                        <SkillBall
                            key={i}
                            name={skill.name}
                            icon={skill.icon}
                            position={[
                                (Math.random() - 0.5) * 5,
                                (Math.random() - 0.5) * 5,
                                (Math.random() - 0.5) * 2
                            ]}
                            r={isMobile ? 1.0 : 1.3}
                        />
                    ))}
                </Physics>
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
