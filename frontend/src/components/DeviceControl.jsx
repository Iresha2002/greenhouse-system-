import React from 'react';
import { Power, Cpu, Trash2, Sliders, CheckCircle2 } from 'lucide-react';

const DeviceControl = ({ devices = [], onToggleStatus, onToggleMode, onDeleteDevice }) => {
  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-md text-slate-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Greenhouse Actuator Matrix
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Control automated irrigation pumps, circulation fans, and LED spectrum lights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 font-semibold">
            {devices.length} {devices.length === 1 ? 'Device' : 'Devices'} Connected
          </span>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 border border-slate-200">
          <Cpu className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No Actuators Registered</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
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
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                    : 'bg-slate-50/80 border-slate-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {device.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                      {device.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isOn
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                    >
                      {device.status}
                    </span>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isAuto
                          ? 'bg-sky-100 text-sky-800 border-sky-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {device.mode}
                    </span>
                  </div>
                </div>

                {/* Status indicator line */}
                <div className="mb-5 flex items-center gap-2 text-xs text-slate-500">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                    }`}
                  />
                  <span>
                    {isOn ? 'Active & Drawing Power' : 'Standby / Idle'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/80">
                  {/* Status toggle button */}
                  <button
                    onClick={() => onToggleStatus(device._id, isOn ? 'OFF' : 'ON')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                      isOn
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
                        : 'bg-[#0b3b2c] hover:bg-[#07291e] text-white font-extrabold'
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
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-300 transition-all cursor-pointer shadow-2xs"
                    title="Toggle Control Mode"
                  >
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">{isAuto ? 'Set Manual' : 'Set Auto'}</span>
                  </button>

                  {/* Delete button */}
                  {onDeleteDevice && (
                    <button
                      onClick={() => onDeleteDevice(device._id)}
                      className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 transition-all cursor-pointer"
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