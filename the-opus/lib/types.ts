// Shared domain types — the A↔B contract. Mirror of supabase/schema.sql.

export type AssetType = "agent" | "skill" | "prompt";
export type UserRole = "admin" | "member";
export type UsageAction = "download" | "run";

export interface AssetMetadata {
  purpose?: string;
  requirements?: string;
  tools?: string[];
  when_not_to_use?: string;
  framework?: string; // e.g. "LangChain" | "CrewAI" | "AutoGen" | "raw"
}

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  org_id: string | null;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url?: string | null;
  department: string | null;
  created_at: string;
}

export type AllowlistStatus = "invited" | "active";

export interface AllowlistEntry {
  id: string;
  org_id: string;
  email: string;
  full_name: string | null;
  department: string | null;
  role: UserRole;
  status: AllowlistStatus;
  activation_token: string | null;
  token_expires_at: string | null;
  invited_by: string | null;
  created_at: string;
}

export interface Asset {
  id: string;
  org_id: string;
  owner_id: string;
  type: AssetType;
  title: string;
  description: string | null;
  metadata: AssetMetadata;
  content: string | null;
  file_url: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface AssetVersion {
  id: string;
  asset_id: string;
  version_label: string;
  changelog: string | null;
  content: string | null;
  file_url: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  asset_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface SearchMatch {
  id: string;
  type: AssetType;
  title: string;
  description: string | null;
  metadata: AssetMetadata;
  tags: string[];
  owner_id: string;
  created_at: string;
  similarity: number;
}
