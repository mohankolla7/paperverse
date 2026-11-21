import React, { useEffect, useState } from 'react';

export default function CustomCursor({ liteMode = false }) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Disable on touch devices or in Lite mode
    if (liteMode || (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0))) {
      return;
    }

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering over interactive elements
      const target = e.target;
      const isInteractive = target.closest('button, a, input, textarea, [role="button"], .interactive-hover');
      setIsHovered(!!isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [liteMode, isVisible]);

  // Smooth lerp for outer follower ring
  useEffect(() => {
    if (!isVisible || liteMode) return;
    let animId;
    const lerp = () => {
      setTrail((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.22,
        y: prev.y + (position.y - prev.y) * 0.22
      }));
      animId = requestAnimationFrame(lerp);
    };
    animId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(animId);
  }, [position, isVisible, liteMode]);

  if (liteMode || !isVisible) return null;

  return (
    <>
      {/* Precision inner neon dot */}
      <div
        className="pointer-events-none fixed z-[9999] w-2 h-2 rounded-full bg-neon-cyan shadow-neon-cyan transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />

      {/* Trailing cosmic glow ring */}
      <div
        className={`pointer-events-none fixed z-[9998] rounded-full border border-neon-violet/60 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ${
          isHovered
            ? 'w-12 h-12 bg-neon-violet/15 border-neon-cyan/70 shadow-neon-violet scale-125'
            : 'w-7 h-7 bg-transparent'
        }`}
        style={{ left: `${trail.x}px`, top: `${trail.y}px` }}
      />
    </>
  );
}
