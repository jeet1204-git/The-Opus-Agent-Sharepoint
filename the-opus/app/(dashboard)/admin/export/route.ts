import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AllowlistEntry } from "@/lib/types";

function csvCell(v: string | null): string {
  const s = (v ?? "").replace(/"/g, '""');
  return `"${s}"`;
}

/** Admin-only: download the org roster as CSV. Never includes passwords. */
export async function GET() {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("org_allowlist")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at");

  const rows = (data as AllowlistEntry[]) ?? [];
  const header = ["Full name", "Email", "Department", "Role", "Status", "Invited at"];
  const lines = [header.map(csvCell).join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvCell(r.full_name),
        csvCell(r.email),
        csvCell(r.department),
        csvCell(r.role),
        csvCell(r.status),
        csvCell(r.created_at),
      ].join(",")
    );
  }

  const csv = lines.join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="opus-roster-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
