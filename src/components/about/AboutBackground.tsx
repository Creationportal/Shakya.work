"use client";

import { useEffect, useRef } from "react";

export default function AboutBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let t = 0;
    const winds = container.querySelectorAll(
      ".wind"
    ) as NodeListOf<HTMLElement>;
    const prayerFlags = container.querySelectorAll(
      ".prayer-flag"
    ) as NodeListOf<HTMLElement>;

    const position = (time: number) => {
      winds.forEach((el, i) => {
        const speed = Number(el.dataset.speed) || 0.2;
        const phase = Number(el.dataset.phase) || 0;
        const x = ((time * speed * 10 + phase) % 120) - 20;
        const y = Math.sin(time * 0.3 + i) * 4;
        el.style.transform = `translate3d(${x}%, ${y}px, 0)`;
      });
      prayerFlags.forEach((el, i) => {
        const sway = Math.sin(time * 0.8 + i) * 3;
        el.style.transform = `rotate(${sway}deg)`;
      });
    };

    // Respect prefers-reduced-motion: render one static, natural frame.
    if (prefersReducedMotion) {
      position(1.7);
      return;
    }

    const animate = () => {
      t += 0.01;
      position(t);
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Soft gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-br from-paper via-paper to-surface opacity-80" />

      {/* Nepal-inspired warm wind streams */}
      <div
        className="wind absolute left-[-20%] top-[12%] h-px w-[140%] bg-gradient-to-r from-transparent via-orange-300/40 to-transparent"
        data-speed="0.15"
        data-phase="0"
      />
      <div
        className="wind absolute left-[-20%] top-[18%] h-px w-[140%] bg-gradient-to-r from-transparent via-amber-300/30 to-transparent"
        data-speed="0.22"
        data-phase="25"
      />
      <div
        className="wind absolute left-[-20%] top-[34%] h-[2px] w-[140%] bg-gradient-to-r from-transparent via-orange-200/25 to-transparent"
        data-speed="0.18"
        data-phase="60"
      />

      {/* China-inspired cool ink wind streams */}
      <div
        className="wind absolute left-[-20%] top-[52%] h-px w-[140%] bg-gradient-to-r from-transparent via-teal-300/30 to-transparent"
        data-speed="0.12"
        data-phase="40"
      />
      <div
        className="wind absolute left-[-20%] top-[64%] h-px w-[140%] bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent"
        data-speed="0.2"
        data-phase="10"
      />
      <div
        className="wind absolute left-[-20%] top-[78%] h-[2px] w-[140%] bg-gradient-to-r from-transparent via-teal-200/20 to-transparent"
        data-speed="0.16"
        data-phase="75"
      />

      {/* Himalayan / Chinese mountain silhouettes */}
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="xMidYMax slice"
        className="absolute bottom-0 left-0 w-full opacity-[0.08] dark:opacity-[0.06]"
      >
        <path
          fill="currentColor"
          d="M0,320 L0,220 C120,200 240,140 360,160 C480,180 600,260 720,240 C840,220 960,120 1080,130 C1200,140 1320,220 1440,200 L1440,320 Z"
        />
      </svg>
      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="xMidYMax slice"
        className="absolute bottom-0 left-0 w-full translate-y-8 opacity-[0.05] dark:opacity-[0.04]"
      >
        <path
          fill="currentColor"
          d="M0,320 L0,260 C160,240 320,180 480,190 C640,200 800,280 960,260 C1120,240 1280,160 1440,170 L1440,320 Z"
        />
      </svg>

      {/* Prayer flags line */}
      <svg
        viewBox="0 0 800 120"
        preserveAspectRatio="xMidYMid meet"
        className="absolute right-[-5%] top-[8%] w-[60%] opacity-40"
      >
        <line
          x1="0"
          y1="20"
          x2="800"
          y2="90"
          stroke="currentColor"
          strokeWidth="1"
          className="text-line"
        />
        <g className="prayer-flag origin-top" style={{ transformOrigin: "160px 36px" }}>
          <rect x="150" y="28" width="20" height="16" className="fill-blue-400/50" />
        </g>
        <g className="prayer-flag origin-top" style={{ transformOrigin: "240px 47px" }}>
          <rect x="230" y="39" width="20" height="16" className="fill-white/50" />
        </g>
        <g className="prayer-flag origin-top" style={{ transformOrigin: "320px 58px" }}>
          <rect x="310" y="50" width="20" height="16" className="fill-red-400/50" />
        </g>
        <g className="prayer-flag origin-top" style={{ transformOrigin: "400px 69px" }}>
          <rect x="390" y="61" width="20" height="16" className="fill-green-500/40" />
        </g>
        <g className="prayer-flag origin-top" style={{ transformOrigin: "480px 80px" }}>
          <rect x="470" y="72" width="20" height="16" className="fill-yellow-400/50" />
        </g>
      </svg>

      {/* Subtle floating particles */}
      <div className="absolute left-[10%] top-[25%] h-1 w-1 rounded-full bg-accent/20" />
      <div className="absolute left-[70%] top-[15%] h-1.5 w-1.5 rounded-full bg-accent/15" />
      <div className="absolute left-[85%] top-[45%] h-1 w-1 rounded-full bg-accent/20" />
      <div className="absolute left-[20%] top-[70%] h-1.5 w-1.5 rounded-full bg-accent/10" />
      <div className="absolute left-[55%] top-[80%] h-1 w-1 rounded-full bg-accent/15" />
    </div>
  );
}
