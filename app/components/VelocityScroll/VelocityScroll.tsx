// app/components/VelocityScroll/VelocityScroll.tsx
'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationFrame,
} from 'framer-motion';
import { wrap } from '@motionone/utils';

interface VelocityScrollProps {
  children: React.ReactNode;
  baseVelocity: number;
  className?: string;
}

function ParallaxText({ children, baseVelocity = 100, className }: VelocityScrollProps) {
  const baseX = useMotionValue(0);

  const x = useTransform(baseX, (v) => `${wrap(0, -25, v)}%`);

  useAnimationFrame((t, delta) => {
    let moveBy = baseVelocity * (delta / 1000);
    baseX.set(baseX.get() + moveBy);
  });

  // --- PERBAIKAN: Menambah jumlah pengulangan untuk teks yang lebih pendek ---
  // Logika ini akan membuat teks yang pendek (seperti "Portofolio")
  // diulang lebih banyak agar animasinya tidak terputus.
  const repetitions = typeof children === 'string' && children.length < 15 ? 8 : 4;

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap">
      <motion.div className={`font-semibold uppercase flex whitespace-nowrap flex-nowrap ${className}`} style={{ x }}>
        {/* Menggunakan Array.from untuk membuat jumlah pengulangan yang dinamis */}
        {Array.from({ length: repetitions }).map((_, i) => (
            <span key={i} className="block mr-8">{children} </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function VelocityScroll() {
    return (
        <section>
            <ParallaxText baseVelocity={-2} className="text-6xl md:text-8xl text-white">Galuh Wikri Ramadhan</ParallaxText>
            <ParallaxText baseVelocity={2} className="text-5xl md:text-7xl text-gray-400">Portofolio</ParallaxText>
        </section>
    )
}
