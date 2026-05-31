import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import Header from '@/components/Header';
import { requireProfile } from '@/lib/auth';
import NanotechField from '@/components/NanotechField';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: middleware already guards, but enforce here too.
  const profile = await requireProfile();

  const avatarUrl = profile.avatar_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profile.avatar_url}?t=${Date.now()}`
    : null;
  
  return (
    <div className="flex h-screen bg-[#fbfbfa] text-[#15161a] font-sans relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <NanotechField />
      <Sidebar isAdmin={profile.role === 'admin'} />
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Header userName={profile.full_name ?? 'User'} avatarUrl={avatarUrl} />
        {children}
      </main>
    </div>
  );
};
