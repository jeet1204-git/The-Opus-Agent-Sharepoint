"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";

/** Admin-only: create a new user inside the admin's organization. */
export async function createOrgUser(formData: FormData) {
  const admin = await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const full_name = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "member");

  if (!email || !password) {
    redirect("/admin?error=" + encodeURIComponent("Email and password are required"));
  }

  const sb = createAdminClient();
  const { error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, org_id: admin.org_id, role },
  });

  if (error) {
    redirect("/admin?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/admin");
  redirect("/admin?ok=1");
}
