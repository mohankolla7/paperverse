import React, { useState } from 'react';
import { FileText, Upload, Sparkles, Download, Copy, Check, RefreshCw, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { extractTextFromPdf, truncatePaperText } from '../lib/pdf';
import { callGemini } from '../lib/gemini';
import { exportComparisonToCsv } from '../lib/csv';

// High quality sample data so college evaluators can test instantly without uploading 3 files
const SAMPLE_PAPERS = [
  {
    title: 'Paper 1: Attention Is All You Need (Vaswani et al.)',
    text: `The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. On WMT 2014 English-to-German translation, our model achieves 28.4 BLEU, improving over the existing best results by over 2 BLEU. On WMT 2014 English-to-French translation, our model establishes a single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs. However, the quadratic complexity O(n^2) with respect to input sequence length limits scalability for ultra-long documents.`
  },
  {
    title: 'Paper 2: BERT: Pre-training of Deep Bidirectional Transformers (Devlin et al.)',
    text: `We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks, such as question answering and language inference, without substantial task-specific architecture modifications. BERT advances the state-of-the-art for eleven natural language processing tasks, achieving 80.5% GLUE score and 86.7% SQuAD 1.1 F1. However, BERT requires extensive compute during pretraining, suffers from discrepancy between pretraining (mask tokens) and fine-tuning, and assumes static context windows.`
  },
  {
    title: 'Paper 3: LoRA: Low-Rank Adaptation of Large Language Models (Hu et al.)',
    text: `An important paradigm of natural language processing consists of large-scale pre-training on general domain data and adaptation to specific downstream tasks. As we pre-train larger models, full fine-tuning, which retrains all model parameters, becomes less feasible. Using GPT-3 175B as an example, deploying independent fine-tuned instances of the model for every task is prohibitively expensive. We propose Low-Rank Adaptation, or LoRA, which freezes the pre-trained model weights and injects trainable rank decomposition matrices into each layer of the Transformer architecture, greatly reducing the number of trainable parameters for downstream tasks. Compared to fine-tuning of GPT-3 175B with Adam, LoRA can reduce the number of trainable parameters by 10,000 times and the GPU memory requirement by 3 times. Evaluated on RoBERTa, DeBERTa, and GPT-3 benchmarks, LoRA performs on par or better than full fine-tuning despite having significantly fewer trainable parameters. A limitation is that LoRA cannot easily combine multiple adapters for batch processing with heterogeneous task requests.`
  }
];

export default function LiteratureReview({ apiKeys, activeKeyIndex, onSwitchKey, onSwitchModel, model, onOpenKeyModal }) {
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'text'
  const [files, setFiles] = useState([]);
  const [textInputs, setTextInputs] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [error, setError] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Handle PDF file uploads (up to 3 files)
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length + files.length > 3) {
      setError('Please select at most 3 PDF papers for literature comparison.');
      return;
    }
    const pdfs = selected.filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (pdfs.length !== selected.length) {
      setError('Only PDF documents are supported.');
    }
    setFiles((prev) => [...prev, ...pdfs].slice(0, 3));
    setError(null);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle text input changes
  const handleTextChange = (index, value) => {
    setTextInputs((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addTextInput = () => {
    if (textInputs.length < 3) {
      setTextInputs((prev) => [...prev, '']);
    }
  };

  const removeTextInput = (index) => {
    if (textInputs.length > 2) {
      setTextInputs((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const loadSampleData = () => {
    setInputMode('text');
    setTextInputs(SAMPLE_PAPERS.map((p) => `${p.title}\n\n${p.text}`));
    setError(null);
  };

  // Run the literature comparison
  const runComparison = async () => {
    if (!apiKeys || apiKeys.length === 0 || !apiKeys.some((k) => k?.trim())) {
      onOpenKeyModal();
      return;
    }

    setError(null);
    setLoading(true);
    setComparisonResult(null);

    try {
      let paperTexts = [];

      if (inputMode === 'upload') {
        if (files.length < 2) {
          throw new Error('Please upload at least 2 PDF papers (maximum 3) to compare.');
        }

        for (let i = 0; i < files.length; i++) {
          setProgressMsg(`Parsing PDF ${i + 1} of ${files.length}: ${files[i].name}...`);
          const extracted = await extractTextFromPdf(files[i]);
          if (extracted.isScanned) {
            throw new Error(`Paper "${files[i].name}" has almost no readable text (likely a scanned image). Please upload a digital PDF.`);
          }
          paperTexts.push(`--- PAPER ${i + 1}: ${files[i].name} ---\n${truncatePaperText(extracted.text, 30000)}`);
        }
      } else {
        const validTexts = textInputs.filter((t) => t.trim().length > 30);
        if (validTexts.length < 2) {
          throw new Error('Please paste content or abstracts for at least 2 papers (at least 30 characters each).');
        }
        paperTexts = validTexts.map((t, i) => `--- PAPER ${i + 1} ---\n${truncatePaperText(t.trim(), 30000)}`);
      }

      setProgressMsg('Gemini is synthesizing methodologies, benchmarks, and research gaps...');

      const systemInstruction = `You are an expert academic meta-reviewer.
Input is ${paperTexts.length} research papers.
Your task is to analyze and compare them strictly based on the provided text.
You MUST output JSON with this exact schema:
{
  "papers": [
    {
      "title": "Exact or inferred Paper Title",
      "year": "Publication Year (e.g., 2017, or 'Not mentioned')",
      "problem": "Clear 1-2 sentence statement of the core problem tackled",
      "method": "Core algorithm, architecture, or methodology used",
      "dataset": "Datasets, benchmarks, or testbeds evaluated on",
      "result": "Specific quantitative metrics, scores, or achievements reported",
      "limitation": "Explicit or evident limitations, computational bottlenecks, or weaknesses"
    }
  ],
  "research_gap": "A cohesive 60-100 word academic paragraph identifying the unaddressed gap, divergence, or future opportunity between these approaches."
}
Do not include Markdown backticks or any prefix/suffix outside the JSON.`;

      const prompt = `Here are the ${paperTexts.length} papers to compare:\n\n${paperTexts.join('\n\n====================\n\n')}`;

      const data = await callGemini({
        apiKeys,
        activeKeyIndex,
        onSwitchKey,
        onSwitchModel,
        model,
        systemInstruction,
        prompt,
        isJson: true,
        temperature: 0.15
      });

      if (!data || !Array.isArray(data.papers) || data.papers.length === 0) {
        throw new Error('Failed to parse paper comparison from Gemini response.');
      }

      setComparisonResult(data);
    } catch (err) {
      console.error('Literature comparison error:', err);
      if (err.needsKeyModal) {
        onOpenKeyModal();
      } else {
        setError(err.message || 'An error occurred during comparison.');
      }
    } finally {
      setLoading(false);
      setProgressMsg('');
    }
  };

  const handleCopy = () => {
    if (!comparisonResult) return;
    const textToCopy = `LITERATURE REVIEW COMPARISON\n\n` +
      comparisonResult.papers.map((p, idx) => `[Paper ${idx + 1}] ${p.title} (${p.year})\n- Problem: ${p.problem}\n- Method: ${p.method}\n- Dataset: ${p.dataset}\n- Results: ${p.result}\n- Limitations: ${p.limitation}\n`).join('\n') +
      `\nRESEARCH GAP SYNTHESIS:\n${comparisonResult.research_gap}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!comparisonResult) return;
    exportComparisonToCsv(comparisonResult.papers, comparisonResult.research_gap, 'paperverse_literature_comparison.csv');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header and Explanation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neon-violet/20 border border-neon-violet/40 text-neon-cyan">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading text-white tracking-wide">
                Literature Review Comparison
              </h2>
              <p className="text-sm text-verse-muted">
                Synthesize 2–3 papers side-by-side, benchmark architectures, and isolate the research gap.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadSampleData}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-xl bg-white/5 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 transition-colors"
          title="Load Transformer, BERT, and LoRA excerpts"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Benchmark Sample
        </button>
      </div>

      {/* Input Mode Selector */}
      <div className="flex items-center gap-3 bg-space-850 p-1.5 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setInputMode('upload')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            inputMode === 'upload'
              ? 'bg-neon-violet text-white shadow-neon-violet'
              : 'text-verse-muted hover:text-white'
          }`}
        >
          Upload 2–3 PDFs
        </button>
        <button
          onClick={() => setInputMode('text')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            inputMode === 'text'
              ? 'bg-neon-violet text-white shadow-neon-violet'
              : 'text-verse-muted hover:text-white'
          }`}
        >
          Paste Abstracts / Text
        </button>
      </div>

      {/* Mode 1: PDF Upload Dropzone */}
      {inputMode === 'upload' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-white/20 hover:border-neon-cyan/50 rounded-2xl p-8 text-center transition-all bg-white/[0.02]">
            <input
              type="file"
              id="pdf-files"
              multiple
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={files.length >= 3}
            />
            <label
              htmlFor="pdf-files"
              className="cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <div className="w-14 h-14 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan">
                <Upload className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-base font-medium text-white">
                  Click to select 2 or 3 PDF papers
                </p>
                <p className="text-xs text-verse-muted mt-1">
                  Client-side PDF parsing. No files are uploaded to an external server.
                </p>
              </div>
            </label>
          </div>

          {/* Uploaded File Badges */}
          {files.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-space-850 border border-white/10"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-neon-cyan shrink-0" />
                    <span className="text-xs font-mono text-verse-text truncate">
                      {file.name}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-verse-muted hover:text-red-400 p-1"
                    title="Remove paper"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Text Inputs */}
      {inputMode === 'text' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {textInputs.map((text, idx) => (
              <div key={idx} className="relative flex flex-col rounded-xl glass-panel p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neon-cyan font-semibold">
                    Paper #{idx + 1}
                  </span>
                  {textInputs.length > 2 && (
                    <button
                      onClick={() => removeTextInput(idx)}
                      className="text-verse-muted hover:text-red-400 p-1"
                      title="Remove input"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <textarea
                  value={text}
                  onChange={(e) => handleTextChange(idx, e.target.value)}
                  placeholder={`Paste Paper #${idx + 1} title, abstract, or methodology...`}
                  rows={8}
                  className="w-full text-xs font-mono glass-input rounded-lg p-3 resize-none focus:ring-1 focus:ring-neon-cyan"
                />
              </div>
            ))}
          </div>

          {textInputs.length < 3 && (
            <button
              onClick={addTextInput}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-verse-muted hover:text-white hover:border-white/30"
            >
              <Plus className="w-3.5 h-3.5" />
              Add 3rd Paper Slot
            </button>
          )}
        </div>
      )}

      {/* Action CTA & Error banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          onClick={runComparison}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-heading font-semibold text-white bg-gradient-to-r from-neon-violet via-neon-cyan to-neon-pink hover:opacity-95 shadow-neon-violet transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Analyzing Literature...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Comparison Matrix</span>
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
          <div className="flex-1">
            <p className="font-semibold">Comparison Error</p>
            <p className="text-xs mt-1 text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Comparison Results Table & Research Gap */}
      {comparisonResult && (
        <div className="space-y-6 pt-4 animate-in fade-in duration-500">
          {/* Action toolbar */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-neon-cyan" />
              Synthesis & Comparison Matrix ({comparisonResult.papers.length} Papers)
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-verse-muted hover:text-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-neon-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownloadCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/30"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV (Excel BOM)
              </button>
            </div>
          </div>

          {/* Research Gap Highlight Card */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-neon-violet/15 via-space-850 to-neon-cyan/10 border border-neon-violet/40 shadow-neon-violet">
            <div className="flex items-center gap-2 text-neon-cyan font-heading font-bold text-sm tracking-wider uppercase mb-2">
              <Sparkles className="w-4 h-4 text-neon-pink" />
              Synthesized Research Gap
            </div>
            <p className="text-verse-text text-sm leading-relaxed">
              {comparisonResult.research_gap}
            </p>
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 glass-panel">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04]">
                  <th className="p-4 font-mono font-semibold text-verse-muted w-44 uppercase tracking-wider">
                    Metric
                  </th>
                  {comparisonResult.papers.map((p, idx) => (
                    <th key={idx} className="p-4 font-heading font-bold text-white min-w-[240px]">
                      <div className="text-neon-cyan text-[11px] font-mono uppercase tracking-wide">
                        Paper {idx + 1}
                      </div>
                      <div className="text-sm font-semibold mt-0.5 line-clamp-2">
                        {p.title || 'Untitled'}
                      </div>
                      <div className="text-xs text-verse-muted font-normal font-mono mt-0.5">
                        Year: {p.year || 'N/A'}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-4 font-mono font-medium text-neon-violet bg-white/[0.01]">
                    Problem
                  </td>
                  {comparisonResult.papers.map((p, idx) => (
                    <td key={idx} className="p-4 text-verse-text leading-relaxed">
                      {p.problem || 'Not mentioned'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-mono font-medium text-neon-cyan bg-white/[0.01]">
                    Methodology
                  </td>
                  {comparisonResult.papers.map((p, idx) => (
                    <td key={idx} className="p-4 text-verse-text leading-relaxed">
                      {p.method || 'Not mentioned'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-mono font-medium text-neon-pink bg-white/[0.01]">
                    Dataset / Benchmark
                  </td>
                  {comparisonResult.papers.map((p, idx) => (
                    <td key={idx} className="p-4 text-verse-text leading-relaxed">
                      {p.dataset || 'Not mentioned'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-mono font-medium text-neon-emerald bg-white/[0.01]">
                    Results & Metrics
                  </td>
                  {comparisonResult.papers.map((p, idx) => (
                    <td key={idx} className="p-4 text-verse-text leading-relaxed">
                      {p.result || 'Not mentioned'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-mono font-medium text-neon-amber bg-white/[0.01]">
                    Limitations
                  </td>
                  {comparisonResult.papers.map((p, idx) => (
                    <td key={idx} className="p-4 text-verse-text leading-relaxed">
                      {p.limitation || 'Not mentioned'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
