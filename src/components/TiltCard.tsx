"use client";

import { useCallback, useRef } from "react";

/**
 * TiltCard — mouse-parallax 3D tilt wrapper.
 * Rotates the card toward the pointer and settles back on leave.
 */

export default function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  scale = 1.02,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      cancelAnimationFrame(raf.current);
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (0.5 - py) * maxTilt;
      const ry = (px - 0.5) * maxTilt;
      raf.current = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
        el.style.boxShadow = `0 18px 40px -18px var(--glow, rgba(124,58,237,0.35))`;
      });
    },
    [maxTilt, scale]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
      el.style.boxShadow = "";
    });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`will-change-transform transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </div>
  );
}
