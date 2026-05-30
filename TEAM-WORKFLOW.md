# Team Git Workflow — The Opus

> The app lives in **`the-opus/`**, not the repo root. Always `cd the-opus` to run it.
> Secrets live in `the-opus/.env.local` (gitignored). Share keys over DM, never commit them.

## Daily loop

**A. Sync before new work**
```bash
git checkout main
git pull origin main
```

**B. Create a feature branch** (small + descriptive)
```bash
git checkout -b feature/your-feature-name
```

**C. Code and commit**
```bash
git add .
git commit -m "Add basic layout for login page"
```

**D. Push your branch**
```bash
git push origin feature/your-feature-name
```

**E. Merge via Pull Request**
1. On GitHub, open a PR: `feature/...` → `main`.
2. A teammate gives it a quick 2-min glance and clicks **Merge** (velocity > heavy review this weekend).
3. Delete the merged branch.
4. **Everyone immediately runs** `git checkout main && git pull origin main`.

## 5 rules that prevent 90% of git pain
1. **Foundation lives on `main`.** Schema, Supabase client, shared layout/nav — already on main. Branch from it.
2. **Pull `main` often.** After every merge, `git pull origin main` into your branch. Small syncs = tiny conflicts.
3. **Small branches, merge fast.** `feature/login`, `feature/upload`, `feature/detail` — not one mega-branch.
4. **DB schema is committed** at `the-opus/supabase/schema.sql`. Schema change = edit that file + commit + tell the team.
5. **Watch shared files:** `package.json` + lockfile, and `app/(dashboard)/layout.tsx` / `components/Sidebar.tsx`. Ping before editing.

## Who owns what (current split)
- **Spine (backend / write-path / AI):** auth, login, admin, upload, contract validation, embeddings, search RPC, RLS.
- **Surface (frontend / read-path / social):** feed, explore, asset detail, likes/reviews/comments, profile.
The **database schema + the `match_assets` search function** are the contract between them.
