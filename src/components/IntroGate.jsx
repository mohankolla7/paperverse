import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';

export default function IntroGate({ onEnter, onSkipDirect }) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Smooth progress counter simulation for asset warmup
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoaded(true);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + step, 100);
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-space-950 text-white font-sans overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-violet/15 rounded-full blur-[160px] animate-pulse-slow" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-neon-cyan/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
        {/* Logo Reveal */}
        <div className="space-y-4">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-neon-violet via-neon-cyan to-neon-pink p-0.5 shadow-neon-violet">
            <div className="w-full h-full bg-space-900 rounded-[22px] flex items-center justify-center text-3xl shadow-inner">
              🌌
            </div>
          </div>

          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-heading tracking-wider">
              Paper<span className="text-gradient">Verse</span>
            </h1>
            <p className="text-sm font-mono text-neon-cyan mt-2 tracking-widest uppercase">
              Travel Through Your Research
            </p>
            <p className="text-xs text-verse-muted max-w-sm mx-auto mt-2 leading-relaxed">
              An award-level AI research assistant & 3D cosmic explorer powered by Google Gemini.
            </p>
          </div>
        </div>

        {/* Progress Counter or Enter Action */}
        <div className="pt-4">
          {!isLoaded ? (
            <div className="space-y-3 max-w-xs mx-auto">
              <div className="flex items-center justify-between text-xs font-mono text-verse-muted">
                <span>Initializing 3D Spline Engine</span>
                <span className="text-neon-cyan font-bold">{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-violet via-neon-cyan to-neon-pink transition-all duration-150 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <button
                onClick={onEnter}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-heading font-bold text-white text-base bg-gradient-to-r from-neon-violet via-neon-cyan to-neon-pink shadow-neon-violet hover:opacity-95 transition-all transform hover:scale-105 active:scale-95"
              >
                <Compass className="w-5 h-5 text-neon-cyan group-hover:rotate-45 transition-transform" />
                <span>Enter the Verse</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div>
                <button
                  onClick={onSkipDirect}
                  className="text-xs font-mono text-verse-muted hover:text-white transition-colors"
                >
                  Skip directly to tools dashboard →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
