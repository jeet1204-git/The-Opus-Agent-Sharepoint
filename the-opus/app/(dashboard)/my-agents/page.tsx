import { Trophy, TrendingUp, Heart, Download, Cpu, Sparkles, Plus } from 'lucide-react';
import Link from 'next/link';

// 1. Personalized Data Object for Sarah's Agents
const MY_AGENTS = [
  {
    id: '1',
    name: 'Legal Brief Summarizer',
    author: 'Sarah Chen',
    tags: ['LEGAL', 'LLM'],
    description: 'Condense complex legal filings into actionable bullet points.',
    likes: 1240,
    downloads: 5200,
    model: 'GPT-4o',
    featured: true,
  },
  {
    id: '4',
    name: 'Data Pipeline Monitor',
    author: 'Sarah Chen',
    tags: ['DEVOP', 'AUTOMATION'],
    description: 'Watches internal database streams and alerts via webhook on structure drift.',
    likes: 412,
    downloads: 1850,
    model: 'Claude 3.5 Sonnet',
    featured: false,
  },
  {
    id: '5',
    name: 'Acme Brand Voice Validator',
    author: 'Sarah Chen',
    tags: ['MARKETING', 'COMPLIANCE'],
    description: 'Scans public copy decks to ensure copy aligns with company compliance standards.',
    likes: 95,
    downloads: 620,
    model: 'Llama 3',
    featured: false,
  }
];

export default function MyAgentsPage() {
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
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-900/20">
                <Plus size={16} /> Create New Agent
              </button>
            </div>
            
            {/* MAIN PERSONAL GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {MY_AGENTS.map((agent) => (
                <AgentCard key={agent.id} {...agent} />
              ))}
            </div>
          </div>
        </section>

        {/* SIDEBAR (Personal Analytics & Metrics) */}
        <aside className="w-full xl:w-80 border-t xl:border-t-0 xl:border-l border-slate-800 p-6 bg-[#0f172a]">
          <AnalyticsSection />
        </aside>
      </div>
    </div>
  );
};

const TrendingCard = ({ agent, rank }: any) => (
  <div className="relative group p-4 rounded-xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden">
    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-slate-400">
      <TrendingUp size={40} />
    </div>
    <div className="relative z-10 flex items-center gap-3">
      <span className="text-2xl font-black text-slate-700 group-hover:text-blue-500/50 transition-colors">
        0{rank}
      </span>
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-slate-200 truncate group-hover:text-white">
          {agent.name}
        </h4>
        <p className="text-[10px] text-slate-500 uppercase tracking-tight">
          {agent.model}
        </p>
      </div>
    </div>
  </div>
);

const AgentCard = ({ id, name, author, tags, description, likes, downloads, model, featured }: any) => (
  <div className={`p-6 rounded-xl border transition-all hover:border-slate-600 group flex flex-col ${
    featured 
      ? 'bg-blue-900/10 border-blue-500/50 ring-1 ring-blue-500/50' 
      : 'bg-slate-900/50 border-slate-800'
  }`}>
    <div className="flex justify-between items-start mb-4 gap-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 shrink-0 bg-slate-700 rounded-full border border-slate-600" />
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
      <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded transition-all active:scale-95 shadow-lg shadow-blue-900/20">
        EDIT AGENT
      </button>
    </div>
  </div>
);

const AnalyticsSection = () => (
  <div>
    <h3 className="flex items-center gap-2 text-xs font-bold mb-6 uppercase tracking-[0.2em] text-slate-500">
      <Trophy size={14} className="text-yellow-500" /> Workspace Impact
    </h3>
    <div className="space-y-5">
      <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Downloads Given</p>
        <p className="text-2xl font-mono font-bold text-white">7,670</p>
      </div>
      <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Integrations</p>
        <p className="text-2xl font-mono font-bold text-white">3 Running</p>
      </div>
      <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Compute Used (Mo.)</p>
        <p className="text-2xl font-mono font-bold text-emerald-400">84.2%</p>
      </div>
    </div>
  </div>
);