import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { inviteEmployee, regenerateInvite, removeInvite } from "./actions";
import CopyInviteLink from "./CopyInviteLink";
import { DEPARTMENTS } from "@/lib/departments";
import type { AllowlistEntry, Organization } from "@/lib/types";
import { Shield, Download, UserPlus, RefreshCw, Trash2 } from "lucide-react";

const OK_MESSAGES: Record<string, string> = {
  invited: "Employee invited. Copy their activation link below.",
  reissued: "A fresh activation link was generated.",
  removed: "Employee removed from the allowlist.",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const profile = await requireAdmin();
  const { error, ok } = await searchParams;

  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", profile.org_id)
    .single();
  const { data: roster } = await supabase
    .from("org_allowlist")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at");

  const orgTyped = org as Organization | null;
  const list = (roster as AllowlistEntry[]) ?? [];
  const activeCount = list.filter((r) => r.status === "active").length;
  const invitedCount = list.filter((r) => r.status === "invited").length;

  const inputCls =
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-[#15161a] focus:outline-none focus:ring-2 focus:ring-[#7c5cff]";
  const labelCls = "mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500";

  return (
    <>
      <header className="h-16 border-b border-slate-200 flex items-center gap-3 px-8 bg-white/60 backdrop-blur-md">
        <Shield size={20} className="text-[#7c5cff]" />
        <h1 className="text-lg font-bold text-[#15161a]">Admin</h1>
        <span className="text-sm text-slate-500">· {orgTyped?.name ?? "Organization"}</span>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-[#fbfbfa]">
        <div className="space-y-10">
          {/* Invite employee */}
          <section>
            <h2 className="text-xl font-bold text-[#15161a] mb-1">Invite an employee</h2>
            <p className="text-sm text-slate-500 mb-4">
              Authorize a work email for <span className="text-slate-700">{orgTyped?.name}</span>.
              Only emails on this list can sign up - the employee sets their own password from
              the activation link.
            </p>

            {error && (
              <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}
            {ok && OK_MESSAGES[ok] && (
              <div className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
                {OK_MESSAGES[ok]}
              </div>
            )}

            <form action={inviteEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-6">
              <div>
                <label className={labelCls}>Full name</label>
                <input name="full_name" className={inputCls} placeholder="Jane Doe" />
              </div>
              <div>
                <label className={labelCls}>Work email *</label>
                <input name="email" type="email" required className={inputCls} placeholder="jane@company.com" />
              </div>
              <div>
                <label className={labelCls}>Department</label>
                <select name="department" defaultValue="" className={inputCls}>
                  <option value="">- none -</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Role</label>
                <select name="role" defaultValue="member" className={inputCls}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-[#7c5cff] px-5 py-2 font-bold text-white transition-colors hover:bg-[#6b4cf0]">
                  <UserPlus size={16} /> Invite employee
                </button>
              </div>
            </form>
          </section>

          {/* Roster */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#15161a]">Roster ({list.length})</h2>
                <p className="text-sm text-slate-500">{activeCount} active · {invitedCount} pending</p>
              </div>
              <a
                href="/admin/export"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-[#15161a] transition-colors hover:border-[#7c5cff]/40 hover:text-[#15161a]"
              >
                <Download size={16} /> Export CSV
              </a>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-white text-slate-500">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Department</th>
                    <th className="px-4 py-3 text-left font-medium">Role</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {list.map((r) => (
                    <tr key={r.id} className="bg-white">
                      <td className="px-4 py-3 text-[#15161a]">{r.full_name ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-500">{r.email}</td>
                      <td className="px-4 py-3 text-slate-500">{r.department ?? "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-0.5 text-xs font-bold ${r.role === "admin" ? "bg-[#7c5cff]/20 text-[#7c5cff]" : "bg-slate-100 text-slate-500"}`}>
                          {r.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-0.5 text-xs font-bold ${r.status === "active" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.status === "invited" ? (
                          <div className="flex items-center justify-end gap-2">
                            {r.activation_token && <CopyInviteLink token={r.activation_token} />}
                            <form action={regenerateInvite}>
                              <input type="hidden" name="id" value={r.id} />
                              <button title="Re-issue link" className="rounded border border-slate-200 p-1.5 text-slate-500 transition-colors hover:border-[#7c5cff]/40 hover:text-[#15161a]">
                                <RefreshCw size={12} />
                              </button>
                            </form>
                            <form action={removeInvite}>
                              <input type="hidden" name="id" value={r.id} />
                              <button title="Remove" className="rounded border border-slate-200 p-1.5 text-slate-500 transition-colors hover:border-red-500/50 hover:text-red-400">
                                <Trash2 size={12} />
                              </button>
                            </form>
                          </div>
                        ) : (
                          <div className="text-right text-xs text-slate-600">-</div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {list.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No one on the roster yet. Invite your first employee above.</td></tr>
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
