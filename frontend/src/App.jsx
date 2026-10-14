import React, { useState, useEffect, useCallback } from 'react';
import { SLIDES } from './data/slides';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BottomCarouselBar } from './components/BottomCarouselBar';
import { AtmosphereCanvas } from './components/AtmosphereCanvas';
import { PreFooterCTA } from './components/PreFooterCTA';
import { Footer } from './components/Footer';

// Dashboard & IoT Components
import Navbar from './components/Navbar';
import SensorCard from './components/SensorCard';
import DeviceControl from './components/DeviceControl';
import AuthModal from './components/AuthModel';
import { getLatestSensorReading, getDevices, updateDevice, deleteDevice } from './services/api';

import { Play, Pause, Thermometer, Droplets, Sprout, Sun } from 'lucide-react';
import './App.css';

export function App() {
  // Navigation view: 'home' (Landing page) | 'dashboard' (Farmer IoT / Portals)
  const [currentView, setCurrentView] = useState('home');

  // Auth & User state from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Landing Page Slide States
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState('left');
  const [transitionKey, setTransitionKey] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Dashboard IoT States
  const [sensorData, setSensorData] = useState({});
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentSlide = SLIDES[activeIndex];

  // Slide Navigation Handlers
  const handleNext = useCallback(() => {
    setDirection('right');
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    setTransitionKey((k) => k + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection('left');
    setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    setTransitionKey((k) => k + 1);
  }, []);

  const handleSelectSlide = (index) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 'right' : 'left');
    setActiveIndex(index);
    setTransitionKey((k) => k + 1);
  };

  // Keyboard navigation for Landing Page
  useEffect(() => {
    if (currentView !== 'home') return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, handleNext, handlePrev]);

  // Landing Page auto-transition timer
  useEffect(() => {
    if (!isAutoPlay || currentView !== 'home') return;
    const timer = setInterval(() => {
      handleNext();
    }, 11000);
    return () => clearInterval(timer);
  }, [isAutoPlay, currentView, handleNext]);

  // IoT Dashboard Data Polling
  const fetchDashboardData = async () => {
    try {
      const latestSensor = await getLatestSensorReading();
      const deviceList = await getDevices();
      setSensorData(latestSensor || {});
      setDevices(deviceList || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching sensor data:', err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'dashboard' && currentUser && currentUser.role === 'farmer') {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 3000);
      return () => clearInterval(interval);
    }
  }, [currentView, currentUser]);

  // Device Actuator Handlers
  const handleToggleStatus = async (id, newStatus) => {
    try {
      await updateDevice(id, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update device status:', err.message);
    }
  };

  const handleToggleMode = async (id, newMode) => {
    try {
      await updateDevice(id, { mode: newMode });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update device mode:', err.message);
    }
  };

  const handleDeleteDevice = async (id) => {
    try {
      await deleteDevice(id);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to delete device:', err.message);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setCurrentView('home');
  };

  // Render Dashboard View
  if (currentView === 'dashboard' && currentUser) {
    return (
      <div className="app-container min-h-screen bg-[#f4f7f6] text-gray-800">
        <Navbar
          user={currentUser}
          onLogout={handleLogout}
          onNavigateHome={() => setCurrentView('home')}
        />

        <main className="dashboard-main max-w-7xl mx-auto px-4 py-8 w-full">
          {/* Back to Home Button */}
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => setCurrentView('home')}
              className="px-4 py-2 rounded-xl bg-emerald-800 text-white font-semibold text-sm hover:bg-emerald-900 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              ← Back to SmartGrow Home
            </button>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              {currentUser.role} portal
            </span>
          </div>

          {/* FARMER DASHBOARD */}
          {currentUser.role === 'farmer' && (
            <>
              {loading ? (
                <p className="loading-text text-center py-12 text-gray-500 font-medium">Loading Greenhouse Telemetry...</p>
              ) : (
                <>
                  <section className="sensor-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

                  <section className="device-section">
                    <DeviceControl
                      devices={devices}
                      onToggleStatus={handleToggleStatus}
                      onToggleMode={handleToggleMode}
                      onDeleteDevice={handleDeleteDevice}
                    />
                  </section>
                </>
              )}
            </>
          )}

          {/* SUPPLIER DASHBOARD */}
          {currentUser.role === 'supplier' && (
            <div className="role-portal-placeholder bg-white p-12 rounded-3xl text-center shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-emerald-900 mb-2">📦 Supplier Inventory Hub</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Welcome back, {currentUser.username}! Manage your agricultural supplies, seeds, fertilizers and incoming farm orders.
              </p>
              <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wide">
                Sprint 4 Ready
              </span>
            </div>
          )}

          {/* CUSTOMER DASHBOARD */}
          {currentUser.role === 'customer' && (
            <div className="role-portal-placeholder bg-white p-12 rounded-3xl text-center shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-emerald-900 mb-2">🛒 Fresh Produce Marketplace</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Welcome, {currentUser.username}! Browse verified harvests and place direct farm-to-table crop orders.
              </p>
              <span className="px-4 py-2 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wide">
                Sprint 5 Ready
              </span>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Render SmartGrow Landing Page
  return (
    <div className="relative min-h-screen w-full bg-[#184832] overflow-x-hidden flex flex-col font-sans antialiased text-white selection:bg-emerald-400 selection:text-[#0b2b1c] scroll-smooth">
      {/* Background Atmosphere & Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(130%_105%_at_65%_35%,#286e4d_0%,#1e593d_28%,#15462f_62%,#0f3523_100%)]" />
        <div
          className="absolute top-1/4 right-1/4 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 opacity-60"
          style={{
            backgroundColor: `${currentSlide.accentColor}30`,
          }}
        />
        <div className="absolute bottom-10 left-12 w-[450px] h-[450px] bg-[#34a86b]/20 rounded-full blur-[130px] pointer-events-none" />
      </div>

      <AtmosphereCanvas />

      {/* Hero Viewport */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between">
        <Header
          activeIndex={activeIndex}
          onSelectSlide={handleSelectSlide}
          currentUser={currentUser}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onGoToDashboard={() => setCurrentView('dashboard')}
          onLogout={handleLogout}
        />

        <main className="relative z-10 flex-1 flex items-center w-full min-h-0">
          <HeroSection
            slide={currentSlide}
            direction={direction}
            transitionKey={transitionKey}
          />
        </main>

        {/* Carousel Navigation Bar */}
        <div className="relative z-20 w-full flex flex-col shrink-0 pb-2">
          <div className="flex items-center justify-between px-8 sm:px-12 md:px-16 pb-1 text-xs text-white/50 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-white/70">
                Slide {activeIndex + 1} of {SLIDES.length}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-emerald-300 font-semibold">
                {currentSlide.bottomCard.title}
              </span>
            </div>

            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill hover:bg-white/10 hover:text-white transition-all cursor-pointer text-[11px]"
              title={isAutoPlay ? 'Pause auto-transition' : 'Resume auto-transition'}
            >
              {isAutoPlay ? (
                <>
                  <Pause className="w-3 h-3 text-emerald-400" />
                  <span>Auto-transition Active</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-white/70" />
                  <span>Auto-transition Paused</span>
                </>
              )}
            </button>
          </div>

          <BottomCarouselBar
            slides={SLIDES}
            activeIndex={activeIndex}
            onSelectSlide={handleSelectSlide}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>

      <PreFooterCTA onExploreDashboard={() => {
        if (currentUser) {
          setCurrentView('dashboard');
        } else {
          setIsAuthModalOpen(true);
        }
      }} />

      <Footer onSelectSlide={handleSelectSlide} />

      {/* Authentication Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
