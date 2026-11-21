import React from 'react';
import { ChevronDown, FastForward, Sparkles, Compass } from 'lucide-react';

export const STATIONS = [
  {
    id: 1,
    tag: 'Station 01',
    name: 'Upload & Parse',
    visualDesc: 'Floating glass paper sheets drifting in a starfield',
    explanation: 'Feed raw research PDFs or abstracts directly into the quantum processor. Client-side extraction keeps your files private.',
    color: 'neon-cyan'
  },
  {
    id: 2,
    tag: 'Station 02',
    name: 'Compare & Benchmark',
    visualDesc: 'A glowing 3D table grid assembling itself',
    explanation: 'Cross-examine methodologies, architectures, and benchmarks side-by-side, isolating the elusive research gap.',
    color: 'neon-violet'
  },
  {
    id: 3,
    tag: 'Station 03',
    name: 'Summarize & Condense',
    visualDesc: 'A big sheet folding down into a small glowing crystal',
    explanation: 'Condense dense 30-page literature into simple-language problems, methods, metrics, and 5 crystal-clear takeaways.',
    color: 'neon-pink'
  },
  {
    id: 4,
    tag: 'Station 04',
    name: 'Chat & Interrogate',
    visualDesc: 'Floating chat bubbles orbiting a pulsing orb',
    explanation: 'Interrogate papers with strict zero-hallucination guardrails. If a claim is not in the text, it will never be fabricated.',
    color: 'neon-emerald'
  },
  {
    id: 5,
    tag: 'Station 05',
    name: 'Generate Proposals',
    visualDesc: 'Rotating wireframe shape morphing into title and abstract',
    explanation: 'Crystallize raw hypotheses into 3 publication-ready IEEE titles, 150–200 word abstracts, and research objectives.',
    color: 'neon-cyan'
  },
  {
    id: 6,
    tag: 'Station 06',
    name: 'Study & Active Recall',
    visualDesc: 'Flip-card style cubes showing quiz questions',
    explanation: 'Master scientific concepts through 5 interactive multiple-choice questions, instant explanations, and key vocabulary.',
    color: 'neon-violet'
  }
];

export default function JourneyOverlay({ currentStation, onSkip, onCompleteJourney }) {
  return (
    <div className="relative z-20 pointer-events-none w-full">
      {/* Pinned Top HUD: Skip Intro Button */}
      <div className="fixed top-6 right-6 z-50 pointer-events-auto">
        <button
          onClick={onSkip}
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold text-white bg-space-950/80 border border-white/20 hover:border-neon-cyan/50 backdrop-blur-xl shadow-glass transition-all hover:scale-105 active:scale-95"
        >
          <span>Skip Intro</span>
          <FastForward className="w-3.5 h-3.5 text-neon-cyan group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Pinned Bottom HUD: Current Station Progress Indicator */}
      <div className="fixed bottom-6 left-6 z-50 pointer-events-auto flex items-center gap-4 bg-space-950/80 border border-white/15 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-glass">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Compass className="w-4 h-4 text-neon-cyan animate-spin-slow" />
          <span className="text-verse-muted">Station</span>
          <span className="font-bold text-white text-sm">
            {currentStation} <span className="text-verse-muted font-normal text-xs">/ 6</span>
          </span>
        </div>

        {/* Station indicator dots */}
        <div className="flex items-center gap-1.5">
          {STATIONS.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s.id === currentStation
                  ? 'w-6 bg-gradient-to-r from-neon-violet to-neon-cyan'
                  : s.id < currentStation
                  ? 'w-2 bg-neon-cyan/40'
                  : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Sections Container (6 full height stops) */}
      <div className="w-full">
        {STATIONS.map((station, idx) => (
          <section
            key={station.id}
            id={`station-${station.id}`}
            className="min-h-screen flex items-center justify-center p-6 sm:p-12"
          >
            <div className="pointer-events-auto max-w-xl w-full glass-panel p-8 sm:p-10 rounded-3xl border border-white/15 shadow-glass space-y-4 text-center sm:text-left transition-all duration-500 hover:border-neon-violet/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                <span className="text-xs font-mono font-bold tracking-widest text-neon-cyan uppercase">
                  {station.tag}
                </span>
                <span className="text-[11px] font-mono text-verse-muted italic">
                  {station.visualDesc}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-wide">
                {station.name}
              </h2>

              <p className="text-sm sm:text-base text-verse-text leading-relaxed font-sans">
                {station.explanation}
              </p>

              {idx === 0 && (
                <div className="pt-4 flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-neon-cyan animate-bounce">
                  <ChevronDown className="w-4 h-4" />
                  <span>Scroll down to continue cosmic flight</span>
                </div>
              )}

              {idx === STATIONS.length - 1 && (
                <div className="pt-4">
                  <button
                    onClick={onCompleteJourney}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-heading font-semibold text-white bg-gradient-to-r from-neon-violet via-neon-cyan to-neon-pink shadow-neon-violet hover:opacity-95 transition-all transform active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Enter Research Deck</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
