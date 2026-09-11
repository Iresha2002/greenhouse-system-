import React from 'react';

const SensorCard = ({ title, value, unit, icon: Icon, color }) => {
    return (
        <div className={`sensor-card ${color}`}>
            <div className="sensor-header">
                <span className="sensor-title">{title}</span>
                <div className="sensor-icon">
                    <Icon size={24} />
                </div>
            </div>
            <div className="sensor-body">
                <span className="sensor-value">
                    {value !== undefined && value !== null ? value : '--'}
                </span>
                <span className="sensor-unit">{unit}</span>
            </div>
        </div>
    );
};

export default SensorCard;