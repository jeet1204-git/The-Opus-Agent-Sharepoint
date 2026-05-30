import React from 'react';
import { 
  Star, Download, Zap, Play, Copy, 
  ExternalLink, Code2, MessageSquare, 
  ChevronRight, Info
} from 'lucide-react';

export default async function AgentDetailPageClient({ agent_data }: any) {  
  return (
    <div className="flex h-full overflow-hidden bg-[#0b1120]">
      {/* LEFT CONTENT SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* BREADCRUMBS */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 uppercase tracking-wider">
          <span>Explore</span> <ChevronRight size={12} />
          <span>Agents</span> <ChevronRight size={12} />
          <span className="text-blue-400 font-semibold">Legal Case Analyzer</span>
        </nav>

        {/* HERO SECTION */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {agent_data.id}
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-500 font-mono">#LCA103</span>
              <span className="text-slate-400">Author: <span className="text-slate-200 underline cursor-pointer">Sarah Chen</span></span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded flex items-center gap-2">
              <Play size={18} fill="white" /> ACTIVATE AGENT
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded">
              DEPLOY/CLONE
            </button>
          </div>
        </div>

        {/* TOP STATS BAR */}
        <div className="flex gap-8 border-b border-slate-800 pb-8 mb-8">
          <StatHighlight icon={<Star className="text-yellow-500" size={18} />} label="4.9/5 stars" sub="52 Reviews" />
          <StatHighlight icon={<Download className="text-blue-400" size={18} />} label="380" sub="Downloads" />
          <StatHighlight icon={<Zap className="text-purple-400" size={18} />} label="1.7k" sub="Executions" />
        </div>

        {/* DESCRIPTION BLOCK */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Agent Description & Use Cases</h3>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500 border border-slate-700">README.md</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-sm">
            Legal Case Analyzer is a specialized LLM wrapper designed to ingest complex legal texts and provide structured summaries. 
            It excels at vectorizing assessed issues and comparing jurisdictional precedents to ensure compliance and risk mitigation.
          </p>
          <p className="text-[10px] text-slate-600 mt-4 italic font-mono uppercase">AI-Generated Description</p>
        </div>

        {/* PROMPT & INSTRUCTIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">System Prompt</h3>
              <Copy size={14} className="text-slate-600 cursor-pointer hover:text-white" />
            </div>
            <div className="font-mono text-sm text-blue-300/80 bg-black/30 p-4 rounded-lg border border-slate-800">
              <span className="text-blue-500">SYSTEM:</span> Analyze the provided legal text for national information...
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Input/Output Examples</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
                <p className="text-slate-500 mb-1">INPUT:</p>
                <p className="text-slate-300 italic">"Provide a brief on the current tenant law..."</p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded border border-slate-700">
                <p className="text-slate-500 mb-1">OUTPUT:</p>
                <p className="text-slate-300 italic">"Based on Section 4 of the Civil Code..."</p>
              </div>
            </div>
          </div>
        </div>

        {/* COMMUNITY SECTION */}
        <div className="mt-12">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <MessageSquare size={16} /> Reviews & Community Discussion
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mock Review Card */}
            <ReviewCard name="Maria S." date="18 hrs ago" content="This wrapper saved our team 4 hours of manual doc review this week. The output format is perfect for our Jira tickets." />
            <ReviewCard name="David K." date="1 day ago" content="Impressive precision on jurisdiction detection, though it struggles with v2.1 prompts occasionally." />
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR (Configuration & Guide) */}
      <aside className="w-80 border-l border-slate-800 p-8 space-y-8 bg-[#0f172a]/50 overflow-y-auto">
        {/* CONFIG SECTION */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Info size={14} /> Configuration
          </h3>
          <div className="space-y-4">
            <ConfigRow label="Intended Model" value="GPT-4" />
            <ConfigRow label="Temperature" value="0.5" />
            <ConfigRow label="Max Tokens" value="2048" />
            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Functions</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-1 rounded">LegalSearch</span>
                <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-1 rounded">TextCompare</span>
              </div>
            </div>
          </div>
        </div>

        {/* IMPLEMENTATION GUIDE */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Code2 size={14} /> Implementation
          </h3>
          <div className="space-y-6">
            <Step title="Set Up API Key" code="export OPUS_KEY='your_key_here'" />
            <Step title="Initialize Client" code="opus init --agent=lca103" />
            <Step title="Run Analysis" code="opus run 'contract_v1.pdf'" />
          </div>
        </div>
      </aside>
    </div>
  );
};

// --- Sub-components ---

const StatHighlight = ({ icon, label, sub }: any) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-lg font-bold text-white leading-none">{label}</span>
    </div>
    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">{sub}</span>
  </div>
);

const ConfigRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
    <span className="text-slate-500">{label}:</span>
    <span className="text-slate-200 font-mono">{value}</span>
  </div>
);

const Step = ({ title, code }: { title: string, code: string }) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold text-slate-300">{title}</p>
    <div className="bg-black/50 border border-slate-700 rounded p-3 font-mono text-[11px] text-blue-400 flex justify-between group">
      <code>{code}</code>
      <Copy size={12} className="opacity-0 group-hover:opacity-100 cursor-pointer" />
    </div>
  </div>
);

const ReviewCard = ({ name, date, content }: any) => (
  <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-700 rounded-full" />
        <div>
          <p className="text-sm font-bold text-slate-200 leading-none">{name}</p>
          <p className="text-[10px] text-slate-500 mt-1">{date}</p>
        </div>
      </div>
      <div className="flex text-yellow-500">
        <Star size={10} fill="currentColor" />
        <Star size={10} fill="currentColor" />
        <Star size={10} fill="currentColor" />
        <Star size={10} fill="currentColor" />
        <Star size={10} fill="currentColor" />
      </div>
    </div>
    <p className="text-xs text-slate-400 leading-relaxed italic">"{content}"</p>
  </div>
);
