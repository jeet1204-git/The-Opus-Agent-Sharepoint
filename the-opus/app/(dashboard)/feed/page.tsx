import Link from 'next/link';
import Image from 'next/image';
import { Trophy, Sparkles, TrendingUp, Heart, Download, Cpu, User, Lock, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { requireProfile } from '@/lib/auth';
import { canUsePayload } from '@/lib/access';

const buildAvatarUrl = (path: string) =>
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const profile = await requireProfile();
  const { scope } = await searchParams;
  const openOnly = scope === 'open';
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from('assets')
    .select('id, title, description, tags, metadata, type, department, restricted, created_at, profiles!owner_id(full_name, avatar_url), likes(count), usages(count)')
    .order('created_at', { ascending: false });

  type Row = {
    id: string; title: string; description: string | null; tags: string[] | null;
    metadata: { purpose?: string; framework?: string } | null; type: string;
    department: string | null; restricted: boolean | null;
    profiles: { full_name: string | null; avatar_url: string | null } | null;
    likes: { count: number }[]; usages: { count: number }[];
  };

  const agents = ((rows ?? []) as unknown as Row[]).map((a) => ({
    id: a.id,
    name: a.title,
    author: a.profiles?.full_name ?? 'Unknown',
    avatarUrl: a.profiles?.avatar_url ? buildAvatarUrl(a.profiles.avatar_url) : null,
    tags: (a.tags ?? []).map((t) => t.toUpperCase()).slice(0, 3),
    description: a.description || a.metadata?.purpose || '',
    likes: a.likes?.[0]?.count ?? 0,
    downloads: a.usages?.[0]?.count ?? 0,
    model: a.metadata?.framework || a.type,
    department: a.department,
    restricted: !!a.restricted,
    locked: !canUsePayload({ restricted: a.restricted, department: a.department }, profile),
    featured: false,
  }));

  const byLikes = [...agents].sort((x, y) => y.likes - x.likes);
  if (byLikes[0]) byLikes[0].featured = true;
  const trending = byLikes.slice(0, 3);

  const counts = new Map<string, number>();
  agents.forEach((a) => counts.set(a.author, (counts.get(a.author) ?? 0) + 1));
  const leaders = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);

  const visible = openOnly ? agents.filter((a) => !a.restricted) : agents;
  const firstName = (profile.full_name ?? 'there').split(' ')[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#0b1120]">
      <div className="flex flex-col xl:flex-row flex-1 overflow-hidden">
        <section className="flex-1 overflow-y-auto p-4 md:p-8">
          <div>
            <div className="mb-10">
              <h3 className="flex items-center gap-2 text-xs font-bold mb-4 uppercase tracking-[0.2em] text-slate-500">
                <Sparkles size={14} className="text-blue-400" /> Trending Now
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trending.map((agent, i) => (
                  <TrendingCard key={agent.id} agent={agent} rank={i + 1} />
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-1 text-white">Welcome, {firstName}!</h2>
            <p className="text-slate-500 mb-6 text-sm uppercase tracking-widest">Explore all Agents</p>

            {/* Scope filter */}
            <div className="mb-8 inline-flex rounded-lg border border-slate-800 bg-slate-900/40 p-1 text-xs font-bold">
              <Link
                href="/feed"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${!openOnly ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                All agents
              </Link>
              <Link
                href="/feed?scope=open"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${openOnly ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Globe size={12} /> Available to everyone
              </Link>
            </div>

            {visible.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-500">
                {openOnly
                  ? 'No org-wide agents yet — switch to “All agents”.'
                  : <>No agents yet. <Link href="/upload" className="text-blue-400">Publish the first one →</Link></>}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {visible.map((agent) => (
                  <AgentCard key={agent.id} {...agent} />
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-slate-800 p-6 bg-[#0f172a]">
          <LeaderboardSection leaders={leaders} />
        </aside>
      </div>
    </div>
  );
}

const TrendingCard = ({ agent, rank }: any) => (
  <Link href={`/agent/${agent.id}`} className="relative group p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden block">
    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
      <TrendingUp size={40} />
    </div>
    <div className="relative z-10 flex items-center gap-3">
      <span className="text-2xl font-black text-slate-700 group-hover:text-blue-500/50 transition-colors">
        0{rank}
      </span>
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-white">{agent.name}</h4>
        <p className="text-[10px] text-slate-500 uppercase tracking-tight">{agent.model}</p>
      </div>
    </div>
  </Link>
);

const AgentCard = ({ id, name, author, avatarUrl, tags, description, likes, downloads, model, featured, restricted, department, locked }: any) => (
  <Link href={`/agent/${id}`} className={`p-6 rounded-xl border transition-all hover:border-slate-600 group flex flex-col ${
    featured
      ? 'bg-blue-900/10 border-blue-500/50 ring-1 ring-blue-500/50'
      : 'bg-slate-900/50 border-slate-800'
  }`}>
    <div className="flex justify-between items-start mb-4 gap-2">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 shrink-0 rounded-full border border-slate-600 overflow-hidden bg-slate-700">
          {avatarUrl
            ? <Image src={avatarUrl} alt={author} fill className="object-cover" />
            : <div className="w-full h-full flex items-center justify-center">
                <User size={16} className="text-slate-400" />
              </div>
          }
        </div>
        <div className="min-w-0">
          <h4 className="font-bold leading-tight group-hover:text-blue-400 transition-colors truncate text-white">{name}</h4>
          <p className="text-xs text-slate-400 truncate">by {author}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {restricted && department && (
          <span className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap border ${locked ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'}`}>
            <Lock size={11} /> {department}
          </span>
        )}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-blue-400 whitespace-nowrap">
          <Cpu size={12} />
          {model}
        </div>
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
      <span className="bg-blue-600 group-hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded transition-all shadow-lg shadow-blue-900/20">
        VIEW
      </span>
    </div>
  </Link>
);

const LeaderboardSection = ({ leaders }: { leaders: [string, number][] }) => (
  <div>
    <h3 className="flex items-center gap-2 text-xs font-bold mb-6 uppercase tracking-[0.2em] text-slate-500">
      <Trophy size={14} className="text-yellow-500" /> Top Contributors
    </h3>
    <div className="space-y-5">
      {leaders.map(([name, n], i) => (
        <div key={name} className="flex items-center justify-between group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 bg-slate-800 rounded-full border border-slate-700 group-hover:border-slate-500 transition-colors" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-400">
                {i + 1}
              </div>
            </div>
            <p className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{name}</p>
          </div>
          <div className="text-[10px] font-mono text-slate-600">
            {n} agent{n === 1 ? '' : 's'}
          </div>
        </div>
      ))}
    </div>
  </div>
);