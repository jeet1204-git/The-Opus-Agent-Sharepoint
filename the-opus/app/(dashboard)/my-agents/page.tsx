// app/my-agents/page.tsx
import { requireProfile } from "@/lib/auth";
import MyAgentsPageClient from "./MyAgentsPageClient";

export default async function Page() {
  const profile = await requireProfile();

  const avatarUrl = profile.avatar_url
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}?t=${Date.now()}`
  : null;

  return <MyAgentsPageClient avatarUrl={avatarUrl} />;
}