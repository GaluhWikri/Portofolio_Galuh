// app/components/ClientOnly.tsx

'use client';

import { useEffect, useState } from 'react';

// Komponen ini memastikan children-nya hanya akan dirender di sisi client (browser).
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null; // Saat di server, jangan render apa pun.
  }

  return <>{children}</>; // Setelah di browser, render children-nya.
}