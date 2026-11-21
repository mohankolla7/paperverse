/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          950: '#03030A',
          900: '#05050F', // Main background
          850: '#090A1A',
          800: '#0F1126',
          700: '#181B38',
          600: '#252952',
          card: 'rgba(255, 255, 255, 0.05)',
          cardHover: 'rgba(255, 255, 255, 0.09)',
          border: 'rgba(255, 255, 255, 0.12)',
          borderGlow: 'rgba(124, 58, 237, 0.35)'
        },
        neon: {
          violet: '#7C3AED',
          cyan: '#22D3EE',
          pink: '#F472B6',
          emerald: '#10B981',
          amber: '#F59E0B'
        },
        verse: {
          text: '#E8EAF6',
          muted: '#8B90B5',
          dim: '#52567A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      backgroundImage: {
        'verse-gradient': 'linear-gradient(135deg, #7C3AED 0%, #22D3EE 50%, #F472B6 100%)',
        'verse-gradient-alt': 'linear-gradient(90deg, #7C3AED, #22D3EE, #F472B6)',
        'verse-glow': 'radial-gradient(circle at 50% 20%, rgba(124, 58, 237, 0.18), transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)'
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 25s linear infinite'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      boxShadow: {
        'neon-violet': '0 0 25px -5px rgba(124, 58, 237, 0.5)',
        'neon-cyan': '0 0 25px -5px rgba(34, 211, 238, 0.5)',
        'neon-pink': '0 0 25px -5px rgba(244, 114, 182, 0.5)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }
    },
  },
  plugins: [],
};
