"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, Settings, BookOpen } from 'lucide-react';

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
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
        isActive 
          ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
};

export const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-slate-800 flex flex-col p-4 space-y-8 bg-[#0f172a]">
      {/* Branding */}
      <div className="flex items-center gap-2 px-2 py-4">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
          <span className="font-bold text-white">O</span>
        </div>
        <h1 className="font-bold text-lg tracking-tight text-white">The OPUS</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <NavItem icon={<LayoutGrid size={20}/>} label="Home/Feed" href="/feed" />
        <NavItem icon={<Users size={20}/>} label="My Agents" href="/my-agents" />
        
        <div className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Manage
        </div>
        
        <NavItem icon={<Settings size={20}/>} label="Settings" href="/settings" />
        <NavItem icon={<BookOpen size={20}/>} label="Documentation" href="/documentation" />
      </nav>
    </aside>
  );
};