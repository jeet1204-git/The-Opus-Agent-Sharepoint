import { Trophy, Heart, Download, Cpu, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireProfile } from '@/lib/auth';

export default async function MyAgentsPageClient({ avatarUrl }: { avatarUrl: string | null }) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from('assets')
    .select('id, title, description, tags, metadata, type, profiles!owner_id(full_name), likes(count), usages(count)')
    .eq('owner_id', profile.id)
    .order('created_at', { ascending: false });

  type Row = {
    id: string; title: string; description: string | null; tags: string[] | null;
    metadata: { purpose?: string; framework?: string } | null; type: string;
    profiles: { full_name: string | null } | null;
    likes: { count: number }[]; usages: { count: number }[];
  };

  const agents = ((rows ?? []) as unknown as Row[]).map((a) => ({
    id: a.id,
    name: a.title,
    author: a.profiles?.full_name ?? 'You',
    tags: (a.tags ?? []).map((t) => t.toUpperCase()).slice(0, 3),
    description: a.description || a.metadata?.purpose || '',
    likes: a.likes?.[0]?.count ?? 0,
    downloads: a.usages?.[0]?.count ?? 0,
    model: a.metadata?.framework || a.type,
    featured: false,
  }));

  const totalEndorsements = agents.reduce((s, a) => s + a.likes, 0);
  const totalRuns = agents.reduce((s, a) => s + a.downloads, 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#0b1120]">
      <div className="flex flex-col xl:flex-row flex-1 overflow-hidden">

        {/* MAIN CONTENT AREA */}
        <section className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto xl:mx-0">

            {/* HEADER WITH CREATION CTA */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-1 text-white">Your Workspace</h2>
                <p className="text-slate-500 text-sm uppercase tracking-widest">Manage your built agents</p>
              </div>
              <Link href="/upload" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                <Plus size={16} /> Create New Agent
              </Link>
            </div>

            {/* MAIN PERSONAL GRID */}
            {agents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-500">
                You haven&apos;t published any agents yet. <Link href="/upload" className="text-blue-400">Publish one →</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {agents.map((agent) => (
                  <AgentCard key={agent.id} {...agent} avatarUrl={avatarUrl} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SIDEBAR (Personal Analytics & Metrics) */}
        <aside className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-slate-800 p-6 bg-[#0f172a]">
          <AnalyticsSection agents={agents.length} endorsements={totalEndorsements} runs={totalRuns} />
        </aside>
      </div>
    </div>
  );
}

const AgentCard = ({ id, name, author, tags, description, likes, downloads, model, featured, avatarUrl }: any) => (
  <div className={`p-6 rounded-xl border transition-all hover:border-slate-600 group flex flex-col ${
    featured
      ? 'bg-blue-900/10 border-blue-500/50 ring-1 ring-blue-500/50'
      : 'bg-slate-900/50 border-slate-800'
  }`}>
    <div className="flex justify-between items-start mb-4 gap-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 shrink-0 bg-slate-700 rounded-full border border-slate-600">
          {avatarUrl ? (
            <img src={avatarUrl} alt={author} className="w-full h-full object-cover rounded-full" />
          ) : (
            <User size={16} className="text-slate-400" />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold leading-tight group-hover:text-blue-400 transition-colors truncate text-white"><Link href={`/agent/${id}`}>{name}</Link></h4>
          <p className="text-xs text-slate-400 truncate">by {author}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-blue-400 whitespace-nowrap">
        <Cpu size={12} />
        {model}
      </div>
    </div>

    <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed italic">
      "{description}"
    </p>

    <div className="flex flex-wrap gap-2 mb-6">
      {tags.map((t: string) => (
        <span key={t} className="px-2 py-0.5 bg-slate-800 text-[10px] font-bold rounded text-slate-300 border border-slate-700">
          {t}
        </span>
      ))}
    </div>

    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
      <div className="flex gap-4 text-slate-500">
        <div className="flex items-center gap-1 text-xs">
          <Heart size={14} className="group-hover:text-pink-500 transition-colors" />
          {likes.toLocaleString()}
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Download size={14} className="group-hover:text-blue-400 transition-colors" />
          {downloads.toLocaleString()}
        </div>
      </div>
      <Link href={`/agent/${id}`} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded transition-all active:scale-95 shadow-lg shadow-blue-900/20">
        VIEW
      </Link>
    </div>
  </div>
);

const AnalyticsSection = ({ agents, endorsements, runs }: { agents: number; endorsements: number; runs: number }) => (
  <div>
    <h3 className="flex items-center gap-2 text-xs font-bold mb-6 uppercase tracking-[0.2em] text-slate-500">
      <Trophy size={14} className="text-yellow-500" /> Workspace Impact
    </h3>
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Agents Published</p>
        <p className="text-2xl font-mono font-bold text-white">{agents}</p>
      </div>
      <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Endorsements</p>
        <p className="text-2xl font-mono font-bold text-white">{endorsements.toLocaleString()}</p>
      </div>
      <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Runs</p>
        <p className="text-2xl font-mono font-bold text-emerald-400">{runs.toLocaleString()}</p>
      </div>
    </div>
  </div>
);
