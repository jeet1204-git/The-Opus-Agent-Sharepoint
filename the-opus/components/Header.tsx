'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User } from 'lucide-react';
import { SignOutButton } from './SignOutButton';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

export default function Header({
  userName = 'User',
  avatarUrl,
}: {
  userName?: string;
  avatarUrl?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [q, setQ] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="border-b border-slate-200">
      <div
        className={`fixed inset-0 bg-[#15161a]/10 transition-opacity duration-300 pointer-events-none ${
          isSearching ? 'opacity-100 z-40' : 'opacity-0 z-0'
        }`}
      />

      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md relative z-50">
        <form
          onSubmit={onSubmit}
          className={`relative transition-all duration-300 ${
            isSearching ? 'flex-1 md:mr-12' : 'w-96'
          }`}
        >
          <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
          <input
            ref={searchRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search agents by what you need… (semantic)"
            onFocus={() => setIsSearching(true)}
            onBlur={() => setIsSearching(false)}
            className="w-full bg-slate-100 border border-slate-200 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c5cff] text-[#15161a] transition-all"
          />
        </form>

        <div className="flex items-center gap-4 shrink-0">
          {/* ── Notification bell ── */}
          <NotificationBell />

          {/* ── User menu ── */}
          <div className="relative">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setIsOpen((prev) => !prev);
              }}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition-colors px-3 py-1.5 rounded-full cursor-pointer focus:outline-none select-none"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-6 h-6 bg-slate-500 rounded-full">
                  <User size={14} />
                </div>
              )}
              <span className="text-sm font-medium text-[#15161a]">{userName}</span>
            </button>

            {isOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 rounded-md border border-slate-200 bg-white p-1 shadow-lg z-20 text-[#15161a]">
                  <div className="px-3 py-2 border-b border-slate-200">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="text-sm font-semibold truncate text-[#15161a]">{userName}</p>
                  </div>
                  <div className="py-1">
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-100 text-left transition-colors"
                      onClick={() => router.push('/profile')}
                    >
                      <User size={16} className="text-slate-400" />
                      Profile
                    </button>
                  </div>
                  <div className="border-t border-slate-200 pt-1 mt-1">
                    <SignOutButton />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}