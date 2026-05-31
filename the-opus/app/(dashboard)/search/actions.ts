"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyAdminsSearchGap } from "@/lib/notifications";

export async function reportSearchGap(query: string, verdict: string, topSimilarity: number | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from("search_gaps").insert({
    user_id: user?.id ?? null,
    query,
    verdict,
    top_similarity: topSimilarity,
  });

  await notifyAdminsSearchGap(`No strong match found for: "${query}"`);
}