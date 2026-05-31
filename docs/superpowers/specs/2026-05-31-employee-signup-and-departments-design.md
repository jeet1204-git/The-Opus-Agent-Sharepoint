# Design — Employee Signup (allowlist + verification) & Agent Departments

- **Date:** 2026-05-31
- **Project:** The Opus (Challenge 04 — internal AI-agent registry)
- **Status:** Approved (design) — building **Part A first**, Part B is the follow-up phase.

## Why
Today there's only sign-in; admins set temp passwords by hand. We want real
onboarding that reinforces the registry's **trust/governance** story (the exact
thing Challenge 04 + a BCG/business audience reward): only **verified, org-
authorized employees** get in, and reusable agent payloads can be **scoped to a
department**. No password is ever stored in readable form — employees set their
own at activation, so "nobody, not even an admin, can see a password" is a line
we can say on stage.

---

## PART A — Allowlist signup & verification (THIS plan)

### Data model
- **New table `org_allowlist`** (admin-managed authorization list):
  `id, org_id, email (unique per org, lowercased), full_name, department,
  role ('admin'|'member'), status ('invited'|'active'), activation_token (nullable),
  token_expires_at (nullable), invited_by, created_at`.
- **`profiles`**: add `department text` (nullable). Update `handle_new_user`
  trigger to read `department` from `raw_user_meta_data`.
- RLS: `org_allowlist` is **admin-only** (select/insert/update/delete gated by
  admin role within the org). The public `/signup` checks happen via a
  SECURITY DEFINER RPC or a service-role server action (not via member RLS),
  so an unauthenticated visitor can verify their email without seeing the list.

### The single source of authorization
An email gets onto `org_allowlist` **only when an admin adds it** (manually, with
name + department + role). That is the one gate. No open domain self-registration.

### Two ways in — same destination ("set your own password")
1. **Admin-initiated:** Admin adds employee → clicks **Send invite** → an
   `activation_token` is generated → (demo) the activation link is shown/copyable
   on-screen (real email is a later integration). Employee opens link → Set
   Password → `active`.
2. **Employee-initiated:** Employee visits **`/signup`**, enters their email:
   - **not on list** → reject: *"This email isn't registered by your organization."*
   - **on list, `active`** → *"Account exists — sign in."* (link to /login)
   - **on list, `invited`** → generate/refresh `activation_token` → show the
     Set-Password step (same as the invite link) → `active`.

### Activation (Set Password) — the technical flow
- Route **`/signup`** (public; add to proxy allowlist) → email-check step.
- Route **`/signup/set-password?token=…`** (public) → validates token + expiry
  against `org_allowlist`, then on submit:
  1. Create the Supabase Auth user via the **service-role admin API**
     (`createUser`, `email_confirm: true`, password = user's chosen password,
     `user_metadata: { full_name, org_id, role, department }`).
  2. The `handle_new_user` trigger creates the `profiles` row (incl. department).
  3. Mark the `org_allowlist` row `active`, clear the token.
  4. Auto sign-in (`signInWithPassword` with the just-set password) → redirect
     to `/feed`. (Fallback: if sign-in fails, redirect to `/login` with a success
     message.)
- Passwords are hashed by Supabase Auth; we never read or store them.

### Admin panel additions (`/admin`)
- **Invite employee** form: email, full name, department (preset list), role.
  On submit → insert `org_allowlist` row (`invited`). Optional **Send invite** →
  generate token + reveal the activation link to copy.
- **Roster table**: name, email, department, role, status. Actions: **Copy
  invite link** (if invited), **Reset** (regenerate token; for active users this
  is the "forgot password" path), **Remove**.
- **Export CSV**: downloads the roster — name, email, department, role, status,
  created — **no passwords**.

### Edge cases
- Email compare is case-insensitive / trimmed.
- Token single-use + expiry (e.g. 7 days); expired → "ask your admin to re-send."
- Re-adding an existing email → no duplicate (unique constraint; surface a clear msg).
- Optional defense-in-depth: also reject emails whose domain isn't in the org's
  allowed domain(s) — but allowlist membership is the real gate.

### Verification / testing
- `npm run build` clean (Next 16 typecheck).
- Live browser run: admin adds an email → copy link → set password → land in app
  with correct department/role on the profile; self-signup happy path + all three
  reject/active/invited branches; CSV downloads with no password column.

---

## PART B — Agent departments & content-gating (NEXT phase, sketch)
- `assets`: add `department text` + `restricted boolean default false`.
- Publish page: Department dropdown + toggle *"Who can use this: Everyone /
  Only [department]."*
- **Content-gating (Jeet's model):** a restricted agent is **discoverable by
  everyone** (title, description, metadata, trust signals) but its **payload**
  (`content` / system prompt / `file_url` / the Run button) is served **only** to
  that department (+ admins). Others see a 🔒 "Finance only" state. Enforced
  **server-side** — payload is never sent to an unauthorized viewer (RLS is row-
  level, so column/payload gating lives in the detail page + run/download actions).
- Filter on feed/search: "Available to everyone" + filter-by-department.
- Seed: set `department` on existing demo teammates + tag a couple agents as
  restricted so the gate demos well.

## Out of scope (YAGNI)
Real transactional email provider (later), SSO/SAML, per-user password policies,
multi-org domain management UI, audit log of invites.
