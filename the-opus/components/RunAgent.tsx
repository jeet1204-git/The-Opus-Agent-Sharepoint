"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { runAgent } from "@/lib/run";

/** Drop-in "Run this agent" panel for the asset detail page. */
export function RunAgent({ assetId }: { assetId: string }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setError("");
    setOutput("");
    const res = await runAgent(assetId, input);
    if (res.error) setError(res.error);
    else setOutput(res.output);
    setRunning(false);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <h3 className="mb-3 flex items-center gap-2 font-bold text-white">
        <Play size={16} className="text-blue-500" /> Run this agent
      </h3>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        placeholder="Paste the input you want to run through this agent…"
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={run}
        disabled={running}
        className="mt-3 flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
      >
        {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
        {running ? "Running…" : "Run"}
      </button>

      {error && (
        <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}
      {output && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">Output</p>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
