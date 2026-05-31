"use server";

import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Activation tokens live for 7 days.
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function newToken(): string {
  return (
    crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "")
  );
}

export type EmailCheck =
  | { status: "not_found" }
  | { status: "active" }
  | { status: "invited" };

/**
 * Public: is this email authorized to sign up? Runs with the service role so an
 * unauthenticated visitor can be checked WITHOUT the allowlist being readable
 * by anyone. Returns only a coarse status - never the row.
 */
export async function checkSignupEmail(emailRaw: string): Promise<EmailCheck> {
  const email = emailRaw.trim().toLowerCase();
  if (!email) return { status: "not_found" };

  const sb = createAdminClient();
  const { data } = await sb
    .from("org_allowlist")
    .select("status")
    .ilike("email", email)
    .maybeSingle();

  if (!data) return { status: "not_found" };
  return { status: data.status === "active" ? "active" : "invited" };
}

/**
 * Public: an invited employee (or the admin's invite flow) asks for an
 * activation link. Generates + stores a single-use token and returns it so the
 * caller can build the /signup/set-password link. (Email delivery is simulated
 * for the demo - the link is shown on-screen.)
 */
export async function requestActivation(
  emailRaw: string
): Promise<{ ok: boolean; token?: string; status?: "active" | "not_found"; message?: string }> {
  const email = emailRaw.trim().toLowerCase();
  if (!email) return { ok: false, status: "not_found" };

  const sb = createAdminClient();
  const { data: row } = await sb
    .from("org_allowlist")
    .select("id, status")
    .ilike("email", email)
    .maybeSingle();

  if (!row) {
    return { ok: false, status: "not_found", message: "This email isn't registered by your organization." };
  }
  if (row.status === "active") {
    return { ok: false, status: "active", message: "Account already exists - please sign in." };
  }

  const token = newToken();
  const { error } = await sb
    .from("org_allowlist")
    .update({ activation_token: token, token_expires_at: new Date(Date.now() + TOKEN_TTL_MS).toISOString() })
    .eq("id", row.id);

  if (error) return { ok: false, message: "Could not start activation. Try again." };
  return { ok: true, token };
}

export interface ActivateState {
  error?: string;
}

/**
 * Public (token-gated): validate the activation token, create the Supabase Auth
 * user with the employee's CHOSEN password, mark the allowlist row active, then
 * auto sign-in and land in the app. Passwords are hashed by Supabase - never
 * stored or readable by us.
 */
export async function activateAccount(
  _prev: ActivateState,
  formData: FormData
): Promise<ActivateState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords don't match." };

  const sb = createAdminClient();
  const { data: row } = await sb
    .from("org_allowlist")
    .select("*")
    .eq("activation_token", token)
    .maybeSingle();

  if (!token || !row) return { error: "This activation link is invalid. Ask your admin to re-send it." };
  if (row.status === "active") return { error: "This account is already active - please sign in." };
  if (row.token_expires_at && new Date(row.token_expires_at).getTime() < Date.now()) {
    return { error: "This activation link has expired. Ask your admin to re-send it." };
  }

  const email = (row.email as string).toLowerCase();

  const { error: createErr } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: row.full_name ?? "",
      org_id: row.org_id,
      role: row.role,
      department: row.department ?? "",
    },
  });

  if (createErr) {
    // Most likely: the auth user already exists.
    return { error: "Could not activate this account. It may already exist - try signing in." };
  }

  await sb
    .from("org_allowlist")
    .update({ status: "active", activation_token: null, token_expires_at: null })
    .eq("id", row.id);

  // Auto sign-in (sets the session cookie), then land in the app.
  const cookieClient = await createClient();
  const { error: signInErr } = await cookieClient.auth.signInWithPassword({ email, password });
  if (signInErr) redirect("/login?ok=activated");
  redirect("/feed");
}
