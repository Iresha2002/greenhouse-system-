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
import SupportView from './components/support/SupportView';
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

  // Listen for session expiry and login requests
  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setIsAuthModalOpen(true);
    };
    const handleOpenLogin = () => {
      setIsAuthModalOpen(true);
    };
    window.addEventListener('smartgrow:auth-expired', handleAuthExpired);
    window.addEventListener('smartgrow:open-login', handleOpenLogin);
    return () => {
      window.removeEventListener('smartgrow:auth-expired', handleAuthExpired);
      window.removeEventListener('smartgrow:open-login', handleOpenLogin);
    };
  }, []);

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
      <div className="relative min-h-screen w-full bg-[#f6f9f8] overflow-x-hidden flex flex-col font-sans antialiased text-slate-900 selection:bg-emerald-200 selection:text-emerald-950">
        {/* Background Atmosphere & Glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(130%_105%_at_65%_35%,#ffffff_0%,#f4f8f5_40%,#edf4f0_75%,#e5efe9_100%)]" />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-emerald-200/35" />
          <div className="absolute bottom-10 left-12 w-[450px] h-[450px] bg-teal-100/40 rounded-full blur-[130px] pointer-events-none" />
        </div>

        <Navbar
          user={currentUser}
          currentView={currentView}
          onLogout={handleLogout}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateSupport={() => setCurrentView('support')}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onGoToDashboard={() => setCurrentView('dashboard')}
          onSelectModule={(moduleId) => {
            setSelectedDashboardTab(moduleId);
            setCurrentView('dashboard');
          }}
        />

        <main className="relative z-10 dashboard-main max-w-7xl mx-auto px-4 sm:px-8 py-6 w-full flex-1">
          {/* Module Navigation Tabs matching PDF Pages 2, 6, 11 */}
          <div className="mb-6 flex items-center">
            <div className="inline-flex items-center p-1 rounded-full bg-white border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
              {[
                { id: 'greenhouse', label: 'Smart Greenhouse' },
                { id: 'marketplace', label: 'Crop Marketplace' },
                { id: 'suppliers', label: 'Agri Suppliers' },
                { id: 'hydroponics', label: 'ExpertConnect' },
              ].map((tab) => {
                const isActive = selectedDashboardTab === tab.id;
                const activeStyle = 'bg-[#f59e0b] text-slate-950 font-bold shadow-sm';

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedDashboardTab(tab.id)}
                    className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? activeStyle
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
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

  // Render Support Page View
  if (currentView === 'support') {
    return (
      <div className="relative min-h-screen w-full bg-[#f6f9f8] overflow-x-hidden flex flex-col font-sans antialiased text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 scroll-smooth">
        {/* Background Atmosphere & Glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(130%_105%_at_65%_35%,#ffffff_0%,#f4f8f5_40%,#edf4f0_75%,#e5efe9_100%)]" />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none bg-emerald-200/35" />
          <div className="absolute bottom-10 left-12 w-[450px] h-[450px] bg-teal-100/40 rounded-full blur-[130px] pointer-events-none" />
        </div>

        <Navbar
          user={currentUser}
          currentView={currentView}
          onLogout={handleLogout}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateSupport={() => setCurrentView('support')}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onGoToDashboard={() => setCurrentView('dashboard')}
          onSelectModule={(moduleId) => {
            setSelectedDashboardTab(moduleId);
            setCurrentView('dashboard');
          }}
        />

        <main className="relative z-10 flex-1">
          <SupportView
            currentUser={currentUser}
            onNavigateHome={() => setCurrentView('home')}
            onGoToDashboard={() => setCurrentView('dashboard')}
            onSelectModule={(moduleId) => {
              setSelectedDashboardTab(moduleId);
              setCurrentView('dashboard');
            }}
          />
        </main>

        <Footer
          onSelectSlide={(index) => {
            handleSelectSlide(index);
            setCurrentView('home');
          }}
          onNavigateSupport={() => setCurrentView('support')}
        />

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

  // Render SmartGrow Landing Page
  return (
    <div className="relative min-h-screen w-full bg-[#f6f9f8] overflow-x-hidden flex flex-col font-sans antialiased text-slate-900 selection:bg-emerald-200 selection:text-emerald-950 scroll-smooth">
      {/* Background Atmosphere & Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(130%_105%_at_65%_35%,#ffffff_0%,#f4f8f5_40%,#edf4f0_75%,#e5efe9_100%)]" />
        <div
          className="absolute top-1/4 right-1/4 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 opacity-60 bg-emerald-200/40"
        />
        <div className="absolute bottom-10 left-12 w-[450px] h-[450px] bg-lime-100/40 rounded-full blur-[130px] pointer-events-none" />
      </div>

      <AtmosphereCanvas />

      {/* Hero Viewport */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between">
        <Header
          activeIndex={activeIndex}
          onSelectSlide={handleSelectSlide}
          currentUser={currentUser}
          currentView={currentView}
          onNavigateHome={() => setCurrentView('home')}
          onNavigateSupport={() => setCurrentView('support')}
          onOpenLogin={() => setIsAuthModalOpen(true)}
          onGoToDashboard={() => setCurrentView('dashboard')}
          onLogout={handleLogout}
          onSelectModule={(moduleId) => {
            setSelectedDashboardTab(moduleId);
            setCurrentView('dashboard');
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
          <div className="flex items-center justify-between px-8 sm:px-12 md:px-16 pb-1 text-xs text-slate-500 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-700">
                Slide {activeIndex + 1} of {SLIDES.length}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[#0b3b2c] font-bold">
                {currentSlide.bottomCard.title}
              </span>
            </div>

            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-all cursor-pointer text-[11px] shadow-sm"
              title={isAutoPlay ? 'Pause auto-transition' : 'Resume auto-transition'}
            >
              {isAutoPlay ? (
                <>
                  <Pause className="w-3 h-3 text-emerald-600" />
                  <span>Auto-transition Active</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-slate-600" />
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

      <Footer
        onSelectSlide={handleSelectSlide}
        onNavigateSupport={() => setCurrentView('support')}
      />

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
