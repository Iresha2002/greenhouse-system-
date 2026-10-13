import React, { useState, useEffect, useCallback } from 'react';
import { SLIDES } from './data/slides';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BottomCarouselBar } from './components/BottomCarouselBar';
import { AtmosphereCanvas } from './components/AtmosphereCanvas';
import { PreFooterCTA } from './components/PreFooterCTA';
import { Footer } from './components/Footer';
import { Play, Pause } from 'lucide-react';

export const App: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [transitionKey, setTransitionKey] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const currentSlide = SLIDES[activeIndex];

  const handleNext = useCallback(() => {
    setDirection('right');
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    setTransitionKey((k) => k + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection('left');
    setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setTransitionKey((k) => k + 1);
  }, []);

  const handleSelectSlide = (index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 'right' : 'left');
    setActiveIndex(index);
    setTransitionKey((k) => k + 1);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Gentle auto-sliding like in the presentation video
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      handleNext();
    }, 11000);
    return () => clearInterval(timer);
  }, [isAutoPlay, handleNext]);

  return (
    <div className="relative min-h-screen w-full bg-[#184832] overflow-x-hidden flex flex-col font-sans antialiased text-white selection:bg-emerald-400 selection:text-[#0b2b1c] scroll-smooth">
      {/* ============================================================ */}
      {/* UNIFIED ATMOSPHERE & BACKGROUND (Matching Video Palette)      */}
      {/* ============================================================ */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Exact lush organic green gradient from the reference video */}
        <div className="absolute inset-0 bg-[radial-gradient(130%_105%_at_65%_35%,#286e4d_0%,#1e593d_28%,#15462f_62%,#0f3523_100%)]" />

        {/* Ambient soft glow blooms */}
        <div
          className="absolute top-1/4 right-1/4 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 opacity-60"
          style={{
            backgroundColor: `${currentSlide.accentColor}30`,
          }}
        />
        <div className="absolute bottom-10 left-12 w-[450px] h-[450px] bg-[#34a86b]/20 rounded-full blur-[130px] pointer-events-none" />
      </div>

      {/* Floating Leaves & Drifting Ambient Particles Canvas */}
      <AtmosphereCanvas />

      {/* ============================================================ */}
      {/* 1. HERO SHOWCASE SCREEN (Full Viewport Height)                */}
      {/* ============================================================ */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between">
        {/* Top Header with Brand, Ecosystem Dropdown & Login */}
        <Header
          activeIndex={activeIndex}
          onSelectSlide={handleSelectSlide}
        />

        {/* Main Hero Section (Synchronized Slow Slide Transitions) */}
        <main className="relative z-10 flex-1 flex items-center w-full min-h-0">
          <HeroSection
            slide={currentSlide}
            direction={direction}
            transitionKey={transitionKey}
          />
        </main>

        {/* Bottom Carousel Status Row with Auto-play Toggle */}
        <div className="relative z-20 w-full flex flex-col shrink-0 pb-2">
          {/* Status Line & Auto-play Control */}
          <div className="flex items-center justify-between px-8 sm:px-12 md:px-16 pb-1 text-xs text-white/50 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-white/70">
                Slide {activeIndex + 1} of {SLIDES.length}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-emerald-300 font-semibold">
                {currentSlide.bottomCard.title}
              </span>
            </div>

            {/* Auto-play toggle button */}
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill hover:bg-white/10 hover:text-white transition-all cursor-pointer text-[11px]"
              title={isAutoPlay ? 'Pause auto-transition' : 'Resume auto-transition'}
            >
              {isAutoPlay ? (
                <>
                  <Pause className="w-3 h-3 text-emerald-400" />
                  <span>Auto-transition Active</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-white/70" />
                  <span>Auto-transition Paused</span>
                </>
              )}
            </button>
          </div>

          <BottomCarouselBar
            slides={SLIDES}
            activeIndex={activeIndex}
            onSelectSlide={handleSelectSlide}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PRE-FOOTER CALL TO ACTION (CTA) BANNER                    */}
      {/* ============================================================ */}
      <PreFooterCTA />

      {/* ============================================================ */}
      {/* 3. MINIMALIST BRAND FOOTER                                   */}
      {/* ============================================================ */}
      <Footer onSelectSlide={handleSelectSlide} />
    </div>
  );
};

export default App;
