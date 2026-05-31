"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function uploadAvatar(formData: FormData) {
    const profile = await requireProfile();
    const supabase = await createClient();

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) return { ok: false, message: "No file provided." };

    const path = `${profile.org_id}/${profile.id}/avatar`;

    const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true }); // upsert replaces old avatar

    if (error) return { ok: false, message: "Upload failed: " + error.message };

    // Save the path to the profiles table so it persists
    await supabase
        .from("profiles")
        .update({ avatar_url: path })
        .eq("id", profile.id);

    revalidatePath("/profile");
    return { ok: true };
}