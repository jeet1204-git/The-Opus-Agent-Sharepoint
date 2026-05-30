// AI layer — powered by OpenRouter (one key for embeddings + generation).
// OpenAI-compatible endpoints: /embeddings and /chat/completions.

const BASE = "https://openrouter.ai/api/v1";

// Embeddings: 768-dim — MUST match vector(768) in supabase/schema.sql.
const EMBED_MODEL = "openai/text-embedding-3-small";
// Generation model (override with OPENROUTER_MODEL). Used by Phase 2 features.
const GEN_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

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

/** One-shot text generation (Phase 2: auto-metadata, run agent, eval). */
export async function generate(prompt: string): Promise<string> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: GEN_MODEL,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenRouter generate failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
