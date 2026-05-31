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
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
      <h3 className="mb-3 flex items-center gap-2 font-bold text-[#15161a]">
        <Play size={16} className="text-[#7c5cff]" /> Run this agent
      </h3>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        placeholder="Paste the input you want to run through this agent…"
        className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#15161a] focus:outline-none focus:ring-2 focus:ring-[#7c5cff]"
      />

      <button
        onClick={run}
        disabled={running}
        className="mt-3 flex items-center gap-2 rounded-md bg-[#15161a] px-5 py-2 font-bold text-white transition-colors hover:bg-black disabled:opacity-50"
      >
        {running ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
        {running ? "Running…" : "Run"}
      </button>

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
      {output && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">Output</p>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-[#15161a]">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
