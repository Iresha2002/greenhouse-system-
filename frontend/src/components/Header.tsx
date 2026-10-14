import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  LogIn,
  Sprout,
  ShoppingBag,
  Cpu,
  Droplet,
  LifeBuoy,
  X,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  activeIndex: number;
  onSelectSlide: (index: number) => void;
  currentUser?: any;
  onOpenLogin?: () => void;
  onGoToDashboard?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeIndex,
  onSelectSlide,
  currentUser,
  onOpenLogin,
  onGoToDashboard,
  onLogout,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownItems = [
    {
      id: 'greenhouse',
      index: 0,
      title: 'Smart Greenhouse',
      desc: 'Real-time climate, temperature & humidity IoT',
      icon: Sprout,
      color: '#4ade80',
    },
    {
      id: 'marketplace',
      index: 1,
      title: 'Crop Market',
      desc: 'Verified harvest data & fresh produce trading',
      icon: ShoppingBag,
      color: '#f97316',
    },
    {
      id: 'suppliers',
      index: 2,
      title: 'Agri Suppliers',
      desc: 'Calibrated sensors, valves & bio-nutrients',
      icon: Cpu,
      color: '#38bdf8',
    },
    {
      id: 'hydroponics',
      index: 3,
      title: 'Hydroponic Bay',
      desc: 'Closed-loop automated pH & root aeration',
      icon: Droplet,
      color: '#06b6d4',
    },
  ];

  const handleDropdownSelect = (index: number) => {
    onSelectSlide(index);
    setIsDropdownOpen(false);
  };

  return (
    <>
      <header className="relative z-30 flex items-center justify-between px-6 sm:px-12 pt-6 pb-3 w-full max-w-7xl mx-auto">
        {/* Left: Brand with leaf icon */}
        <div
          onClick={() => onSelectSlide(0)}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md group-hover:bg-white/25 transition-all">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            SmartGrow
          </span>
        </div>

        {/* Center: Navigation Links (Home, Dropdown List, Support) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {/* Home Link */}
          <button
            onClick={() => onSelectSlide(0)}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Home
          </button>

          {/* Solutions Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-all cursor-pointer group"
            >
              <span>Ecosystem</span>
              <ChevronDown
                className={`w-4 h-4 text-white/70 group-hover:text-white transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Frosted Glass Dropdown Panel */}
            {isDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0f3824]/95 backdrop-blur-2xl border border-white/25 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-1.5 border-b border-white/10 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
                    SmartGrow Modules
                  </span>
                </div>

                <div className="space-y-1">
                  {dropdownItems.map((item) => {
                    const isCurrent = item.index === activeIndex;
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleDropdownSelect(item.index)}
                        className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-white/20 border border-white/30 text-white'
                            : 'hover:bg-white/10 text-white/80 hover:text-white'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm mt-0.5"
                          style={{
                            backgroundColor: `${item.color}25`,
                            border: `1px solid ${item.color}55`,
                          }}
                        >
                          <IconComponent
                            className="w-4 h-4"
                            style={{ color: item.color }}
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white tracking-tight">
                              {item.title}
                            </span>
                            {isCurrent && (
                              <span className="text-[9.5px] px-1.5 py-0.5 rounded-md bg-[#4ade80]/20 text-[#4ade80] font-semibold border border-[#4ade80]/40">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-[10.5px] text-white/60 truncate mt-0.5">
                            {item.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* How It Works Link */}
          <a
            href="#how-it-works"
            className="px-4 py-2 rounded-full text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            How It Works
          </a>

          {/* Support Link */}
          <a
            href="#support"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LifeBuoy className="w-3.5 h-3.5 text-emerald-300" />
            <span>Support</span>
          </a>
        </nav>

        {/* Right: Login / Profile Button */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onGoToDashboard}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/30 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all cursor-pointer border border-emerald-400/50"
              >
                <span>Dashboard ({currentUser.username})</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
                  title="Logout"
                >
                  Logout
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                if (onOpenLogin) {
                  onOpenLogin();
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-white/15 hover:bg-white text-white hover:text-[#113824] backdrop-blur-md border border-white/30 text-xs sm:text-sm font-bold tracking-wide shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
            >
              <LogIn className="w-4 h-4 text-[#4ade80] group-hover:text-[#113824] transition-colors" />
              <span>Login</span>
            </button>
          )}
        </div>
      </header>

      {/* Sleek Minimalist Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-3xl bg-[#123d29] border border-white/25 shadow-2xl p-6 text-white">
            {/* Close Button */}
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-3 text-emerald-300">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">SmartGrow Portal</h3>
              <p className="text-xs text-white/60 mt-1">
                Access your intelligent greenhouse telemetry
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsLoginModalOpen(false);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="grower@smartgrow.io"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:bg-white/15 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-400 focus:bg-white/15 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 rounded-xl bg-[#4ade80] text-[#0f3322] font-bold text-sm hover:bg-[#3ec974] transition-all shadow-lg shadow-black/20 cursor-pointer"
              >
                Sign In to Platform
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
