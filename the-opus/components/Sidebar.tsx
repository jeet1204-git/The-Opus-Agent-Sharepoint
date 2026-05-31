"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, BookOpen, UploadCloud, Shield, TrendingUp, SearchAlert } from 'lucide-react';
import { SignOutButton } from '@/components/SignOutButton';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const NavItem = ({ icon, label, href }: NavItemProps) => {
  const pathname = usePathname();
  // Checks if the current URL matches the link destination
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${isActive
          ? 'bg-[#7c5cff]/10 text-[#7c5cff] border border-[#7c5cff]/25'
          : 'text-slate-500 hover:bg-slate-100 hover:text-[#15161a]'
        }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export const Sidebar = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  return (
    <aside className="w-64 border-r border-slate-200 flex flex-col p-4 bg-white relative z-10">
      {/* Branding */}
      <a href="/" className="flex items-center gap-2 px-2 py-4 mb-4">
        <div className="w-8 h-8 rounded-lg" style={{ background: "conic-gradient(from 120deg,#ff8a5c,#7c5cff,#2ed3b7,#ffd23f,#ff8a5c)" }} />
        <h1 className="font-bold text-lg tracking-tight text-[#15161a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>The OPUS</h1>
      </a>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <NavItem icon={<LayoutGrid size={20} />} label="Home/Feed" href="/feed" />
        <NavItem icon={<UploadCloud size={20} />} label="Publish" href="/upload" />
        <NavItem icon={<Users size={20} />} label="My Agents" href="/my-agents" />
        <NavItem icon={<TrendingUp size={20} />} label="Reuse Impact" href="/impact" />

        <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Manage
        </div>

        {isAdmin && (
          <>
            <NavItem icon={<Shield size={20} />} label="Admin" href="/admin" />
            <NavItem icon={<SearchAlert size={20} />} label="Search Gaps" href="/search-gaps" />
          </>
        )}

        <NavItem icon={<BookOpen size={20} />} label="FAQs" href="/documentation" />
      </nav>

      {/* Sign out pinned to bottom */}
      <div className="border-t border-slate-200 pt-2">
        <SignOutButton />
      </div>
    </aside>
  );
};
