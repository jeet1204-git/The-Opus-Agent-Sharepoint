// AI layer - powered by OpenRouter (one key for embeddings + generation).
// OpenAI-compatible endpoints: /embeddings and /chat/completions.

const BASE = "https://openrouter.ai/api/v1";

// Embeddings: 768-dim - MUST match vector(768) in supabase/schema.sql.
const EMBED_MODEL = "openai/text-embedding-3-small";
// Two tiers, chosen per use case (we have a limited shared credit budget):
//  - QUALITY: user-facing generation a judge reads (e.g. Run an agent).
//  - FAST:    structured/utility work (auto-fill metadata, eval scoring, classify).
// Override either via env. Quality alts: anthropic/claude-opus-4.8 (max), openai/gpt-5.5.
const GEN_MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.6";
const FAST_MODEL = process.env.OPENROUTER_FAST_MODEL || "google/gemini-3.5-flash";

export const EMBED_DIMENSIONS = 768;

function key(): string {
  const k = process.env.OPENROUTER_API_KEY;
  if (!k) throw new Error("OPENROUTER_API_KEY is not set");
  return k;
}

function headers() {
  return {
    Authorization: `Bearer ${key()}`,
    "Content-Type": "application/json",
    // Optional OpenRouter attribution headers:
    "HTTP-Referer": "https://the-opus.local",
    "X-Title": "The Opus",
  };
}

/** Embed a single string into a vector for pgvector search. */
export async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${BASE}/embeddings`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ model: EMBED_MODEL, input: text, dimensions: EMBED_DIMENSIONS }),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter embed failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.data[0].embedding as number[];
}

async function complete(prompt: string, model: string): Promise<string> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter generate failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** QUALITY generation - user-facing output (e.g. Run an agent). Uses GEN_MODEL. */
export async function generate(prompt: string): Promise<string> {
  return complete(prompt, GEN_MODEL);
}

/** FAST generation - cheap utility tasks (auto-metadata, eval scoring, classify). */
export async function generateFast(prompt: string): Promise<string> {
  return complete(prompt, FAST_MODEL);
}
