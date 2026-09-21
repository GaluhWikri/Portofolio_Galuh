'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TrackballControls, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import useIsMobile from '@/app/hooks/useIsMobile';

interface SkillItem {
    name: string;
    icon: string;
}

// Cache tekstur per URL. Ganti-ganti filter tidak lagi mengunduh ulang gambar yang sama, dan
// kegagalan ikut di-cache supaya 404 tidak dihantam berulang tiap render. Entri dibatasi jumlah
// ikon unik (~36), jadi tidak menumpuk di GPU.
const texCache = new Map<string, THREE.Texture | null>();

const muatTekstur = (url: string) =>
    new Promise<THREE.Texture | null>((resolve) => {
        if (texCache.has(url)) return resolve(texCache.get(url) ?? null);
        new THREE.TextureLoader().load(
            url,
            (t) => {
                t.colorSpace = THREE.SRGBColorSpace;
                texCache.set(url, t);
                resolve(t);
            },
            undefined,
            () => {
                texCache.set(url, null);
                resolve(null);
            },
        );
    });

// Huruf awal untuk skill tanpa ikon, digambar ke canvas 2D — bukan komponen <Text> (troika).
// Troika mengunduh font dari CDN dan membuat web worker; kalau gagal, kartu skill baru yang
// belum punya ikon tampil kosong. Canvas 2D selalu tersedia dan tidak butuh jaringan.
const hurufCache = new Map<string, THREE.Texture>();

const hurufTekstur = (ch: string) => {
    const hit = hurufCache.get(ch);
    if (hit) return hit;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    g.fillStyle = '#0A0A0A';
    g.font = 'bold 96px system-ui, -apple-system, Segoe UI, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(ch, 64, 70);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    hurufCache.set(ch, t);
    return t;
};

// Jaring pengaman: kalau three/WebGL melempar error, hanya section skill yang jatuh ke daftar
// teks — halaman tidak ikut jadi putih dan tetap bisa di-scroll.
class BatasError extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { gagal: boolean }> {
    state = { gagal: false };
    static getDerivedStateFromError() {
        return { gagal: true };
    }
    render() {
        return this.state.gagal ? this.props.fallback : this.props.children;
    }
}

const DaftarSkill = ({ skills }: { skills: SkillItem[] }) => (
    <div className="flex h-full flex-wrap content-center items-center justify-center gap-2 overflow-auto p-6">
        {skills.map((s, i) => (
            <span key={s.name || i} className="border-2 border-black bg-white px-3 py-1.5 text-xs font-bold uppercase">
                {s.name}
            </span>
        ))}
    </div>
);

