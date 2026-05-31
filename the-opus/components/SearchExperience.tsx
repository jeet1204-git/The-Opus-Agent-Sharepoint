"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Search, Loader2, CheckCircle2, ArrowRight, Heart, Play, Star, Wand2 } from "lucide-react";
import { aiSearch, type AiSearchResult } from "@/lib/search";
import { reportSearchGap } from "@/app/(dashboard)/search/actions";
import type { SearchMatch } from "@/lib/types";

const STEPS = ["Reading your request…", "Searching the registry…", "Asking the assistant…"];

function relLabel(s: number): { text: string; cls: string } {
  if (s >= 0.3) return { text: "Strong match", cls: "bg-emerald-500/15 text-emerald-300" };
  if (s >= 0.22) return { text: "Related", cls: "bg-blue-500/15 text-blue-300" };
  return { text: "Loosely related", cls: "bg-slate-700/60 text-slate-400" };
}

function isLowConfidenceResult(results: SearchMatch[], verdict: string | undefined): boolean {
  if (verdict === "none") return true;
  const topSimilarity = results[0]?.similarity ?? null;
  if (topSimilarity === null) return true;
  return topSimilarity < 0.22;
}

export default function SearchExperience({ query }: { query: string }) {
  const [data, setData] = useState<AiSearchResult | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const gapReported = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);
    setStep(0);
    gapReported.current = false;

    stepTimer.current = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 750);

    aiSearch(query)
      .then((res) => {
        if (cancelled) return;
        setTimeout(() => {
          if (cancelled) return;
          setData(res);
          setLoading(false);

          // Report gap if results are low-confidence and not already reported
          if (!gapReported.current && isLowConfidenceResult(res.results, res.ai?.verdict)) {
            gapReported.current = true;
            const topSimilarity = res.results[0]?.similarity ?? null;
            reportSearchGap(query, res.ai?.verdict ?? "none", topSimilarity).catch(() => {
              // Fire-and-forget; silently ignore errors
            });
          }
        }, 250);
      })
      .catch(() => {
        if (!cancelled) {
          setData({ results: [], ai: null });
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      if (stepTimer.current) clearInterval(stepTimer.current);
    };
  }, [query]);

  useEffect(() => {
    if (!loading && stepTimer.current) clearInterval(stepTimer.current);
  }, [loading]);

  const ai = data?.ai ?? null;
  const results = data?.results ?? [];

  return (
    <div className="max-w-5xl">
      <h3 className="flex items-center gap-2 text-xs font-bold mb-2 uppercase tracking-[0.2em] text-slate-500">
        <Sparkles size={14} className="text-blue-400" /> AI Search
      </h3>
      <h2 className="text-2xl font-bold mb-1 text-white">
        Results for &ldquo;{query}&rdquo;
      </h2>
      <p className="text-slate-500 mb-8 text-sm">
        An assistant reads your intent and finds the agent to reuse — so you don&apos;t rebuild it.
      </p>

      {/* Thinking animation */}
      {loading && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/[0.06] p-6 mb-8">
          <div className="flex items-center gap-3 text-blue-300">
            <Loader2 size={18} className="animate-spin" />
            <span className="font-medium">{STEPS[step]}</span>
          </div>
          <div className="mt-4 flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  i <= step ? "bg-blue-500" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* The confident answer card */}
      {!loading && ai && (
        <AnswerCard ai={ai} best={results.find((r) => r.id === ai.bestId) ?? null} />
      )}

      {/* Low-confidence nudge */}
      {!loading && isLowConfidenceResult(results, ai?.verdict) && (
        <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-5 py-4 flex items-start gap-3">
          <Search size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-200/80">
            We couldn&apos;t find a strong match for this. We&apos;ve noted the gap — try rephrasing, or{" "}
            <Link href="/agent/new" className="underline underline-offset-2 text-amber-300 hover:text-amber-200">
              create this agent
            </Link>
            .
          </p>
        </div>
      )}

      {/* Ranked list */}
      {!loading && results.length > 0 && (
        <>
          <h4 className="text-xs font-bold mb-4 uppercase tracking-[0.2em] text-slate-500">
            {ai?.bestId ? "Other related agents" : "Closest agents"}
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {results
              .filter((r) => r.id !== ai?.bestId)
              .map((r) => {
                const label = relLabel(r.similarity);
                return (
                  <Link
                    key={r.id}
                    href={`/agent/${r.id}`}
                    className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 transition-all hover:border-blue-500/50 group flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h4 className="font-bold leading-tight text-white group-hover:text-blue-400 transition-colors">
                        {r.title}
                      </h4>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${label.cls}`}>
                        {label.text}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2 italic">
                      &quot;{r.description || r.metadata?.purpose || r.type}&quot;
                    </p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {(r.tags ?? []).slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 bg-slate-800 text-[10px] font-bold rounded text-slate-300 border border-slate-700 uppercase"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </Link>
                );
              })}
          </div>
        </>
      )}

      {!loading && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-500">
          <Search size={20} className="mx-auto mb-2" />
          No similar agents found. Try describing the task differently.
        </div>
      )}
    </div>
  );
}

function AnswerCard({ ai, best }: { ai: NonNullable<AiSearchResult["ai"]>; best: SearchMatch | null }) {
  const badge =
    ai.verdict === "exists"
      ? { text: "Already exists — reuse it", cls: "bg-emerald-500/20 text-emerald-300" }
      : ai.verdict === "closest"
        ? { text: "Closest starting point", cls: "bg-amber-500/20 text-amber-300" }
        : { text: "No match yet", cls: "bg-slate-700/60 text-slate-300" };

  return (
    <div className="mb-8 rounded-xl border border-blue-500/40 bg-gradient-to-br from-blue-500/[0.12] to-slate-900/40 p-6">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-blue-300">
          <Wand2 size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Assistant</span>
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>{badge.text}</span>
      </div>

      <p className="text-xl font-bold text-white leading-snug">{ai.headline}</p>
      {ai.reason && <p className="mt-2 text-sm text-slate-300/90">{ai.reason}</p>}

      {best && ai.bestId && (
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-slate-700 bg-slate-900/60 p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <p className="font-semibold text-white truncate">{best.title}</p>
            </div>
            {ai.best && (
              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Heart size={12} /> {ai.best.likes}</span>
                <span className="flex items-center gap-1"><Play size={12} /> {ai.best.runs} runs</span>
                {ai.best.rating != null && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star size={12} /> {ai.best.rating.toFixed(1)}
                  </span>
                )}
              </div>
            )}
          </div>
          <Link
            href={`/agent/${ai.bestId}`}
            className="flex shrink-0 items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-500"
          >
            View &amp; reuse <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}