"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-white"
    >
      <LogOut size={20} />
      <span className="text-sm font-medium">Sign out</span>
    </button>
  );
}
