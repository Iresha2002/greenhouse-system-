import React from 'react';
import { LogOut, User, Sprout, ArrowLeft } from 'lucide-react';

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
        {/* Top Row: Brand & User Controls */}
        <div className="flex items-center justify-between">
          {/* Brand Logo & Back to Landing */}
          <div className="flex items-center gap-3">
            <div
              onClick={onNavigateHome}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white group-hover:text-[#4de1b7] transition-colors">
                SmartGrow
              </span>
            </div>

            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white/70 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Home</span>
              </button>
            )}
          </div>

          {/* User Controls matching PDF Pages 2, 6, 11 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  {user.role}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white/90 hidden xs:inline">
                  {user.username}
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1 rounded-full text-xs font-semibold text-red-200 hover:text-white bg-red-500/15 hover:bg-red-500/30 border border-red-400/30 transition-all cursor-pointer"
                  title="Logout"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-300 bg-white/[0.06] px-3 py-1 rounded-full border border-white/10 hidden sm:inline">
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

        {/* Bottom Row: Module Navigation Tabs (Smart Greenhouse, Crop Marketplace, Agri Suppliers, ExpertConnect) */}
        {onSelectTab && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
            {tabs.map((tab) => {
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#4de1b7] text-slate-950 font-bold shadow-sm'
                      : 'bg-white/[0.08] hover:bg-white/[0.14] text-white/90 border border-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
