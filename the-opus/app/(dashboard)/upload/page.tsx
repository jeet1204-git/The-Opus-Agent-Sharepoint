"use client";

import { useActionState, useState, useRef } from "react";
import Link from "next/link";
import { UploadCloud, AlertTriangle, XCircle, Copy, Loader2 } from "lucide-react";
import { createAsset, type UploadState } from "./actions";
import { searchAssets } from "@/lib/search";
import { DEPARTMENTS } from "@/lib/departments";
import type { ContractIssue } from "@/lib/validation";
import type { SearchMatch } from "@/lib/types";

const initial: UploadState = { ok: false, issues: [] };

function issuesFor(issues: ContractIssue[], field: string) {
  return issues.filter((i) => i.field === field);
}

function FieldHint({ issues, field }: { issues: ContractIssue[]; field: string }) {
  const fieldIssues = issuesFor(issues, field);
  if (fieldIssues.length === 0) return null;
  return (
    <div className="mt-1 space-y-0.5">
      {fieldIssues.map((i, idx) => (
        <p
          key={idx}
          className={`flex items-center gap-1 text-xs ${i.level === "error" ? "text-red-400" : "text-amber-400"}`}
        >
          {i.level === "error" ? <XCircle size={12} /> : <AlertTriangle size={12} />}
          {i.message}
        </p>
      ))}
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls =
  "mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400";

export default function UploadPage() {
  const [state, formAction, pending] = useActionState(createAsset, initial);

  // ── Department scope (Part B: content-gating) ──
  const [dept, setDept] = useState("");

  // ── Live "about-to-duplicate" detector ──
  const [dupes, setDupes] = useState<SearchMatch[]>([]);
  const [checking, setChecking] = useState(false);
  const draft = useRef({ title: "", purpose: "" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleDupeCheck() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const text = `${draft.current.title} ${draft.current.purpose}`.trim();
      if (text.length < 8) {
        setDupes([]);
        return;
      }
      setChecking(true);
      try {
        const res = await searchAssets(text, 3);
        setDupes(res.filter((r) => r.similarity >= 0.35));
      } catch {
        setDupes([]);
      } finally {
        setChecking(false);
      }
    }, 500);
  }

  const strongest = dupes[0];

  return (
    <>
      <header className="h-16 border-b border-slate-800 flex items-center gap-3 px-8 bg-[#0f172a]/50 backdrop-blur-md">
        <UploadCloud size={20} className="text-blue-500" />
        <h1 className="text-lg font-bold text-white">Publish an agent</h1>
        {checking && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Loader2 size={12} className="animate-spin" /> checking for duplicates…
          </span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-[#0b1120]">
        {/* The hero: duplicate detector */}
        {dupes.length > 0 && (
          <div className="mb-6 max-w-3xl rounded-xl border border-amber-500/40 bg-amber-500/10 p-5">
            <div className="mb-3 flex items-center gap-2 text-amber-300">
              <AlertTriangle size={18} />
              <h3 className="font-bold">
                {strongest && strongest.similarity >= 0.6
                  ? "This may already exist — reuse instead of rebuilding?"
                  : "Similar agents already in the registry"}
              </h3>
            </div>
            <p className="mb-4 text-sm text-amber-200/80">
              We found existing agents that look close to what you&apos;re describing. Reusing a
              trusted one is faster than building from scratch.
            </p>
            <div className="space-y-2">
              {dupes.map((d) => (
                <Link
                  key={d.id}
                  href={`/agent/${d.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 transition-colors hover:border-blue-500/50"
                >
                  <div>
                    <p className="font-semibold text-white">{d.title}</p>
                    <p className="text-xs text-slate-400">
                      {d.metadata?.purpose ?? d.description ?? d.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
                      {Math.round(d.similarity * 100)}% match
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-blue-400">
                      <Copy size={12} /> View &amp; reuse
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <form action={formAction} className="space-y-6">
          {state.message && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {state.message}
            </div>
          )}

          {/* Basics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Type</label>
              <select name="type" defaultValue="agent" className={inputCls}>
                <option value="agent">Agent</option>
                <option value="skill">Skill</option>
                <option value="prompt">Prompt</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Title *</label>
              <input
                name="title"
                className={inputCls}
                placeholder="Legal Brief Summarizer"
                onChange={(e) => {
                  draft.current.title = e.target.value;
                  scheduleDupeCheck();
                }}
              />
              <FieldHint issues={state.issues} field="title" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Short description</label>
            <input name="description" className={inputCls} placeholder="Summarizes long legal briefs into key points." />
            <FieldHint issues={state.issues} field="description" />
          </div>

          {/* Contract metadata */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">The contract — what another team needs to reuse this</p>

            <div>
              <label className={labelCls}>Purpose * (what it does)</label>
              <textarea
                name="purpose"
                rows={2}
                className={inputCls}
                placeholder="Takes a legal brief and returns a structured summary with parties, claims, and risks."
                onChange={(e) => {
                  draft.current.purpose = e.target.value;
                  scheduleDupeCheck();
                }}
              />
              <FieldHint issues={state.issues} field="purpose" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Framework</label>
                <input name="framework" className={inputCls} placeholder="LangChain / CrewAI / AutoGen / raw prompt" />
              </div>
              <div>
                <label className={labelCls}>Tools (comma-separated)</label>
                <input name="tools" className={inputCls} placeholder="web_search, pdf_reader" />
                <FieldHint issues={state.issues} field="tools" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Requirements</label>
              <input name="requirements" className={inputCls} placeholder="API key for X, input must be plain text under 50 pages" />
            </div>

            <div>
              <label className={labelCls}>When NOT to use it</label>
              <textarea name="when_not_to_use" rows={2} className={inputCls} placeholder="Don't use for non-English documents or for legal advice." />
              <FieldHint issues={state.issues} field="when_not_to_use" />
            </div>

            <div>
              <label className={labelCls}>Tags (comma-separated)</label>
              <input name="tags" className={inputCls} placeholder="legal, summarization, llm" />
            </div>

            {/* Department scope */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-4">
              <div>
                <label className={labelCls}>Department</label>
                <select
                  name="department"
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Everyone (no department) —</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label
                  className={`flex items-center gap-2 text-sm ${dept ? "text-slate-300" : "text-slate-600"}`}
                >
                  <input type="checkbox" name="restricted" disabled={!dept} className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-blue-600" />
                  Restrict payload to {dept || "this department"} only
                </label>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Restricted agents stay <span className="text-slate-400">discoverable by everyone</span> (title,
              description, trust signals) — but only {dept || "the chosen department"} (and admins) can see the
              prompt/file and run it.
            </p>
          </div>

          {/* Runnable content */}
          <div>
            <label className={labelCls}>Content — the prompt / config *</label>
            <textarea name="content" rows={8} className={`${inputCls} font-mono`} placeholder={'You are a legal analyst. Given a brief, extract...\n\n(or paste a LangChain/CrewAI config)'} />
            <FieldHint issues={state.issues} field="content" />
          </div>

          <div>
            <label className={labelCls}>Or upload a config file (optional)</label>
            <input name="file" type="file" className="block w-full text-sm text-slate-400 file:mr-4 file:rounded-md file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700" />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-blue-600 px-6 py-2.5 font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {pending ? "Publishing…" : "Publish to registry"}
          </button>
        </form>
      </div>
    </>
  );
}
