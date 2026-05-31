// One-off: create believable demo teammates in Acme Corp via the service-role
// admin API. The on_auth_user_created trigger auto-creates each profile from
// user_metadata. Idempotent-ish: skips emails that already exist.
//
//   node scripts/seed-team.mjs
//
// Reads NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- tiny .env.local loader (no dotenv dep) ---
const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const ORG_ID = "d4ee0984-d9ff-45ee-b938-9833c53ce491"; // Acme Corp
const PASSWORD = "Opus!Demo2026";

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Realistic enterprise teammates across functions. role member except one lead.
const TEAM = [
  { full_name: "Sarah Chen",     email: "sarah.chen@acme.test",     role: "member" },
  { full_name: "Marco Rossi",    email: "marco.rossi@acme.test",    role: "member" },
  { full_name: "Lena Hoffmann",  email: "lena.hoffmann@acme.test",  role: "member" },
  { full_name: "Priya Nair",     email: "priya.nair@acme.test",     role: "member" },
  { full_name: "Tom Becker",     email: "tom.becker@acme.test",     role: "member" },
  { full_name: "Yuki Tanaka",    email: "yuki.tanaka@acme.test",    role: "member" },
  { full_name: "David Okafor",   email: "david.okafor@acme.test",   role: "member" },
];

// list existing to avoid dup-create noise
const { data: existing } = await sb.auth.admin.listUsers({ perPage: 1000 });
const have = new Set((existing?.users ?? []).map((u) => u.email));

for (const t of TEAM) {
  if (have.has(t.email)) {
    console.log("skip (exists):", t.email);
    continue;
  }
  const { data, error } = await sb.auth.admin.createUser({
    email: t.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: t.full_name, org_id: ORG_ID, role: t.role },
  });
  if (error) console.error("ERR", t.email, error.message);
  else console.log("created:", t.full_name, "->", data.user.id);
}

console.log("done.");
