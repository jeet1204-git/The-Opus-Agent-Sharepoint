"use server";

import { createClient } from "@/lib/supabase/server";
import { embed, generateFast } from "@/lib/ai";
import type { SearchMatch } from "@/lib/types";

export type SearchVerdict = "exists" | "closest" | "none" | "error";

export interface AiVerdict {
  verdict: SearchVerdict;
  bestId: string | null;
  headline: string; // one-line plain-English answer for the user
  reason: string; // why this agent fits
  best?: { likes: number; runs: number; rating: number | null };
}

export interface AiSearchResult {
  results: SearchMatch[];
  ai: AiVerdict | null;
}

/**
 * Semantic search across the current user's org.
 * PERSON B: import and call this from the Explore/Feed search bar:
 *   const results = await searchAssets("summarize legal contracts");
 *
 * Embeds the query with OpenRouter, then calls the match_assets() RPC
 * (cosine similarity over pgvector). Returns same-org matches only (RLS).
 */
export async function searchAssets(
  query: string,
  matchCount = 12
): Promise<SearchMatch[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const supabase = await createClient();

  let queryEmbedding: number[];
  try {
    queryEmbedding = await embed(trimmed);
  } catch {
    // No OpenRouter key / embed failure → graceful empty result rather than a crash.
    return [];
  }

  const { data, error } = await supabase.rpc("match_assets", {
    query_embedding: queryEmbedding,
    match_count: matchCount,
  });

  if (error) {
    console.error("match_assets RPC failed:", error.message);
    return [];
  }
  return (data as SearchMatch[]) ?? [];
}

/**
 * Agentic search: embeddings shortlist the candidates (fast, scales), then a
 * cheap fast model (Gemini 3.5 Flash via generateFast) reasons over ONLY those
 * candidates and returns a confident, plain-English verdict. The model can
 * never invent an agent - we validate its pick against the shortlist and fall
 * back to pure semantic order if anything looks off.
 */
export async function aiSearch(query: string): Promise<AiSearchResult> {
  const trimmed = query.trim();
  if (!trimmed) return { results: [], ai: null };

  // Embed first, in isolation, so we can tell "AI is down" apart from
  // "the registry genuinely has no match". A swallowed embed error must NOT
  // masquerade as an empty registry - that looks broken on stage.
  let queryEmbedding: number[];
  try {
    queryEmbedding = await embed(trimmed);
  } catch {
    return {
      results: [],
      ai: {
        verdict: "error",
        bestId: null,
        headline: "AI search is temporarily unavailable.",
        reason:
          "We couldn't reach the assistant right now - please try again in a moment. You can still browse the registry below.",
      },
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("match_assets", {
    query_embedding: queryEmbedding,
    match_count: 6,
  });
  if (error) console.error("match_assets RPC failed:", error.message);
  const results: SearchMatch[] = error ? [] : ((data as SearchMatch[]) ?? []);

  if (results.length === 0) {
    return {
      results,
      ai: {
        verdict: "none",
        bestId: null,
        headline: `Nothing in the registry matches “${trimmed}” yet - you'd be the first to build it.`,
        reason: "",
      },
    };
  }

  const lines = results
    .map((r) => `[${r.id}] ${r.title} - ${r.metadata?.purpose ?? r.description ?? r.type} (tags: ${(r.tags ?? []).join(", ")})`)
    .join("\n");

  const prompt = `You are the search assistant for a company's internal AI-agent registry. A teammate is looking for an agent to REUSE instead of building their own.

Their request: "${trimmed}"

Candidate agents already in the registry (pre-filtered by meaning). You may ONLY pick from these - never invent one:
${lines}

Classify the result:
- "exists": one of them clearly does what they asked.
- "closest": no exact fit, but one is a reasonable starting point.
- "none": none is genuinely relevant.

Reply with ONLY minified JSON, no markdown, no prose:
{"verdict":"exists|closest|none","best_id":"<an id from the list, or empty for none>","headline":"<=16 word plain-English answer addressed to the teammate>","reason":"<=24 words on why this agent fits their request>"}`;

  let ai: AiVerdict | null = null;
  try {
    const raw = await generateFast(prompt);
    const slice = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const json = JSON.parse(slice) as { verdict?: string; best_id?: string; headline?: string; reason?: string };
    const validId = results.some((r) => r.id === json.best_id) ? json.best_id! : null;
    const verdict: SearchVerdict = (["exists", "closest", "none"] as const).includes(json.verdict as "exists" | "closest" | "none")
      ? (json.verdict as SearchVerdict)
      : "closest";
    ai = {
      verdict: validId ? verdict : "none",
      bestId: validId,
      headline: String(json.headline ?? "").trim().slice(0, 180),
      reason: String(json.reason ?? "").trim().slice(0, 260),
    };
  } catch {
    ai = null; // graceful fallback: UI shows the ranked list with no verdict card
  }

  // Float the assistant's pick to the top of the list.
  if (ai?.bestId) {
    const idx = results.findIndex((r) => r.id === ai!.bestId);
    if (idx > 0) results.unshift(results.splice(idx, 1)[0]);
  }

  // Enrich the chosen agent with live trust signals for the answer card.
  if (ai?.bestId) {
    const [likesRes, runsRes, revRes] = await Promise.all([
      supabase.from("likes").select("*", { count: "exact", head: true }).eq("asset_id", ai.bestId),
      supabase.from("usages").select("*", { count: "exact", head: true }).eq("asset_id", ai.bestId),
      supabase.from("reviews").select("rating").eq("asset_id", ai.bestId),
    ]);
    const ratings = ((revRes.data ?? []) as { rating: number }[]).map((r) => r.rating);
    ai.best = {
      likes: likesRes.count ?? 0,
      runs: runsRes.count ?? 0,
      rating: ratings.length ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : null,
    };
  }

  return { results, ai };
}
