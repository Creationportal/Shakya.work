"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SimulationEngine } from "./engine";
import { SimulationRenderer } from "./renderer";

export function useSimulation(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const engineRef = useRef<SimulationEngine | null>(null);
  const rendererRef = useRef<SimulationRenderer | null>(null);
  const displayRef = useRef(new Map<string, { x: number; y: number }>());
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);
  const reducedRef = useRef(false);
  const lastCountsRef = useRef({ agents: 0, humans: 0, phase: "Day" });
  const startLoopRef = useRef<() => void>(() => {});

  const [running, setRunning] = useState(false);
  const [counts, setCounts] = useState({ agents: 0, humans: 0, phase: "Day" });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new SimulationEngine();
    const renderer = new SimulationRenderer(canvas);
    engineRef.current = engine;
    rendererRef.current = renderer;

    const tick = () => {
      const now = performance.now();
      engine.update(1 / 60);
      const state = engine.getState();
      const display = displayRef.current;
      for (const f of state.figures) {
        const d = display.get(f.id) || { x: f.x, y: f.y };
        display.set(f.id, d);
        d.x += (f.x - d.x) * 0.25;
        d.y += (f.y - d.y) * 0.25;
      }
      renderer.draw(state, display, now);

      const c = engine.getCounts();
      if (
        c.agents !== lastCountsRef.current.agents ||
        c.humans !== lastCountsRef.current.humans ||
        c.phase !== lastCountsRef.current.phase
      ) {
        lastCountsRef.current = c;
        setCounts(c);
      }

      // Only keep the render loop alive while the simulation is running AND
      // motion is allowed; otherwise the RAF chain ends here.
      rafRef.current = runningRef.current && !reducedRef.current ? requestAnimationFrame(tick) : 0;
    };

    // Kick the loop off from start()/stop() transitions.
    startLoopRef.current = () => {
      if (!rafRef.current && runningRef.current && !reducedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    // Respect reduced-motion: a single static frame, no animation loop.
    reducedRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Draw the initial idle frame; tick() won't schedule further frames when
    // reduced motion is requested.
    setCounts(engine.getCounts());
    tick();

    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasRef]);

  const start = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.start();
    runningRef.current = true;
    if (!reducedRef.current) startLoopRef.current();
    setRunning(true);
  }, []);

  const stop = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.stop();
    runningRef.current = false;
    setRunning(false);
  }, []);

  return { running, counts, start, stop };
}
