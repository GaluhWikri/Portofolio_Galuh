'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    size: number;
    density: number;
}

const InteractiveBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const animationFrameRef = useRef<number>();

    const initParticles = useCallback((canvas: HTMLCanvasElement) => {
        const particles: Particle[] = [];
        const spacing = 30;
        const rows = Math.ceil(canvas.height / spacing);
        const cols = Math.ceil(canvas.width / spacing);

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const x = j * spacing;
                const y = i * spacing;
                particles.push({
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                    size: Math.random() * 2 + 1,
                    density: Math.random() * 30 + 10,
                });
            }
        }
        particlesRef.current = particles;
    }, []);

    const drawParticles = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const mouse = mouseRef.current;
        const maxDistance = 120;

        particlesRef.current.forEach((particle) => {
            // Calculate distance from mouse
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Repel particles from mouse
            if (distance < maxDistance) {
                const force = (maxDistance - distance) / maxDistance;
                const directionX = dx / distance;
                const directionY = dy / distance;

                particle.x -= directionX * force * particle.density;
                particle.y -= directionY * force * particle.density;
            } else {
                // Return to base position
                const returnSpeed = 0.05;
                particle.x += (particle.baseX - particle.x) * returnSpeed;
                particle.y += (particle.baseY - particle.y) * returnSpeed;
            }

            // Draw particle
            const distanceFromMouse = Math.sqrt(
                Math.pow(mouse.x - particle.x, 2) + Math.pow(mouse.y - particle.y, 2)
            );

            // Closer particles are darker
            const alpha = distanceFromMouse < maxDistance
                ? 0.3 + (1 - distanceFromMouse / maxDistance) * 0.4
                : 0.15;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fill();
        });
    }, []);

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        drawParticles(ctx, canvas);
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [drawParticles]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles(canvas);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouseRef.current = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
            }
        };

        const handleTouchEnd = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [initParticles, animate]);

    return (
        <canvas
            ref={canvasRef}
            className="interactive-bg"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />
    );
};

export default InteractiveBackground;
