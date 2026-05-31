"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const expiry = () => new Date(Date.now() + TOKEN_TTL_MS).toISOString();
const newToken = () =>
  crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

/** Admin: add an employee email to the org allowlist (status: invited). */
export async function inviteEmployee(formData: FormData) {
  const admin = await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const full_name = String(formData.get("full_name") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const role = String(formData.get("role") ?? "member") === "admin" ? "admin" : "member";

  if (!email) redirect("/admin?error=" + encodeURIComponent("Email is required"));

  const supabase = await createClient();
  const { error } = await supabase.from("org_allowlist").insert({
    org_id: admin.org_id,
    email,
    full_name: full_name || null,
    department: department || null,
    role,
    status: "invited",
    activation_token: newToken(),
    token_expires_at: expiry(),
    invited_by: admin.id,
  });

  if (error) {
    const msg = error.code === "23505" ? "That email is already on the list." : error.message;
    redirect("/admin?error=" + encodeURIComponent(msg));
  }

  revalidatePath("/admin");
  redirect("/admin?ok=invited");
}

/** Admin: re-issue a fresh activation link for an invited employee. */
export async function regenerateInvite(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin?error=" + encodeURIComponent("Missing id"));

  const supabase = await createClient();
  await supabase
    .from("org_allowlist")
    .update({ activation_token: newToken(), token_expires_at: expiry() })
    .eq("id", id)
    .eq("status", "invited");

  revalidatePath("/admin");
  redirect("/admin?ok=reissued");
}

/** Admin: remove an invited employee from the allowlist. */
export async function removeInvite(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin?error=" + encodeURIComponent("Missing id"));

  const supabase = await createClient();
  await supabase.from("org_allowlist").delete().eq("id", id).eq("status", "invited");

  revalidatePath("/admin");
  redirect("/admin?ok=removed");
}
