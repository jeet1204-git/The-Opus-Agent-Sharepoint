"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleLike } from "@/app/(dashboard)/agent/[id]/actions";

export function LikeButton({
  assetId,
  initialLiked,
  initialCount,
  locked = false,
}: {
  assetId: string;
  initialLiked: boolean;
  initialCount: number;
  locked?: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();

  // Restricted agents: other departments can see the endorsement count (trust
  // signal) but cannot endorse - show a static, non-interactive badge.
  if (locked) {
    return (
      <div
        title="Endorsing is limited to this agent's department"
        className="flex items-center gap-2 px-4 py-2 rounded border font-bold bg-white border-slate-200 text-slate-500 cursor-not-allowed"
      >
        <Heart size={16} fill="none" />
        {initialCount}
      </div>
    );
  }

  function onClick() {
    // optimistic
    setLiked((v) => !v);
    setCount((c) => c + (liked ? -1 : 1));
    start(async () => {
      await toggleLike(assetId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={`flex items-center gap-2 px-4 py-2 rounded border font-bold transition-all ${
        liked
          ? "bg-pink-50 border-pink-200 text-pink-600"
          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
      }`}
    >
      <Heart size={16} fill={liked ? "currentColor" : "none"} />
      {count}
    </button>
  );
}
