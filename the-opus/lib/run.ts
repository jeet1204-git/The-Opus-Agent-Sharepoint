"use server";

import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { generate } from "@/lib/ai";

export interface RunResult {
  output: string;
  error?: string;
}

/**
 * Execute an agent live via OpenRouter, and log a 'run' usage event.
 * PERSON B: drop <RunAgent assetId={id} /> onto the detail page; it calls this.
 */
export async function runAgent(assetId: string, userInput: string): Promise<RunResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: asset, error } = await supabase
    .from("assets")
    .select("title, content")
    .eq("id", assetId)
    .single();

  if (error || !asset) return { output: "", error: "Agent not found." };
  if (!asset.content) return { output: "", error: "This agent has no runnable content." };

  const prompt = [
    asset.content,
    "\n\n--- USER INPUT ---",
    userInput || "(no input provided)",
    "--- END INPUT ---",
    "\nRespond exactly as the agent defined above would.",
  ].join("\n");

  let output: string;
  try {
    output = await generate(prompt);
  } catch (e) {
    return { output: "", error: "Run failed: " + (e as Error).message };
  }

  // Log usage (best-effort; powers "used by N" trust signal).
  await supabase.from("usages").insert({
    asset_id: assetId,
    user_id: profile.id,
    action: "run",
  });

  return { output };
}
