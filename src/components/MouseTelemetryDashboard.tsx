import React, { useEffect, useRef } from 'react';

export default function MouseTelemetryDashboard() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetScale = 1.0;
    let currentScale = 1.0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as HTMLElement | null;
      const isHovering = target ? !!target.closest('button, a, [role="button"], input, select, textarea, .cursor-pointer, [onclick]') : false;
      
      targetScale = isHovering ? 1.5 : 1.0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let animationFrameId: number;

    const updatePosition = () => {
      // Scale transition remains smooth
      currentScale += (targetScale - currentScale) * 0.15;

      // Position update is instantaneous (zero latency, perfect 120Hz tracking)
      glow.style.transform = `translate3d(${mouseX - 125}px, ${mouseY - 125}px, 0) scale(${currentScale})`;

      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Sombreado de luz detalhado e mais forte, sem ponto central sólido */}
      <div
        ref={glowRef}
        className="absolute w-[250px] h-[250px] rounded-full pointer-events-none will-change-transform"
        style={{
          background: `
            radial-gradient(circle at center, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.06) 20%, rgba(255, 255, 255, 0.02) 45%, rgba(255, 255, 255, 0) 70%),
            radial-gradient(circle at center, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0.01) 35%, rgba(245, 158, 11, 0) 60%)
          `,
          mixBlendMode: 'screen',
          filter: 'blur(8px)', // Suaviza ainda mais a composição das camadas de gradiente
        }}
      />
    </div>
  );
}

// Mantido para manter compatibilidade absoluta com os outros componentes mapeados sem dar erros de compilação
export function triggerNelsinhoMouseHover(spotId: string) {
  const event = new CustomEvent('nelsinho-spot-hover', {
    detail: { spotId }
  });
  window.dispatchEvent(event);
}
