// app/components/AnimatedNumber/AnimatedNumber.tsx
'use client';

import { useEffect } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';

/**
 * Komponen untuk menganimasikan angka dari 0 ke nilai target
 * saat elemen masuk ke dalam viewport.
 */
export default function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Membuat animasi spring yang akan bertransisi dengan mulus ke nilai target.
  // Animasi dimulai dari 0.
  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  // Mengubah nilai spring menjadi integer yang dibulatkan untuk ditampilkan.
  // toLocaleString() menambahkan koma sebagai pemisah ribuan.
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  // Memicu animasi saat komponen masuk ke dalam viewport.
  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [spring, value, isInView]);

  // Merender angka yang dianimasikan di dalam motion.span
  return <motion.span ref={ref}>{display}</motion.span>;
}
