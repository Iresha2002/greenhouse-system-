import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { SlideData } from '../types';

interface BottomCarouselBarProps {
  slides: SlideData[];
  activeIndex: number;
  onSelectSlide: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const BottomCarouselBar: React.FC<BottomCarouselBarProps> = ({
  slides,
  activeIndex,
  onSelectSlide,
  onPrev,
  onNext,
}) => {
  return (
    <div className="relative z-20 w-full px-6 sm:px-12 pb-6 pt-1 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 sm:gap-4 w-full">
        {/* Prev Circular Button (White with dark green icon, matching video) */}
        <button
          onClick={onPrev}
          aria-label="Previous slide"
          className="w-10 h-10 shrink-0 rounded-full bg-white text-[#1a4d36] hover:bg-white/90 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* 4 Cards Row matching the video's bottom card styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 flex-1">
          {slides.map((slide, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={slide.id}
                onClick={() => onSelectSlide(idx)}
                className={`relative group cursor-pointer rounded-2xl p-3 sm:p-3.5 transition-all duration-300 flex items-center gap-3 ${
                  isActive
                    ? 'bottom-card-active text-[#143b27]'
                    : 'bottom-card-inactive text-white'
                }`}
              >
                {/* Thumbnail Image */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={slide.bottomCard.imageThumbnail}
                    alt={slide.bottomCard.title}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-xs sm:text-[13px] font-bold truncate tracking-tight ${
                        isActive ? 'text-[#123824]' : 'text-white'
                      }`}
                    >
                      {slide.bottomCard.title}
                    </h4>
                    {isActive ? (
                      <span className="w-4 h-4 rounded-full bg-[#1b5e3d] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-white/40 text-white/70 flex items-center justify-center shrink-0 group-hover:border-white group-hover:text-white transition-colors">
                        <Plus className="w-2.5 h-2.5 stroke-[2]" />
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-[11px] truncate mt-0.5 ${
                      isActive ? 'text-[#2a5740]' : 'text-white/70'
                    }`}
                  >
                    {slide.bottomCard.description}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-[#1b5e3d]/10 text-[#17482f] font-bold'
                          : 'bg-white/10 text-white/90'
                      }`}
                    >
                      {slide.bottomCard.metric}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Circular Button (Vibrant Mint Green, matching video) */}
        <button
          onClick={onNext}
          aria-label="Next slide"
          className="w-10 h-10 shrink-0 rounded-full bg-[#52b788] text-white hover:bg-[#40a375] flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
