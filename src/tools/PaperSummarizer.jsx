import React, { useState } from 'react';
import { BookOpen, Upload, Sparkles, Copy, Check, RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { extractTextFromPdf, truncatePaperText } from '../lib/pdf';
import { callGemini } from '../lib/gemini';

const SAMPLE_PAPER = {
  name: 'ResNet: Deep Residual Learning for Image Recognition',
  text: `Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth. On the ImageNet dataset, we evaluate residual nets with a depth of up to 152 layers—8× deeper than VGG nets but still having lower complexity. An ensemble of these residual nets achieves 3.57% error on the ImageNet test set. This result won the 1st place on the ILSVRC 2015 classification task. We also present analysis on CIFAR-10 with 100 and 1000 layers. The degradation problem (accuracy getting saturated and then degrading rapidly) is addressed by the shortcut connections which perform identity mapping. However, residual networks require careful initialization, have increased memory footprint during backpropagation, and still suffer from vanishing gradients when depth exceeds 1000 layers without additional regularization.`
};

export default function PaperSummarizer({ apiKeys, activeKeyIndex, onSwitchKey, onSwitchModel, model, onOpenKeyModal }) {
  const [file, setFile] = useState(null);
  const [rawText, setRawText] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
        setError('Please upload a valid PDF document.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const loadSample = () => {
    setUseTextInput(true);
    setRawText(SAMPLE_PAPER.text);
    setError(null);
  };

  const handleSummarize = async () => {
    if (!apiKeys || apiKeys.length === 0 || !apiKeys.some((k) => k?.trim())) {
      onOpenKeyModal();
      return;
    }

    setError(null);
    setLoading(true);
    setSummaryData(null);

    try {
      let paperContent = '';

      if (useTextInput) {
        if (!rawText.trim() || rawText.trim().length < 40) {
          throw new Error('Please enter at least 40 characters of paper text.');
        }
        paperContent = truncatePaperText(rawText.trim(), 30000);
      } else {
        if (!file) {
          throw new Error('Please select a PDF file to summarize.');
        }
        setProgressMsg(`Extracting text from ${file.name}...`);
        const extracted = await extractTextFromPdf(file);
        if (extracted.isScanned) {
          throw new Error('This PDF contains almost no readable text (scanned image). Please upload a digital PDF.');
        }
        paperContent = truncatePaperText(extracted.text, 30000);
      }

      setProgressMsg('Gemini is generating simple-language breakdown and 5 key takeaways...');

      const systemInstruction = `You are an expert research communicator.
Break down this research paper into simple, understandable language suitable for college students.
You MUST output strictly in JSON with this exact schema:
{
  "title": "Full title of paper",
  "authors": "Authors list or 'Not mentioned'",
  "problem": "What problem is the paper trying to solve? (2-3 sentences)",
  "method": "What is their proposed method/solution? (2-3 sentences)",
  "dataset": "What dataset, benchmark, or experiments were used? (1-2 sentences)",
  "results": "What were the main quantitative/qualitative results? (2-3 sentences)",
  "limitations": "What limitations or drawbacks do the authors note? (1-2 sentences)",
  "takeaways": [
    "Takeaway 1 (clear sentence)",
    "Takeaway 2 (clear sentence)",
    "Takeaway 3 (clear sentence)",
    "Takeaway 4 (clear sentence)",
    "Takeaway 5 (clear sentence)"
  ]
}
Do not wrap in markdown or backticks.`;

      const prompt = `Summarize this research paper:\n\n${paperContent}`;

      const data = await callGemini({
        apiKeys,
        activeKeyIndex,
        onSwitchKey,
        onSwitchModel,
        model,
        systemInstruction,
        prompt,
        isJson: true,
        temperature: 0.2
      });

      if (!data || !data.title || !Array.isArray(data.takeaways)) {
        throw new Error('AI returned an unexpected format. Please retry.');
      }

      setSummaryData(data);
    } catch (err) {
      console.error('Summarize error:', err);
      if (err.needsKeyModal) {
        onOpenKeyModal();
      } else {
        setError(err.message || 'Failed to summarize paper.');
      }
    } finally {
      setLoading(false);
      setProgressMsg('');
    }
  };

  const handleCopy = () => {
    if (!summaryData) return;
    const text = `PAPER SUMMARY: ${summaryData.title}\nAuthors: ${summaryData.authors}\n\n` +
      `PROBLEM:\n${summaryData.problem}\n\n` +
      `METHOD:\n${summaryData.method}\n\n` +
      `DATASET:\n${summaryData.dataset}\n\n` +
      `RESULTS:\n${summaryData.results}\n\n` +
      `LIMITATIONS:\n${summaryData.limitations}\n\n` +
      `5 KEY TAKEAWAYS:\n` + summaryData.takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-white tracking-wide">
              Paper Summarizer
            </h2>
            <p className="text-sm text-verse-muted">
              Distill complex papers into simple problem, methodology, results, and 5 key takeaways.
            </p>
          </div>
        </div>

        <button
          onClick={loadSample}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-xl bg-white/5 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load ResNet Sample
        </button>
      </div>

      {/* Input Toggle */}
      <div className="flex items-center gap-3 bg-space-850 p-1.5 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setUseTextInput(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !useTextInput ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40' : 'text-verse-muted hover:text-white'
          }`}
        >
          Upload PDF File
        </button>
        <button
          onClick={() => setUseTextInput(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            useTextInput ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40' : 'text-verse-muted hover:text-white'
          }`}
        >
          Paste Paper Text
        </button>
      </div>

      {/* Input Area */}
      {!useTextInput ? (
        <div className="border-2 border-dashed border-white/20 hover:border-neon-cyan/50 rounded-2xl p-8 text-center transition-all bg-white/[0.02]">
          <input
            type="file"
            id="summary-pdf"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="summary-pdf" className="cursor-pointer flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
              <Upload className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-base font-medium text-white">
                {file ? file.name : 'Choose a research paper PDF to summarize'}
              </p>
              <p className="text-xs text-verse-muted mt-1">
                Reads text in-browser and extracts key structural insights
              </p>
            </div>
          </label>
        </div>
      ) : (
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste paper abstract or full text here..."
          rows={6}
          className="w-full text-xs font-mono glass-input rounded-xl p-4 resize-none"
        />
      )}

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handleSummarize}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-heading font-semibold text-white bg-gradient-to-r from-neon-cyan to-neon-violet hover:opacity-95 shadow-neon-cyan transition-all transform active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Distilling Research...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Summarize Paper</span>
            </>
          )}
        </button>

        {loading && (
          <span className="text-xs font-mono text-neon-cyan animate-pulse">
            {progressMsg}
          </span>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
          <div>
            <p className="font-semibold">Summarization Error</p>
            <p className="text-xs mt-1 text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Output */}
      {summaryData && (
        <div className="space-y-6 pt-4 animate-in fade-in duration-500">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-xl font-bold font-heading text-white">
                {summaryData.title}
              </h3>
              <p className="text-xs font-mono text-verse-muted mt-1">
                Authors: {summaryData.authors}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-verse-muted hover:text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-neon-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* 5 Takeaways Banner */}
          <div className="p-6 rounded-2xl glass-panel border-neon-cyan/30 space-y-3">
            <h4 className="text-sm font-heading font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neon-pink" />
              5 Core Takeaways
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {summaryData.takeaways.map((takeaway, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-verse-text">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan flex items-center justify-center text-xs font-mono font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed">{takeaway}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Structural Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-neon-violet font-semibold">
                Problem Addressed
              </span>
              <p className="text-xs text-verse-text leading-relaxed">
                {summaryData.problem}
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-neon-cyan font-semibold">
                Methodology & Design
              </span>
              <p className="text-xs text-verse-text leading-relaxed">
                {summaryData.method}
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-neon-pink font-semibold">
                Dataset / Benchmark
              </span>
              <p className="text-xs text-verse-text leading-relaxed">
                {summaryData.dataset}
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-neon-emerald font-semibold">
                Key Results & Metrics
              </span>
              <p className="text-xs text-verse-text leading-relaxed">
                {summaryData.results}
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-2 md:col-span-2">
              <span className="text-xs font-mono uppercase tracking-wider text-neon-amber font-semibold">
                Limitations & Future Work
              </span>
              <p className="text-xs text-verse-text leading-relaxed">
                {summaryData.limitations}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
