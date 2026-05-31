"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Settings2,
  ShieldCheck,
  Info,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ── CONSTANTS TIED TO EXTERNAL WHITE PAPERS ──
const MIT_MULTIPLIER = 0.37;    // 37% average task speed-up via generative assistance
const LLM_COST_PER_HOUR = 1.50; // Static hardware/token overhead deduction
const WEEKS_PER_YEAR = 46;      // Net working weeks (factoring out corporate holidays)



// ── FORMULA TOOLTIP ──────────────────────────────────────────────────────────
function FormulaTooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors text-[11px] mt-2"
        aria-label="Show formula"
      >
        <Info size={12} />
        <span>how it's calculated</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-72 rounded-xl border border-slate-200 bg-slate-100 p-4 text-xs text-slate-700 leading-relaxed shadow-2xl">
          {children}
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-4 w-3 h-3 rotate-45 bg-slate-100 border-r border-b border-slate-200" />
        </div>
      )}
    </div>
  );
}

// ── SLIDER CONTROL ───────────────────────────────────────────────────────────
function SliderControl({
  label,
  val,
  min,
  max,
  step,
  onChange,
  percent = false,
  suffix = "",
  prefix = "",
}: {
  label: string;
  val: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  percent?: boolean;
  suffix?: string;
  prefix?: string;
}) {
  const display = percent
    ? `${(val * 100).toFixed(0)}%`
    : `${prefix}${val}${suffix}`;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">
          {label}
        </label>
        <span className="text-[#7c5cff] font-mono text-xs font-bold">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}

