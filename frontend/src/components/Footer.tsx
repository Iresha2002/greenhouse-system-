import React from 'react';
import { ArrowUp } from 'lucide-react';

interface FooterProps {
  onSelectSlide: (index: number) => void;
  onNavigateSupport?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectSlide, onNavigateSupport }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-20 w-full border-t border-white/10 bg-[#0e3020]/60 backdrop-blur-md py-8 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand & Tagline */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-emerald-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <span className="font-bold text-white tracking-tight">SmartGrow</span>
          </div>
          <span className="hidden sm:inline text-white/30">•</span>
          <span className="text-xs text-white/60">
            Intelligent Micro-Climate & Crop Telemetry
          </span>
        </div>

        {/* Quick Module Navigation Links */}
        <div className="flex items-center gap-4 text-xs font-medium text-white/70">
          <button
            onClick={() => {
              onSelectSlide(0);
              scrollToTop();
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Greenhouse
          </button>
          <button
            onClick={() => {
              onSelectSlide(1);
              scrollToTop();
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Marketplace
          </button>
          <button
            onClick={() => {
              onSelectSlide(2);
              scrollToTop();
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Suppliers
          </button>
          <button
            onClick={() => {
              onSelectSlide(3);
              scrollToTop();
            }}
            className="hover:text-white transition-colors cursor-pointer"
          >
            ExpertConnect
          </button>
          {onNavigateSupport && (
            <button
              onClick={() => {
                onNavigateSupport();
                scrollToTop();
              }}
              className="hover:text-emerald-300 text-white/90 font-semibold transition-colors cursor-pointer"
            >
              Support
            </button>
          )}
        </div>

        {/* Copyright & Scroll to Top */}
        <div className="flex items-center gap-4 text-xs text-white/50">
          <span>© 2026 SmartGrow Systems Inc.</span>
          <button
            onClick={scrollToTop}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            title="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
