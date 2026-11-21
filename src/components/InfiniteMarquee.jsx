import React from 'react';

const MARQUEE_ITEMS = [
  '⚡ LITERATURE REVIEW COMPARISON MATRIX',
  '🌌 3D CATMULL-ROM COSMIC JOURNEY',
  '🔍 ZERO-HALLUCINATION GROUNDED CHAT',
  '📑 5-TAKEAWAY PAPER SUMMARIZER',
  '💡 IEEE THESIS & ABSTRACT GENERATOR',
  '🎓 INTERACTIVE ACTIVE RECALL STUDY BUDDY',
  '🔐 PURE CLIENT-SIDE IN-MEMORY KEYS',
  '📊 EXCEL-READY CSV EXPORTS (UTF-8 BOM)',
  '🚀 POWERED BY GOOGLE GEMINI 2.5 FLASH'
];

export default function InfiniteMarquee() {
  return (
    <div className="w-full overflow-hidden border-y border-white/10 bg-space-950/60 backdrop-blur-md py-3 select-none">
      <div className="flex w-max animate-marquee space-x-8">
        {/* Render twice for continuous seamless loop */}
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 text-xs font-mono text-verse-muted tracking-widest whitespace-nowrap"
          >
            <span className="text-white font-medium hover:text-neon-cyan transition-colors">
              {item}
            </span>
            <span className="text-neon-violet">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
