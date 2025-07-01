// app/components/ScrollReveal/ScrollReveal.tsx

import React, { useEffect, useRef, useMemo, ReactNode, RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  containerClassName?: string;
  textClassName?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  scrollContainerRef,
  containerClassName = "",
  textClassName = "",
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="inline-block" key={index}>
          {word}
        </span>
      );
    });
  }, [children]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;

    const wordElements = el.querySelectorAll<HTMLElement>("span.inline-block");

    // ================= PERUBAIKAN UTAMA =================
    // Animasi untuk setiap kata, menggabungkan opacity dan pergerakan (y)
    // untuk efek "hilang dan muncul" yang lebih jelas.
    gsap.fromTo(
      wordElements,
      { 
        opacity: 0, // Mulai dari tidak terlihat
        y: 20,      // Mulai dari posisi sedikit di bawah
      },
      {
        opacity: 1, // Menjadi terlihat penuh
        y: 0,       // Kembali ke posisi asli
        stagger: 0.05,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          scroller,
          start: "top bottom-=100", // Pemicu animasi saat elemen masuk viewport
          // Mainkan saat masuk, balikkan saat keluar, mainkan lagi saat masuk kembali
          toggleActions: "play reverse play reverse",
        },
      }
    );
    // =================================================

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [scrollContainerRef]);

  return (
    <h2 ref={containerRef} className={`my-5 ${containerClassName}`}>
      <p className={`leading-[1.5] font-semibold ${textClassName}`}>
        {splitText}
      </p>
    </h2>
  );
};

export default ScrollReveal;
