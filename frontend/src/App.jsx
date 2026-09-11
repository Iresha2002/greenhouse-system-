import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SensorCard from './components/SensorCard';
import DeviceControl from './components/DeviceControl';
import { getLatestSensorReading, getDevices, updateDevice,deleteDevice } from './services/api';
import { Thermometer, Droplets, Sprout, Sun } from 'lucide-react';
import './App.css';

function App() {
  const [sensorData, setSensorData] = useState({});
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch latest data from Express Backend
  const fetchData = async () => {
    try {
      const latestSensor = await getLatestSensorReading();
      const deviceList = await getDevices();
      
      setSensorData(latestSensor || {});
      setDevices(deviceList || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Fetch immediately on load

    // Poll every 3 seconds for live real-time updates
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle Toggle Device ON/OFF
  const handleToggleStatus = async (id, newStatus) => {
    try {
      await updateDevice(id, { status: newStatus });
      fetchData(); // Refresh UI immediately
    } catch (err) {
      console.error('Failed to update status:', err.message);
    }
  };

  // Handle Toggle Mode AUTO/MANUAL
  const handleToggleMode = async (id, newMode) => {
    try {
      await updateDevice(id, { mode: newMode });
      fetchData(); // Refresh UI immediately
    } catch (err) {
      console.error('Failed to update mode:', err.message);
    }
  };

  //Handle Delete Device
  const handleDeleteDevice = async (id) => {
    try {
      await deleteDevice(id);
      fetchData(); // Refresh UI immediately
    } catch (err) {
      console.error('Failed to delete device:', err.message);
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="dashboard-main">
        {loading ? (
          <p className="loading-text">Loading Greenhouse Data...</p>
        ) : (
          <>
            {/* Live Sensor Metrics Grid */}
            <section className="sensor-grid">
              <SensorCard
                title="Temperature"
                value={sensorData.temperature}
                unit="°C"
                icon={Thermometer}
                color="card-red"
              />
              <SensorCard
                title="Humidity"
                value={sensorData.humidity}
                unit="%"
                icon={Droplets}
                color="card-blue"
              />
              <SensorCard
                title="Soil Moisture"
                value={sensorData.soilMoisture}
                unit="%"
                icon={Sprout}
                color="card-green"
              />
              <SensorCard
                title="Light Level"
                value={sensorData.lightLevel}
                unit="lux"
                icon={Sun}
                color="card-yellow"
              />
            </section>

            {/* Device Control Panel */}
            <section className="device-section">
              <h2>Device Control</h2>
              <DeviceControl
                devices={devices}
                onToggleStatus={handleToggleStatus}
                onToggleMode={handleToggleMode}
                onDeleteDevice={handleDeleteDevice}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;