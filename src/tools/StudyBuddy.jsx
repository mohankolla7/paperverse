import React, { useState } from 'react';
import { GraduationCap, Upload, Sparkles, Copy, Check, RefreshCw, AlertCircle, HelpCircle, BookMarked, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { extractTextFromPdf, truncatePaperText } from '../lib/pdf';
import { callGemini } from '../lib/gemini';

const SAMPLE_NOTES = `Distributed Consensus and the Raft Algorithm:
Consensus involves multiple servers agreeing on values to maintain consistent state despite network partitions or server crashes. Paxos was historically the standard consensus protocol, but is notoriously difficult to understand and implement. Raft was designed by Ongaro and Ousterhout at Stanford with an explicit goal of understandability.

Raft decomposes consensus into three independent subproblems:
1. Leader Election: A cluster begins with all servers as followers. If followers do not hear heartbeats from a leader within a randomized election timeout (typically 150-300ms), they transition to candidate state and request votes.
2. Log Replication: The leader accepts log entries from clients and distributes them to follower nodes. Once an entry is safely replicated on a majority of nodes (quorum), the leader commits it and applies it to its local state machine.
3. Safety: If any server has applied a particular log entry at a given index to its state machine, no other server will ever apply a different log entry for the same index. The Raft leader election ensures that a candidate cannot be elected unless its log contains all committed entries.

Split votes in Raft are prevented through randomized election timeouts, ensuring that one candidate usually times out before others and wins the majority quorum.`;

export default function StudyBuddy({ apiKeys, activeKeyIndex, onSwitchKey, model, onOpenKeyModal }) {
  const [file, setFile] = useState(null);
  const [notesText, setNotesText] = useState('');
  const [useTextInput, setUseTextInput] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studyData, setStudyData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { qIndex: chosenOptionIndex }
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const extracted = await extractTextFromPdf(selected);
      if (extracted.isScanned) {
        throw new Error('This PDF has almost no readable text (scanned image).');
      }
      setNotesText(truncatePaperText(extracted.text, 30000));
      setFile(selected);
      setUseTextInput(false);
    } catch (err) {
      setError(err.message || 'Failed to read PDF.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setUseTextInput(true);
    setNotesText(SAMPLE_NOTES);
    setFile(null);
    setError(null);
  };

  const handleGenerateStudyGuide = async () => {
    if (!notesText.trim() || notesText.trim().length < 40) {
      setError('Please enter at least 40 characters of lecture notes or upload a PDF.');
      return;
    }

    if (!apiKeys || apiKeys.length === 0 || !apiKeys.some((k) => k?.trim())) {
      onOpenKeyModal();
      return;
    }

    setError(null);
    setLoading(true);
    setStudyData(null);
    setSelectedAnswers({});

    try {
      const systemInstruction = `You are a warm, encouraging university peer tutor.
Based strictly on the provided study material, generate a high-yield study kit.
You MUST output strictly in JSON with this exact schema:
{
  "summary_bullets": [
    "High-yield takeaway 1",
    "High-yield takeaway 2",
    "High-yield takeaway 3",
    "High-yield takeaway 4",
    "High-yield takeaway 5",
    "High-yield takeaway 6"
  ],
  "questions": [
    {
      "question": "Clear conceptual question testing understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Clear explanation of why this answer is correct according to the notes."
    }
  ],
  "key_terms": [
    {
      "term": "Term Name",
      "definition": "Precise, exam-ready definition in 1-2 sentences."
    },
    {
      "term": "Term Name 2",
      "definition": "Precise definition."
    },
    {
      "term": "Term Name 3",
      "definition": "Precise definition."
    }
  ]
}
Ensure exactly 5-6 summary bullets, exactly 5 multiple choice questions, and exactly 3 key terms.
Do not wrap in markdown or backticks.`;

      const prompt = `STUDY MATERIAL:\n${notesText}`;

      const data = await callGemini({
        apiKeys,
        activeKeyIndex,
        onSwitchKey,
        model,
        systemInstruction,
        prompt,
        isJson: true,
        temperature: 0.2
      });

      if (!data || !Array.isArray(data.summary_bullets) || !Array.isArray(data.questions)) {
        throw new Error('AI returned incomplete study guide data. Please try again.');
      }

      setStudyData(data);
    } catch (err) {
      console.error('Study guide error:', err);
      if (err.needsKeyModal) {
        onOpenKeyModal();
      } else {
        setError(err.message || 'Failed to create study guide.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx, optIdx, correctIdx) => {
    // Only set if not already answered
    if (selectedAnswers[qIdx] !== undefined) return;

    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));

    if (optIdx === correctIdx) {
      // Trigger festive student celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#7C3AED', '#22D3EE', '#F472B6']
        });
      } catch (e) {
        // Safe if canvas-confetti is not loaded
      }
    }
  };

  const handleCopy = () => {
    if (!studyData) return;
    const text = `PAPERVERSE STUDY GUIDE\n\n` +
      `KEY BULLETS:\n` + studyData.summary_bullets.map((b, i) => `• ${b}`).join('\n') +
      `\n\nCORE VOCABULARY & TERMS:\n` + studyData.key_terms.map((t) => `${t.term}: ${t.definition}`).join('\n') +
      `\n\n5 EXAM PRACTICE QUESTIONS:\n` + studyData.questions.map((q, i) =>
        `Q${i + 1}: ${q.question}\n` +
        q.options.map((opt, oIdx) => `  [${String.fromCharCode(65 + oIdx)}] ${opt}`).join('\n') +
        `\n  Correct Answer: [${String.fromCharCode(65 + q.correct_index)}] - ${q.explanation}\n`
      ).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neon-violet/20 border border-neon-violet/40 text-neon-violet">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-white tracking-wide">
              Study Buddy & Interactive Quiz
            </h2>
            <p className="text-sm text-verse-muted">
              Convert raw notes into 5–6 bullet summaries, 3 key terms, and 5 interactive self-check questions.
            </p>
          </div>
        </div>

        <button
          onClick={loadSample}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-xl bg-white/5 border border-neon-violet/30 text-neon-cyan hover:bg-neon-violet/10 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Raft Consensus Sample
        </button>
      </div>

      {/* Input Toggle */}
      <div className="flex items-center gap-3 bg-space-850 p-1.5 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setUseTextInput(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            useTextInput ? 'bg-neon-violet text-white shadow-neon-violet' : 'text-verse-muted hover:text-white'
          }`}
        >
          Paste Lecture Notes
        </button>
        <button
          onClick={() => setUseTextInput(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            !useTextInput ? 'bg-neon-violet text-white shadow-neon-violet' : 'text-verse-muted hover:text-white'
          }`}
        >
          Upload PDF File
        </button>
      </div>

      {/* Input Form */}
      {useTextInput ? (
        <textarea
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
          placeholder="Paste lecture notes, book chapter excerpt, or textbook notes here..."
          rows={6}
          className="w-full text-xs font-mono glass-input rounded-xl p-4 resize-none"
        />
      ) : (
        <div className="border-2 border-dashed border-white/20 hover:border-neon-violet/50 rounded-2xl p-8 text-center transition-all bg-white/[0.02]">
          <input
            type="file"
            id="study-pdf"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="study-pdf" className="cursor-pointer flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-neon-violet/10 border border-neon-violet/30 flex items-center justify-center text-neon-cyan">
              <Upload className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-base font-medium text-white">
                {file ? file.name : 'Upload notes or research paper PDF'}
              </p>
              <p className="text-xs text-verse-muted mt-1">
                Reads the document in-browser and prepares interactive study questions
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Action CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handleGenerateStudyGuide}
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-heading font-semibold text-white bg-gradient-to-r from-neon-violet via-neon-pink to-neon-cyan hover:opacity-95 shadow-neon-violet transition-all transform active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Building Study Guide & Quiz...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Study Kit</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
          <div>
            <p className="font-semibold">Study Kit Error</p>
            <p className="text-xs mt-1 text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Generated Study Guide */}
      {studyData && (
        <div className="space-y-8 pt-4 animate-in fade-in duration-500">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xl font-bold font-heading text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-cyan" />
              Interactive Study Kit
            </h3>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-verse-muted hover:text-white"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-neon-emerald" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy All'}
            </button>
          </div>

          {/* 5-6 Bullet Summary */}
          <div className="glass-panel p-6 rounded-2xl space-y-3">
            <h4 className="text-sm font-heading font-bold text-neon-cyan uppercase tracking-wider flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-neon-pink" />
              Core Takeaways & High-Yield Bullets
            </h4>
            <ul className="space-y-2.5">
              {studyData.summary_bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs text-verse-text">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan shrink-0 mt-2" />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3 Key Terms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {studyData.key_terms.map((termItem, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl space-y-2 border-neon-violet/30">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neon-violet font-semibold">
                  Term #{idx + 1}
                </span>
                <h5 className="text-sm font-bold font-heading text-white">
                  {termItem.term}
                </h5>
                <p className="text-xs text-verse-muted leading-relaxed font-mono">
                  {termItem.definition}
                </p>
              </div>
            ))}
          </div>

          {/* 5 Interactive Multiple Choice Questions */}
          <div className="space-y-4">
            <h4 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-neon-pink" />
              Interactive Practice Quiz (5 Questions)
            </h4>
            <p className="text-xs text-verse-muted">
              Click an option to test your understanding and view the verified explanation.
            </p>

            <div className="space-y-4">
              {studyData.questions.map((q, qIdx) => {
                const userChoice = selectedAnswers[qIdx];
                const hasAnswered = userChoice !== undefined;
                const isCorrect = userChoice === q.correct_index;

                return (
                  <div
                    key={qIdx}
                    className="glass-panel p-6 rounded-2xl space-y-4 border border-white/10"
                  >
                    <div className="flex items-start gap-3">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-neon-pink/20 border border-neon-pink/40 text-neon-pink flex items-center justify-center text-xs font-mono font-bold mt-0.5">
                        {qIdx + 1}
                      </span>
                      <p className="text-sm font-semibold text-white">
                        {q.question}
                      </p>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = 'bg-white/[0.03] border-white/10 text-verse-text hover:bg-white/[0.07] hover:border-neon-cyan/40';

                        if (hasAnswered) {
                          if (optIdx === q.correct_index) {
                            btnStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200';
                          } else if (optIdx === userChoice) {
                            btnStyle = 'bg-red-500/20 border-red-500/60 text-red-200';
                          } else {
                            btnStyle = 'bg-white/[0.01] border-white/5 text-verse-muted opacity-40';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(qIdx, optIdx, q.correct_index)}
                            disabled={hasAnswered}
                            className={`p-3 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold opacity-60">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </div>

                            {hasAnswered && optIdx === q.correct_index && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            {hasAnswered && optIdx === userChoice && optIdx !== q.correct_index && (
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Reveal */}
                    {hasAnswered && (
                      <div
                        className={`p-4 rounded-xl text-xs leading-relaxed animate-in fade-in duration-300 ${
                          isCorrect
                            ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-200'
                            : 'bg-red-950/30 border border-red-500/30 text-red-200'
                        }`}
                      >
                        <p className="font-bold font-heading mb-1">
                          {isCorrect ? '✓ Spot on!' : `✗ Incorrect (Correct Answer: [${String.fromCharCode(65 + q.correct_index)}])`}
                        </p>
                        <p className="font-mono text-[11px] opacity-90">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
