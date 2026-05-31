// Agent "contract" validation - a named challenge requirement.
// An asset is only reusable by another team if its contract is complete:
// purpose, runnable content, tool needs, and explicit "when NOT to use".

import type { AssetType, AssetMetadata } from "@/lib/types";

export type IssueLevel = "error" | "warning";

export interface ContractIssue {
  field: string;
  level: IssueLevel;
  message: string;
}

export interface ContractInput {
  type: AssetType | string;
  title: string;
  description: string;
  content: string;
  hasFile: boolean;
  metadata: AssetMetadata;
}

const VALID_TYPES: AssetType[] = ["agent", "skill", "prompt"];

/**
 * Returns a list of issues. `error`-level issues block publishing;
 * `warning`-level issues are surfaced but allow publishing.
 */
export function validateContract(input: ContractInput): ContractIssue[] {
  const issues: ContractIssue[] = [];
  const m = input.metadata ?? {};

  // - Errors (block) -
  if (!input.title.trim()) {
    issues.push({ field: "title", level: "error", message: "Title is required." });
  }
  if (!VALID_TYPES.includes(input.type as AssetType)) {
    issues.push({ field: "type", level: "error", message: "Type must be agent, skill, or prompt." });
  }
  if (!input.content.trim() && !input.hasFile) {
    issues.push({ field: "content", level: "error", message: "Provide runnable content (prompt/config) or upload a file - storage alone isn't reuse." });
  }
  if (!m.purpose?.trim()) {
    issues.push({ field: "purpose", level: "error", message: "Purpose is required so another team knows what this does." });
  }

  // - Warnings (allow, but flag: completeness = trust) -
  if (!m.when_not_to_use?.trim()) {
    issues.push({ field: "when_not_to_use", level: "warning", message: "No 'when NOT to use' - reuse is risky without boundaries." });
  }
  if (input.type === "agent" && (!m.tools || m.tools.length === 0)) {
    issues.push({ field: "tools", level: "warning", message: "No tools listed - agents usually need to declare their tool dependencies." });
  }
  if (!input.description.trim()) {
    issues.push({ field: "description", level: "warning", message: "A short description helps discovery." });
  }

  // - Config sanity: if framework looks like JSON config, check it parses -
  const fw = (m.framework ?? "").toLowerCase();
  if (input.content.trim() && (fw.includes("json") || input.content.trim().startsWith("{"))) {
    try {
      JSON.parse(input.content);
    } catch {
      issues.push({ field: "content", level: "warning", message: "Content looks like JSON but doesn't parse - double-check the config." });
    }
  }

  return issues;
}

export function hasBlockingErrors(issues: ContractIssue[]): boolean {
  return issues.some((i) => i.level === "error");
}
