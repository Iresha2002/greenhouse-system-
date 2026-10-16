import React from 'react';
import { LogOut, User, Sprout, ArrowLeft } from 'lucide-react';

const Navbar = ({ user, onLogout, onNavigateHome }) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0f3824]/90 border-b border-white/15 px-6 sm:px-12 py-3.5 transition-all shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Home link */}
        <div className="flex items-center gap-4">
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md group-hover:bg-white/25 transition-all">
              <Sprout className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              SmartGrow <span className="text-xs font-normal text-emerald-300/80 uppercase tracking-widest pl-1">OS</span>
            </span>
          </div>

          {onNavigateHome && (
            <button
              onClick={onNavigateHome}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/75 hover:text-white bg-white/10 hover:bg-white/20 transition-all border border-white/15 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </button>
          )}
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                {user.role}
              </span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{user.username}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/30 text-xs font-semibold cursor-pointer transition-all"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Telemetry Connected</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
