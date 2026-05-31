"use client";

import { useEffect, useRef } from "react";

/** Subtle in-app version of the landing's nanotech dot-field (normal cursor). */
export default function NanotechField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    let W = 0, H = 0, raf = 0, mx = -999, my = -999;
    const rz = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    const mv = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    rz();
    const GAP = 26, RAD = 140;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      for (let y = GAP / 2; y < H; y += GAP) for (let x = GAP / 2; x < W; x += GAP) {
        const d = Math.hypot(x - mx, y - my), t = Math.max(0, 1 - d / RAD);
        const r = 0.7 + t * t * 2.6;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283);
        if (t > 0) { const c = t > .6 ? "124,92,255" : t > .3 ? "46,211,183" : "255,138,92"; ctx.fillStyle = `rgba(${c},${0.10 + t * 0.7})`; }
        else ctx.fillStyle = "rgba(20,20,30,0.028)";
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", mv);
    window.addEventListener("resize", rz);
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", mv); window.removeEventListener("resize", rz); };
  }, []);
  return <canvas ref={ref} aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}
