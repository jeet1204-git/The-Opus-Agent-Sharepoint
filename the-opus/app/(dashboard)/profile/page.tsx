// app/profile/page.tsx
import { requireProfile } from "@/lib/auth";
import ProfilePageClient from "./ProfilePageClient";

export default async function Page() {
  const profile = await requireProfile();
  return <ProfilePageClient initialAvatarPath={profile.avatar_url} />;
}