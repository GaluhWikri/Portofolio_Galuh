// app/hooks/useIsMobile.tsx
'use client';

import { useState, useEffect } from 'react';

/**
 * Hook untuk mendeteksi ukuran layar mobile berdasarkan breakpoint.
 * @param {number} breakpoint - Lebar maksimal untuk dianggap mobile (default: 768px).
 * @returns {boolean} - `true` jika lebar layar di bawah breakpoint.
 */
const useIsMobile = (breakpoint = 768): boolean => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Fungsi ini akan dijalankan hanya di client-side
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Pengecekan awal saat komponen dimuat
        checkScreenSize();

        // Tambahkan event listener untuk memantau perubahan ukuran layar
        window.addEventListener('resize', checkScreenSize);

        // Hapus listener saat komponen tidak lagi digunakan untuk mencegah memory leak
        return () => window.removeEventListener('resize', checkScreenSize);
    }, [breakpoint]);

    return isMobile;
};

export default useIsMobile;