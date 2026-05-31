import { NextResponse } from "next/server";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { embed } from "@/lib/ai";
import type { AssetMetadata, AssetType } from "@/lib/types";

interface DemoAsset {
  type: AssetType;
  title: string;
  description: string;
  metadata: AssetMetadata;
  content: string;
  tags: string[];
}

// Realistic enterprise agents so the feed + semantic search + final demo
// aren't empty. Admin visits GET /api/seed once.
const DEMO: DemoAsset[] = [
  {
    type: "agent",
    title: "Legal Brief Summarizer",
    description: "Turns long legal briefs into structured summaries: parties, claims, risks.",
    metadata: {
      purpose: "Read a legal brief and extract parties, claims, obligations, and risk flags into a structured summary.",
      requirements: "Plain-text or PDF brief under ~50 pages. English only.",
      tools: ["pdf_reader", "structured_output"],
      when_not_to_use: "Not for non-English documents or for producing binding legal advice.",
      framework: "LangChain",
    },
    content:
      "You are a legal analyst. Given a legal brief, return JSON with: parties[], claims[], obligations[], risk_flags[], and a 3-sentence plain-English summary.",
    tags: ["legal", "summarization", "llm"],
  },
  {
    type: "agent",
    title: "Support Ticket Triager",
    description: "Classifies inbound support tickets by severity, component, and routes to the right queue.",
    metadata: {
      purpose: "Classify a support ticket (severity, component, customer sentiment) and recommend a routing queue.",
      requirements: "Raw ticket text. Optional customer tier.",
      tools: ["classifier", "knowledge_base_search"],
      when_not_to_use: "Don't use for security incidents - those must go to the on-call security path directly.",
      framework: "CrewAI",
    },
    content:
      "You triage support tickets. Output severity (CRITICAL/HIGH/MEDIUM/LOW), component, sentiment, and recommended_queue with a one-line reason.",
    tags: ["support", "triage", "classification"],
  },
  {
    type: "prompt",
    title: "Marketing Copy Generator",
    description: "Generates on-brand marketing copy variants for a product and audience.",
    metadata: {
      purpose: "Produce 3 marketing copy variants (headline + body) tuned to a product, audience, and tone.",
      requirements: "Product description, target audience, desired tone.",
      tools: [],
      when_not_to_use: "Avoid for regulated claims (medical, financial) without compliance review.",
      framework: "raw prompt",
    },
    content:
      "Write 3 marketing copy variants for {{product}} aimed at {{audience}} in a {{tone}} tone. Each: a headline (<=10 words) and 2-sentence body.",
    tags: ["marketing", "copywriting", "content"],
  },
  {
    type: "agent",
    title: "Resume Screener",
    description: "Scores resumes against a job description with explainable criteria.",
    metadata: {
      purpose: "Score a resume against a job description across must-have and nice-to-have criteria, with rationale.",
      requirements: "Resume text + structured job description.",
      tools: ["pdf_reader", "structured_output"],
      when_not_to_use: "Never use as the sole hiring decision; outputs must have human review (bias risk).",
      framework: "AutoGen",
    },
    content:
      "Score this resume against the job description. Return overall_fit (0-100), met_criteria[], missing_criteria[], and a 2-sentence rationale. Do not infer protected attributes.",
    tags: ["hr", "recruiting", "scoring"],
  },
  {
    type: "skill",
    title: "SQL Query Explainer",
    description: "Explains what a SQL query does in plain English and flags risky operations.",
    metadata: {
      purpose: "Explain a SQL query in plain English and flag destructive or expensive operations.",
      requirements: "A single SQL statement or short script.",
      tools: [],
      when_not_to_use: "Not a substitute for query-plan analysis on production performance issues.",
      framework: "raw prompt",
    },
    content:
      "Explain what this SQL does in 3 sentences, list tables touched, and flag any DELETE/UPDATE/DROP or full-table scans as warnings.",
    tags: ["data", "sql", "developer"],
  },
  {
    type: "agent",
    title: "Invoice Data Extractor",
    description: "Extracts structured line items and totals from invoice PDFs.",
    metadata: {
      purpose: "Extract vendor, invoice number, line items, taxes, and total from an invoice into structured JSON.",
      requirements: "Machine-readable invoice PDF (not scanned images without OCR).",
      tools: ["pdf_reader", "ocr", "structured_output"],
      when_not_to_use: "Don't trust totals without a validation pass; OCR on low-quality scans is unreliable.",
      framework: "LangChain",
    },
    content:
      "Extract from this invoice: vendor, invoice_number, date, line_items[{description, qty, unit_price, amount}], tax, total. Return JSON only.",
    tags: ["finance", "extraction", "documents"],
  },
  {
    type: "skill",
    title: "Meeting Notes to Action Items",
    description: "Converts raw meeting notes into owners, action items, and deadlines.",
    metadata: {
      purpose: "Turn raw meeting notes into a list of action items with owner, task, and deadline, plus decisions made.",
      requirements: "Raw notes or transcript text.",
      tools: [],
      when_not_to_use: "Not reliable for legally binding commitments without confirmation from attendees.",
      framework: "raw prompt",
    },
    content:
      "From these meeting notes, extract action_items[{owner, task, deadline}] and decisions[]. Keep owners as named in the notes.",
    tags: ["productivity", "meetings", "summarization"],
  },
  {
    type: "agent",
    title: "PR Review Assistant",
    description: "Reviews a code diff for bugs, risks, and missing tests with concrete suggestions.",
    metadata: {
      purpose: "Review a pull-request diff and surface likely bugs, security risks, and missing test coverage.",
      requirements: "A unified diff and optional PR description.",
      tools: ["code_analysis"],
      when_not_to_use: "Not a replacement for running the test suite or a human security review on auth/crypto code.",
      framework: "raw prompt",
    },
    content:
      "Review this diff. Return issues[{severity, file, line, problem, suggestion}] and a list of tests that should be added. Be specific and concise.",
    tags: ["devops", "code-review", "engineering"],
  },
];

