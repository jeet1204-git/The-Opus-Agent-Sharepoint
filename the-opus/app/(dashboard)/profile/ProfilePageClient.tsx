"use client";

import React, { useState, useTransition } from 'react';
import { Camera, LogOut, Briefcase, User, ShieldAlert, BarChart3, Save } from 'lucide-react';
import { uploadAvatar } from './actions';
import Image from 'next/image';

const buildAvatarUrl = (path: string) =>
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}?t=${Date.now()}`;

export default function ProfilePageClient({ initialAvatarPath }: { initialAvatarPath?: string | null }) {
    const [name, setName] = useState('Sarah Jenkins');
    const [department, setDepartment] = useState('LEGAL');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(
        initialAvatarPath ? buildAvatarUrl(initialAvatarPath) : null
    );
    const [isPending, startTransition] = useTransition();

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarUrl(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("file", file);

        startTransition(async () => {
            const result = await uploadAvatar(formData);
            if (!result.ok) {
                alert(result.message);
                setAvatarUrl(initialAvatarPath ? buildAvatarUrl(initialAvatarPath) : null);
            }
        });
    };

    const handleResign = () => {
        const confirmResign = window.confirm(
            "Are you absolutely sure you want to resign? This will immediately revoke your access to The OPUS."
        );
        if (confirmResign) console.log("Resignation initiated.");
    };

    return (
        <div className="h-full bg-[#fbfbfa] p-10 flex flex-col justify-center items-center overflow-y-auto">
            <div className="w-full xl:w-11/12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center justify-center">

                    {/* COLUMN 1: EDITABLE FIELDS */}
                    <div className="space-y-8 order-2 lg:order-1 w-full">
                        <div className="bg-white border border-slate-200 rounded-2xl p-10 space-y-6 shadow-xl">
                            <div className="flex items-center gap-3 text-slate-500">
                                <Briefcase size={22} />
                                <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Department</label>
                            </div>
                            <select
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className="w-full bg-slate-100 border border-slate-200 rounded-xl p-5 text-lg text-[#15161a] focus:ring-2 focus:ring-[#7c5cff] transition-all outline-none"
                            >
                                <option value="LEGAL">LEGAL</option>
                                <option value="MARKETING">MARKETING</option>
                                <option value="ENGINEERING">ENGINEERING</option>
                            </select>
                            <button className="w-full bg-[#7c5cff] hover:bg-[#6b4cf0] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
                                <Save size={20} /> Save Changes
                            </button>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-10 space-y-6 shadow-xl">
                            <div className="flex items-center gap-3 text-slate-500">
                                <User size={22} />
                                <label className="text-sm font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-100 border border-slate-200 rounded-xl p-5 text-lg text-[#15161a] focus:ring-2 focus:ring-[#7c5cff] outline-none"
                            />
                            <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl border border-slate-200 transition-all">
                                Update Info
                            </button>
                        </div>
                    </div>

                    {/* COLUMN 2: AVATAR CENTERPIECE */}
                    <div className="relative group w-80 h-80 rounded-full p-2 bg-gradient-to-tr from-blue-600 via-sky-400 to-transparent shadow-[0_0_60px_rgba(37,99,235,0.25)]">
                        <div className="w-full h-full rounded-full bg-slate-100 overflow-hidden relative">
                            {avatarUrl
                                ? <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                                : <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                    <User size={140} className="text-slate-600" />
                                  </div>
                            }
                            <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-base font-bold cursor-pointer transition-all duration-300 backdrop-blur-md">
                                {isPending
                                    ? <span className="text-[#7c5cff] animate-pulse">Uploading...</span>
                                    : <>
                                        <Camera size={40} className="mb-2 text-[#7c5cff]" />
                                        <span>Update Avatar</span>
                                      </>
                                }
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isPending} />
                            </label>
                        </div>
                    </div>

                    {/* COLUMN 3: ACTIONS & STATS */}
                    <div className="space-y-8 order-3 w-full">
                        <div className="bg-white border border-slate-200 rounded-2xl p-10 space-y-6 shadow-xl">
                            <div className="flex items-center gap-3 text-slate-500">
                                <ShieldAlert size={22} />
                                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Workspace</h4>
                            </div>
                            <button
                                onClick={handleResign}
                                className="w-full bg-red-950/10 hover:bg-red-950/30 text-red-500 border border-red-900/30 rounded-xl p-8 flex flex-col items-center gap-4 group transition-all"
                            >
                                <LogOut size={40} className="group-hover:translate-x-1 transition-transform" />
                                <span className="font-bold text-lg">Resign from Organization</span>
                            </button>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-10 space-y-6 shadow-xl">
                            <div className="flex items-center gap-3 text-slate-500 mb-2">
                                <BarChart3 size={22} />
                                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Insights</h4>
                            </div>
                            <div className="flex justify-between items-center text-lg border-b border-slate-200 pb-4">
                                <span className="text-slate-500">Tenure</span>
                                <span className="text-[#15161a] font-semibold tracking-wide">14 Months</span>
                            </div>
                            <div className="flex justify-between items-center text-lg pt-2">
                                <span className="text-slate-500">Global Rank</span>
                                <span className="text-[#7c5cff] font-bold italic">Top 5%</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}