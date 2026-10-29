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
import MarketplaceView from './components/marketplace/MarketplaceView';
import SuppliersMarketplaceView from './components/suppliers/SuppliersMarketplaceView';
import ExpertConnectView from './components/expertconnect/ExpertConnectView';
import { getLatestSensorReading, getDevices, updateDevice, deleteDevice } from './services/api';

import { Play, Pause, Thermometer, Droplets, Sprout, Sun } from 'lucide-react';
import './App.css';

export function App() {
  // Navigation view: 'home' (Landing page) | 'dashboard' (Farmer IoT / Portals)
  const [currentView, setCurrentView] = useState('home');
  const [selectedDashboardTab, setSelectedDashboardTab] = useState('greenhouse');

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

  // Render Dashboard / Portal View
  if (currentView === 'dashboard') {
    return (
      <div className="relative min-h-screen w-full bg-[#184832] overflow-x-hidden flex flex-col font-sans antialiased text-white selection:bg-emerald-400 selection:text-[#0b2b1c]">
        {/* Background Atmosphere & Glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(130%_105%_at_65%_35%,#286e4d_0%,#1e593d_28%,#15462f_62%,#0f3523_100%)]" />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-emerald-500/20" />
          <div className="absolute bottom-10 left-12 w-[450px] h-[450px] bg-[#34a86b]/20 rounded-full blur-[130px] pointer-events-none" />
        </div>

        <Navbar
          user={currentUser}
          onLogout={handleLogout}
          onNavigateHome={() => setCurrentView('home')}
          onOpenLogin={() => setIsAuthModalOpen(true)}
        />

        <main className="relative z-10 dashboard-main max-w-7xl mx-auto px-6 sm:px-12 py-8 w-full flex-1">
          {/* Header Bar with Sub-heading & Status */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                  {selectedDashboardTab === 'marketplace'
                    ? 'Agricultural Produce Exchange'
                    : selectedDashboardTab === 'suppliers'
                    ? 'Agricultural Supplier Hub'
                    : selectedDashboardTab === 'hydroponics'
                    ? 'Greenhouse Agricultural Consultation'
                    : 'Live Greenhouse Control Matrix'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {selectedDashboardTab === 'marketplace'
                  ? 'SmartGrow Crop Marketplace'
                  : selectedDashboardTab === 'suppliers'
                  ? 'Agricultural Supplies Marketplace'
                  : selectedDashboardTab === 'hydroponics'
                  ? 'SmartGrow ExpertConnect'
                  : 'Greenhouse Telemetry & Actuators'}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-950 bg-emerald-400 px-3.5 py-1.5 rounded-full shadow-md">
                {currentUser ? `${currentUser.role} portal` : 'Guest Shopper'}
              </span>
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer border border-white/20"
              >
                ← Back to Home
              </button>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-8 bg-white/[0.08] backdrop-blur-xl p-2 rounded-2xl border border-white/15 shadow-xl">
            <button
              onClick={() => setSelectedDashboardTab('greenhouse')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedDashboardTab === 'greenhouse'
                  ? 'bg-emerald-500 text-emerald-950 shadow-lg font-extrabold'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              🌱 Smart Greenhouse
            </button>
            <button
              onClick={() => setSelectedDashboardTab('marketplace')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedDashboardTab === 'marketplace'
                  ? 'bg-orange-500 text-white shadow-lg font-extrabold'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              🛍️ Crop Marketplace
            </button>
            <button
              onClick={() => setSelectedDashboardTab('suppliers')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedDashboardTab === 'suppliers'
                  ? 'bg-sky-500 text-white shadow-lg font-extrabold'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              ⚡ Agri Suppliers
            </button>
            <button
              onClick={() => setSelectedDashboardTab('hydroponics')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedDashboardTab === 'hydroponics'
                  ? 'bg-cyan-500 text-cyan-950 shadow-lg font-extrabold'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              💧 Hydroponic Bay
            </button>
          </div>

          {/* TAB 1: SMART GREENHOUSE */}
          {selectedDashboardTab === 'greenhouse' && (
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-10 h-10 border-4 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
                  <p className="text-emerald-300 font-semibold tracking-wide text-sm">Synchronizing Greenhouse Telemetry...</p>
                </div>
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

          {/* TAB 2: CROP MARKETPLACE */}
          {selectedDashboardTab === 'marketplace' && (
            <MarketplaceView
              currentUser={currentUser}
              onSwitchToFarmerPortal={() => setSelectedDashboardTab('greenhouse')}
            />
          )}

          {/* TAB 3: AGRI SUPPLIERS */}
          {selectedDashboardTab === 'suppliers' && (
            <SuppliersMarketplaceView currentUser={currentUser} />
          )}

          {/* TAB 4: SMARTGROW EXPERTCONNECT (CONSULTATION PLATFORM) */}
          {selectedDashboardTab === 'hydroponics' && (
            <ExpertConnectView
              currentUser={currentUser}
              onOpenLogin={() => setIsAuthModalOpen(true)}
            />
          )}

          {/* Auth Modal inside Dashboard View */}
          {isAuthModalOpen && (
            <AuthModal
              onLoginSuccess={handleLoginSuccess}
              onClose={() => setIsAuthModalOpen(false)}
            />
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
          onSelectModule={(moduleId) => {
            if (moduleId === 'greenhouse' || moduleId === 'hydroponics') {
              setSelectedDashboardTab(moduleId === 'hydroponics' ? 'hydroponics' : 'greenhouse');
              setCurrentView('dashboard');
            } else if (moduleId === 'marketplace') {
              setSelectedDashboardTab('marketplace');
              setCurrentView('dashboard');
            } else if (moduleId === 'suppliers') {
              setSelectedDashboardTab('suppliers');
              setCurrentView('dashboard');
            }
          }}
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
