import Link from 'next/link';
import { Search, Sparkles } from 'lucide-react';
import { searchAssets } from '@/lib/search';
import { requireProfile } from '@/lib/auth';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireProfile();
  const { q } = await searchParams;
  const query = (q ?? '').trim();
  const results = query ? await searchAssets(query, 24) : [];

  return (
    <div className="flex flex-col min-h-screen bg-[#0b1120]">
      <section className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl">
          <h3 className="flex items-center gap-2 text-xs font-bold mb-2 uppercase tracking-[0.2em] text-slate-500">
            <Sparkles size={14} className="text-blue-400" /> Semantic results
          </h3>
          <h2 className="text-2xl font-bold mb-1 text-white">
            {query ? <>Results for &ldquo;{query}&rdquo;</> : 'Search'}
          </h2>
          <p className="text-slate-500 mb-8 text-sm">
            Ranked by meaning, not keywords — searched by intent &amp; problem similarity.
          </p>

          {query && results.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-500">
              <Search size={20} className="mx-auto mb-2" />
              No similar agents found. Try describing the task differently.
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results.map((r) => (
              <Link
                key={r.id}
                href={`/agent/${r.id}`}
                className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 transition-all hover:border-blue-500/50 group flex flex-col"
              >
                <div className="flex justify-between items-start mb-3 gap-2">
                  <h4 className="font-bold leading-tight text-white group-hover:text-blue-400 transition-colors">{r.title}</h4>
                  <span className="shrink-0 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                    {Math.round(r.similarity * 100)}% match
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2 italic">
                  "{r.description || r.metadata?.purpose || r.type}"
                </p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {(r.tags ?? []).slice(0, 3).map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-slate-800 text-[10px] font-bold rounded text-slate-300 border border-slate-700 uppercase">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
