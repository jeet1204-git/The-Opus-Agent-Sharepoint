"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { embed } from "@/lib/ai";
import {
  validateContract,
  hasBlockingErrors,
  type ContractIssue,
} from "@/lib/validation";
import type { AssetMetadata, AssetType } from "@/lib/types";

export interface UploadState {
  ok: boolean;
  issues: ContractIssue[];
  message?: string;
}

function parseList(v: FormDataEntryValue | null): string[] {
  return String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createAsset(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const profile = await requireProfile();

  const type = String(formData.get("type") ?? "agent") as AssetType;
  const title = String(formData.get("title") ?? "");
  const description = String(formData.get("description") ?? "");
  const content = String(formData.get("content") ?? "");
  const metadata: AssetMetadata = {
    purpose: String(formData.get("purpose") ?? ""),
    requirements: String(formData.get("requirements") ?? ""),
    tools: parseList(formData.get("tools")),
    when_not_to_use: String(formData.get("when_not_to_use") ?? ""),
    framework: String(formData.get("framework") ?? ""),
  };
  const tags = parseList(formData.get("tags"));
  const department = String(formData.get("department") ?? "").trim() || null;
  // Only meaningful when a department is chosen.
  const restricted = formData.get("restricted") === "on" && !!department;
  const file = formData.get("file") as File | null;
  const hasFile = !!file && file.size > 0;

  // 1. Contract validation
  const issues = validateContract({ type, title, description, content, hasFile, metadata });
  if (hasBlockingErrors(issues)) {
    return { ok: false, issues, message: "Fix the errors below before publishing." };
  }

  const supabase = await createClient();

  // 2. Optional file → storage
  let file_url: string | null = null;
  if (hasFile && file) {
    const path = `${profile.org_id}/${crypto.randomUUID()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("assets").upload(path, file);
    if (upErr) {
      return { ok: false, issues, message: "File upload failed: " + upErr.message };
    }
    file_url = path;
  }

  // 3. Embedding (graceful if no OpenRouter key yet)
  let embedding: number[] | null = null;
  try {
    const text = [
      title,
      description,
      metadata.purpose,
      (metadata.tools ?? []).join(" "),
      tags.join(" "),
      content,
    ]
      .filter(Boolean)
      .join("\n");
    embedding = await embed(text);
  } catch {
    embedding = null;
  }

  // 4. Insert asset
  const { data, error } = await supabase
    .from("assets")
    .insert({
      org_id: profile.org_id,
      owner_id: profile.id,
      type,
      title,
      description,
      metadata,
      content,
      file_url,
      tags,
      department,
      restricted,
      embedding,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, issues, message: "Could not save: " + error.message };
  }

  // 5. Initial version
  await supabase.from("versions").insert({
    asset_id: data.id,
    version_label: "v1",
    content,
    file_url,
  });

  revalidatePath("/feed");
  redirect(`/agent/${data.id}`);
}
