import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createOrgUser } from "./actions";
import type { Profile, Organization } from "@/lib/types";
import { Shield } from "lucide-react";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const profile = await requireAdmin();
  const { error, ok } = await searchParams;

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at");
  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.org_id)
    .single();

  const orgTyped = org as Organization | null;
  const memberList = (members as Profile[]) ?? [];

  return (
    <>
      <header className="h-16 border-b border-slate-800 flex items-center gap-3 px-8 bg-[#0f172a]/50 backdrop-blur-md">
        <Shield size={20} className="text-blue-500" />
        <h1 className="text-lg font-bold text-white">Admin</h1>
        <span className="text-sm text-slate-500">· {orgTyped?.name ?? "Organization"}</span>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-[#0b1120]">
        <div className="space-y-10">
          {/* Create user */}
          <section>
            <h2 className="text-xl font-bold text-white mb-1">Create a user</h2>
            <p className="text-sm text-slate-500 mb-4">
              New users are added to <span className="text-slate-300">{orgTyped?.name}</span> and can sign in immediately.
            </p>

            {error && (
              <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}
            {ok && (
              <div className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
                User created.
              </div>
            )}

            <form action={createOrgUser} className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">Full name</label>
                <input name="full_name" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">Role</label>
                <select name="role" className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">Email</label>
                <input name="email" type="email" required className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="jane@company.com" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">Temp password</label>
                <input name="password" type="text" required className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="set-a-password" />
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="rounded-md bg-blue-600 px-5 py-2 font-bold text-white transition-colors hover:bg-blue-500">
                  Create user
                </button>
              </div>
            </form>
          </section>

          {/* Members */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Members ({memberList.length})</h2>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {memberList.map((m) => (
                    <tr key={m.id} className="bg-slate-900/30">
                      <td className="px-4 py-3 text-white">{m.full_name ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-400">{m.email ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-0.5 text-xs font-bold ${m.role === "admin" ? "bg-blue-600/20 text-blue-400" : "bg-slate-800 text-slate-400"}`}>
                          {m.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {memberList.length === 0 && (
                    <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">No members yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
