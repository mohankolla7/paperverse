import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Lenis from 'lenis';
import IntroGate from './components/IntroGate';
import JourneyOverlay from './components/JourneyOverlay';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ApiKeyModal from './components/ApiKeyModal';
import SettingsModal from './components/SettingsModal';
import CustomCursor from './components/CustomCursor';
import InfiniteMarquee from './components/InfiniteMarquee';
import { DEFAULT_MODEL } from './lib/gemini';

// Lazy-load the 3D Canvas so the initial bundle stays lean and Lite mode loads instantaneously
const SceneCanvas = lazy(() => import('./three/SceneCanvas'));

export default function App() {
  // App journey stages: 'gate' (Loading Screen) -> 'journey' (3D Flight) -> 'dashboard' (Active Tools)
  const [journeyStage, setJourneyStage] = useState('gate');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentStation, setCurrentStation] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Pure in-memory API keys (up to 3). Never written to localStorage/cookies/files
  const [apiKeys, setApiKeys] = useState([]);
  const [activeKeyIndex, setActiveKeyIndex] = useState(0);
  const [currentModel, setCurrentModel] = useState(DEFAULT_MODEL);

  // Lite mode state (auto-enabled on mobile or prefers-reduced-motion)
  const [liteMode, setLiteMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      return isMobile || prefersReduced;
    }
    return false;
  });

  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Mouse parallax tracker
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalize mouse between -1 and 1
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Initialize Lenis smooth scroll during 'journey' stage
  useEffect(() => {
    if (journeyStage !== 'journey' || liteMode) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5
    });

    let animFrame;
    function raf(time) {
      lenis.raf(time);
      animFrame = requestAnimationFrame(raf);
    }
    animFrame = requestAnimationFrame(raf);

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(1, Math.max(0, window.scrollY / totalHeight));
        setScrollProgress(progress);

        // Determine active station 1 to 6
        const stationIdx = Math.min(6, Math.floor(progress * 6) + 1);
        setCurrentStation(stationIdx);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animFrame);
      lenis.destroy();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [journeyStage, liteMode]);

  // Transition handlers
  const handleEnterFromGate = () => {
    setJourneyStage('journey');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSkipToDashboard = () => {
    setJourneyStage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Per specifications: after journey ends, if user has no key, prompt the stylish API key modal
    if (!apiKeys || apiKeys.length === 0 || !apiKeys.some((k) => k?.trim())) {
      setTimeout(() => setIsKeyModalOpen(true), 600);
    }
  };

  const handleCompleteJourney = () => {
    handleSkipToDashboard();
  };

  const handleRestartJourney = () => {
    setJourneyStage('journey');
    setScrollProgress(0);
    setCurrentStation(1);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Key Failover Toast callback
  const handleSwitchKey = (newIndex, message) => {
    setActiveKeyIndex(newIndex);
    setToastMessage(message || `Switched to backup key ${newIndex + 1}`);
    setTimeout(() => setToastMessage(''), 6000);
  };

  const handleSaveKeys = (keys) => {
    setApiKeys(keys);
    setActiveKeyIndex(0);
    setToastMessage(`Connected ${keys.length} Gemini API key${keys.length > 1 ? 's' : ''} in secure memory.`);
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleClearKeys = () => {
    setApiKeys([]);
    setActiveKeyIndex(0);
    setToastMessage('All keys removed from memory.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-space-900 text-verse-text selection:bg-neon-violet selection:text-white relative font-sans">
      {/* Custom Glowing Neon Cursor */}
      <CustomCursor liteMode={liteMode} />

      {/* STAGE 1 OF FLOW: Cinematic Intro Gate & Progress Loading */}
      {journeyStage === 'gate' && (
        <IntroGate
          onEnter={handleEnterFromGate}
          onSkipDirect={handleSkipToDashboard}
        />
      )}

      {/* 3D Background Canvas (Persistent across journey and background ambient) */}
      {!liteMode && (
        <Suspense fallback={null}>
          <SceneCanvas
            scrollProgress={journeyStage === 'journey' ? scrollProgress : 1.0}
            mousePos={mousePos}
            liteMode={liteMode}
          />
        </Suspense>
      )}

      {/* STAGE 2 OF FLOW: 6-Station Catmull-Rom Cosmic Flight */}
      {journeyStage === 'journey' && (
        <JourneyOverlay
          currentStation={currentStation}
          onSkip={handleSkipToDashboard}
          onCompleteJourney={handleCompleteJourney}
        />
      )}

      {/* STAGE 3 OF FLOW: Main Research Dashboard Deck */}
      {journeyStage === 'dashboard' && (
        <div className="relative z-10 flex flex-col min-h-screen animate-in fade-in duration-700">
          <Navbar
            apiKeys={apiKeys}
            activeKeyIndex={activeKeyIndex}
            currentModel={currentModel}
            onOpenKeyModal={() => setIsKeyModalOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            liteMode={liteMode}
            onToggleLiteMode={() => setLiteMode((prev) => !prev)}
            onRestartJourney={handleRestartJourney}
          />

          <InfiniteMarquee />

          <main className="flex-1 pb-16">
            <Dashboard
              apiKeys={apiKeys}
              activeKeyIndex={activeKeyIndex}
              onSwitchKey={handleSwitchKey}
              model={currentModel}
              onOpenKeyModal={() => setIsKeyModalOpen(true)}
              toastMessage={toastMessage}
            />
          </main>

          {/* Footer */}
          <footer className="w-full border-t border-white/10 bg-space-950/90 backdrop-blur-md py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-verse-muted">
              <div className="flex items-center gap-2">
                <span className="text-white font-heading font-semibold">PaperVerse</span>
                <span>—</span>
                <span>Travel through your research</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Google Gemini 2.5 Flash</span>
                <span>•</span>
                <span>In-Memory Security</span>
                <span>•</span>
                <span className="text-neon-cyan">Vercel Ready</span>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Modals */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKeys={apiKeys}
        onSaveKeys={handleSaveKeys}
        onClearKeys={handleClearKeys}
        activeKeyIndex={activeKeyIndex}
        onSetActiveKeyIndex={setActiveKeyIndex}
        currentModel={currentModel}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentModel={currentModel}
        onSaveModel={setCurrentModel}
      />
    </div>
  );
}
