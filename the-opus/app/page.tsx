"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Terminal, Shield, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-200 relative overflow-hidden flex flex-col justify-between font-sans">
      
      {/* BACKGROUND GRAPHIC TRICK: Ambient blur mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
      
      {/* Blueprint Grid Lines Accent to reinforce a "GitHub for Agents" theme */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-15 pointer-events-none" />

      {/* 1. SIMPLE HEADER */}
      <header className="w-full max-w-7xl mx-auto px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          {/* Your Custom SVG Symbol */}
          <div className="relative w-9 h-9 rounded-lg p-0.5 bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-900/30">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                <Image src="/logos/the-opus-logo-symbol.svg" alt="The OPUS Logo" className="w-16 h-16" width={64} height={64} />
            </div>
          </div>
          <span className="font-black text-xl text-white tracking-widest">THE OPUS</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-semibold text-slate-400">
          <a href="https://github.com/jeet1204-git/The-Opus-Agent-Sharepoint" className="hover:text-white transition">GitHub</a>
        </div>
      </header>

      {/* 2. MINIMALIST CENTRAL HERO AREA */}
      <main className="w-full max-w-4xl mx-auto px-8 text-center py-20 relative z-10 my-auto">
        {/* Context Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/40 border border-blue-800/30 rounded-full text-xs font-bold tracking-[0.25em] text-blue-400 uppercase mb-6">
          <Terminal size={12} /> Private Agent Marketplace
        </div>
        
        {/* Value Prop Main Title */}
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
          The Hub for Company <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-sky-400">AI Agents</span>
        </h1>
        
        {/* Lightweight Pitch Paragraph */}
        <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
          Upload, Download and Search AI Agents built inside the organisation. No more repeated efforts, just a shared pool of AI workflows.
        </p>

        {/* Action Button Set */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link 
            href="/feed" 
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-blue-900/20 transition-all active:scale-[0.98]"
          >
            Launch Workspace <ArrowRight size={18} />
          </Link>
          
          <button className="w-full sm:w-auto bg-slate-900/50 hover:bg-slate-800 text-slate-300 font-bold px-8 py-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
            Admin Management
          </button>
        </div>
      </main>

      {/* 3. TECHNICAL METADATA FOOTER */}
      <footer className="w-full max-w-7xl mx-auto px-8 py-8 relative z-10">
        <div className="border-t border-slate-900/80 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-8 text-xs text-slate-500 font-mono">
            <div>
              <p className="font-bold text-slate-600 tracking-wider uppercase mb-1">Team</p>
              <div className="flex gap-4">
                <p className="text-slate-400">Mehmet Adil Öztürk,</p>
                <p className="text-slate-400">Jeet Upadhyay,</p>
                <p className="text-slate-400">Harshil Sojitra</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500">
            <Shield size={14} className="text-blue-500" /> TechON Hackathon 2026 Submission
          </div>
        </div>
      </footer>

    </div>
  );
}