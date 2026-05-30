"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleLike } from "@/app/(dashboard)/agent/[id]/actions";

export function LikeButton({
  assetId,
  initialLiked,
  initialCount,
}: {
  assetId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, start] = useTransition();

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
          ? "bg-pink-600/20 border-pink-500/50 text-pink-400"
          : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
      }`}
    >
      <Heart size={16} fill={liked ? "currentColor" : "none"} />
      {count}
    </button>
  );
}
