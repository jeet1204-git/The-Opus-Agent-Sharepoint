"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function LandingPage() {
  useEffect(() => {
    const cv = document.getElementById("opus-field") as HTMLCanvasElement | null;
    const dot = document.getElementById("opus-dot");
    const ring = document.getElementById("opus-ring");
    if (!cv || !dot || !ring) return;
    const ctx = cv.getContext("2d")!;
    let W = 0, H = 0, raf = 0;
    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    resize();
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
      dot.animate(
        [{ transform: "translate(-50%,-50%) scale(1.6)" }, { transform: "translate(-50%,-50%) scale(1)" }],
        { duration: 180 }
      );
    };
    const GAP = 23, RAD = 155;
    const loop = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      ctx.clearRect(0, 0, W, H);
      for (let y = GAP / 2; y < H; y += GAP) for (let x = GAP / 2; x < W; x += GAP) {
        const d = Math.hypot(x - mx, y - my), t = Math.max(0, 1 - d / RAD);
        const r = 0.9 + t * t * 3.8;
        ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283);
        if (t > 0) { const c = t > .62 ? "124,92,255" : t > .32 ? "46,211,183" : "255,138,92"; ctx.fillStyle = `rgba(${c},${0.12 + t * 0.88})`; }
        else ctx.fillStyle = "rgba(20,20,30,0.045)";
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    const hoverEls = Array.from(document.querySelectorAll(".opus-landing .hov"));
    const on = () => ring.classList.add("h"), off = () => ring.classList.remove("h");
    hoverEls.forEach((el) => { el.addEventListener("mouseenter", on); el.addEventListener("mouseleave", off); });
    window.addEventListener("mousemove", move);
    window.addEventListener("resize", resize);
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("resize", resize);
      hoverEls.forEach((el) => { el.removeEventListener("mouseenter", on); el.removeEventListener("mouseleave", off); });
    };
  }, []);

  return (
    <div className="opus-landing">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <style>{CSS}</style>

      <canvas id="opus-field" />
      <div id="opus-dot" />
      <div id="opus-ring" />

      <div className="wrap">
        <div className="blob b1" /><div className="blob b2" /><div className="blob b3" /><div className="blob b4" />

        <nav className="nav">
          <div className="wm"><span className="logo" />Opus</div>
          <div className="navlinks">
            <Link href="/feed" className="hov">Discover</Link>
            <Link href="/upload" className="hov">Publish</Link>
            <Link href="/impact" className="hov">Impact</Link>
            <Link href="/feed" className="cta hov">Launch ↗</Link>
          </div>
        </nav>

        <div className="hero">
          <div className="pill"><span className="d" />Your company&apos;s AI agents, in one place</div>
          <h1>Build it once.<br /><span className="g">Reuse it forever.</span></h1>
          <p className="sub">The lively home for every AI agent your team builds — discover what already exists, trust it, and run it in one click.</p>
          <div className="btns">
            <Link href="/feed" className="p hov">Launch workspace ↗</Link>
            <Link href="/search" className="s hov">Explore agents</Link>
          </div>
          <div className="chips">
            <span className="chip"><span className="sw" style={{ background: "#ff8a5c" }} />Semantic search</span>
            <span className="chip"><span className="sw" style={{ background: "#7c5cff" }} />Duplicate detector</span>
            <span className="chip"><span className="sw" style={{ background: "#2ed3b7" }} />One-click run</span>
            <span className="chip"><span className="sw" style={{ background: "#ffd23f" }} />Reuse impact</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.opus-landing{position:fixed;inset:0;overflow:hidden;background:#fbfbfa;color:#15161a;font-family:'Inter',sans-serif;cursor:none}
.opus-landing a{cursor:none;text-decoration:none;color:inherit}
.opus-landing #opus-field{position:fixed;inset:0;z-index:0;pointer-events:none}
.opus-landing #opus-dot{position:fixed;width:9px;height:9px;border-radius:50%;background:conic-gradient(from 0deg,#ff8a5c,#7c5cff,#2ed3b7,#ffd23f,#ff8a5c);transform:translate(-50%,-50%);pointer-events:none;z-index:9999}
.opus-landing #opus-ring{position:fixed;width:38px;height:38px;border-radius:50%;border:2px solid rgba(124,92,255,.55);transform:translate(-50%,-50%);pointer-events:none;z-index:9998;transition:width .2s,height .2s,border-color .2s,background .2s}
.opus-landing #opus-ring.h{width:62px;height:62px;border-color:transparent;background:radial-gradient(circle,rgba(124,92,255,.18),transparent 70%)}
.opus-landing .wrap{position:relative;max-width:1100px;margin:0 auto;padding:30px 32px;height:100vh;display:flex;flex-direction:column}
.opus-landing .blob{position:absolute;border-radius:50%;filter:blur(60px);opacity:.5;z-index:0}
.opus-landing .b1{width:340px;height:340px;background:#ff8a5c;top:60px;left:-60px}
.opus-landing .b2{width:300px;height:300px;background:#7c5cff;top:10px;right:-40px}
.opus-landing .b3{width:280px;height:280px;background:#2ed3b7;bottom:80px;left:30%}
.opus-landing .b4{width:240px;height:240px;background:#ffd23f;bottom:40px;right:10%}
.opus-landing .nav{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;margin-bottom:auto}
.opus-landing .wm{font-family:'Space Grotesk';font-weight:700;font-size:20px;display:flex;align-items:center;gap:9px}
.opus-landing .logo{width:26px;height:26px;border-radius:8px;background:conic-gradient(from 120deg,#ff8a5c,#7c5cff,#2ed3b7,#ffd23f,#ff8a5c)}
.opus-landing .navlinks{display:flex;gap:26px;font-weight:500;font-size:14px;color:#5b5c66;align-items:center}
.opus-landing .cta{background:#15161a;color:#fff;padding:10px 18px;border-radius:11px;font-weight:600}
.opus-landing .hero{position:relative;z-index:1;text-align:center;max-width:760px;margin:auto}
.opus-landing .pill{display:inline-flex;align-items:center;gap:8px;background:#fff;border:1px solid #ececf0;box-shadow:0 6px 20px rgba(20,20,30,.06);border-radius:999px;padding:7px 15px;font-size:13px;font-weight:600;margin-bottom:28px}
.opus-landing .pill .d{width:7px;height:7px;border-radius:50%;background:#2ed3b7}
.opus-landing h1{font-family:'Space Grotesk';font-weight:700;font-size:64px;line-height:1.03;letter-spacing:-.03em}
.opus-landing h1 .g{background:linear-gradient(95deg,#ff8a5c,#7c5cff 45%,#2ed3b7);-webkit-background-clip:text;background-clip:text;color:transparent}
.opus-landing .sub{font-size:18px;color:#56575f;line-height:1.6;margin:24px auto 0;max-width:560px}
.opus-landing .btns{display:flex;gap:13px;justify-content:center;margin-top:34px}
.opus-landing .p{background:#15161a;color:#fff;padding:14px 26px;border-radius:13px;font-family:'Space Grotesk';font-weight:600;font-size:15px}
.opus-landing .s{background:#fff;color:#15161a;border:1px solid #e6e6ec;padding:14px 24px;border-radius:13px;font-family:'Space Grotesk';font-weight:600;font-size:15px}
.opus-landing .chips{display:flex;gap:10px;justify-content:center;margin-top:46px;flex-wrap:wrap}
.opus-landing .chip{background:#fff;border:1px solid #ededf2;border-radius:12px;padding:10px 16px;font-size:13px;font-weight:600;display:flex;gap:8px;align-items:center;box-shadow:0 4px 14px rgba(20,20,30,.04)}
.opus-landing .sw{width:9px;height:9px;border-radius:3px}
`;
