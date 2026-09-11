import React from 'react';
import { Power, Settings } from 'lucide-react';

const DeviceControl = ({ devices, onToggleStatus, onToggleMode, onDeleteDevice }) => {
    return (
        <div className="device-control-panel">
            <h2>⚙️ Device Control Panel</h2>
            <div className="device-grid">
                {devices.length === 0 ? (
                    <p className="no-devices">No devices found. Add a device from backend!</p>
                ) : (
                    devices.map((device) => (
                        <div key={device._id} className={`device-card ${device.status.toLowerCase()}`}>
                            <div className="device-info">
                                <h3>{device.name}</h3>
                                <span className="device-type">{device.type}</span>
                            </div>

                            <div className="device-badges">
                                <span className={`badge status-${device.status.toLowerCase()}`}>
                                    {device.status}
                                </span>
                                <span className="badge mode-badge">
                                    {device.mode}
                                </span>
                            </div>

                            <div className="device-actions">
                                {/* Toggle ON/OFF */}
                                <button
                                    className={`btn btn-toggle ${device.status === 'ON' ? 'btn-on' : 'btn-off'}`}
                                    onClick={() => onToggleStatus(device._id, device.status === 'ON' ? 'OFF' : 'ON')}
                                >
                                    <Power size={18} />
                                    {device.status === 'ON' ? 'Turn OFF' : 'Turn ON'}
                                </button>

                                {/* Toggle AUTO/MANUAL */}
                                <button
                                    className="btn btn-mode"
                                    onClick={() => onToggleMode(device._id, device.mode === 'AUTOMATIC' ? 'MANUAL' : 'AUTOMATIC')}
                                >
                                    <Settings size={18} />
                                    {device.mode === 'AUTOMATIC' ? 'Set Manual' : 'Set Auto'}
                                </button>
                                <button 
                                    className="btn btn-delete"
                                    onClick={() => onDeleteDevice(device._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default DeviceControl;