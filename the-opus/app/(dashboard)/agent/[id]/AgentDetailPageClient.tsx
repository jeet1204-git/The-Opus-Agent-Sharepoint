import React from 'react';
import {
  Star, Zap, Copy, Code2, MessageSquare, ChevronRight, Info, Heart, AlertTriangle, GitBranch,
  User, Lock
} from 'lucide-react';
import { RunAgent } from '@/components/RunAgent';
import { LikeButton } from '@/components/LikeButton';
import { ReviewForm } from '@/components/ReviewForm';
import Image from 'next/image';

export default function AgentDetailPageClient({ agent, liked, locked = false, restrictedDept = null }: any) {
  const meta = agent.metadata ?? {};
  const author = agent.profiles?.full_name ?? 'Unknown';
  const reviews = agent.reviews ?? [];
  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? (reviews.reduce((s: number, r: any) => s + (r.rating ?? 0), 0) / reviewCount).toFixed(1)
    : '—';
  const executions = agent.usages?.[0]?.count ?? 0;
  const likeCount = agent.likes?.[0]?.count ?? 0;
  const versions = agent.versions ?? [];
  const tools: string[] = meta.tools ?? [];

  return (
    <div className="flex h-full overflow-hidden">
      {/* LEFT CONTENT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 uppercase tracking-wider">
          <span>Agents</span> <ChevronRight size={12} />
          <span className="text-[#7c5cff] font-semibold">{agent.title}</span>
        </nav>

        {/* HERO SECTION */}
        <div className="flex justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#15161a] mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{agent.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 border border-slate-200 uppercase">{agent.type}</span>
              <span className="text-slate-500">Author: <span className="text-[#15161a]">{author}</span></span>
              {agent.restricted && agent.department && (
                <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${locked ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  <Lock size={10} /> {agent.department} only
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <LikeButton assetId={agent.id} initialLiked={liked} initialCount={likeCount} locked={locked} />
            <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded text-xs font-mono text-[#7c5cff]">
              {meta.framework || 'raw'}
            </div>
          </div>
        </div>

        {/* TOP STATS BAR */}
        <div className="flex gap-8 border-b border-slate-200 pb-8 mb-8">
          <StatHighlight icon={<Star className="text-yellow-500" size={18} />} label={`${avgRating}/5`} sub={`${reviewCount} Reviews`} />
          <StatHighlight icon={<Heart className="text-pink-500" size={18} />} label={String(likeCount)} sub="Endorsements" />
          <StatHighlight icon={<Zap className="text-[#7c5cff]" size={18} />} label={String(executions)} sub="Runs" />
        </div>

        {/* DESCRIPTION BLOCK */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Purpose & Use Cases</h3>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 border border-slate-200">contract</span>
          </div>
          <p className="text-slate-700 leading-relaxed text-sm">{meta.purpose || agent.description || 'No description provided.'}</p>
          {meta.requirements && (
            <p className="text-xs text-slate-500 mt-4"><span className="text-slate-500 font-bold uppercase">Requirements: </span>{meta.requirements}</p>
          )}
          {meta.when_not_to_use && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span><span className="font-bold uppercase">When NOT to use: </span>{meta.when_not_to_use}</span>
            </div>
          )}
        </div>

        {/* PROMPT + RUN GRID (or locked state for restricted agents) */}
        {locked ? (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
            <Lock size={28} className="mx-auto mb-3 text-amber-500" />
            <h3 className="text-lg font-bold text-[#15161a] mb-1">Payload restricted to {restrictedDept}</h3>
            <p className="mx-auto max-w-md text-sm text-slate-500">
              This agent is published for the <span className="text-amber-700 font-semibold">{restrictedDept}</span> department.
              You can see what it does and its trust signals, but the system prompt / file and the
              ability to run it are limited to {restrictedDept} (and admins).
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">System Prompt / Config</h3>
                <Copy size={14} className="text-slate-500" />
              </div>
              <pre className="font-mono text-xs text-[#5b4bd6] bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-64 overflow-auto whitespace-pre-wrap">
                {agent.content || '(no content)'}
              </pre>
            </div>

            {/* REAL one-click Run */}
            <RunAgent assetId={agent.id} />
          </div>
        )}

        {/* COMMUNITY SECTION */}
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <MessageSquare size={16} /> Reviews & Endorsements ({reviewCount})
          </h3>
          <div className="mb-6">
            <ReviewForm assetId={agent.id} locked={locked} department={restrictedDept} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.length === 0 && (
              <p className="text-sm text-slate-500">No reviews yet — be the first to endorse this agent.</p>
            )}
            {reviews.map((r: any) => (
              <ReviewCard
                key={r.id}
                name={r.profiles?.full_name ?? 'Someone'}
                date={new Date(r.created_at).toLocaleDateString()}
                rating={r.rating}
                content={r.comment ?? ''}
                avatarUrl={r.profiles?.avatar_url
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${r.profiles.avatar_url}`
                  : null
                }
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR (Configuration & Versions) */}
      <aside className="w-80 border-l border-slate-200 p-8 space-y-8 bg-white/60 overflow-y-auto">
        {/* CONFIG SECTION */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Info size={14} /> Configuration
          </h3>
          <div className="space-y-4">
            <ConfigRow label="Type" value={agent.type} />
            <ConfigRow label="Framework" value={meta.framework || 'raw'} />
            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Tools</p>
              <div className="flex flex-wrap gap-2">
                {tools.length === 0 && <span className="text-[10px] text-slate-500">none declared</span>}
                {tools.map((t) => (
                  <span key={t} className="text-[10px] bg-[#7c5cff]/10 text-[#7c5cff] px-2 py-1 rounded">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* VERSIONS */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <GitBranch size={14} /> Versions
          </h3>
          <div className="space-y-3">
            {versions.length === 0 && <p className="text-[10px] text-slate-500">No versions.</p>}
            {versions.map((v: any) => (
              <div key={v.id} className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                <span className="text-[#15161a] font-mono">{v.version_label}</span>
                <span className="text-[10px] text-slate-500">{new Date(v.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* IMPLEMENTATION GUIDE */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Code2 size={14} /> Implementation
          </h3>
          <div className="space-y-6">
            <Step title="Copy the prompt/config" code="(from System Prompt panel)" />
            <Step title="Or run it here" code="use the Run panel →" />
          </div>
        </div>
      </aside>
    </div>
  );
}

// --- Sub-components ---

const StatHighlight = ({ icon, label, sub }: any) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-lg font-bold text-[#15161a] leading-none">{label}</span>
    </div>
    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">{sub}</span>
  </div>
);

const ConfigRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
    <span className="text-slate-500">{label}:</span>
    <span className="text-[#15161a] font-mono">{value}</span>
  </div>
);

const Step = ({ title, code }: { title: string; code: string }) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold text-slate-700">{title}</p>
    <div className="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-[11px] text-[#7c5cff] flex justify-between group">
      <code>{code}</code>
      <Copy size={12} className="opacity-0 group-hover:opacity-100 cursor-pointer" />
    </div>
  </div>
);

const ReviewCard = ({ name, date, content, rating, avatarUrl }: any) => (
  <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-xl">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 shrink-0 rounded-full border border-slate-200 overflow-hidden bg-slate-100">
          {avatarUrl
            ? <Image src={avatarUrl} alt={name} fill className="object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
              <User size={14} className="text-slate-500" />
            </div>
          }
        </div>
        <div>
          <p className="text-sm font-bold text-[#15161a] leading-none">{name}</p>
          <p className="text-[10px] text-slate-500 mt-1">{date}</p>
        </div>
      </div>
      <div className="flex text-yellow-500">
        {Array.from({ length: rating ?? 0 }).map((_, i) => (
          <Star key={i} size={10} fill="currentColor" />
        ))}
      </div>
    </div>
    <p className="text-xs text-slate-500 leading-relaxed italic">"{content}"</p>
  </div>
);
