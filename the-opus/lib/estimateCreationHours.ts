"use server";

import { generateFast } from "@/lib/ai";

type AssetScore = {
  assetId: string;
  length: number;
  complexity: number;
  specificity: number;
  hoursEstimate: number;
};

export type EstimationResult = {
  assets: AssetScore[];
  totalHours: number;
};

/**
 * Uses the fast LLM to score each asset's content on three dimensions (0–1),
 * then derives estimated hours it would take to create each one from scratch.
 * Batches all assets into a single call to keep costs low.
 *
 * hours_per_asset = (length + complexity + specificity) × 0.5
 * max = 1.5 hrs, realistic mid ≈ 0.75 hrs
 */
export async function estimateCreationHours(
  assets: { id: string; content: string }[]
): Promise<EstimationResult> {
  if (assets.length === 0) return { assets: [], totalHours: 0 };

  // Truncate long content - we only need enough to judge difficulty
  const MAX_CHARS = 600;
  const payload = assets.map((a) => ({
    id: a.id,
    content: a.content.length > MAX_CHARS ? a.content.slice(0, MAX_CHARS) + "…" : a.content,
  }));

  const prompt = `You evaluate AI agent prompts to estimate how long a skilled engineer would take to write each from scratch.

Score each on three dimensions from 0.0 to 1.0:
- length: how long and detailed is the content? (0 = one sentence, 1 = very long multi-section)
- complexity: how much logic, branching, or multi-step reasoning? (0 = single instruction, 1 = highly complex)
- specificity: how domain-specific or customised? (0 = generic e.g. "summarise text", 1 = deeply tailored workflow)

Reply ONLY with minified JSON - no markdown, no backticks, no explanation:
[{"id":"...","length":0.0,"complexity":0.0,"specificity":0.0}]

Assets:
${JSON.stringify(payload)}`;

  try {
    const raw = await generateFast(prompt);

    // Strip any accidental markdown fences
    const clean = raw.replace(/```json|```/g, "").trim();
    const start = clean.indexOf("[");
    const end = clean.lastIndexOf("]") + 1;
    const scores: { id: string; length: number; complexity: number; specificity: number }[] =
      JSON.parse(clean.slice(start, end));
    
    const scoredAssets: AssetScore[] = scores.map((s) => {
      const sum = (s.length ?? 0) + (s.complexity ?? 0) + (s.specificity ?? 0);
      return {
        assetId: s.id,
        length: s.length,
        complexity: s.complexity,
        specificity: s.specificity,
        hoursEstimate: sum * 0.5,
      };
    });

    console.log("[estimateCreationHours] scoredAssets:", scoredAssets);

    const totalHours = scoredAssets.reduce((acc, a) => acc + a.hoursEstimate, 0) * 0.5;

    return { assets: scoredAssets, totalHours };
  } catch (err) {
    console.error("[estimateCreationHours] scoring failed:", err);
    // Graceful fallback: 0.5 hrs per asset
    const fallback = assets.map((a) => ({
      assetId: a.id,
      length: 0.33,
      complexity: 0.33,
      specificity: 0.33,
      hoursEstimate: 0.5,
    }));
    return { assets: fallback, totalHours: fallback.length * 0.5 };
  }
}