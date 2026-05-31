import { Sparkles, Search } from 'lucide-react';
import SearchExperience from '@/components/SearchExperience';
import { requireProfile } from '@/lib/auth';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireProfile();
  const { q } = await searchParams;
  const query = (q ?? '').trim();

  return (
    <div className="flex flex-col min-h-screen bg-[#0b1120]">
      <section className="flex-1 overflow-y-auto p-4 md:p-8">
        {query ? (
          <SearchExperience query={query} />
        ) : (
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold mb-2 uppercase tracking-[0.2em] text-slate-500">
              <Sparkles size={14} className="text-blue-400" /> AI Search
            </h3>
            <h2 className="text-2xl font-bold mb-1 text-white">Search</h2>
            <p className="text-slate-500 mb-8 text-sm">
              Describe the task you need an agent for — the assistant finds what to reuse.
            </p>
            <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-500">
              <Search size={20} className="mx-auto mb-2" />
              Try “summarize a contract”, “triage support tickets”, or “extract data from invoices”.
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
