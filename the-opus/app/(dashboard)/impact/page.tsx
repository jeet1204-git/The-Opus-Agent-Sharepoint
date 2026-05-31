// app/impact/page.tsx
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { estimateCreationHours } from "@/lib/estimateCreationHours";
import ImpactPageClient from "./ImpactPageClient";

export default async function ImpactPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  // 1. Employee count
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("org_id", profile.org_id);

  if (error) console.error("Failed to read workspace size:", error.message);
  const dynamicEmployeeCount = count ?? 10;

  // 2. Fetch all asset content + timestamps for this org
  const { data: assets } = await supabase
    .from("assets")
    .select("id, content, created_at, updated_at")
    .eq("org_id", profile.org_id)
    .not("content", "is", null)
    .order("created_at", { ascending: true });

  const rows = assets ?? [];

  // 3. Derive time span from first created_at → last updated_at
  const earliestCreatedAt = rows[0]?.created_at ?? null;
  const latestUpdatedAt = rows.reduce(
    (latest, a) => (!latest || a.updated_at > latest ? a.updated_at : latest),
    null as string | null
  );

  // 4. Ask AI to estimate creation hours per asset
  const { totalHours } = await estimateCreationHours(
    rows.map((a) => ({ id: a.id, content: a.content ?? "" }))
  );

  return (
    <ImpactPageClient
      initialEmployeeCount={dynamicEmployeeCount}
      estimatedHoursSaved={totalHours}
      earliestCreatedAt={earliestCreatedAt}
      latestUpdatedAt={latestUpdatedAt}
    />
  );
}