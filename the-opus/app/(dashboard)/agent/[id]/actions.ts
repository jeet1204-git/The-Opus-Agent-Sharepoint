"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { canUsePayload } from "@/lib/access";

/**
 * Department gating for SOCIAL actions (like / review). You can only endorse or
 * review an agent you can actually use - restricted agents stay discoverable
 * (title/trust visible) but their department owns the social signals too.
 * Mirrors the payload gate in lib/run.ts. Never trust the client.
 */
async function assertCanEndorse(
  supabase: Awaited<ReturnType<typeof createClient>>,
  assetId: string,
  profile: { role: string; department?: string | null },
) {
  const { data: asset } = await supabase
    .from("assets")
    .select("department, restricted")
    .eq("id", assetId)
    .single();
  if (asset && !canUsePayload(asset, profile)) {
    throw new Error(`Restricted: only the ${asset.department} department can endorse or review this agent.`);
  }
}

export async function toggleLike(assetId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await assertCanEndorse(supabase, assetId, profile);
  const { data: existing } = await supabase
    .from("likes")
    .select("asset_id")
    .eq("asset_id", assetId)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("asset_id", assetId).eq("user_id", profile.id);
  } else {
    await supabase.from("likes").insert({ asset_id: assetId, user_id: profile.id });
  }
  revalidatePath(`/agent/${assetId}`);
}

export async function addReview(assetId: string, rating: number, comment: string) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await assertCanEndorse(supabase, assetId, profile);
  await supabase.from("reviews").insert({
    asset_id: assetId,
    user_id: profile.id,
    rating: Math.max(1, Math.min(5, rating)),
    comment: comment.trim() || null,
  });
  revalidatePath(`/agent/${assetId}`);
}

export async function logDownload(assetId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();
  await supabase.from("usages").insert({ asset_id: assetId, user_id: profile.id, action: "download" });
  revalidatePath(`/agent/${assetId}`);
}
