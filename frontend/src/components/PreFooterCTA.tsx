import React, { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface PreFooterCTAProps {
  onExploreDashboard?: () => void;
}

export const PreFooterCTA: React.FC<PreFooterCTAProps> = ({ onExploreDashboard }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
    if (onExploreDashboard) {
      setTimeout(() => {
        onExploreDashboard();
      }, 1000);
    }
  };

  const steps = [
    {
      num: '1',
      title: 'Connect',
      desc: 'Place sensors. Setup takes 10 minutes.',
    },
    {
      num: '2',
      title: 'Watch',
      desc: 'See every reading on one screen.',
    },
    {
      num: '3',
      title: 'Act',
      desc: 'Sell crops, buy supplies, ask experts.',
    },
  ];

  return (
    <section id="how-it-works" className="relative z-20 w-full px-6 sm:px-12 py-16 max-w-7xl mx-auto text-white">
      {/* 1. How it works Section matching Image 1 */}
      <div className="mb-14">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-8">
          How it works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {steps.map((step) => (
            <div key={step.num} className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-[#4de1b7] text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                {step.num}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-white/75 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Glassy CTA Box matching Image 1 */}
      <div className="relative rounded-[32px] sm:rounded-[36px] bg-white/[0.08] backdrop-blur-2xl border border-white/15 shadow-2xl p-8 sm:p-12 lg:p-14 flex flex-col items-center text-center">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-emerald-500/5 rounded-[36px] pointer-events-none" />

        <h2 className="text-2xl sm:text-4xl lg:text-4xl font-extrabold text-white tracking-tight max-w-2xl mb-2.5">
          Ready to Cultivate the Future of Agriculture?
        </h2>

        <p className="text-white/80 text-sm sm:text-base mb-8">
          Join 200+ greenhouses.
        </p>

        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
              className="w-full sm:w-72 px-5 py-3 rounded-full bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4de1b7] shadow-inner"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer whitespace-nowrap hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Get Started &rarr;</span>
            </button>
          </form>
        ) : (
          <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#4de1b7]/20 border border-[#4de1b7]/40 text-[#4de1b7] text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#4de1b7]" />
            <span>Welcome! Redirecting you to the system...</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default PreFooterCTA;