// app/impact/page.tsx
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ImpactPageClient from "./ImpactPageClient";

export default async function ImpactPage() {
  // 1. Enforce authentication and grab the active employee's profile details
  const profile = await requireProfile();
  const supabase = await createClient();

  // 2. Fetch the number of unique employee profiles sharing the same workspace organization ID
  const { count, error } = await supabase
    .from("profiles") // Matches your standard collection naming strategy
    .select("*", { count: "exact", head: true })
    .eq("org_id", profile.org_id);

  if (error) {
    console.error("Failed to read workspace size:", error.message);
  }

  // Fallback gracefully to your baseline team of 10 if the table returns empty or fails
  const dynamicEmployeeCount = count ?? 10;

  // 3. Render the interactive client view, feeding it the real database metrics
  return <ImpactPageClient initialEmployeeCount={dynamicEmployeeCount} />;
}