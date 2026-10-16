import React from 'react';
import { Power, Cpu, Trash2, Sliders, CheckCircle2 } from 'lucide-react';

const DeviceControl = ({ devices = [], onToggleStatus, onToggleMode, onDeleteDevice }) => {
  return (
    <div className="rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/20 p-6 sm:p-8 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Greenhouse Actuator Matrix
            </h2>
          </div>
          <p className="text-xs text-white/60">
            Control automated irrigation pumps, circulation fans, and LED spectrum lights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-white/70 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
            {devices.length} {devices.length === 1 ? 'Device' : 'Devices'} Connected
          </span>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-white/[0.04] border border-white/10">
          <Cpu className="w-10 h-10 text-white/30 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white/70">No Actuators Registered</p>
          <p className="text-xs text-white/40 max-w-sm mx-auto mt-1">
            Hardware units will automatically connect when the greenhouse simulator or IoT relay starts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {devices.map((device) => {
            const isOn = device.status === 'ON';
            const isAuto = device.mode === 'AUTOMATIC';

            return (
              <div
                key={device._id}
                className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 ${
                  isOn
                    ? 'bg-emerald-950/40 border-emerald-400/40 shadow-lg shadow-emerald-950/30'
                    : 'bg-white/[0.05] border-white/15'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {device.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-300/80 uppercase tracking-wider">
                      {device.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isOn
                          ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40'
                          : 'bg-white/10 text-white/60 border-white/20'
                      }`}
                    >
                      {device.status}
                    </span>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isAuto
                          ? 'bg-sky-400/20 text-sky-300 border-sky-400/30'
                          : 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                      }`}
                    >
                      {device.mode}
                    </span>
                  </div>
                </div>

                {/* Status indicator line */}
                <div className="mb-5 flex items-center gap-2 text-xs text-white/60">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOn ? 'bg-emerald-400 animate-pulse' : 'bg-white/30'
                    }`}
                  />
                  <span>
                    {isOn ? 'Active & Drawing Power' : 'Standby / Idle'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  {/* Status toggle button */}
                  <button
                    onClick={() => onToggleStatus(device._id, isOn ? 'OFF' : 'ON')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                      isOn
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{isOn ? 'Turn OFF' : 'Power ON'}</span>
                  </button>

                  {/* Mode button */}
                  <button
                    onClick={() =>
                      onToggleMode(device._id, isAuto ? 'MANUAL' : 'AUTOMATIC')
                    }
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer"
                    title="Toggle Control Mode"
                  >
                    <Sliders className="w-3.5 h-3.5 text-white/70" />
                    <span className="hidden sm:inline">{isAuto ? 'Set Manual' : 'Set Auto'}</span>
                  </button>

                  {/* Delete button */}
                  {onDeleteDevice && (
                    <button
                      onClick={() => onDeleteDevice(device._id)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-300 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
                      title="Remove device"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeviceControl;