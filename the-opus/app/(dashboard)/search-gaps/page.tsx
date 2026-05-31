import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Search, TrendingDown } from "lucide-react";
import Link from "next/link";

type SearchGap = {
  id: string;
  query: string;
  verdict: string;
  top_similarity: number | null;
  user_id: string | null;
  created_at: string;
};

type MetricCardProps = {
  label: string;
  value: number | string;
  sub?: string;
};

function MetricCard({ label, value, sub }: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest font-bold">{label}</p>
      <p className="text-3xl font-bold text-[#15161a]">{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
    </div>
  );
}

function verdictBadge(verdict: string) {
  if (verdict === "none")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
        none
      </span>
    );
  if (verdict === "closest")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400">
        closest
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
      {verdict}
    </span>
  );
}

function SimBar({ value }: { value: number | null }) {
  if (value === null)
    return <span className="text-xs text-slate-600">no result</span>;
  const pct = Math.round(value * 100);
  const color =
    value < 0.1
      ? "bg-red-500"
      : value < 0.18
        ? "bg-amber-500"
        : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(pct * 5, 100)}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{value.toFixed(2)}</span>
    </div>
  );
}

export default async function SearchGapsPage({
  searchParams,
}: {
  searchParams: Promise<{ verdict?: string; page?: string }>;
}) {
  await requireAdmin();
  const supabase = await createClient();

  const { verdict, page } = await searchParams;
  const currentPage = Math.max(0, parseInt(page ?? "0"));
  const PAGE_SIZE = 20;

  // Build query
  let query = supabase
    .from("search_gaps")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

  if (verdict) query = query.eq("verdict", verdict);

  const { data: gaps, count } = await query.returns<SearchGap[]>();

  // Metrics
  const [{ count: total }, { count: thisWeek }, { count: noMatch }] = await Promise.all([
    supabase.from("search_gaps").select("*", { count: "exact", head: true }),
    supabase
      .from("search_gaps")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
    supabase
      .from("search_gaps")
      .select("*", { count: "exact", head: true })
      .eq("verdict", "none"),
  ]);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbfa]">
      <section className="flex-1 overflow-y-auto p-4 md:p-8 max-w-6xl mx-auto w-full">

        {/* Header */}
        <div className="mb-6">
          <h2 className="flex items-center gap-2.5 text-2xl font-bold text-[#15161a] mb-1">
            <TrendingDown size={22} className="text-slate-500" />
            Search gaps
          </h2>
          <p className="text-sm text-slate-500">
            Queries where users found no strong match — candidates for new agents.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total gaps" value={total ?? 0} sub="all time" />
          <MetricCard label="This week" value={thisWeek ?? 0} />
          <MetricCard label="No match" value={noMatch ?? 0} sub={'verdict = "none"'} />
          <MetricCard label="Pages" value={totalPages} sub={`${PAGE_SIZE} per page`} />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Filter:</span>
          {["", "none", "closest"].map((v) => (
            <Link
              key={v}
              href={v ? `?verdict=${v}` : "?"}
              className={`rounded-full px-3 py-1 text-xs font-bold border transition-colors ${
                (verdict ?? "") === v
                  ? "bg-[#7c5cff] border-[#7c5cff] text-white"
                  : "border-slate-200 text-slate-500 hover:border-slate-500"
              }`}
            >
              {v === "" ? "All" : v}
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 w-[35%]">
                  Query
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 w-[12%]">
                  Verdict
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 w-[20%]">
                  Top similarity
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 w-[13%]">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-500 w-[20%]">
                  User
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(gaps ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-600">
                    <Search size={20} className="mx-auto mb-2" />
                    No gaps recorded yet.
                  </td>
                </tr>
              )}
              {(gaps ?? []).map((gap) => (
                <tr key={gap.id} className="hover:bg-white/60 transition-colors">
                  <td className="px-4 py-3 text-[#15161a] font-medium truncate max-w-0">
                    <span title={gap.query}>{gap.query}</span>
                  </td>
                  <td className="px-4 py-3">{verdictBadge(gap.verdict)}</td>
                  <td className="px-4 py-3">
                    <SimBar value={gap.top_similarity} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(gap.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs font-mono truncate">
                    {gap.user_id ?? "anon"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              {currentPage > 0 && (
                <Link
                  href={`?${verdict ? `verdict=${verdict}&` : ""}page=${currentPage - 1}`}
                  className="rounded-md border border-slate-200 px-4 py-1.5 text-sm text-slate-700 hover:border-slate-500 transition-colors"
                >
                  Previous
                </Link>
              )}
              {currentPage < totalPages - 1 && (
                <Link
                  href={`?${verdict ? `verdict=${verdict}&` : ""}page=${currentPage + 1}`}
                  className="rounded-md border border-slate-200 px-4 py-1.5 text-sm text-slate-700 hover:border-slate-500 transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}

      </section>
    </div>
  );
}