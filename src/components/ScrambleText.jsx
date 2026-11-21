import React, { useState, useEffect } from 'react';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789!@#$%^&*<>[]{}';

export default function ScrambleText({ text = '', duration = 12, className = '' }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let iteration = 0;
    const maxIterations = text.length;
    let interval;

    interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      if (iteration >= maxIterations) {
        clearInterval(interval);
      }
      iteration += 1 / 2;
    }, duration);

    return () => clearInterval(interval);
  }, [text, duration]);

  return <span className={className}>{displayText}</span>;
}
