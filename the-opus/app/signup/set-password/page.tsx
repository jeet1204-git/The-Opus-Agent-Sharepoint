import Image from "next/image";
import Link from "next/link";
import { XCircle } from "lucide-react";
import SetPasswordForm from "./SetPasswordForm";

export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbfbfa] text-[#15161a] font-sans">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg shadow-blue-900/30">
            <Image src="/logos/the-opus-logo-symbol.svg" alt="The OPUS Logo" className="w-16 h-16" width={64} height={64} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[#15161a]">The OPUS</h1>
            <p className="text-xs text-slate-500">Set your password</p>
          </div>
        </div>

        {token ? (
          <>
            <h2 className="mb-1 text-xl font-semibold text-[#15161a]">Choose a password</h2>
            <p className="mb-6 text-sm text-slate-500">
              Set a password to finish activating your account. You&apos;ll use it to sign in.
            </p>
            <SetPasswordForm token={token} />
          </>
        ) : (
          <div className="text-center">
            <XCircle size={36} className="mx-auto mb-3 text-red-400" />
            <h2 className="mb-1 text-lg font-semibold text-[#15161a]">Invalid link</h2>
            <p className="mb-6 text-sm text-slate-500">
              This activation link is missing or invalid. Ask your admin to re-send it.
            </p>
            <Link href="/signup" className="text-sm font-medium text-[#7c5cff] hover:text-[#7c5cff]">
              ← Back to sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
