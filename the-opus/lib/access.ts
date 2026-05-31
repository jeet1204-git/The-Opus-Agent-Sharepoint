// Department content-gating. A restricted agent stays *discoverable* by everyone
// (title, description, metadata, trust signals) but its reusable PAYLOAD
// (content / system prompt / file / Run) is served only to its department + admins.

export interface Gateable {
  restricted?: boolean | null;
  department?: string | null;
}
export interface Viewer {
  role: string;
  department?: string | null;
}

/** Can this viewer access the agent's reusable payload (content/file/Run)? */
export function canUsePayload(asset: Gateable, viewer: Viewer): boolean {
  if (!asset.restricted) return true; // open to the whole org
  if (viewer.role === "admin") return true; // admins always can
  if (!asset.department) return true; // restricted but unscoped → treat as open
  return (viewer.department ?? null) === asset.department;
}
