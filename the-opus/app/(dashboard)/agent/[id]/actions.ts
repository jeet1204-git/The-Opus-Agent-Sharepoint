"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function toggleLike(assetId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();
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
