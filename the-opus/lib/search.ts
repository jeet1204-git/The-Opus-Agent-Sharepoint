"use server";

import { createClient } from "@/lib/supabase/server";
import { embed } from "@/lib/gemini";
import type { SearchMatch } from "@/lib/types";

/**
 * Semantic search across the current user's org.
 * PERSON B: import and call this from the Explore/Feed search bar:
 *   const results = await searchAssets("summarize legal contracts");
 *
 * Embeds the query with Gemini, then calls the match_assets() RPC
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
    // No Gemini key / embed failure → graceful empty result rather than a crash.
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
