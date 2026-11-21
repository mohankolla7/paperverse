import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Upload, Send, Sparkles, AlertCircle, RefreshCw, Copy, Check, User, Bot, HelpCircle } from 'lucide-react';
import { extractTextFromPdf, truncatePaperText } from '../lib/pdf';
import { callGemini } from '../lib/gemini';

const SAMPLE_PAPER = {
  name: 'Quantum Computing Fundamentals (Preskill et al.)',
  text: `Quantum computers exploit quantum mechanical phenomena such as superposition and entanglement to perform calculations exponentially faster than classical supercomputers for specific problem classes. Qubits can exist in a linear combination of states |0> and |1>. Quantum gates operate through unitary transformations on state vectors. Shor's algorithm provides exponential speedup for integer factorization, threatening RSA encryption. Grover's algorithm provides quadratic speedup for unstructured database search. Current devices operate in the Noisy Intermediate-Scale Quantum (NISQ) era with 50 to 1,000 physical qubits. Fault-tolerant quantum computing requires quantum error correction (such as surface codes), which incurs an overhead of roughly 1,000 physical qubits per logical qubit. Major physical hardware implementations include superconducting transmon qubits (IBM, Google), trapped ions (IonQ, Quantinuum), and neutral atoms (QuEra). Decoherence times and two-qubit gate fidelities currently cap quantum circuit depth at around 100-200 sequential gate layers.`
};

