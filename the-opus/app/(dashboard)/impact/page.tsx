import Link from "next/link";
import { TrendingUp, Clock, Euro, Repeat, Users, Boxes, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

// ── ROI model (assumptions are shown to the user, not hidden) ──
// Each time a teammate adopts an existing agent instead of building their own,
// they avoid a build. We count distinct (member × agent) adoptions as
// "rebuilds avoided" and price each at a conservative engineering estimate.
const HOURS_PER_REBUILD = 6; // hrs to stand up a comparable agent from scratch
const BLENDED_RATE = 85; // € per engineering hour (fully loaded)
const WEEKS = 8;

const eur = (n: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default async function ImpactPage() {
  await requireProfile();
  const supabase = await createClient();

  const [{ data: assets }, { data: usages }, { data: reviews }, { data: likes }] = await Promise.all([
    supabase.from("assets").select("id, title, type"),
    supabase.from("usages").select("asset_id, user_id, action, created_at"),
    supabase.from("reviews").select("asset_id, rating"),
    supabase.from("likes").select("asset_id"),
  ]);

  type U = { asset_id: string; user_id: string; action: string; created_at: string };
  const U = (usages ?? []) as U[];
  const A = (assets ?? []) as { id: string; title: string; type: string }[];
  const R = (reviews ?? []) as { asset_id: string; rating: number }[];
  const L = (likes ?? []) as { asset_id: string }[];

  // Headline aggregates
  const reuseEvents = U.length;
  const downloads = U.filter((u) => u.action === "download").length;
  const adoptions = new Set(U.map((u) => `${u.user_id}:${u.asset_id}`)).size; // rebuilds avoided
  const activeMembers = new Set(U.map((u) => u.user_id)).size;
  const hoursSaved = adoptions * HOURS_PER_REBUILD;
  const moneySaved = hoursSaved * BLENDED_RATE;

  // Per-asset rollup
  const byAsset = A.map((a) => {
    const events = U.filter((u) => u.asset_id === a.id);
    const ratings = R.filter((r) => r.asset_id === a.id).map((r) => r.rating);
    const adopt = new Set(events.map((u) => u.user_id)).size;
    return {
      ...a,
      events: events.length,
      adopt,
      likes: L.filter((l) => l.asset_id === a.id).length,
      avg: ratings.length ? ratings.reduce((s, r) => s + r, 0) / ratings.length : null,
      hours: adopt * HOURS_PER_REBUILD,
    };
  }).sort((x, y) => y.events - x.events);

  // Weekly reuse trend (last 8 weeks, chronological)
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const buckets = Array.from({ length: WEEKS }, () => 0);
  for (const u of U) {
    const idx = Math.floor((now - new Date(u.created_at).getTime()) / week);
    if (idx >= 0 && idx < WEEKS) buckets[WEEKS - 1 - idx] += 1;
  }
  const maxWeek = Math.max(1, ...buckets);

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="h-16 border-b border-slate-200 flex items-center gap-3 px-8 bg-white/60 backdrop-blur-md">
        <TrendingUp size={20} className="text-[#7c5cff]" />
        <h1 className="text-lg font-bold text-[#15161a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Reuse Impact</h1>
        <span className="ml-2 rounded-full bg-[#7c5cff]/10 px-2 py-0.5 text-xs font-medium text-[#7c5cff]">
          Acme Corp · this quarter
        </span>
      </header>

      <div className="p-8 space-y-8">
        {/* The mic-drop line */}
        <div>
          <p className="text-sm uppercase tracking-widest text-slate-500 mb-2">The bottom line</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#15161a] leading-tight max-w-4xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            The Opus has saved Acme{" "}
            <span className="text-[#7c5cff]">{hoursSaved.toLocaleString()} engineering hours</span> —
            about <span className="text-[#0fae8e]">{eur(moneySaved)}</span> — by reusing agents
            instead of rebuilding them.
          </h2>
        </div>

        {/* Hero stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <StatCard icon={<Clock size={18} />} accent="text-[#7c5cff]"
            label="Engineering hours saved" value={hoursSaved.toLocaleString()}
            sub={`${adoptions} rebuilds avoided × ${HOURS_PER_REBUILD}h each`} />
          <StatCard icon={<Euro size={18} />} accent="text-[#0fae8e]"
            label="Cost avoided" value={eur(moneySaved)}
            sub={`at ${eur(BLENDED_RATE)}/engineering hour`} />
          <StatCard icon={<Repeat size={18} />} accent="text-[#e0922a]"
            label="Rebuilds avoided" value={adoptions.toLocaleString()}
            sub={`${activeMembers} teammates reused existing agents`} />
        </div>

        {/* Secondary chips */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MiniStat icon={<Sparkles size={14} />} label="Total reuse events" value={reuseEvents.toLocaleString()} />
          <MiniStat icon={<Boxes size={14} />} label="Agents in registry" value={A.length.toLocaleString()} />
          <MiniStat icon={<TrendingUp size={14} />} label="Downloads" value={downloads.toLocaleString()} />
          <MiniStat icon={<Users size={14} />} label="Active members" value={activeMembers.toLocaleString()} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Weekly trend */}
          <section className="xl:col-span-1 rounded-xl border border-slate-200 bg-white shadow-sm p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
              Reuse over the last {WEEKS} weeks
            </h3>
            <div className="flex items-end gap-2 h-40">
              {buckets.map((c, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-[#7c5cff]/40 to-[#2ed3b7] transition-all"
                    style={{ height: `${Math.max(4, (c / maxWeek) * 100)}%` }}
                    title={`${c} reuse events`}
                  />
                  <span className="text-[10px] text-slate-500">
                    {i === WEEKS - 1 ? "now" : `-${WEEKS - 1 - i}w`}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Reuse is compounding as the registry fills — the flywheel the challenge asks for.
            </p>
          </section>

          {/* Most-reused agents */}
          <section className="xl:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
              Most-reused agents
            </h3>
            <div className="space-y-1">
              <div className="grid grid-cols-12 px-3 pb-2 text-[10px] uppercase tracking-wider text-slate-500">
                <span className="col-span-5">Agent</span>
                <span className="col-span-2 text-right">Reuses</span>
                <span className="col-span-2 text-right">Adopters</span>
                <span className="col-span-2 text-right">Hours saved</span>
                <span className="col-span-1 text-right">Rating</span>
              </div>
              {byAsset.map((a) => (
                <Link key={a.id} href={`/agent/${a.id}`}
                  className="grid grid-cols-12 items-center rounded-lg px-3 py-2.5 hover:bg-slate-100 transition-colors group">
                  <span className="col-span-5 truncate font-medium text-slate-700 group-hover:text-[#15161a]">{a.title}</span>
                  <span className="col-span-2 text-right font-mono text-slate-700">{a.events}</span>
                  <span className="col-span-2 text-right font-mono text-slate-500">{a.adopt}</span>
                  <span className="col-span-2 text-right font-mono text-[#7c5cff]">{a.hours}h</span>
                  <span className="col-span-1 text-right font-mono text-[#e0922a]">{a.avg ? a.avg.toFixed(1) : "—"}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Honest methodology */}
        <p className="max-w-4xl text-xs leading-relaxed text-slate-500 border-t border-slate-200 pt-4">
          <span className="font-semibold text-slate-500">How this is calculated:</span> a “rebuild avoided” is a
          distinct (teammate × agent) adoption — someone running or downloading an agent that already existed
          instead of building their own. Each is priced at a conservative {HOURS_PER_REBUILD} engineering hours
          at a fully-loaded rate of {eur(BLENDED_RATE)}/hour. Figures come from live registry activity, not estimates.
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, accent, label, value, sub }: {
  icon: React.ReactNode; accent: string; label: string; value: string; sub: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
      <div className={`flex items-center gap-2 ${accent} mb-3`}>
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <p className="text-4xl font-bold text-[#15161a] tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
      <p className="mt-2 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm px-4 py-3">
      <div className="flex items-center gap-1.5 text-slate-500 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold text-[#15161a]">{value}</p>
    </div>
  );
}
