import React, { useRef, useState, useEffect } from 'react';
import { SlideData } from '../types';
import { FloatingTag } from './FloatingTag';
import { ChevronRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  slide: SlideData;
  direction: 'left' | 'right';
  transitionKey: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  slide,
  direction,
  transitionKey,
}) => {
  const visualRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update container dimensions for exact SVG leader line positioning
  useEffect(() => {
    const updateSize = () => {
      if (visualRef.current) {
        setDimensions({
          width: visualRef.current.offsetWidth,
          height: visualRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (visualRef.current) {
      ro.observe(visualRef.current);
    }

    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [slide.id]);

  const animationClass = direction === 'right' ? 'slide-enter-right' : 'slide-enter-left';

  return (
    <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between px-6 sm:px-12 md:px-16 py-2 gap-6 lg:gap-10 w-full max-w-7xl mx-auto overflow-hidden">
      {/* Left Column: Headline, Description & Video-style Action Controls */}
      <div
        key={`left-${transitionKey}`}
        className={`w-full lg:w-5/12 flex flex-col items-start justify-center text-left ${animationClass}`}
      >
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] mb-3">
          {slide.headline}
        </h1>

        {/* Metric Value & Community badge matching video */}
        <div className="flex items-center gap-3 mb-3.5 flex-wrap">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {slide.bottomCard.metric.split('•')[0] || 'Optimal'}
          </span>
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/80 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] inline-block animate-pulse"></span>
            <span>200+ connected smart systems</span>
          </div>
        </div>

        {/* Main Description */}
        <p className="text-white/80 text-xs sm:text-sm leading-relaxed max-w-md mb-5 font-normal">
          {slide.description}
        </p>

        {/* Action Controls matching video layout (Status pill + Green button) */}
        <div className="flex items-center gap-3.5 flex-wrap mb-3">
          {/* Status Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>Active Telemetry</span>
          </div>

          {/* Green Action Pill matching video 'Add to Cart' button */}
          <button
            onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-5 py-2 rounded-full bg-[#4ade80] text-[#0f3322] hover:bg-[#3ec974] font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-black/15 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>Explore System</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* 'Know More >' Link matching video */}
        <a
          href="#cta"
          className="inline-flex items-center gap-1 text-xs font-semibold text-white/70 hover:text-white transition-colors mt-1 group"
        >
          <span>Know More</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      {/* Right Column: Hero Centerpiece with Floating Connected Tags */}
      <div
        key={`right-${transitionKey}`}
        className={`w-full lg:w-7/12 flex items-center justify-center relative min-h-[320px] sm:min-h-[380px] lg:min-h-[420px] ${animationClass}`}
      >
        {/* Central Visual Container */}
        <div
          ref={visualRef}
          className="relative w-full max-w-[480px] aspect-square flex items-center justify-center"
        >
          {/* Soft ambient natural sunlight/glow behind plant */}
          <div className="absolute inset-0 rounded-full bg-[#3b875d]/30 blur-3xl pointer-events-none" />
          <div className="absolute w-64 h-64 rounded-full bg-[#facc15]/10 blur-2xl pointer-events-none -top-6 -right-6" />

          {/* Main Hero Subject Image with clean soft border and lighting */}
          <div className="relative w-72 sm:w-80 md:w-92 lg:w-[380px] aspect-square rounded-[32px] overflow-hidden shadow-2xl shadow-[#0c2419]/80 border border-white/20 group">
            <img
              src={slide.image}
              alt={slide.headline}
              className="w-full h-full object-cover transform scale-102 group-hover:scale-108 transition-transform duration-700 ease-out"
            />
            {/* Subtle glass reflection overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/15 pointer-events-none" />
          </div>

          {/* Floating Connected Glassmorphism Cards with SVG Leader Lines */}
          {slide.floatingTags.map((tag) => (
            <FloatingTag
              key={tag.id}
              tag={tag}
              containerWidth={dimensions.width}
              containerHeight={dimensions.height}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
