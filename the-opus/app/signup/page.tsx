"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mail, ArrowRight, XCircle, MailCheck, Loader2 } from "lucide-react";
import { checkSignupEmail, requestActivation } from "@/lib/signup";

type View =
  | { kind: "form" }
  | { kind: "rejected" }
  | { kind: "active" }
  | { kind: "invited"; email: string; token: string };

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [view, setView] = useState<View>({ kind: "form" });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) return;
    setError("");
    startTransition(async () => {
      const res = await checkSignupEmail(value);
      if (res.status === "not_found") return setView({ kind: "rejected" });
      if (res.status === "active") return setView({ kind: "active" });
      // invited → mint an activation token (simulated email)
      const act = await requestActivation(value);
      if (!act.ok || !act.token) {
        setError(act.message ?? "Could not start activation. Try again.");
        return;
      }
      setView({ kind: "invited", email: value, token: act.token });
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbfa] text-[#15161a] font-sans">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
        {/* Brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg shadow-blue-900/30">
            <Image src="/logos/the-opus-logo-symbol.svg" alt="The OPUS Logo" className="w-16 h-16" width={64} height={64} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#15161a]">The OPUS</h1>
            <p className="text-xs text-slate-500">Join your organization</p>
          </div>
        </div>

        {view.kind === "form" && (
          <>
            <h2 className="mb-1 text-xl font-semibold text-[#15161a]">Create your account</h2>
            <p className="mb-6 text-sm text-slate-500">
              Use your <span className="text-slate-700">work email</span>. Only emails your
              organization has registered can sign up.
            </p>

            {error && (
              <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">
                  Work email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-[#15161a] focus:outline-none focus:ring-2 focus:ring-[#7c5cff]"
                  placeholder="you@company.com"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#7c5cff] py-2 font-bold text-white transition-colors hover:bg-[#6b4cf0] disabled:opacity-50"
              >
                {pending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                {pending ? "Checking…" : "Continue"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#7c5cff] hover:text-[#7c5cff]">Sign in</Link>
            </p>
          </>
        )}

        {view.kind === "rejected" && (
          <div className="text-center">
            <XCircle size={36} className="mx-auto mb-3 text-red-400" />
            <h2 className="mb-1 text-lg font-semibold text-[#15161a]">Email not registered</h2>
            <p className="mb-6 text-sm text-slate-500">
              This email isn&apos;t registered by your organization. Ask your admin to add you,
              then try again.
            </p>
            <button
              onClick={() => { setView({ kind: "form" }); setEmail(""); }}
              className="text-sm font-medium text-[#7c5cff] hover:text-[#7c5cff]"
            >
              ← Try another email
            </button>
          </div>
        )}

        {view.kind === "active" && (
          <div className="text-center">
            <MailCheck size={36} className="mx-auto mb-3 text-emerald-400" />
            <h2 className="mb-1 text-lg font-semibold text-[#15161a]">Account already exists</h2>
            <p className="mb-6 text-sm text-slate-500">This email is already activated.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-[#7c5cff] px-5 py-2 font-bold text-white transition-colors hover:bg-[#6b4cf0]"
            >
              Go to sign in <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {view.kind === "invited" && (
          <div className="text-center">
            <MailCheck size={36} className="mx-auto mb-3 text-[#7c5cff]" />
            <h2 className="mb-1 text-lg font-semibold text-[#15161a]">Check your email</h2>
            <p className="mb-2 text-sm text-slate-500">
              We&apos;ve sent a secure activation link to{" "}
              <span className="text-[#15161a]">{view.email}</span>.
            </p>
            <p className="mb-6 text-xs text-slate-600">
              (Demo: email delivery is simulated — open the link below to continue.)
            </p>
            <button
              onClick={() => router.push(`/signup/set-password?token=${view.token}`)}
              className="inline-flex items-center gap-2 rounded-md bg-[#7c5cff] px-5 py-2 font-bold text-white transition-colors hover:bg-[#6b4cf0]"
            >
              Open activation link <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
