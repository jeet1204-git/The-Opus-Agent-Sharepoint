'use client';

import { useState } from 'react';
import { Search, Bell, User, Settings, LogOut } from 'lucide-react';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-[#0f172a]/50 backdrop-blur-md relative z-50">
            {/* Search Input */}
            <div className="relative w-96">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                <input
                    type="text"
                    placeholder="Search agents..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <Bell size={20} className="text-slate-400 cursor-pointer hover:text-white transition-colors" />
                
                {/* Profile Dropdown Container */}
                <div className="relative">
                    {/* Trigger Button */}
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 transition-colors px-3 py-1.5 rounded-full cursor-pointer focus:outline-none select-none"
                    >
                        <div className="w-6 h-6 bg-slate-500 rounded-full" />
                        <span className="text-sm font-medium text-white">Sarah J.</span>
                    </button>

                    {/* Dropdown Menu */}
                    {isOpen && (
                        <>
                            {/* Backdrop overlay to close menu when clicking outside */}
                            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                            
                            <div className="absolute right-0 mt-2 w-56 rounded-md border border-slate-800 bg-slate-900 p-1 shadow-lg z-20 text-slate-200">
                                {/* Header / Info Section */}
                                <div className="px-3 py-2 border-b border-slate-800">
                                    <p className="text-xs text-slate-500">Signed in as</p>
                                    <p className="text-sm font-semibold truncate text-white">Sarah J.</p>
                                </div>

                                {/* Menu Items */}
                                <div className="py-1">
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-800 text-left transition-colors">
                                        <User size={16} className="text-slate-400" />
                                        Profile
                                    </button>
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-slate-800 text-left transition-colors">
                                        <Settings size={16} className="text-slate-400" />
                                        Settings
                                    </button>
                                </div>

                                {/* Divider & Sign Out */}
                                <div className="border-t border-slate-800 pt-1 mt-1">
                                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-red-950/40 text-red-400 hover:text-red-300 text-left transition-colors">
                                        <LogOut size={16} />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}