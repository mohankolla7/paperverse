import React, { useState } from 'react';
import { FileText, BookOpen, MessageSquare, Lightbulb, GraduationCap, Sparkles } from 'lucide-react';
import LiteratureReview from '../tools/LiteratureReview';
import PaperSummarizer from '../tools/PaperSummarizer';
import ChatWithPaper from '../tools/ChatWithPaper';
import GeneratorTool from '../tools/GeneratorTool';
import StudyBuddy from '../tools/StudyBuddy';

export const TOOLS = [
  {
    id: 'literature-review',
    name: 'Literature Review',
    tag: 'Main Feature',
    desc: 'Compare 2-3 papers & extract research gaps',
    icon: FileText,
    accent: 'neon-violet'
  },
  {
    id: 'summarizer',
    name: 'Paper Summarizer',
    tag: '5 Takeaways',
    desc: 'Plain-English breakdown of complex PDFs',
    icon: BookOpen,
    accent: 'neon-cyan'
  },
  {
    id: 'chat',
    name: 'Chat with Paper',
    tag: 'Strict Grounding',
    desc: 'Interactive QA with zero hallucination',
    icon: MessageSquare,
    accent: 'neon-pink'
  },
  {
    id: 'generator',
    name: 'Thesis Generator',
    tag: 'IEEE Formatted',
    desc: '3 Titles, 200-word abstract & keywords',
    icon: Lightbulb,
    accent: 'neon-emerald'
  },
  {
    id: 'study-buddy',
    name: 'Study Buddy',
    tag: 'Interactive Quiz',
    desc: '5-bullet summaries & self-checking MCQs',
    icon: GraduationCap,
    accent: 'neon-amber'
  }
];

export default function Dashboard({
  apiKeys,
  activeKeyIndex,
  onSwitchKey,
  onSwitchModel,
  model,
  onOpenKeyModal,
  toastMessage
}) {
  const [activeTab, setActiveTab] = useState('literature-review');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast notification banner (e.g., failover to backup key 2) */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan text-xs font-mono flex items-center justify-between shadow-neon-cyan animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neon-pink" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Tool Selector Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTab === tool.id;

          return (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden group ${
                isActive
                  ? 'glass-panel bg-white/[0.08] border-neon-violet shadow-neon-violet translate-y-[-2px]'
                  : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
              }`}
            >
              {/* Active glow pip */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-violet via-neon-cyan to-neon-pink" />
              )}

              <div className="flex items-center justify-between w-full">
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-neon-violet/20 text-neon-cyan'
                      : 'bg-white/5 text-verse-muted group-hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-verse-muted">
                  {tool.tag}
                </span>
              </div>

              <div>
                <h3 className="font-heading font-semibold text-sm text-white tracking-wide">
                  {tool.name}
                </h3>
                <p className="text-[11px] text-verse-muted mt-0.5 line-clamp-1">
                  {tool.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Tool Surface */}
      <main className="glass-panel rounded-3xl p-6 sm:p-8 md:p-10 border border-white/10 relative overflow-hidden min-h-[580px]">
        {activeTab === 'literature-review' && (
          <LiteratureReview
            apiKeys={apiKeys}
            activeKeyIndex={activeKeyIndex}
            onSwitchKey={onSwitchKey}
            onSwitchModel={onSwitchModel}
            model={model}
            onOpenKeyModal={onOpenKeyModal}
          />
        )}

        {activeTab === 'summarizer' && (
          <PaperSummarizer
            apiKeys={apiKeys}
            activeKeyIndex={activeKeyIndex}
            onSwitchKey={onSwitchKey}
            onSwitchModel={onSwitchModel}
            model={model}
            onOpenKeyModal={onOpenKeyModal}
          />
        )}

        {activeTab === 'chat' && (
          <ChatWithPaper
            apiKeys={apiKeys}
            activeKeyIndex={activeKeyIndex}
            onSwitchKey={onSwitchKey}
            onSwitchModel={onSwitchModel}
            model={model}
            onOpenKeyModal={onOpenKeyModal}
          />
        )}

        {activeTab === 'generator' && (
          <GeneratorTool
            apiKeys={apiKeys}
            activeKeyIndex={activeKeyIndex}
            onSwitchKey={onSwitchKey}
            onSwitchModel={onSwitchModel}
            model={model}
            onOpenKeyModal={onOpenKeyModal}
          />
        )}

        {activeTab === 'study-buddy' && (
          <StudyBuddy
            apiKeys={apiKeys}
            activeKeyIndex={activeKeyIndex}
            onSwitchKey={onSwitchKey}
            onSwitchModel={onSwitchModel}
            model={model}
            onOpenKeyModal={onOpenKeyModal}
          />
        )}
      </main>
    </div>
  );
}
