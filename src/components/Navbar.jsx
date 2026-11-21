import React from 'react';
import { Key, Settings, Sparkles, Zap, ZapOff, Compass, ShieldCheck } from 'lucide-react';

export default function Navbar({
  apiKeys,
  activeKeyIndex,
  currentModel,
  onOpenKeyModal,
  onOpenSettings,
  liteMode,
  onToggleLiteMode,
  onRestartJourney
}) {
  const hasKey = apiKeys && apiKeys.length > 0 && apiKeys.some((k) => k?.trim());

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-space-900/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-violet via-neon-cyan to-neon-pink p-0.5 shadow-neon-violet">
            <div className="w-full h-full bg-space-900 rounded-[10px] flex items-center justify-center text-lg">
              🌌
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg tracking-wider text-white">
                Paper<span className="text-gradient">Verse</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
                v1.0
              </span>
            </div>
            <p className="hidden md:block text-[11px] font-mono text-verse-muted">
              Travel through your research
            </p>
          </div>
        </div>

        {/* Status Chip & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Status Chip: Active Key & Model */}
          <div
            onClick={onOpenKeyModal}
            className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-space-850 border border-white/10 hover:border-white/20 transition-all text-xs font-mono"
            title="Click to manage Gemini API keys"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                hasKey ? 'bg-neon-emerald animate-pulse' : 'bg-red-400'
              }`}
            />
            <span className="text-verse-muted">
              {hasKey ? `Key #${activeKeyIndex + 1}` : 'No Key'}
            </span>
            <span className="text-white/20">|</span>
            <span className="text-neon-cyan truncate max-w-[140px]">
              {currentModel}
            </span>
          </div>

          {/* Re-enter Journey Button */}
          {onRestartJourney && (
            <button
              onClick={onRestartJourney}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-white/5 border border-white/10 text-verse-text hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors"
              title="Experience 3D Catmull-Rom cosmic flight"
            >
              <Compass className="w-3.5 h-3.5" />
              Replay Journey
            </button>
          )}

          {/* Lite Mode Toggle */}
          <button
            onClick={onToggleLiteMode}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all ${
              liteMode
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-verse-muted hover:text-white'
            }`}
            title={liteMode ? 'Lite mode active (3D paused for high performance)' : 'Switch to Lite mode (disables 3D effects)'}
          >
            {liteMode ? <ZapOff className="w-3.5 h-3.5 text-amber-400" /> : <Zap className="w-3.5 h-3.5 text-neon-cyan" />}
            <span className="hidden sm:inline">{liteMode ? 'Lite Mode' : '3D Mode'}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-verse-muted hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
            title="Model Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* API Keys Button */}
          <button
            onClick={onOpenKeyModal}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-heading font-semibold border transition-all ${
              hasKey
                ? 'bg-neon-violet/20 border-neon-violet/40 text-neon-cyan hover:bg-neon-violet/30'
                : 'bg-gradient-to-r from-neon-violet to-neon-pink text-white shadow-neon-violet hover:opacity-90'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{hasKey ? 'Key Manager' : 'Connect Key'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
