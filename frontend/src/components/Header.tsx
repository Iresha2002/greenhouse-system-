import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
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
  activeIndex?: number;
  onSelectSlide?: (index: number) => void;
  currentUser?: any;
  onOpenLogin?: () => void;
  onGoToDashboard?: () => void;
  onLogout?: () => void;
  onSelectModule?: (moduleId: string) => void;
  onNavigateHome?: () => void;
  onNavigateSupport?: () => void;
  currentView?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeIndex = 0,
  onSelectSlide,
  currentUser,
  onOpenLogin,
  onGoToDashboard,
  onLogout,
  onSelectModule,
  onNavigateHome,
  onNavigateSupport,
  currentView = 'home',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
      title: 'ExpertConnect',
      desc: 'Verified greenhouse agronomists & crop consultation',
      icon: Droplet,
      color: '#06b6d4',
    },
  ];

  const handleDropdownSelect = (item: typeof dropdownItems[0]) => {
    setIsDropdownOpen(false);
    if (onSelectModule) {
      onSelectModule(item.id);
    } else if (onSelectSlide) {
      onSelectSlide(item.index);
    }
  };

  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else if (onSelectSlide) {
      onSelectSlide(0);
    }
  };

  return (
    <>
      <header className="relative z-30 flex items-center justify-between px-6 sm:px-12 pt-6 pb-3 w-full max-w-7xl mx-auto">
        {/* Left: Brand with leaf icon */}
        <div
          onClick={handleGoHome}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center shadow-sm group-hover:bg-emerald-600/15 transition-all">
            <svg
              className="w-5 h-5 text-emerald-700"
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
          <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
            SmartGrow
          </span>
        </div>

        {/* Center: Navigation Links (Home, Dropdown List, Support) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {/* Home Link */}
          <button
            onClick={handleGoHome}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
              currentView === 'home'
                ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            Home
          </button>

          {/* Solutions Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100/60 transition-all cursor-pointer group"
            >
              <span>Ecosystem</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Frosted Glass Dropdown Panel */}
            {isDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 sm:w-80 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
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
                        onClick={() => handleDropdownSelect(item)}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                          isCurrent
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-medium'
                            : 'hover:bg-slate-50 text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                          style={{
                            backgroundColor: `${item.color}15`,
                            border: `1px solid ${item.color}35`,
                          }}
                        >
                          <IconComponent
                            className="w-4 h-4"
                            style={{ color: item.color }}
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                            {item.title}
                          </span>
                          <span className="text-[10.5px] text-slate-500 truncate mt-0.5">
                            {item.desc}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Support Link */}
          <button
            onClick={() => {
              if (onNavigateSupport) onNavigateSupport();
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
              currentView === 'support'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/60'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5 text-emerald-600" />
            <span>Support</span>
          </button>
        </nav>

        {/* Right: Login / Profile Button */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onGoToDashboard}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#0b3b2c] hover:bg-[#07291e] text-white font-bold text-xs sm:text-sm tracking-wide shadow-sm transition-all cursor-pointer"
              >
                <span>Hi, {currentUser.username || currentUser.name || 'User'}</span>
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer border border-slate-200/80 transition-colors"
                  title="Logout"
                >
                  Logout
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenLogin && onOpenLogin()}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-[#0b3b2c] hover:bg-[#07291e] text-white text-xs sm:text-sm font-bold tracking-wide shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer group"
            >
              <LogIn className="w-4 h-4 text-emerald-300 group-hover:text-white transition-colors" />
              <span>Login</span>
            </button>
          )}
        </div>
      </header>
    </>
  );
};
