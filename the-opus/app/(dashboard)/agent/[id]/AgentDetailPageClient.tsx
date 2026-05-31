import React from 'react';
import {
  Star, Zap, Copy, Code2, MessageSquare, ChevronRight, Info, Heart, AlertTriangle, GitBranch,
  User
} from 'lucide-react';
import { RunAgent } from '@/components/RunAgent';
import { LikeButton } from '@/components/LikeButton';
import { ReviewForm } from '@/components/ReviewForm';
import Image from 'next/image';

export default function AgentDetailPageClient({ agent, liked }: any) {
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
    <div className="flex h-full overflow-hidden bg-[#0b1120]">
      {/* LEFT CONTENT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 uppercase tracking-wider">
          <span>Agents</span> <ChevronRight size={12} />
          <span className="text-blue-400 font-semibold">{agent.title}</span>
        </nav>

        {/* HERO SECTION */}
        <div className="flex justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{agent.title}</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700 uppercase">{agent.type}</span>
              <span className="text-slate-400">Author: <span className="text-slate-200">{author}</span></span>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <LikeButton assetId={agent.id} initialLiked={liked} initialCount={likeCount} />
            <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded text-xs font-mono text-blue-400">
              {meta.framework || 'raw'}
            </div>
          </div>
        </div>

        {/* TOP STATS BAR */}
        <div className="flex gap-8 border-b border-slate-800 pb-8 mb-8">
          <StatHighlight icon={<Star className="text-yellow-500" size={18} />} label={`${avgRating}/5`} sub={`${reviewCount} Reviews`} />
          <StatHighlight icon={<Heart className="text-pink-400" size={18} />} label={String(likeCount)} sub="Endorsements" />
          <StatHighlight icon={<Zap className="text-purple-400" size={18} />} label={String(executions)} sub="Runs" />
        </div>

        {/* DESCRIPTION BLOCK */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Purpose & Use Cases</h3>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500 border border-slate-700">contract</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-sm">{meta.purpose || agent.description || 'No description provided.'}</p>
          {meta.requirements && (
            <p className="text-xs text-slate-400 mt-4"><span className="text-slate-500 font-bold uppercase">Requirements: </span>{meta.requirements}</p>
          )}
          {meta.when_not_to_use && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span><span className="font-bold uppercase">When NOT to use: </span>{meta.when_not_to_use}</span>
            </div>
          )}
        </div>

        {/* PROMPT + RUN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">System Prompt / Config</h3>
              <Copy size={14} className="text-slate-600" />
            </div>
            <pre className="font-mono text-xs text-blue-300/80 bg-black/30 p-4 rounded-lg border border-slate-800 max-h-64 overflow-auto whitespace-pre-wrap">
              {agent.content || '(no content)'}
            </pre>
          </div>

          {/* REAL one-click Run */}
          <RunAgent assetId={agent.id} />
        </div>

        {/* COMMUNITY SECTION */}
        <div className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <MessageSquare size={16} /> Reviews & Endorsements ({reviewCount})
          </h3>
          <div className="mb-6">
            <ReviewForm assetId={agent.id} />
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
      <aside className="w-80 border-l border-slate-800 p-8 space-y-8 bg-[#0f172a]/50 overflow-y-auto">
        {/* CONFIG SECTION */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Info size={14} /> Configuration
          </h3>
          <div className="space-y-4">
            <ConfigRow label="Type" value={agent.type} />
            <ConfigRow label="Framework" value={meta.framework || 'raw'} />
            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Tools</p>
              <div className="flex flex-wrap gap-2">
                {tools.length === 0 && <span className="text-[10px] text-slate-600">none declared</span>}
                {tools.map((t) => (
                  <span key={t} className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-1 rounded">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* VERSIONS */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <GitBranch size={14} /> Versions
          </h3>
          <div className="space-y-3">
            {versions.length === 0 && <p className="text-[10px] text-slate-600">No versions.</p>}
            {versions.map((v: any) => (
              <div key={v.id} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                <span className="text-slate-200 font-mono">{v.version_label}</span>
                <span className="text-[10px] text-slate-500">{new Date(v.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* IMPLEMENTATION GUIDE */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
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
      <span className="text-lg font-bold text-white leading-none">{label}</span>
    </div>
    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">{sub}</span>
  </div>
);

const ConfigRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
    <span className="text-slate-500">{label}:</span>
    <span className="text-slate-200 font-mono">{value}</span>
  </div>
);

const Step = ({ title, code }: { title: string; code: string }) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold text-slate-300">{title}</p>
    <div className="bg-black/50 border border-slate-700 rounded p-3 font-mono text-[11px] text-blue-400 flex justify-between group">
      <code>{code}</code>
      <Copy size={12} className="opacity-0 group-hover:opacity-100 cursor-pointer" />
    </div>
  </div>
);

const ReviewCard = ({ name, date, content, rating, avatarUrl }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 shrink-0 rounded-full border border-slate-600 overflow-hidden bg-slate-700">
          {avatarUrl
            ? <Image src={avatarUrl} alt={name} fill className="object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
              <User size={14} className="text-slate-400" />
            </div>
          }
        </div>
        <div>
          <p className="text-sm font-bold text-slate-200 leading-none">{name}</p>
          <p className="text-[10px] text-slate-500 mt-1">{date}</p>
        </div>
      </div>
      <div className="flex text-yellow-500">
        {Array.from({ length: rating ?? 0 }).map((_, i) => (
          <Star key={i} size={10} fill="currentColor" />
        ))}
      </div>
    </div>
    <p className="text-xs text-slate-400 leading-relaxed italic">"{content}"</p>
  </div>
);