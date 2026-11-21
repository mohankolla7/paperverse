import React, { useState } from 'react';
import { X, Cpu, Check, AlertCircle, Sparkles } from 'lucide-react';
import { AVAILABLE_MODELS } from '../lib/gemini';

export default function SettingsModal({ isOpen, onClose, currentModel, onSaveModel }) {
  const [selectedModel, setSelectedModel] = useState(currentModel || 'gemini-2.5-flash');
  const [customModel, setCustomModel] = useState('');
  const [isCustom, setIsCustom] = useState(!AVAILABLE_MODELS.some((m) => m.id === currentModel));

  if (!isOpen) return null;

  const handleSave = () => {
    const finalModel = isCustom ? customModel.trim() : selectedModel;
    if (!finalModel) return;
    onSaveModel(finalModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-white/15 p-6 md:p-8 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-white">
                Engine & Model Settings
              </h3>
              <p className="text-xs text-verse-muted">
                Configure your active Google Gemini model endpoint
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-verse-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model Presets */}
        <div className="space-y-3">
          <label className="block text-xs font-mono uppercase tracking-wider text-verse-muted">
            Select Active Gemini Model
          </label>
          <div className="space-y-2">
            {AVAILABLE_MODELS.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  setIsCustom(false);
                  setSelectedModel(m.id);
                }}
                className={`p-3.5 rounded-xl border text-xs font-mono cursor-pointer transition-all flex items-center justify-between ${
                  !isCustom && selectedModel === m.id
                    ? 'bg-neon-cyan/15 border-neon-cyan text-white shadow-neon-cyan'
                    : 'bg-white/[0.02] border-white/10 text-verse-text hover:bg-white/[0.05]'
                }`}
              >
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-[11px] text-verse-muted mt-0.5">{m.id}</p>
                </div>
                {!isCustom && selectedModel === m.id && (
                  <Check className="w-4 h-4 text-neon-cyan shrink-0" />
                )}
              </div>
            ))}

            {/* Custom Model Option */}
            <div
              onClick={() => setIsCustom(true)}
              className={`p-3.5 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                isCustom
                  ? 'bg-neon-violet/15 border-neon-violet text-white shadow-neon-violet'
                  : 'bg-white/[0.02] border-white/10 text-verse-text hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">Custom Model Identifier</span>
                {isCustom && <Check className="w-4 h-4 text-neon-violet shrink-0" />}
              </div>
              {isCustom && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="e.g. gemini-3.0-flash-preview"
                    className="w-full glass-input rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-neon-violet"
                    autoFocus
                  />
                  <p className="text-[10px] text-verse-muted mt-1.5">
                    Useful when Google AI Studio introduces new model previews or experimental checkpoints.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-verse-muted hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-xs font-mono font-semibold text-white bg-gradient-to-r from-neon-violet to-neon-cyan hover:opacity-90 shadow-neon-violet transition-all"
          >
            Apply Model
          </button>
        </div>
      </div>
    </div>
  );
}
