import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Leaf,
  CheckCircle2,
  X,
  Building2,
  Send,
} from 'lucide-react';

export const PreFooterCTA: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [farmType, setFarmType] = useState('Commercial Greenhouse');
  const [modalSuccess, setModalSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalSuccess(true);
    setTimeout(() => {
      setModalSuccess(false);
      setIsModalOpen(false);
    }, 2200);
  };

  return (
    <section id="cta" className="relative z-20 w-full px-6 sm:px-12 py-16 max-w-7xl mx-auto">
      {/* Ambient background bloom */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-[#34a86b]/15 to-emerald-600/10 rounded-[36px] blur-2xl pointer-events-none" />

      {/* Main Glassmorphism CTA Container */}
      <div className="relative rounded-[32px] sm:rounded-[40px] bg-gradient-to-b from-white/[0.14] to-white/[0.05] backdrop-blur-2xl border border-white/25 shadow-2xl overflow-hidden p-8 sm:p-12 lg:p-16 flex flex-col items-center text-center">
        
        {/* Subtle decorative background watermarks */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#52b788]/20 blur-3xl pointer-events-none" />

        {/* Top Feature Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[#4ade80] text-xs font-semibold tracking-wide mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Bio-Telemetry Platform</span>
        </div>

        {/* Catchy Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] max-w-3xl mb-4">
          Ready to Cultivate the Future of Agriculture?
        </h2>

        {/* Subtitle */}
        <p className="text-white/80 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl mb-8 font-normal">
          Join over 200+ commercial greenhouses using SmartGrow to automate microclimates,
          conserve 95% more water, and verify crop quality directly for premium buyers.
        </p>

        {/* Interactive Action Area (Email Input + Demo Button) */}
        {!isSubmitted ? (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md flex flex-col sm:flex-row items-center gap-3 mb-6"
          >
            <div className="relative w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email or greenhouse name..."
                required
                className="w-full px-5 py-3.5 rounded-full bg-white/95 text-[#143b27] placeholder-[#1e4835]/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4ade80] shadow-inner transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#4ade80] text-[#0d2f1f] hover:bg-[#3ec974] font-bold text-sm tracking-wide shadow-lg shadow-black/20 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#4ade80]/20 border border-[#4ade80]/40 text-emerald-200 text-sm font-semibold mb-6 animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
            <span>Thank you! Our agricultural engineers will reach out within 2 hours.</span>
          </div>
        )}

        {/* Secondary Action Link / Modal Trigger */}
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <span className="text-white/60">Need a custom enterprise setup?</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[#4ade80] font-semibold underline underline-offset-4 hover:text-white transition-colors cursor-pointer"
          >
            Schedule a 1-on-1 Consultation
          </button>
        </div>

        {/* Trust Badges Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-10 pt-8 border-t border-white/15 w-full max-w-4xl text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#4ade80] shrink-0 border border-white/15">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">10-Min Setup</span>
              <span className="text-[10.5px] text-white/60">Plug & Play Sensors</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#38bdf8] shrink-0 border border-white/15">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Secure LoRaWAN</span>
              <span className="text-[10.5px] text-white/60">End-to-End Encrypted</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#4ade80] shrink-0 border border-white/15">
              <Leaf className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Organic Passports</span>
              <span className="text-[10.5px] text-white/60">100% Traceable Yield</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#facc15] shrink-0 border border-white/15">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">200+ Growers</span>
              <span className="text-[10.5px] text-white/60">Commercial Scale</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Schedule Consultation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#113926] border border-white/25 shadow-2xl p-6 sm:p-8 text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {!modalSuccess ? (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Schedule an Ag-Tech Demo</h3>
                    <p className="text-xs text-white/60">
                      Personalized architectural walkthrough for your facility
                    </p>
                  </div>
                </div>

                <form onSubmit={handleModalSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:bg-white/15 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">
                      Business Email
                    </label>
                    <input
                      type="email"
                      placeholder="jane@greenhousefarms.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:bg-white/15 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">
                      Facility & System Type
                    </label>
                    <select
                      value={farmType}
                      onChange={(e) => setFarmType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e3020] border border-white/20 text-sm text-white focus:outline-none focus:border-emerald-400 transition-all cursor-pointer"
                    >
                      <option value="Commercial Greenhouse">Commercial Greenhouse (1-10+ Acres)</option>
                      <option value="Vertical Hydroponics Facility">Vertical Hydroponics Facility</option>
                      <option value="Smart Bio-Dome / Nursery">Smart Bio-Dome / Specialty Nursery</option>
                      <option value="Crop Producer / Supplier">Crop Producer / Organic Supplier</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 mt-2 rounded-xl bg-[#4ade80] text-[#0d2f1f] font-bold text-sm hover:bg-[#3ec974] transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Confirm Consultation</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="py-8 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#4ade80]/20 border border-[#4ade80] flex items-center justify-center text-[#4ade80] mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold mb-1">Demo Scheduled!</h4>
                <p className="text-xs text-white/70 max-w-xs">
                  We have sent an invitation to your email. An agronomist will review your facility profile shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
