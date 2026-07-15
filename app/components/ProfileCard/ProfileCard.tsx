'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';

function TechCube() {
    const meshRef = useRef<THREE.Mesh>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Load tekstur logo dari folder public/assets/icon/
    const texReact = useTexture('/assets/icon/icons8-react-50.png');
    const texFigma = useTexture('/assets/icon/icons8-figma-48.png');
    const texTailwind = useTexture('/assets/icon/icons8-tailwindcss-48.png');
    const texNode = useTexture('/assets/icon/icons8-node-js-48.png');
    const texTypescript = useTexture('/assets/icon/icons8-typescript-48.png');
    const texJavascript = useTexture('/assets/icon/icons8-javascript-48.png');

    useFrame((state, delta) => {
        if (meshRef.current && !isHovered) {
            // Putar perlahan saat tidak di-hover/drag
            meshRef.current.rotation.x += delta * 0.15;
            meshRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <mesh 
            ref={meshRef}
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
            castShadow
            receiveShadow
        >
            <boxGeometry args={[3.2, 3.2, 3.2]} />
            
            {/* 6 Material untuk 6 Sisi Kubus: Kanan, Kiri, Atas, Bawah, Depan, Belakang */}
            <meshStandardMaterial attach="material-0" map={texReact} color="white" roughness={0.3} metalness={0.1} />
            <meshStandardMaterial attach="material-1" map={texFigma} color="white" roughness={0.3} metalness={0.1} />
            <meshStandardMaterial attach="material-2" map={texTailwind} color="white" roughness={0.3} metalness={0.1} />
            <meshStandardMaterial attach="material-3" map={texNode} color="white" roughness={0.3} metalness={0.1} />
            <meshStandardMaterial attach="material-4" map={texTypescript} color="white" roughness={0.3} metalness={0.1} />
            <meshStandardMaterial attach="material-5" map={texJavascript} color="white" roughness={0.3} metalness={0.1} />
            
            {/* Outline Hitam Tebal khas Neo-Brutalisme */}
            <Edges 
                color="black"
                threshold={15}
                lineWidth={4}
            />
        </mesh>
    );
}

export default function ProfileCard() {
    return (
        <div className="w-full max-w-[400px] h-[360px] md:h-[400px] bg-white border-4 border-black shadow-[8px_8px_0px_#000] relative overflow-hidden flex items-center justify-center">
            {/* Judul Lencana di Sudut Kiri Atas */}
            <div className="absolute top-4 left-4 z-10 bg-black text-white text-[10px] font-black px-2.5 py-1 uppercase tracking-wider select-none">
                3D Interactive Cube
            </div>
            
            {/* Petunjuk Interaksi di Sudut Kanan Bawah */}
            <div className="absolute bottom-4 right-4 z-10 text-[9px] font-bold text-gray-400 select-none">
                DRAG UNTUK MEMUTAR
            </div>

            <Canvas camera={{ position: [0, 0, 7.0], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <directionalLight position={[-5, 5, 5]} intensity={1.0} />
                
                <TechCube />
                
                {/* Kontrol Orbit bebas hambatan putar */}
                <OrbitControls 
                    enableZoom={false}
                    enablePan={false}
                    rotateSpeed={1.0}
                />
            </Canvas>
        </div>
    );
}
