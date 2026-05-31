import { login } from "./actions";
import Image from "next/image";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1120] text-slate-200 font-sans">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#0f172a] p-8 shadow-2xl">
        {/* Brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg shadow-blue-900/30">
            <Image src="/logos/the-opus-logo-symbol.svg" alt="The OPUS Logo" className="w-16 h-16" width={64} height={64} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">The OPUS</h1>
            <p className="text-xs text-slate-500">Agent registry for your team</p>
          </div>
        </div>

        <h2 className="mb-1 text-xl font-semibold text-white">Sign in</h2>
        <p className="mb-6 text-sm text-slate-500">Use the account your admin created.</p>

        {ok === "activated" && (
          <div className="mb-4 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
            Account activated — please sign in.
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 font-bold text-white transition-colors hover:bg-blue-500"
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <a href="/signup" className="font-medium text-blue-400 hover:text-blue-300">Create your account</a>
        </p>
      </div>
    </div>
  );
}
