"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "@/lib/i18n";

export type OrbConfig = {
  label?: string;
  pointerReactive?: boolean;
  dragToOrbit?: boolean;
};

const N = 26;

/**
 * Pointer-reactive particle orbit.
 *
 * Replicates the behavior of the original Shakya.work hero orbit:
 *  - 26 particles on random radii with individual speeds/directions
 *  - 3 concentric guide rings (outer-10, outer-50, 70)
 *  - Pointer repulsion: particles within 90px of the cursor are pushed away
 *  - Drag-to-orbit: horizontal drag injects a decaying phase rotation
 *  - Center dot and ring colors read from CSS --accent; 15% of particles use
 *    the page text color (--ink) for subtle variation.
 */
export default function Orb({ config = {} }: { config?: OrbConfig }) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const labelText = config.label ?? t("home.orbLabel");
  const pointerReactive = config.pointerReactive !== false;
  const dragToOrbit = config.dragToOrbit !== false;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Non-null aliases so nested functions keep the narrowed types.
    const cvs = canvas;
    const c = ctx;

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let dpr = 1;

    const particles: Array<{
      r: number;
      a: number;
      speed: number;
      size: number;
      op: number;
      useText: boolean;
    }> = [];

    // Cached CSS custom properties — recomputed at most once per second
    // instead of forcing a style recalc on every animation frame.
    let accent = "#7c3aed";
    let text = "#FAFAFA";
    let frames = 0;

    const pointer = { x: 0, y: 0, active: false };
    let phase = 0;
    let drag: { x: number; last: number } | null = null;
    let running = true;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = cvs.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      cvs.width = Math.floor(w * dpr);
      cvs.height = Math.floor(h * dpr);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h / 2;
    }

    function build() {
      particles.length = 0;
      const maxR = Math.min(w, h) / 2 - 70;
      for (let i = 0; i < N; i++) {
        const r = 60 + Math.random() * maxR;
        particles.push({
          r,
          a: Math.random() * Math.PI * 2,
          speed:
            (0.0006 + Math.random() * 0.0012) * (Math.random() < 0.5 ? 1 : -1),
          size: 1.5 + Math.random() * 3,
          op: 0.25 + Math.random() * 0.6,
          useText: Math.random() < 0.15,
        });
      }
    }

    function draw() {
      c.clearRect(0, 0, w, h);

      frames++;
      if (frames % 60 === 0) {
        const cs = getComputedStyle(document.documentElement);
        accent = cs.getPropertyValue("--accent").trim() || "#7c3aed";
        text = cs.getPropertyValue("--ink").trim() || "#FAFAFA";
      }

      const outer = Math.min(w, h) / 2;

      // 3 guide rings with the original opacities
      [outer - 10, outer - 50, 70].forEach((r, i) => {
        c.beginPath();
        c.arc(cx, cy, Math.max(2, r), 0, Math.PI * 2);
        c.strokeStyle = accent;
        c.globalAlpha = [0.25, 0.5, 0.7][i];
        c.lineWidth = 1;
        c.stroke();
      });

      // center dot
      c.globalAlpha = 1;
      c.beginPath();
      c.arc(cx, cy, 10, 0, Math.PI * 2);
      c.fillStyle = accent;
      c.fill();

      // particles
      particles.forEach((p) => {
        p.a += p.speed + phase;
        let px = cx + Math.cos(p.a) * p.r;
        let py = cy + Math.sin(p.a) * p.r;

        if (pointerReactive && pointer.active) {
          const dx = px - pointer.x;
          const dy = py - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < 90 && d > 0.001) {
            const f = (90 - d) / 90;
            px += (dx / d) * f * 22;
            py += (dy / d) * f * 22;
          }
        }

        c.beginPath();
        c.arc(px, py, p.size, 0, Math.PI * 2);
        c.fillStyle = p.useText ? text : accent;
        c.globalAlpha = p.op;
        c.fill();
      });

      c.globalAlpha = 1;
    }

    function loop() {
      if (dragToOrbit && drag) {
        phase += drag.last;
        drag.last *= 0.9;
      }
      draw();
      if (running && !prefersReducedMotion) {
        rafRef.current = requestAnimationFrame(loop);
      }
    }

    function onPointerMove(e: PointerEvent) {
      const rect = cvs.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;

      if (dragToOrbit && drag) {
        drag.last = (e.clientX - drag.x) * 0.002;
        drag.x = e.clientX;
      }
    }

    function onPointerLeave() {
      pointer.active = false;
    }

    function onPointerDown(e: PointerEvent) {
      if (!dragToOrbit) return;
      drag = { x: e.clientX, last: 0 };
      cvs.setPointerCapture(e.pointerId);
    }

    function onPointerUp(e: PointerEvent) {
      drag = null;
      cvs.releasePointerCapture?.(e.pointerId);
    }

    function onPointerCancel(e: PointerEvent) {
      drag = null;
      cvs.releasePointerCapture?.(e.pointerId);
    }

    function onResize() {
      resize();
      build();
    }

    resize();
    build();

    window.addEventListener("resize", onResize);
    cvs.addEventListener("pointermove", onPointerMove);
    cvs.addEventListener("pointerleave", onPointerLeave);
    cvs.addEventListener("pointerdown", onPointerDown);
    cvs.addEventListener("pointerup", onPointerUp);
    cvs.addEventListener("pointercancel", onPointerCancel);

    running = true;
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      cvs.removeEventListener("pointermove", onPointerMove);
      cvs.removeEventListener("pointerleave", onPointerLeave);
      cvs.removeEventListener("pointerdown", onPointerDown);
      cvs.removeEventListener("pointerup", onPointerUp);
      cvs.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [pointerReactive, dragToOrbit]);

  return (
    <div className="orbit relative mx-auto aspect-square w-full max-w-[360px] lg:max-w-[460px] lg:ml-auto">
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive particle orbit"
      />
      {labelText && (
        <p className="pointer-events-none absolute -bottom-7 left-0 font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
          {labelText}
        </p>
      )}
    </div>
  );
}
