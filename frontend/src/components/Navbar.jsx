import React from 'react';
import { Sprout } from 'lucide-react';

const Navbar = ({
  user,
  onLogout,
  onNavigateHome,
  onOpenLogin,
  selectedTab = 'greenhouse',
  onSelectTab,
}) => {
  const tabs = [
    { id: 'greenhouse', label: 'Smart Greenhouse' },
    { id: 'marketplace', label: 'Crop Marketplace' },
    { id: 'suppliers', label: 'Agri Suppliers' },
    { id: 'hydroponics', label: 'ExpertConnect' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0b2821]/95 border-b border-white/10 px-4 sm:px-8 py-3 transition-all shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top Row matching Image 1: [🌱 SmartGrow] on left, User role + Name + [Log out] on right */}
        <div className="flex items-center justify-between">
          {/* Brand Capsule Pill */}
          <div
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 transition-all cursor-pointer group"
          >
            <Sprout className="w-4 h-4 text-[#4de1b7]" />
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-white group-hover:text-[#4de1b7] transition-colors">
              SmartGrow
            </span>
          </div>

          {/* User Section on right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#4de1b7]/20 border border-[#4de1b7]/40 text-[#4de1b7]">
                  {user.role}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white/90">
                  {user.fullName || user.username || 'SmartGrow Admin'}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3.5 py-1 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer ml-1"
                  title="Logout"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#4de1b7] bg-white/[0.06] px-3 py-1 rounded-full border border-white/10">
                  Guest
                </span>
                {onOpenLogin && (
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="px-4 py-1.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-sm"
                  >
                    Sign In
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: Continuous Capsule Pill Bar matching Image 1 */}
        {onSelectTab && (
          <div className="flex items-center">
            <div className="inline-flex items-center p-1 rounded-full bg-black/25 border border-white/10 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const isActive = selectedTab === tab.id;
                // Crop Marketplace active pill is warm amber/yellow (#f59e0b) as shown in Image 1
                const activeStyle =
                  tab.id === 'marketplace'
                    ? 'bg-[#f59e0b] text-slate-950 font-bold shadow-md'
                    : 'bg-[#4de1b7] text-slate-950 font-bold shadow-md';

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectTab(tab.id)}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? activeStyle
                        : 'text-white/75 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;