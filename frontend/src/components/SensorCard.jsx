import React from 'react';

const colorThemes = {
  'card-red': {
    glow: 'from-rose-500/20 to-transparent',
    border: 'border-rose-400/30',
    iconBg: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    accentText: 'text-rose-300',
    pill: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    status: 'High Climate',
  },
  'card-blue': {
    glow: 'from-sky-500/20 to-transparent',
    border: 'border-sky-400/30',
    iconBg: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
    accentText: 'text-sky-300',
    pill: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    status: 'Optimal Range',
  },
  'card-green': {
    glow: 'from-emerald-500/20 to-transparent',
    border: 'border-emerald-400/30',
    iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    accentText: 'text-emerald-300',
    pill: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    status: 'Root Zone Active',
  },
  'card-yellow': {
    glow: 'from-amber-500/20 to-transparent',
    border: 'border-amber-400/30',
    iconBg: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    accentText: 'text-amber-300',
    pill: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    status: 'Full Spectrum',
  },
};

const SensorCard = ({ title, value, unit, icon: Icon, color = 'card-green' }) => {
  const theme = colorThemes[color] || colorThemes['card-green'];

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-xl border ${theme.border} p-6 shadow-xl hover:bg-white/[0.12] transition-all duration-300 group hover:-translate-y-1`}>
      {/* Background soft ambient radial gradient */}
      <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br ${theme.glow} blur-2xl pointer-events-none`} />

      <div className="relative z-10 flex items-start justify-between mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-white/60 block mb-1">
            {title}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.pill}`}>
            {theme.status}
          </span>
        </div>

        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-inner ${theme.iconBg} transition-transform group-hover:scale-110 duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="relative z-10 flex items-baseline gap-1 mt-4">
        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
          {value !== undefined && value !== null ? value : '--'}
        </span>
        <span className={`text-base font-bold ${theme.accentText}`}>
          {unit}
        </span>
      </div>

      <div className="relative z-10 mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
        <span>IoT Node: Active</span>
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Live sync
        </span>
      </div>
    </div>
  );
};

export default SensorCard;