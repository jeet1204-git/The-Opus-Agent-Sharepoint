"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Notify all admin users that a new search gap was found.
 * Call this from any server action after detecting a search gap.
 *
 * @param gapSummary  Short description shown in the notification body
 */
export async function notifyAdminsSearchGap(gapSummary: string) {
  const supabase = await createClient();

  // 1. Fetch all admin profile IDs
  const { data: admins, error: adminError } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (adminError) {
    console.error("[notifications] Failed to fetch admins:", adminError);
    return;
  }

  if (!admins || admins.length === 0) return;

  // 2. Insert one notification row per admin
  const rows = admins.map((admin) => ({
    user_id: admin.id,
    title: "New Search Gap Detected",
    message: gapSummary,
    link: "/search-gaps",
  }));

  const { error: insertError } = await supabase
    .from("notifications")
    .insert(rows);

  if (insertError) {
    console.error("[notifications] Failed to insert notifications:", insertError);
  }
}

/**
 * Generic helper — send a notification to a specific user.
 * Also a server action, so call it from other server actions directly.
 */
export async function notifyUser({
  userId,
  title,
  message,
  link,
}: {
  userId: string;
  title: string;
  message: string;
  link?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title,
    message,
    link: link ?? null,
  });

  if (error) {
    console.error("[notifications] Failed to notify user:", error);
  }
}