export async function GET() {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (profile.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const supabase = await createClient();

  // Don't double-seed.
  const { count } = await supabase
    .from("assets")
    .select("id", { count: "exact", head: true })
    .eq("org_id", profile.org_id);
  if ((count ?? 0) > 0) {
    return NextResponse.json({
      skipped: true,
      message: `Org already has ${count} assets - seed skipped.`,
    });
  }

  const created: string[] = [];
  let embeddedCount = 0;

  for (const a of DEMO) {
    let embedding: number[] | null = null;
    try {
      const text = [
        a.title,
        a.description,
        a.metadata.purpose,
        (a.metadata.tools ?? []).join(" "),
        a.tags.join(" "),
        a.content,
      ]
        .filter(Boolean)
        .join("\n");
      embedding = await embed(text);
      embeddedCount++;
    } catch {
      embedding = null; // no OpenRouter key / quota - still seed, just no vector
    }

    const { data, error } = await supabase
      .from("assets")
      .insert({
        org_id: profile.org_id,
        owner_id: profile.id,
        type: a.type,
        title: a.title,
        description: a.description,
        metadata: a.metadata,
        content: a.content,
        tags: a.tags,
        embedding,
      })
      .select("id")
      .single();

    if (!error && data) {
      await supabase.from("versions").insert({
        asset_id: data.id,
        version_label: "v1",
        content: a.content,
      });
      created.push(data.id);
    }
  }

  return NextResponse.json({
    ok: true,
    created: created.length,
    embedded: embeddedCount,
    message:
      embeddedCount === 0
        ? "Seeded without embeddings (check OPENROUTER_API_KEY for semantic search)."
        : `Seeded ${created.length} agents with ${embeddedCount} embeddings.`,
  });
}
