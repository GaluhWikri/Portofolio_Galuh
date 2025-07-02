// app/hooks/useIsMobile.tsx
'use client';

import { useState, useEffect } from 'react';

const useIsMobile = (breakpoint = 768): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Cek ukuran saat komponen dimuat di client
    checkScreenSize();

    // Monitor perubahan ukuran layar
    window.addEventListener('resize', checkScreenSize);

    // Hapus listener untuk mencegah memory leak
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [breakpoint]);

  return isMobile;
};

export default useIsMobile;