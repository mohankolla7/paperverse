import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PaperVerse ErrorBoundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-space-900 flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-neon-pink/40 shadow-neon-pink text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-neon-pink/15 border border-neon-pink/40 text-neon-pink flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading">
                Quantum State Disrupted
              </h2>
              <p className="text-xs text-verse-muted mt-2 leading-relaxed">
                An unexpected interface anomaly occurred. PaperVerse safely contained the error to protect your active research.
              </p>
              {this.state.error?.message && (
                <p className="text-[11px] font-mono text-red-300 bg-red-950/40 border border-red-500/20 rounded-lg p-2.5 mt-3 text-left overflow-x-auto">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neon-violet hover:bg-neon-violet/90 text-white font-heading text-sm font-semibold shadow-neon-violet transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
