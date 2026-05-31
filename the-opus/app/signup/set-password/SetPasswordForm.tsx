"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { activateAccount, type ActivateState } from "@/lib/signup";

const initial: ActivateState = {};

export default function SetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(activateAccount, initial);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state.error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">
          New password
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="At least 8 characters"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">
          Confirm password
        </label>
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Re-enter password"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 py-2 font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
        {pending ? "Activating…" : "Activate & sign in"}
      </button>
    </form>
  );
}
