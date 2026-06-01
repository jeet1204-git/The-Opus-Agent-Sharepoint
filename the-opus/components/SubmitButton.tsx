"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

/**
 * Submit button that reflects the parent <form>'s server-action pending state:
 * shows a spinner + "pending" label and disables itself while the action runs.
 * Fixes the "did my click register?" dead feeling on auth forms.
 */
export function SubmitButton({
  children,
  pendingText = "Please wait…",
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={
        className ??
        "flex w-full items-center justify-center gap-2 rounded-md bg-[#15161a] py-2 font-bold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
      }
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {pending ? pendingText : children}
    </button>
  );
}
