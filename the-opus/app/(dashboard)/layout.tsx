import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { requireProfile } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: middleware already guards, but enforce here too.
  const profile = await requireProfile();

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans">
      <Sidebar isAdmin={profile.role === 'admin'} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};
