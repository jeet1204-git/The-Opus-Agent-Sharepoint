import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import Header from '@/components/Header';
import { requireProfile } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: middleware already guards, but enforce here too.
  const profile = await requireProfile();

  const avatarUrl = profile.avatar_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}?t=${Date.now()}`
    : null;
  
  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans">
      <Sidebar isAdmin={profile.role === 'admin'} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header userName={profile.full_name ?? 'User'} avatarUrl={avatarUrl} />
        {children}
      </main>
    </div>
  );
};
