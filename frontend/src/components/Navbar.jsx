import React from 'react';
import { Sprout } from 'lucide-react';

const Navbar = ({ user, onLogout, onNavigateHome, onOpenLogin }) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0b2821]/95 border-b border-white/10 px-4 sm:px-8 py-3.5 transition-all shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Capsule Pill matching PDF */}
        <div
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 transition-all cursor-pointer group"
        >
          <Sprout className="w-4 h-4 text-[#4de1b7]" />
          <span className="text-sm sm:text-base font-extrabold tracking-tight text-white group-hover:text-[#4de1b7] transition-colors">
            SmartGrow
          </span>
        </div>

        {/* User Section on right matching PDF Page 2 */}
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
    </header>
  );
};

export default Navbar;