export default function ChatWithPaper({ apiKeys, activeKeyIndex, onSwitchKey, onSwitchModel, model, onOpenKeyModal }) {
  const [file, setFile] = useState(null);
  const [paperText, setPaperText] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
        throw new Error('This PDF contains almost no readable text (scanned image). Please upload a digital PDF.');
      }
      setPaperText(truncatePaperText(extracted.text, 30000));
      setPaperTitle(selected.name);
      setFile(selected);
      setMessages([
        {
          role: 'assistant',
          text: `Paper "${selected.name}" loaded successfully (${extracted.wordCount.toLocaleString()} words). What would you like to ask about its methodology, equations, or findings?`
        }
      ]);
    } catch (err) {
      setError(err.message || 'Failed to read PDF.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setPaperTitle(SAMPLE_PAPER.name);
    setPaperText(SAMPLE_PAPER.text);
    setError(null);
    setMessages([
      {
        role: 'assistant',
        text: `Loaded "${SAMPLE_PAPER.name}". Ask me anything about NISQ hardware, Shor's algorithm, error correction overhead, or coherence limits!`
      }
    ]);
  };

  const handleSend = async (questionToSend) => {
    const question = questionToSend || inputQuestion;
    if (!question.trim()) return;

    if (!paperText) {
      setError('Please upload a PDF paper or load a sample first.');
      return;
    }

    if (!apiKeys || apiKeys.length === 0 || !apiKeys.some((k) => k?.trim())) {
      onOpenKeyModal();
      return;
    }

    const newMessages = [...messages, { role: 'user', text: question }];
    setMessages(newMessages);
    setInputQuestion('');
    setError(null);
    setLoading(true);

    try {
      // Build conversation context
      const conversationHistory = newMessages
        .slice(-6)
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n\n');

      const systemInstruction = `You are a strict academic QA assistant for PaperVerse.
You answer user questions about the attached research paper.
CRITICAL MANDATORY RULES:
1. Base your answer EXCLUSIVELY on the provided paper text below.
2. If the user asks anything that is NOT explicitly stated, addressed, or verifiable in the paper text, you must reply with EXACTLY this phrase and nothing else:
"This is not mentioned in the paper"
3. Do not assume, extrapolate, speculate, or bring in outside world knowledge.
4. Keep answers concise, factual, and directly cite specific details from the paper.`;

      const prompt = `SOURCE PAPER TEXT:
${paperText}

CONVERSATION HISTORY:
${conversationHistory}

USER QUESTION:
${question}

Answer strictly following the rules:`;

      const answer = await callGemini({
        apiKeys,
        activeKeyIndex,
        onSwitchKey,
        onSwitchModel,
        model,
        systemInstruction,
        prompt,
        isJson: false,
        temperature: 0.1
      });

      setMessages((prev) => [...prev, { role: 'assistant', text: answer.trim() }]);
    } catch (err) {
      console.error('Chat error:', err);
      if (err.needsKeyModal) {
        onOpenKeyModal();
      } else {
        setError(err.message || 'Failed to get answer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (idx, text) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const starterQuestions = [
    'What is the primary methodology introduced?',
    'What benchmarks and datasets were evaluated?',
    'What limitations or failure modes did the authors identify?'
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neon-pink/20 border border-neon-pink/40 text-neon-pink">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-heading text-white tracking-wide">
              Chat with Paper
            </h2>
            <p className="text-sm text-verse-muted">
              Interactive interrogation with hallucination-proof replies strictly grounded in the paper.
            </p>
          </div>
        </div>

        <button
          onClick={loadSample}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-xl bg-white/5 border border-neon-pink/30 text-neon-pink hover:bg-neon-pink/10 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Quantum Sample
        </button>
      </div>

      {/* Paper Status / Upload Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-space-850 border border-white/10">
        <div className="flex items-center gap-3 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-neon-pink animate-pulse" />
          <span className="text-xs font-mono text-verse-muted">Active Paper:</span>
          <span className="text-xs font-mono text-white font-medium truncate">
            {paperTitle || 'No paper loaded yet'}
          </span>
        </div>

        <div>
          <input
            type="file"
            id="chat-pdf"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="chat-pdf"
            className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono bg-white/5 border border-white/15 text-verse-text hover:text-white hover:border-neon-pink/40 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-neon-pink" />
            {paperTitle ? 'Switch PDF' : 'Upload PDF'}
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-xs mt-1 text-red-200">{error}</p>
          </div>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="h-[460px] flex flex-col glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-neon-pink/10 border border-neon-pink/30 flex items-center justify-center text-neon-pink">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-heading font-semibold text-white">Ask Anything About Your Paper</h3>
                <p className="text-xs text-verse-muted leading-relaxed">
                  Strict hallucination boundary: if a topic is not in the paper, PaperVerse will immediately reply:
                  <span className="block mt-1 text-neon-cyan font-mono font-semibold">
                    "This is not mentioned in the paper"
                  </span>
                </p>
              </div>

              {paperText && (
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {starterQuestions.map((sq, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(sq)}
                      className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-verse-muted hover:text-neon-cyan hover:border-neon-cyan/40 transition-colors"
                    >
                      {sq}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-neon-pink/20 border border-neon-pink/40 flex items-center justify-center text-neon-pink shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`relative group max-w-[80%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-neon-violet to-neon-cyan text-white rounded-tr-none'
                      : 'bg-space-850/80 border border-white/10 text-verse-text rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopyMessage(idx, msg.text)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-black/40 text-verse-muted hover:text-white transition-opacity"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? (
                        <Check className="w-3.5 h-3.5 text-neon-emerald" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 text-xs leading-relaxed justify-start items-center">
              <div className="w-8 h-8 rounded-lg bg-neon-pink/20 border border-neon-pink/40 flex items-center justify-center text-neon-pink shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-space-850 border border-white/10 rounded-2xl rounded-tl-none p-3.5 text-verse-muted font-mono animate-pulse">
                Querying paper text...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-space-950/80 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={paperText ? 'Ask a specific question about the paper...' : 'Upload a paper to begin chatting...'}
              disabled={!paperText || loading}
              className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs font-mono focus:ring-1 focus:ring-neon-pink disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!paperText || !inputQuestion.trim() || loading}
              className="p-2.5 rounded-xl bg-neon-pink hover:bg-neon-pink/90 text-white shadow-neon-pink disabled:opacity-40 transition-all"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
