import React, { useState } from 'react';
import { Sparkles, Copy, Check, RefreshCw, AlertCircle, Lightbulb, Compass, Target, Rocket } from 'lucide-react';
import { callGemini } from '../lib/gemini';

const SAMPLE_IDEA = {
  domain: 'Computer Vision & Healthcare AI',
  idea: 'Using low-cost smartphone cameras with lightweight vision transformers to detect early signs of diabetic retinopathy in rural clinics where ophthalmologists are scarce.'
};

export default function GeneratorTool({ apiKeys, activeKeyIndex, onSwitchKey, model, onOpenKeyModal }) {
  const [domain, setDomain] = useState('');
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadSample = () => {
    setDomain(SAMPLE_IDEA.domain);
    setIdea(SAMPLE_IDEA.idea);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!idea.trim() || idea.trim().length < 20) {
      setError('Please provide at least a 2-3 line research idea (minimum 20 characters).');
      return;
    }

    if (!apiKeys || apiKeys.length === 0 || !apiKeys.some((k) => k?.trim())) {
      onOpenKeyModal();
      return;
    }

    setError(null);
    setLoading(true);
    setResult(null);

    try {
      const systemInstruction = `You are an elite academic publication strategist and grant proposal expert.
Given a research idea and domain, generate a professional publication package.
You MUST output strictly in JSON with this exact schema:
{
  "titles": [
    "Academic Title 1 (formal & comprehensive)",
    "Academic Title 2 (punchy & innovative)",
    "Academic Title 3 (application-driven)"
  ],
  "abstract": "A rigorous, publication-ready academic abstract between 150 and 200 words following standard structure: background, problem, methodology, anticipated results, and clinical/scientific impact.",
  "keywords": [
    "Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5"
  ],
  "objectives": [
    "Core Objective 1",
    "Core Objective 2",
    "Core Objective 3"
  ],
  "future_enhancements": [
    "Future Enhancement 1",
    "Future Enhancement 2",
    "Future Enhancement 3"
  ]
}
Do not include backticks or markdown wrapper.`;

      const prompt = `Research Domain: ${domain || 'General Computer Science & Artificial Intelligence'}
Research Idea: ${idea}`;

      const data = await callGemini({
        apiKeys,
        activeKeyIndex,
        onSwitchKey,
        model,
        systemInstruction,
        prompt,
        isJson: true,
        temperature: 0.3
      });

      if (!data || !Array.isArray(data.titles) || !data.abstract) {
        throw new Error('Failed to generate full research proposal package.');
      }

      setResult(data);
    } catch (err) {
      console.error('Generation error:', err);
      if (err.needsKeyModal) {
        onOpenKeyModal();
      } else {
        setError(err.message || 'Failed to generate content.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `PROPOSED TITLES:\n` + result.titles.map((t, i) => `${i + 1}. ${t}`).join('\n') +
      `\n\nABSTRACT (150-200 Words):\n${result.abstract}\n\n` +
      `KEYWORDS: ${result.keywords.join(', ')}\n\n` +
      `RESEARCH OBJECTIVES:\n` + result.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n') +
      `\n\nFUTURE ENHANCEMENTS:\n` + result.future_enhancements.map((f, i) => `${i + 1}. ${f}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/40 text-neon-emerald">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-white tracking-wide">
              Title, Abstract & Keyword Generator
            </h2>
            <p className="text-sm text-verse-muted">
              Convert a raw thesis concept into 3 IEEE-standard titles, a 150–200 word abstract, keywords, and roadmap.
            </p>
          </div>
        </div>

        <button
          onClick={loadSample}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-xl bg-white/5 border border-neon-emerald/30 text-neon-emerald hover:bg-neon-emerald/10 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Health-AI Sample
        </button>
      </div>

      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-verse-muted mb-2">
            Target Research Field / Domain (Optional)
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g. Distributed Systems, Computational Neuroscience, Edge AI"
            className="w-full glass-input rounded-xl px-4 py-3 text-xs font-mono focus:ring-1 focus:ring-neon-emerald"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-verse-muted mb-2">
            Your Core Idea / Thesis Statement (2–3 lines)
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your mechanism, the problem it solves, and why traditional methods fail..."
            rows={4}
            className="w-full glass-input rounded-xl p-4 text-xs font-mono focus:ring-1 focus:ring-neon-emerald resize-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-heading font-semibold text-white bg-gradient-to-r from-neon-emerald via-neon-cyan to-neon-violet hover:opacity-95 shadow-neon-emerald transition-all transform active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Generating Publication Package...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Titles & Abstract</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
          <div>
            <p className="font-semibold">Generation Error</p>
            <p className="text-xs mt-1 text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Output Display */}
      {result && (
        <div className="space-y-6 pt-4 animate-in fade-in duration-500">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-emerald" />
              Generated Publication Package
            </h3>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-verse-muted hover:text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-neon-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Full Package' : 'Copy All'}
            </button>
          </div>

          {/* 3 Titles Card */}
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-neon-emerald font-semibold flex items-center gap-2">
              <Compass className="w-4 h-4" />
              3 Candidate Titles
            </span>
            <div className="space-y-2">
              {result.titles.map((t, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-sm font-heading font-medium text-white flex items-start gap-3">
                  <span className="text-neon-emerald font-mono font-bold text-xs">{idx + 1}.</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Abstract */}
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-neon-cyan font-semibold">
                Academic Abstract (150–200 Words)
              </span>
              <span className="text-[11px] font-mono text-verse-muted">
                Word count: {result.abstract.split(/\s+/).filter(Boolean).length}
              </span>
            </div>
            <p className="text-xs text-verse-text leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5 font-mono">
              {result.abstract}
            </p>
          </div>

          {/* Keywords */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-neon-pink font-semibold">
              Indexed Keywords
            </span>
            <div className="flex flex-wrap gap-2">
              {result.keywords.map((kw, i) => (
                <span key={i} className="px-3 py-1 rounded-lg text-xs font-mono bg-neon-pink/10 border border-neon-pink/30 text-neon-pink">
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {/* Objectives and Future Enhancements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-neon-violet font-semibold flex items-center gap-2">
                <Target className="w-4 h-4" />
                Key Research Objectives
              </span>
              <ul className="space-y-2 text-xs text-verse-text">
                {result.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-neon-violet font-bold">•</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-neon-amber font-semibold flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Future Enhancements & Scope
              </span>
              <ul className="space-y-2 text-xs text-verse-text">
                {result.future_enhancements.map((enh, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-neon-amber font-bold">•</span>
                    <span>{enh}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
