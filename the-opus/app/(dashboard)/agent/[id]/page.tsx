import { notFound } from "next/navigation";
import AgentDetailPageClient from "./AgentDetailPageClient";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: asset } = await supabase
    .from("assets")
    .select(
      "*, profiles!owner_id(full_name), reviews(id, rating, comment, created_at, profiles!user_id(full_name)), versions(id, version_label, changelog, created_at), likes(count), usages(count)"
    )
    .eq("id", id)
    .single();

  if (!asset) notFound();

  const { data: myLike } = await supabase
    .from("likes")
    .select("asset_id")
    .eq("asset_id", id)
    .eq("user_id", profile.id)
    .maybeSingle();

  return <AgentDetailPageClient agent={asset} liked={!!myLike} />;
}
