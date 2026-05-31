"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Send, Lock } from "lucide-react";
import { addReview } from "@/app/(dashboard)/agent/[id]/actions";

export function ReviewForm({
  assetId,
  locked = false,
  department = null,
}: {
  assetId: string;
  locked?: boolean;
  department?: string | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [pending, start] = useTransition();

  // Restricted agents: only the owning department (and admins) can review.
  if (locked) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-500">
        <Lock size={14} className="shrink-0 text-slate-600" />
        Reviewing is limited to the {department ?? "owning"} department.
      </div>
    );
  }

  function submit() {
    if (!comment.trim()) return;
    start(async () => {
      await addReview(assetId, rating, comment);
      setComment("");
      router.refresh();
    });
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
      <div className="mb-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => setRating(n)} type="button">
            <Star size={16} className={n <= rating ? "text-yellow-500" : "text-slate-600"} fill={n <= rating ? "currentColor" : "none"} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Share how this agent worked for your team…"
        className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={submit}
        disabled={pending || !comment.trim()}
        className="mt-2 flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50"
      >
        <Send size={14} /> {pending ? "Posting…" : "Post review"}
      </button>
    </div>
  );
}
