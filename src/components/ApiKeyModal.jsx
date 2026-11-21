import React, { useState } from 'react';
import { Key, X, ExternalLink, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, Trash2, Eye, EyeOff, Plus, Cpu } from 'lucide-react';
import { validateGeminiKey, AVAILABLE_MODELS } from '../lib/gemini';

export default function ApiKeyModal({
  isOpen,
  onClose,
  apiKeys,
  onSaveKeys,
  onClearKeys,
  activeKeyIndex,
  onSetActiveKeyIndex,
  currentModel,
  onSaveModel
}) {
  const [keysInput, setKeysInput] = useState(() => {
    const list = [...(apiKeys || [])];
    while (list.length < 1) list.push('');
    return list;
  });

  const [selectedModel, setSelectedModel] = useState(currentModel || 'gemini-3.5-flash');
  const [showKey, setShowKey] = useState([false, false, false]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [successNote, setSuccessNote] = useState('');
  const [validationError, setValidationError] = useState(null);

  if (!isOpen) return null;

  const handleKeyChange = (index, value) => {
    setKeysInput((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
    setValidationError(null);
    setValidationSuccess(false);
  };

  const addKeySlot = () => {
    if (keysInput.length < 3) {
      setKeysInput((prev) => [...prev, '']);
    }
  };

  const removeKeySlot = (index) => {
    setKeysInput((prev) => prev.filter((_, i) => i !== index));
    setValidationError(null);
    setValidationSuccess(false);
  };

  const toggleShowKey = (index) => {
    setShowKey((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleConnect = async () => {
    const valid = keysInput.map((k) => (k || '').trim()).filter(Boolean);

    if (valid.length === 0) {
      setValidationError('Please enter at least one valid Gemini API key.');
      return;
    }

    setIsValidating(true);
    setValidationError(null);
    setValidationSuccess(false);
    setSuccessNote('');

    try {
      // Validate key and auto-discover supported model
      const result = await validateGeminiKey(valid[0], selectedModel);

      if (result.workingModel && onSaveModel) {
        onSaveModel(result.workingModel);
        setSelectedModel(result.workingModel);
      }

      setValidationSuccess(true);
      setSuccessNote(result.note || `Verified successfully on ${result.workingModel}!`);
      onSaveKeys(valid);

      // Brief animation before closing
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('API key verification error:', err);
      setValidationError(err.message || 'Key validation failed. Please check the key.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleForget = () => {
    setKeysInput(['']);
    onClearKeys();
    setValidationSuccess(false);
    setValidationError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-white/15 p-6 md:p-8 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neon-violet/20 border border-neon-violet/40 text-neon-violet">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading text-white">
                Paste your Gemini API key
              </h3>
              <p className="text-xs text-verse-muted">
                PaperVerse Key Manager & Multi-Key Failover
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

        {/* Security Notice */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20 text-xs text-verse-text">
          <ShieldCheck className="w-5 h-5 text-neon-cyan shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-neon-cyan">Pure In-Memory Security</p>
            <p className="text-verse-muted leading-relaxed">
              Your API keys are stored exclusively in temporary React memory. They are <strong>never</strong> saved to
              localStorage, cookies, backend servers, or logged to the console.
            </p>
          </div>
        </div>

        {/* Model Selection Dropdown inside Key Modal */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-verse-muted flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-neon-cyan" />
              Active Gemini Model
            </label>
            <span className="text-[10px] font-mono text-neon-cyan">
              Auto-probes fallback if not found
            </span>
          </div>
          <select
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              if (onSaveModel) onSaveModel(e.target.value);
            }}
            className="w-full glass-input rounded-xl px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-neon-cyan cursor-pointer bg-space-850"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-space-900 text-white">
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Key Inputs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono uppercase tracking-wider text-verse-muted">
              Gemini API Keys (Up to 3 for automatic failover)
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono text-neon-cyan hover:underline"
            >
              Get a free key
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-2.5">
            {keysInput.map((val, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-verse-muted">
                  <span>
                    Key #{idx + 1} {idx === 0 ? '(Primary Active Key)' : `(Backup Key ${idx + 1})`}
                  </span>
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => removeKeySlot(idx)}
                      className="text-verse-muted hover:text-red-400 p-0.5"
                      title="Remove key slot"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showKey[idx] ? 'text' : 'password'}
                    value={val}
                    onChange={(e) => handleKeyChange(idx, e.target.value)}
                    placeholder={`AIzaSy... (Gemini key #${idx + 1})`}
                    className="w-full glass-input rounded-xl px-4 py-2.5 pr-14 text-xs font-mono focus:ring-1 focus:ring-neon-violet"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleShowKey(idx)}
                      className="p-1 text-verse-muted hover:text-white"
                      title={showKey[idx] ? 'Mask key' : 'Reveal key'}
                    >
                      {showKey[idx] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {keysInput.length < 3 && (
            <button
              type="button"
              onClick={addKeySlot}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-neon-violet hover:text-neon-cyan transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Backup Key Slot ({keysInput.length}/3)
            </button>
          )}
        </div>

        {/* Validation Feedback */}
        {validationSuccess && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-neon-emerald shrink-0" />
            <span>{successNote || 'Key validated successfully! Initializing PaperVerse research engine...'}</span>
          </div>
        )}

        {validationError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleForget}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Forget Keys
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-verse-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConnect}
              disabled={isValidating}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-heading text-xs font-semibold text-white bg-gradient-to-r from-neon-violet via-neon-cyan to-neon-pink hover:opacity-95 shadow-neon-violet transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Testing Key...</span>
                </>
              ) : (
                <span>Connect & Save</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