// ── CUSTOM CHART TOOLTIP ─────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, eur }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100/95 p-3 text-xs shadow-2xl backdrop-blur-sm">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-mono font-bold text-[#15161a]">{eur(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ImpactPageClient({
  initialEmployeeCount,
  estimatedHoursSaved,
  earliestCreatedAt,
  latestUpdatedAt,
}: {
  initialEmployeeCount: number;
  estimatedHoursSaved: number;
  earliestCreatedAt: string | null;
  latestUpdatedAt: string | null;
}) {
  const [hourlyRate, setHourlyRate] = useState(55);
  const [utilizationRate, setUtilizationRate] = useState(0.2);
  const [trackingWindow, setTrackingWindow] = useState(48);

  const eur = (n: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);

  const { historicalMoneySaved, annualExecutionNet, daysSinceInception, chartData } =
    useMemo(() => {
      // ── Time span ──────────────────────────────────────────────────────────
      const start = earliestCreatedAt ? new Date(earliestCreatedAt).getTime() : null;
      const end   = latestUpdatedAt   ? new Date(latestUpdatedAt).getTime()   : null;
      const days  = start && end ? Math.max(1, (end - start) / 86_400_000) : 30;

      // ── A. Creation savings (historical, to-date) ──────────────────────────
      // estimatedHoursSaved = AI-scored hours across all assets (length + complexity + specificity) × 0.5
      const histMoney = estimatedHoursSaved * hourlyRate;

      // Daily asset creation rate: how many €-worth of work per day since inception
      const dailyCreationRate = histMoney / days; // €/day
      const annualCreationRate = dailyCreationRate * 365; // €/year at current pace

      // ── B. Net execution savings ───────────────────────────────────────────
      const netValuePerHour = hourlyRate - LLM_COST_PER_HOUR;
      const weeklyHoursSaved = utilizationRate * trackingWindow;
      const annualExecHours =
        weeklyHoursSaved * WEEKS_PER_YEAR * initialEmployeeCount * MIT_MULTIPLIER;
      const annExecNet = annualExecHours * netValuePerHour;

      // ── Chart: 10-year projection ──────────────────────────────────────────
      // Type A grows as a compounding curve: each year the org adds more assets,
      // so savings compound at the same daily rate observed so far.
      // Cumulative Type A at year Y = annualCreationRate × Y × (Y+1)/2
      //   (triangular sum — year 1 adds 1×, year 2 adds 2×, etc.)
      // This produces a curve that accelerates, not a flat line.
      const data = Array.from({ length: 10 }, (_, i) => {
        const y = i + 1;
        const cumulativeA = Math.round(annualCreationRate * (y * (y + 1)) / 2);
        const cumulativeB = Math.round(annExecNet * y);
        return {
          year: `Year ${y}`,
          "Type A — Creation": cumulativeA,
          "Type B — Execution": cumulativeB,
          Combined: cumulativeA + cumulativeB,
        };
      });

      return {
        historicalMoneySaved: histMoney,
        annualExecutionNet: annExecNet,
        daysSinceInception: days,
        chartData: data,
      };
    }, [hourlyRate, utilizationRate, trackingWindow, estimatedHoursSaved, earliestCreatedAt, latestUpdatedAt]);

  const total10yr =
    chartData[9]["Type A — Creation"] + chartData[9]["Type B — Execution"];

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfbfa] flex flex-col lg:flex-row">

      {/* ── LEFT: METRICS + CHART ── */}
      <div className="flex-1 p-8 space-y-8 min-w-0">
        <header className="flex items-center gap-3">
          <TrendingUp size={24} className="text-[#7c5cff]" />
          <h1 className="text-2xl font-bold text-[#15161a]">Financial Impact Projection</h1>
        </header>

        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600/10 to-transparent p-8 rounded-3xl border border-blue-500/20">
          <p className="text-xs uppercase tracking-widest text-[#7c5cff] font-bold mb-2">
            Net 10-Year Value Loop
          </p>
          <h2 className="text-5xl md:text-7xl font-black text-[#15161a] tracking-tighter italic">
            {eur(total10yr)}
          </h2>
          <p className="text-slate-500 mt-3 text-sm max-w-2xl leading-relaxed">
            The complete compounding financial dividend unlocked by accumulating custom
            prompt blueprints and scaling workflow efficiency across your entire
            organization.
          </p>
        </section>

        {/* Type A + B cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Type A */}
          <div className="bg-white/80 border border-slate-200 p-7 rounded-3xl space-y-3">
            <div className="text-[#7c5cff] font-bold text-xs uppercase tracking-widest">
              Type A · Creation savings
            </div>
            <p className="text-3xl font-extrabold text-[#15161a]">{eur(historicalMoneySaved)}</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reclaimed development costs to date across{" "}
              <span className="text-slate-700">{Math.round(daysSinceInception)} days</span> of asset
              creation. Engineers reuse pre-existing verified wrappers instead of
              recreating similar LLM contexts from scratch.
            </p>
            <FormulaTooltip>
              <p className="font-bold text-[#15161a] mb-2">Creation savings formula</p>
              <code className="block bg-white rounded px-2 py-1 mb-2 text-[#7c5cff]">
                estimated_hours × hourly_rate
              </code>
              <p className="text-slate-500 mb-2">
                Each asset is scored by AI on three dimensions (0–1 each):
              </p>
              <ul className="text-slate-500 space-y-0.5">
                <li><span className="text-slate-700">length</span> — how detailed the content is</li>
                <li><span className="text-slate-700">complexity</span> — branching logic, multi-step reasoning</li>
                <li><span className="text-slate-700">specificity</span> — domain-specific vs generic</li>
              </ul>
              <code className="block bg-white rounded px-2 py-1 mt-2 text-[#7c5cff]">
                hours = (length + complexity + specificity) × 0.5
              </code>
            </FormulaTooltip>
          </div>

          {/* Type B */}
          <div className="bg-white/80 border border-slate-200 p-7 rounded-3xl space-y-3">
            <div className="text-emerald-500 font-bold text-xs uppercase tracking-widest">
              Type B · Net annual execution
            </div>
            <p className="text-3xl font-extrabold text-[#15161a]">{eur(annualExecutionNet)}</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Forward-looking optimization gains from peer-reviewed performance shifts,
              minus a €1.50/hr deduction for operational API token bandwidth.
            </p>
            <FormulaTooltip>
              <p className="font-bold text-[#15161a] mb-2">Net annual execution formula</p>
              <code className="block bg-white rounded px-2 py-1 mb-2 text-emerald-600">
                (r × window × {WEEKS_PER_YEAR} × employees × {MIT_MULTIPLIER}) × (rate − €{LLM_COST_PER_HOUR})
              </code>
              <ul className="text-slate-500 space-y-0.5 mt-1">
                <li><span className="text-slate-700">r</span> = utilization rate</li>
                <li><span className="text-slate-700">{WEEKS_PER_YEAR}</span> = net working weeks/year</li>
                <li><span className="text-slate-700">{MIT_MULTIPLIER}</span> = MIT-cited speed-up multiplier</li>
                <li><span className="text-slate-700">€{LLM_COST_PER_HOUR}</span> = LLM infrastructure deduction</li>
              </ul>
            </FormulaTooltip>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Cumulative return roadmap
            </h3>
            <FormulaTooltip>
              <p className="font-bold text-[#15161a] mb-2">Projection formula</p>
              <code className="block bg-white rounded px-2 py-1 mb-2 text-amber-600">
                TypeA(Y) = annualRate × Y×(Y+1)/2
              </code>
              <p className="text-slate-500 mb-2">
                Type A accelerates — each year the org adds more assets at the same daily rate
                observed so far (<span className="text-slate-700">{Math.round(daysSinceInception)} days</span> of data).
                The triangular sum <code className="text-amber-600">Y×(Y+1)/2</code> produces a curve, not a flat line.
              </p>
              <code className="block bg-white rounded px-2 py-1 text-[#7c5cff]">
                TypeB(Y) = annualExec × Y  (linear)
              </code>
            </FormulaTooltip>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={72}
                tickFormatter={(v) =>
                  v >= 1_000_000
                    ? `€${(v / 1_000_000).toFixed(1)}M`
                    : v >= 1_000
                    ? `€${Math.round(v / 1_000)}K`
                    : `€${v}`
                }
              />
              <Tooltip content={<ChartTooltip eur={eur} />} />
              <Legend
                wrapperStyle={{ fontSize: "11px", color: "#94a3b8", paddingTop: "12px" }}
              />
              <Area
                type="monotone"
                dataKey="Type B — Execution"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradB)"
                dot={false}
                activeDot={{ r: 4, fill: "#3b82f6" }}
              />
              <Area
                type="monotone"
                dataKey="Type A — Creation"
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                fill="url(#gradA)"
                dot={false}
                activeDot={{ r: 4, fill: "#10b981" }}
              />
              <Area
                type="monotone"
                dataKey="Combined"
                stroke="#f59e0b"
                strokeWidth={2.5}
                fill="url(#gradC)"
                dot={false}
                activeDot={{ r: 5, fill: "#f59e0b" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── RIGHT: SLIDERS ── */}
      <aside className="w-full lg:w-80 bg-white border-l border-slate-200 p-8 space-y-8">
        <div className="flex items-center gap-2 text-[#15161a] font-bold">
          <Settings2 size={18} className="text-[#7c5cff]" />
          <h2>Organizational Input</h2>
        </div>

        <div className="space-y-6">
          <SliderControl
            label="Internal engineering cost"
            val={hourlyRate}
            min={30}
            max={200}
            step={5}
            onChange={setHourlyRate}
            prefix="€"
            suffix="/hr"
          />
          <SliderControl
            label="Workplace utilization (r)"
            val={utilizationRate}
            min={0.01}
            max={1.0}
            step={0.01}
            onChange={setUtilizationRate}
            percent
          />
          <SliderControl
            label="Tracked weekly window"
            val={trackingWindow}
            min={10}
            max={60}
            step={1}
            onChange={setTrackingWindow}
            suffix=" hrs"
          />
        </div>

        {/* Snapshot cards */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest">
            Milestones
          </p>
          {[1, 3, 5].map((y) => {
            const d = chartData[y - 1];
            return (
              <div
                key={y}
                className="flex items-center justify-between bg-white/60 rounded-xl px-4 py-3 border border-slate-200"
              >
                <span className="text-xs text-slate-500 font-bold uppercase">
                  {y} {y === 1 ? "year" : "years"}
                </span>
                <span className="text-sm font-bold text-[#15161a] font-mono">
                  {eur(d.Combined)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-200">
          <div className="flex gap-3 text-slate-500 italic text-[11px] leading-relaxed">
            <ShieldCheck size={24} className="shrink-0 text-[#7c5cff]" />
            <p>
              Calculations balance prompt engineering time saved against real-world API
              infrastructure costs to verify workspace ROI loops.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}