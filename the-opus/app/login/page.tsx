import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbfbfa] text-[#15161a]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      {/* soft color blobs */}
      <div className="pointer-events-none absolute -left-20 top-10 h-72 h-72 w-72 rounded-full bg-[#ff8a5c] opacity-40 blur-[70px]" />
      <div className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-[#7c5cff] opacity-40 blur-[70px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#2ed3b7] opacity-40 blur-[70px]" />

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md p-8 shadow-xl">
        {/* Brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg" style={{ background: "conic-gradient(from 120deg,#ff8a5c,#7c5cff,#2ed3b7,#ffd23f,#ff8a5c)" }} />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#15161a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>The OPUS</h1>
            <p className="text-xs text-slate-500">Agent registry for your team</p>
          </div>
        </div>

        <h2 className="mb-1 text-xl font-semibold text-[#15161a]">Sign in</h2>
        <p className="mb-6 text-sm text-slate-500">Use the account your admin created.</p>

        {ok === "activated" && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Account activated — please sign in.
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form action={login} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#15161a] focus:outline-none focus:ring-2 focus:ring-[#7c5cff]"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-[#15161a] focus:outline-none focus:ring-2 focus:ring-[#7c5cff]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-[#15161a] py-2 font-bold text-white transition-colors hover:bg-black"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <a href="/signup" className="font-medium text-[#7c5cff] hover:underline">Create your account</a>
        </p>
      </div>
    </div>
  );
}