// Komponen kartu logo individual yang selalu menghadap kamera
// size: skala kartu (1 = ukuran penuh). Mengecil otomatis saat skill banyak.
const SkillBadge = ({ icon, name, position, size }: { icon: string; name: string; position: THREE.Vector3; size: number }) => {
    // Ikon dimuat manual, BUKAN lewat useTexture. useTexture melempar error kalau gambarnya gagal
    // (404, atau diblokir CORS seperti dashboardicons.com) dan error itu menjatuhkan seluruh
    // halaman jadi putih. Di sini gagal = kartu ini saja yang pakai huruf awal.
    const [tex, setTex] = useState<THREE.Texture | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let alive = true;
        setTex(null);
        setFailed(false);
        if (!icon) {
            setFailed(true);
            return;
        }
        muatTekstur(icon).then((t) => {
            if (!alive) return;
            if (t) setTex(t);
            else setFailed(true);
        });
        return () => {
            alive = false;
        };
    }, [icon]);

    const map = tex ?? (failed ? hurufTekstur((name || '?').charAt(0).toUpperCase()) : null);

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
                <mesh position={[0.06 * size, -0.06 * size, -0.01]}>
                    <planeGeometry args={[1.5 * size, 1.5 * size]} />
                    <meshBasicMaterial color="#0A0A0A" />
                </mesh>

                {/* Bingkai Luar Hitam */}
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[1.5 * size, 1.5 * size]} />
                    <meshBasicMaterial color="#0A0A0A" />
                </mesh>

                {/* Latar Belakang Kartu Putih */}
                <mesh position={[0, 0, 0.002]}>
                    <planeGeometry args={[1.4 * size, 1.4 * size]} />
                    <meshBasicMaterial color="white" />
                </mesh>

                {/* Gambar Ikon Skill (Sangat Tajam & Tidak Terdistorsi).
                    Kalau ikon belum diisi / gagal dimuat, `map` berisi huruf awal hasil canvas —
                    skill tetap tampil, jadi jumlahnya cocok dengan counter dan tidak hilang. */}
                {map && (
                    <mesh position={[0, 0, 0.01]}>
                        <planeGeometry args={[1.0 * size, 1.0 * size]} />
                        <meshBasicMaterial map={map} transparent={true} toneMapped={false} />
                    </mesh>
                )}

                {/* Teks Nama Keahlian Saat Hover — ukurannya tetap supaya selalu terbaca */}
                {hovered && (
                    <group position={[0, -1.1 * size, 0.02]}>
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

// Komponen grup skill 3D yang berputar sendiri dengan entrance animation
// formation: 'globe' = sebaran bola (cocok untuk banyak skill), 'ring' = roda orbit menghadap kamera (cocok untuk sedikit skill)
const SkillGlobeGroup = ({ skills, radius, formation }: { skills: SkillItem[]; radius: number; formation: 'globe' | 'ring' }) => {
    const tiltRef = useRef<THREE.Group>(null);
    const spinRef = useRef<THREE.Group>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [entranceScale, setEntranceScale] = useState(0);

    // Re-form tiap kali daftar skill / bentuk berubah (ganti filter)
    React.useEffect(() => {
        setEntranceScale(0);
        const id = requestAnimationFrame(() => setEntranceScale(1));
        return () => cancelAnimationFrame(id);
    }, [skills, formation]);

    // Distribusi posisi badge sesuai bentuk yang dipilih
    const badges = useMemo(() => {
        const count = skills.length;

        if (formation === 'ring') {
            // Roda orbit pada bidang XY (menghadap kamera). Radius ikut jumlah skill
            // supaya jarak antar badge tetap ~2.6 unit dan tidak saling tindih.
            const r = Math.max(1.7, Math.min(radius * 1.15, count * 0.42));
            return skills.map((skill, i) => {
                const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
                return { skill, size: 1, position: new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0) };
            });
        }

        // Fibonacci Sphere: distribusi merata di permukaan bola.
        // Bola membesar sedikit dan kartu mengecil sedikit saat skill banyak, supaya kartu
        // tidak saling menumpuk — tapi tidak sampai renggang sehingga bentuk bolanya hilang.
        // ponytail: 3.4 / 21 diukur pada kanvas 749x500 (kamera z=12, fov 45) -> kartu
        // bersentuhan ~65% lebar, globe terpakai ~85% tinggi kanvas. Kalau skill nambah
        // jauh lagi, naikkan cameraDistance-nya, bukan plafon radiusnya.
        const spread = 1 + Math.min(0.34, Math.max(0, count - 12) * 0.021);
        const r = Math.min(radius * spread, 3.4);
        const size = Math.max(0.66, Math.min(1, Math.sqrt(21 / count)));

        return skills.map((skill, i) => {
            const y = count > 1 ? 1 - (i / (count - 1)) * 2 : 0;
            const rad = Math.sqrt(1 - y * y);
            const phi = i * 2.3999632; // Golden angle

            return { skill, size, position: new THREE.Vector3(Math.cos(phi) * rad * r, y * r, Math.sin(phi) * rad * r) };
        });
    }, [skills, radius, formation]);

    useFrame((state, delta) => {
        if (!tiltRef.current || !spinRef.current) return;

        // Lerp skala grup dari 0 ke 1 secara halus
        tiltRef.current.scale.lerp(new THREE.Vector3(entranceScale, entranceScale, entranceScale), 0.08);

        if (isHovered) return;

        if (formation === 'ring') {
            // Roda berputar pada porosnya sendiri (sumbu Z) agar tiap badge tetap terbaca
            spinRef.current.rotation.z -= delta * 0.35;
        } else {
            // Bola berputar perlahan dua sumbu
            spinRef.current.rotation.y += delta * 0.12;
            spinRef.current.rotation.x += delta * 0.04;
        }
    });

    return (
        <group
            ref={tiltRef}
            // Kemiringan di-set deklaratif (bukan diakumulasi di frame loop) supaya
            // bentuk cincin tidak mewarisi rotasi bola dari filter sebelumnya.
            rotation={[formation === 'ring' ? -0.15 : 0, 0, 0]}
            scale={[0, 0, 0]} // Mulai dari ukuran 0
            onPointerOver={() => setIsHovered(true)}
            onPointerOut={() => setIsHovered(false)}
        >
            <group ref={spinRef}>
                {badges.map(({ skill, position, size }, i) => (
                    <SkillBadge
                        key={skill.name || i}
                        icon={skill.icon}
                        name={skill.name}
                        position={position}
                        size={size}
                    />
                ))}
            </group>
        </group>
    );
};

export default function PhysicsSkills({ skills, formation = 'globe' }: { skills: SkillItem[]; formation?: 'globe' | 'ring' }) {
    const isMobile = useIsMobile();

    if (skills.length === 0) return <div>No skills data</div>;

    // Radius bola; bentuk cincin menghitung radiusnya sendiri dari jumlah skill
    const globeRadius = isMobile ? 2.4 : 3.0;
    const cameraDistance = 12.0;

    return (
        <div className="w-full h-[400px] md:h-[500px] bg-white relative overflow-hidden">
            {/* BatasError di-key ulang tiap ganti filter, jadi sekali gagal pun filter berikutnya
                masih dicoba — bukan langsung mati permanen. */}
            <BatasError key={`${formation}-${skills.length}`} fallback={<DaftarSkill skills={skills} />}>
                <Canvas
                    camera={{ position: [0, 0, cameraDistance], fov: 45 }}
                    onCreated={({ gl }) => {
                        // Konteks WebGL bisa hilang (GPU sibuk, tab lama nganggur, driver reset).
                        // preventDefault = browser boleh memulihkannya; tanpa ini kanvas tinggal
                        // putih sampai halaman di-reload.
                        gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault(), false);
                    }}
                >
                    <ambientLight intensity={1.5} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} />

                    <SkillGlobeGroup skills={skills} radius={globeRadius} formation={formation} />

                    <TrackballControls
                        noPan={true}
                        noZoom={true}
                        staticMoving={false}
                        dynamicDampingFactor={0.1}
                        rotateSpeed={2.5}
                    />
                </Canvas>
            </BatasError>
        </div>
    );
}
