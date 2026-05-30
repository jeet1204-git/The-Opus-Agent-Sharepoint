import { Trophy, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';

export default function MyAgentsPage() {
  return (
    <>
      <Header />


      <div className="flex flex-1 overflow-hidden">
        {/* FEED GRID */}
        <section className="flex-1 overflow-y-auto p-8 bg-[#0b1120]">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold mb-1">Welcome, Sarah!</h2>
            <p className="text-slate-500 mb-8 text-sm uppercase tracking-widest">Agents within Acme Corp</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AgentCard featured name="Legal Brief Summarizer" author="Sarah Chen" tags={['LEGAL', 'LLM']} />
              <AgentCard name="Marketing Copy Generator" author="David Lee" tags={['MARKETING', 'SEO']} />
            </div>
          </div>
        </section>

        {/* RIGHT STATS BAR */}
        <aside className="w-80 border-l border-slate-800 p-6 space-y-8 bg-[#0f172a]">
          <TrendingSection />
          <LeaderboardSection />
        </aside>
      </div>
    </>
  );
};

// Internal Sub-components
const AgentCard = ({ name, author, tags, featured = false }: any) => (
  <div className={`p-6 rounded-xl border transition-all ${featured ? 'bg-blue-900/10 border-blue-500/50 ring-1 ring-blue-500/50' : 'bg-slate-900/50 border-slate-800'}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-slate-700 rounded-full border border-slate-600" />
      <div>
        <h4 className="font-bold leading-tight">{name}</h4>
        <p className="text-xs text-slate-400">{author}</p>
      </div>
    </div>
    <div className="flex gap-2 mb-6">
      {tags.map((t: string) => (
        <span key={t} className="px-2 py-0.5 bg-slate-800 text-[10px] font-bold rounded text-slate-400 border border-slate-700">{t}</span>
      ))}
    </div>
    <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded mb-2">RUN NOW</button>
  </div>
);

const TrendingSection = () => (
  <div>
    <h3 className="flex items-center gap-2 text-sm font-bold mb-4 uppercase text-slate-400">
      <TrendingUp size={16} /> Trending
    </h3>
    <ul className="space-y-3 text-sm text-slate-400">
      <li>1. Legal Brief Summarizer</li>
      <li>2. Marketing Copy Generator</li>
    </ul>
  </div>
);

const LeaderboardSection = () => (
  <div>
    <h3 className="flex items-center gap-2 text-sm font-bold mb-4 uppercase text-slate-400">
      <Trophy size={16} className="text-yellow-500" /> Leaderboard
    </h3>
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-700 rounded-full" />
          <p className="text-sm font-medium text-slate-300">Contributor_{i}</p>
        </div>
      ))}
    </div>
  </div>
);
