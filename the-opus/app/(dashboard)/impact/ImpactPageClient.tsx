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
const HIST_HOURS = 124.5;       // Historical creation hours saved
const DAYS_SINCE_INCEPTION = 60;

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
        className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors text-[11px] mt-2"
        aria-label="Show formula"
      >
        <Info size={12} />
        <span>how it's calculated</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-72 rounded-xl border border-slate-700 bg-slate-950 p-4 text-xs text-slate-300 leading-relaxed shadow-2xl">
          {children}
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-4 w-3 h-3 rotate-45 bg-slate-950 border-r border-b border-slate-700" />
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
        <span className="text-blue-400 font-mono text-xs font-bold">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}

// ── CUSTOM CHART TOOLTIP ─────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, eur }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/95 p-3 text-xs shadow-2xl backdrop-blur-sm">
      <p className="font-bold text-slate-300 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-mono font-bold text-white">{eur(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ImpactPageClient({
  initialEmployeeCount,
}: {
  initialEmployeeCount: number;
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

  const { historicalMoneySaved, annualExecutionNet, annCreationBase, chartData } =
    useMemo(() => {
      // A. Creation savings
      const histMoney = HIST_HOURS * hourlyRate;
      const annCreation = (histMoney / DAYS_SINCE_INCEPTION) * 365;

      // B. Net execution savings
      const netValuePerHour = hourlyRate - LLM_COST_PER_HOUR;
      const weeklyHoursSaved = utilizationRate * trackingWindow;
      const annualExecHours =
        weeklyHoursSaved * WEEKS_PER_YEAR * initialEmployeeCount * MIT_MULTIPLIER;
      const annExecNet = annualExecHours * netValuePerHour;

      // Chart data — 10 year projection
      const data = Array.from({ length: 10 }, (_, i) => {
        const y = i + 1;
        return {
          year: `Year ${y}`,
          "Type A — Creation": Math.round(annCreation * y),
          "Type B — Execution": Math.round(annExecNet * y),
          Combined: Math.round((annCreation + annExecNet) * y),
        };
      });

      return {
        historicalMoneySaved: histMoney,
        annualExecutionNet: annExecNet,
        annCreationBase: annCreation,
        chartData: data,
      };
    }, [hourlyRate, utilizationRate, trackingWindow]);

  const total10yr =
    chartData[9]["Type A — Creation"] + chartData[9]["Type B — Execution"];

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b1120] flex flex-col lg:flex-row">

      {/* ── LEFT: METRICS + CHART ── */}
      <div className="flex-1 p-8 space-y-8 min-w-0">
        <header className="flex items-center gap-3">
          <TrendingUp size={24} className="text-blue-500" />
          <h1 className="text-2xl font-bold text-white">Financial Impact Projection</h1>
        </header>

        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600/10 to-transparent p-8 rounded-3xl border border-blue-500/20">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-bold mb-2">
            Net 10-Year Value Loop
          </p>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic">
            {eur(total10yr)}
          </h2>
          <p className="text-slate-400 mt-3 text-sm max-w-2xl leading-relaxed">
            The complete compounding financial dividend unlocked by accumulating custom
            prompt blueprints and scaling workflow efficiency across your entire
            organization.
          </p>
        </section>

        {/* Type A + B cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Type A */}
          <div className="bg-slate-900/80 border border-slate-800 p-7 rounded-3xl space-y-3">
            <div className="text-blue-500 font-bold text-xs uppercase tracking-widest">
              Type A · Creation savings
            </div>
            <p className="text-3xl font-extrabold text-white">{eur(historicalMoneySaved)}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reclaimed development costs to date. Engineers reuse pre-existing verified
              wrappers instead of recreating similar LLM contexts from scratch.
            </p>
            <FormulaTooltip>
              <p className="font-bold text-white mb-2">Creation savings formula</p>
              <code className="block bg-slate-900 rounded px-2 py-1 mb-2 text-blue-300">
                historical_hours × hourly_rate
              </code>
              <p className="text-slate-400">
                {HIST_HOURS} recorded hrs × your rate. Annualised:{" "}
                <code className="text-blue-300">(result ÷ {DAYS_SINCE_INCEPTION} days) × 365</code>
              </p>
            </FormulaTooltip>
          </div>

          {/* Type B */}
          <div className="bg-slate-900/80 border border-slate-800 p-7 rounded-3xl space-y-3">
            <div className="text-emerald-500 font-bold text-xs uppercase tracking-widest">
              Type B · Net annual execution
            </div>
            <p className="text-3xl font-extrabold text-white">{eur(annualExecutionNet)}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Forward-looking optimization gains from peer-reviewed performance shifts,
              minus a €1.50/hr deduction for operational API token bandwidth.
            </p>
            <FormulaTooltip>
              <p className="font-bold text-white mb-2">Net annual execution formula</p>
              <code className="block bg-slate-900 rounded px-2 py-1 mb-2 text-emerald-300">
                (r × window × {WEEKS_PER_YEAR} × employees × {MIT_MULTIPLIER}) × (rate − €{LLM_COST_PER_HOUR})
              </code>
              <ul className="text-slate-400 space-y-0.5 mt-1">
                <li><span className="text-slate-300">r</span> = utilization rate</li>
                <li><span className="text-slate-300">{WEEKS_PER_YEAR}</span> = net working weeks/year</li>
                <li><span className="text-slate-300">{MIT_MULTIPLIER}</span> = MIT-cited speed-up multiplier</li>
                <li><span className="text-slate-300">€{LLM_COST_PER_HOUR}</span> = LLM infrastructure deduction</li>
              </ul>
            </FormulaTooltip>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Cumulative return roadmap
            </h3>
            <FormulaTooltip>
              <p className="font-bold text-white mb-2">Projection formula</p>
              <code className="block bg-slate-900 rounded px-2 py-1 mb-2 text-amber-300">
                Combined(Y) = (Type B × Y) + (Type A annualised × Y)
              </code>
              <p className="text-slate-400">
                Linear compounding of both savings streams. Both series share the same
                starting base and grow proportionally with your slider inputs.
              </p>
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
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradB)"
                dot={false}
                activeDot={{ r: 4, fill: "#3b82f6" }}
              />
              <Area
                type="monotone"
                dataKey="Type A — Creation"
                stroke="#10b981"
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
      <aside className="w-full lg:w-80 bg-[#0f172a] border-l border-slate-800 p-8 space-y-8">
        <div className="flex items-center gap-2 text-white font-bold">
          <Settings2 size={18} className="text-blue-400" />
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
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest">
            Milestones
          </p>
          {[1, 3, 5].map((y) => {
            const d = chartData[y - 1];
            return (
              <div
                key={y}
                className="flex items-center justify-between bg-slate-900/60 rounded-xl px-4 py-3 border border-slate-800"
              >
                <span className="text-xs text-slate-500 font-bold uppercase">
                  {y} {y === 1 ? "year" : "years"}
                </span>
                <span className="text-sm font-bold text-white font-mono">
                  {eur(d.Combined)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800">
          <div className="flex gap-3 text-slate-500 italic text-[11px] leading-relaxed">
            <ShieldCheck size={24} className="shrink-0 text-blue-500" />
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