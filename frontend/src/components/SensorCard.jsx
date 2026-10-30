import React from 'react';

const colorThemes = {
  'card-red': {
    glow: 'from-rose-500/10 to-transparent',
    border: 'border-rose-200',
    iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
    accentText: 'text-rose-600',
    pill: 'bg-rose-50 text-rose-700 border-rose-200',
    status: 'High Climate',
  },
  'card-blue': {
    glow: 'from-sky-500/10 to-transparent',
    border: 'border-sky-200',
    iconBg: 'bg-sky-50 text-sky-600 border-sky-200',
    accentText: 'text-sky-600',
    pill: 'bg-sky-50 text-sky-700 border-sky-200',
    status: 'Optimal Range',
  },
  'card-green': {
    glow: 'from-emerald-500/10 to-transparent',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    accentText: 'text-emerald-700',
    pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    status: 'Root Zone Active',
  },
  'card-yellow': {
    glow: 'from-amber-500/10 to-transparent',
    border: 'border-amber-200',
    iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
    accentText: 'text-amber-700',
    pill: 'bg-amber-50 text-amber-800 border-amber-200',
    status: 'Full Spectrum',
  },
};

const SensorCard = ({ title, value, unit, icon: Icon, color = 'card-green' }) => {
  const theme = colorThemes[color] || colorThemes['card-green'];

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-white border ${theme.border} p-6 shadow-md hover:shadow-lg transition-all duration-300 group hover:-translate-y-1`}>
      {/* Background soft ambient radial gradient */}
      <div className={`absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br ${theme.glow} blur-2xl pointer-events-none`} />

      <div className="relative z-10 flex items-start justify-between mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 block mb-1">
            {title}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.pill}`}>
            {theme.status}
          </span>
        </div>

        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs ${theme.iconBg} transition-transform group-hover:scale-110 duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="relative z-10 flex items-baseline gap-1 mt-4">
        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
          {value !== undefined && value !== null ? value : '--'}
        </span>
        <span className={`text-base font-bold ${theme.accentText}`}>
          {unit}
        </span>
      </div>

      <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>IoT Node: Active</span>
        <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Live sync
        </span>
      </div>
    </div>
  );
};

export default SensorCard;