import React, { useState, useEffect, useCallback } from 'react';
import {
  Stethoscope,
  Users,
  FileWarning,
  CalendarCheck,
  Award,
  Search,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Microscope,
  Sprout,
  Droplets,
  Bug,
  Thermometer,
  Cpu,
  FlaskConical,
  ShieldCheck,
  Clock,
  MessageSquare,
  ClipboardCheck,
  Video,
  Phone,
  MapPin,
  X,
  RefreshCw,
  ArrowUpDown,
  Bell,
} from 'lucide-react';
import {
  getExpertsDirectory,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../../services/api';
import ExpertCard from './ExpertCard';
import ExpertProfileModal from './ExpertProfileModal';
import ExpertApplicationPortal from './ExpertApplicationPortal';
import ProblemSubmissionPortal from './ProblemSubmissionPortal';
import ConsultationBookingPortal from './ConsultationBookingPortal';
import AdminManagementPortal from './AdminManagementPortal';

// 14 Configurable Expert Specializations (Section 5.1)
export const EXPERT_SPECIALIZATIONS = [
  {
    id: 'Greenhouse Management',
    label: 'Greenhouse Management',
    icon: Sprout,
    description: 'Protected-culture climate control, ventilation, and multi-span operations.',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-400/30 text-emerald-300',
  },
  {
    id: 'Hydroponics',
    label: 'Hydroponics & Closed-Loop',
    icon: Droplets,
    description: 'NFT channels, deep-water culture, dutch buckets, and dissolved oxygen balance.',
    color: 'from-cyan-500/20 to-sky-500/10 border-cyan-400/30 text-cyan-300',
  },
  {
    id: 'Nutrient Management',
    label: 'Nutrient & EC/pH Balance',
    icon: FlaskConical,
    description: 'Water-soluble A+B fertigation formulas, chelated micronutrients, and EC targets.',
    color: 'from-lime-500/20 to-emerald-500/10 border-lime-400/30 text-lime-300',
  },
  {
    id: 'Plant Diseases',
    label: 'Plant Pathology & Diseases',
    icon: Microscope,
    description: 'Early blight, powdery mildew, root rot (Pythium), and viral wilt diagnostics.',
    color: 'from-amber-500/20 to-orange-500/10 border-amber-400/30 text-amber-300',
  },
  {
    id: 'Pest Management',
    label: 'Integrated Pest Management',
    icon: Bug,
    description: 'Whiteflies, thrips, spider mites, leafminers, and bio-control strategies.',
    color: 'from-rose-500/20 to-amber-500/10 border-rose-400/30 text-rose-300',
  },
  {
    id: 'Irrigation Systems',
    label: 'Drip & Automated Irrigation',
    icon: Droplets,
    description: 'Pressure-compensated emitters, solenoid zoning, and substrate moisture scheduling.',
    color: 'from-sky-500/20 to-blue-500/10 border-sky-400/30 text-sky-300',
  },
  {
    id: 'Crop Nutrition',
    label: 'Crop Nutrition & Foliar Care',
    icon: Sprout,
    description: 'Calcium/magnesium deficiency correction, blossom-end rot prevention, and yield boosting.',
    color: 'from-green-500/20 to-emerald-500/10 border-green-400/30 text-green-300',
  },
  {
    id: 'Climate and Temperature Control',
    label: 'Climate & VPD Optimization',
    icon: Thermometer,
    description: 'Vapor Pressure Deficit (VPD), evaporative cooling pads, and shade-net management.',
    color: 'from-orange-500/20 to-amber-500/10 border-orange-400/30 text-orange-300',
  },
  {
    id: 'Greenhouse Automation',
    label: 'Greenhouse Automation',
    icon: Cpu,
    description: 'Automated dosing pumps, relay controllers, and closed-loop actuator rules.',
    color: 'from-indigo-500/20 to-cyan-500/10 border-indigo-400/30 text-indigo-300',
  },
  {
    id: 'Sensor and IoT Systems',
    label: 'Sensor & IoT Telemetry',
    icon: Cpu,
    description: 'RS485 soil probes, PAR light sensors, LoRaWAN nodes, and MQTT calibration.',
    color: 'from-purple-500/20 to-indigo-500/10 border-purple-400/30 text-purple-300',
  },
  {
    id: 'Soil and Growing Media',
    label: 'Soil & Coco Peat Substrates',
    icon: Sprout,
    description: 'Buffered coco peat slabs, perlite mixes, root-zone drainage, and substrate flushing.',
    color: 'from-teal-500/20 to-emerald-500/10 border-teal-400/30 text-teal-300',
  },
  {
    id: 'Crop Selection',
    label: 'Crop & Hybrid Selection',
    icon: Sparkles,
    description: 'Selecting F1 greenhouse cultivars suited to highland and tropical microclimates.',
    color: 'from-emerald-500/20 to-cyan-500/10 border-emerald-400/30 text-emerald-300',
  },
  {
    id: 'Harvest Management',
    label: 'Harvest & Post-Harvest Quality',
    icon: CheckCircle,
    description: 'Ripening stages, Brix sugar grading, cold-chain storage, and shelf-life extension.',
    color: 'from-cyan-500/20 to-teal-500/10 border-cyan-400/30 text-cyan-300',
  },
  {
    id: 'Sustainable Agriculture',
    label: 'Sustainable & Organic Farming',
    icon: ShieldCheck,
    description: 'Zero-residue biological crop protection, water recycling, and GAP certification.',
    color: 'from-lime-500/20 to-teal-500/10 border-lime-400/30 text-lime-300',
  },
];

// Suggested Agricultural Problem Categories (Section 8)
export const PROBLEM_CATEGORIES = [
  'Yellowing Leaves',
  'Poor Crop Growth',
  'Nutrient Deficiency',
  'Pest Problems',
  'Plant Diseases',
  'Irrigation Problems',
  'Temperature and Humidity',
  'Hydroponic System Problems',
  'Sensor and Automation Problems',
  'Harvest Problems',
  'Other Agricultural Problems',
];

export const ExpertConnectView = ({ currentUser, onOpenLogin }) => {
  // Active sub-navigation view within ExpertConnect:
  // 'overview' | 'directory' | 'problem' | 'consultations' | 'apply'
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Stage 3: Expert Directory & Filtering State
  const [experts, setExperts] = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedQualification, setSelectedQualification] = useState('All');
  const [selectedConsultationType, setSelectedConsultationType] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxFee, setMaxFee] = useState(100);
  const [sortBy, setSortBy] = useState('availability'); // 'availability' | 'experience' | 'rating' | 'feeAsc' | 'feeDesc'

  // Detailed Expert Profile Modal & Consultation Selection
  const [selectedExpertProfile, setSelectedExpertProfile] = useState(null);
  const [preselectedExpert, setPreselectedExpert] = useState(null);
  const [preselectedProblem, setPreselectedProblem] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Stage 10: In-App Notifications State (Section 13)
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadNotifCount(0);
      return;
    }
    try {
      const res = await getMyNotifications();
      if (res && res.success) {
        setNotifications(res.notifications || []);
        setUnreadNotifCount(res.unreadCount || 0);
      }
    } catch {
      // ignore if unauthenticated
    }
  }, [currentUser]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, activeSubTab]);

  const handleMarkNotifRead = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif._id);
        fetchNotifications();
      } catch {
        // ignore
      }
    }
    if (notif.linkTab) {
      setActiveSubTab(notif.linkTab);
    }
    setShowNotificationsPanel(false);
  };

  const handleMarkAllNotifsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch verified experts from MongoDB (/api/experts)
  const fetchExperts = useCallback(async () => {
    setLoadingExperts(true);
    try {
      const params = {
        sortBy,
        verifiedOnly: 'true',
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedSpecialization !== 'All') params.specialization = selectedSpecialization;
      if (selectedQualification !== 'All') params.qualification = selectedQualification;
      if (selectedConsultationType !== 'All') params.consultationType = selectedConsultationType;
      if (availableOnly) params.availableOnly = 'true';
      if (maxFee < 100) params.maxFee = maxFee;

      const res = await getExpertsDirectory(params);
      if (res && res.success && Array.isArray(res.data)) {
        setExperts(res.data);
      } else {
        setExperts([]);
      }
    } catch {
      setExperts([]);
    } finally {
      setLoadingExperts(false);
    }
  }, [
    debouncedSearch,
    selectedSpecialization,
    selectedQualification,
    selectedConsultationType,
    availableOnly,
    maxFee,
    sortBy,
  ]);

  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  const handleSelectSpecialization = (specId) => {
    setSelectedSpecialization(specId);
    setActiveSubTab('directory');
  };

  const handleResetExpertFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedSpecialization('All');
    setSelectedQualification('All');
    setSelectedConsultationType('All');
    setAvailableOnly(false);
    setMaxFee(100);
    setSortBy('availability');
  };

  const handleRequestConsultationClick = (expert, problem = null) => {
    setPreselectedExpert(expert || null);
    setPreselectedProblem(problem || null);
    showToast(
      `Selected ${expert.fullName} for consultation booking. Opening Consultations tab...`
    );
    setActiveSubTab('consultations');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-full bg-[#0a2e26] border border-emerald-400/50 text-white shadow-2xl backdrop-blur-xl">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header — Clean Forest Aesthetic matching PDF Page 11 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ask an expert
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/70 mt-1">
            Get help with plants, pests, water and sensors. Only approved, verified experts are listed.
          </p>
        </div>

        {currentUser ? (
          <div className="text-xs text-emerald-200/80 bg-[#0f3830] border border-emerald-500/20 px-3.5 py-1.5 rounded-full shrink-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Signed in as <strong className="text-white">{currentUser.username}</strong> ({currentUser.role})</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="text-xs text-emerald-300 hover:text-white bg-[#0f3830] border border-emerald-500/30 px-3.5 py-1.5 rounded-full shrink-0 cursor-pointer font-medium"
          >
            Sign in to submit problems & book →
          </button>
        )}
      </div>

      {/* Sub-Navigation Pill Bar matching Page 11 Reference */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'directory', label: `Find an expert (${experts.length})` },
            { id: 'problem', label: 'Submit a problem' },
            { id: 'consultations', label: 'My consultations' },
            { id: 'apply', label: 'Become an expert' },
            ...(currentUser?.role === 'admin'
              ? [{ id: 'admin', label: 'Admin: approve experts', isAdmin: true }]
              : []),
          ].map((tab) => {
            const isActive = activeSubTab === tab.id;
            let pillClass = '';
            if (isActive) {
              pillClass = 'bg-[#4de1b7] text-slate-950 font-bold shadow';
            } else if (tab.isAdmin) {
              pillClass = 'border border-amber-400/50 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20';
            } else {
              pillClass = 'bg-white/[0.08] hover:bg-white/[0.14] text-white/90 border border-white/10';
            }
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${pillClass}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {currentUser && (
            <button
              type="button"
              onClick={() => {
                setShowNotificationsPanel((prev) => !prev);
                fetchNotifications();
              }}
              className="relative px-3.5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white/90 text-xs font-semibold flex items-center gap-1.5 border border-white/10 cursor-pointer transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-300" />
              <span>Notifications</span>
              {unreadNotifCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px]">
                  {unreadNotifCount}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={fetchExperts}
            title="Refresh expert directory"
            className="px-3.5 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white/90 text-xs font-semibold flex items-center gap-1.5 border border-white/10 cursor-pointer transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingExperts ? 'animate-spin text-emerald-300' : ''}`} />
            <span>Refresh experts</span>
          </button>
        </div>
      </div>

      {/* Collapsible Notifications Drawer */}
      {showNotificationsPanel && currentUser && (
        <div className="rounded-2xl bg-[#0f3830] border border-emerald-500/30 p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Notifications ({notifications.length})
              </h4>
            </div>
            <div className="flex items-center gap-2">
              {unreadNotifCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllNotifsRead}
                  className="px-3 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-emerald-200 text-xs font-medium cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowNotificationsPanel(false)}
                className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-emerald-100/60 py-3 text-center">
              You have no notifications yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {notifications.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => handleMarkNotifRead(n)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    n.isRead
                      ? 'bg-[#0a2720]/60 border-emerald-500/10 text-emerald-100/70'
                      : 'bg-[#14473d] border-emerald-400/40 text-white'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-white">
                        {n.title}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100/75 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-100/45 font-mono shrink-0">
                    {new Date(n.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 1: PLATFORM OVERVIEW (Categories, Featured, Workflow)*/}
      {/* ========================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Action Feature Cards - Light White Glassy Look */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md p-6 flex flex-col justify-between shadow-lg shadow-black/10 hover:border-white/25 transition-all min-h-[175px]">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Find an expert
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4">
                  Browse plant, pest, hydroponic and sensor specialists.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('directory')}
                className="text-xs sm:text-sm font-bold text-[#4de1b7] hover:text-[#3cd0a6] flex items-center gap-1 cursor-pointer transition-colors mt-auto text-left"
              >
                <span>See experts →</span>
              </button>
            </div>

            <div className="rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md p-6 flex flex-col justify-between shadow-lg shadow-black/10 hover:border-white/25 transition-all min-h-[175px]">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Describe your problem
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4">
                  Tell us what you see. We match you with the right expert.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('problem')}
                className="text-xs sm:text-sm font-bold text-[#4de1b7] hover:text-[#3cd0a6] flex items-center gap-1 cursor-pointer transition-colors mt-auto text-left"
              >
                <span>Report a problem →</span>
              </button>
            </div>

            <div className="rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md p-6 flex flex-col justify-between shadow-lg shadow-black/10 hover:border-white/25 transition-all min-h-[175px]">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  My consultations
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4">
                  Your bookings, messages and treatment plans.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('consultations')}
                className="text-xs sm:text-sm font-bold text-[#4de1b7] hover:text-[#3cd0a6] flex items-center gap-1 cursor-pointer transition-colors mt-auto text-left"
              >
                <span>Open →</span>
              </button>
            </div>

            <div className="rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md p-6 flex flex-col justify-between shadow-lg shadow-black/10 hover:border-white/25 transition-all min-h-[175px]">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Become an expert
                </h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed mb-4">
                  Have farming qualifications? Apply to be verified.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('apply')}
                className="text-xs sm:text-sm font-bold text-[#4de1b7] hover:text-[#3cd0a6] flex items-center gap-1 cursor-pointer transition-colors mt-auto text-left"
              >
                <span>Apply →</span>
              </button>
            </div>
          </div>

          {/* Experts Section - Matching Exact Screenshot Layout */}
          <div className="space-y-4 pt-2">
            <h2 className="text-2xl font-bold text-white">
              {experts.length} experts ready to help
            </h2>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'video', label: 'Video call' },
                { id: 'text', label: 'Text and photos' },
                { id: 'phone', label: 'Phone call' },
                { id: 'in_person', label: 'Farm visit' },
              ].map((type) => {
                const isSelected = selectedConsultationType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() =>
                      setSelectedConsultationType(isSelected ? 'All' : type.id)
                    }
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#4de1b7] text-slate-950 font-bold border-transparent'
                        : 'bg-white/[0.08] hover:bg-white/[0.15] text-white/90 border-white/10'
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>

            {/* Expert Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {experts.map((expert) => (
                <ExpertCard
                  key={expert._id}
                  expert={expert}
                  onViewProfile={(exp) => setSelectedExpertProfile(exp)}
                  onRequestConsultation={handleRequestConsultationClick}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: FIND A GREENHOUSE EXPERT (Stage 3 Full Directory) */}
      {/* ========================================================= */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          {/* Top Consultation Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'All', label: 'All types' },
              { id: 'video', label: 'Video call' },
              { id: 'text', label: 'Text and photos' },
              { id: 'phone', label: 'Phone call' },
              { id: 'in_person', label: 'Farm visit' },
            ].map((type) => {
              const isSelected = selectedConsultationType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedConsultationType(type.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#4de1b7] text-slate-950 font-bold border-transparent'
                      : 'bg-white/[0.08] hover:bg-white/[0.15] text-white/90 border border-white/10'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Search, Qualification, Specialty & Sort Controls */}
          <div className="rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md p-4 space-y-3 shadow-lg shadow-black/10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search by Expert Name, Qualification, or Topic */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, qualification, or topic..."
                  aria-label="Search agricultural experts"
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#4de1b7]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Specialization Filter Dropdown */}
              <div className="md:col-span-3">
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  aria-label="Filter by specialization"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
                >
                  <option value="All" className="bg-[#0b2821] text-white">
                    All Specializations
                  </option>
                  {EXPERT_SPECIALIZATIONS.map((spec) => (
                    <option key={spec.id} value={spec.id} className="bg-[#0b2821] text-white">
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Qualification Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedQualification}
                  onChange={(e) => setSelectedQualification(e.target.value)}
                  aria-label="Filter by qualification"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
                >
                  <option value="All" className="bg-[#0b2821] text-white">
                    All Degrees
                  </option>
                  <option value="PhD" className="bg-[#0b2821] text-white">
                    Doctorate (PhD)
                  </option>
                  <option value="MSc" className="bg-[#0b2821] text-white">
                    Master's (MSc)
                  </option>
                  <option value="BSc" className="bg-[#0b2821] text-white">
                    Bachelor's (BSc)
                  </option>
                </select>
              </div>

              {/* Sort By */}
              <div className="md:col-span-2 relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort experts"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
                >
                  <option value="availability" className="bg-[#0b2821] text-white">
                    Available First
                  </option>
                  <option value="experience" className="bg-[#0b2821] text-white">
                    Most Experienced
                  </option>
                  <option value="rating" className="bg-[#0b2821] text-white">
                    Top Rated
                  </option>
                  <option value="fee_asc" className="bg-[#0b2821] text-white">
                    Fee: Low to High
                  </option>
                  <option value="fee_desc" className="bg-[#0b2821] text-white">
                    Fee: High to Low
                  </option>
                </select>
              </div>
            </div>

            {/* Bottom Row: Availability Toggle, Max Fee Slider & Reset */}
            <div className="pt-2 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAvailableOnly((prev) => !prev)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    availableOnly
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 font-bold'
                      : 'bg-[#0a2720] border-emerald-500/20 text-emerald-100/70 hover:text-white'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Available now only</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-emerald-100/75">
                    Max fee: <strong className="text-white">${maxFee}</strong>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={maxFee}
                    onChange={(e) => setMaxFee(Number(e.target.value))}
                    className="w-24 sm:w-32 accent-[#4de1b7] cursor-pointer"
                    aria-label="Maximum consultation fee slider"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-emerald-100/60">
                  Showing <strong className="text-white">{experts.length}</strong> expert{experts.length === 1 ? '' : 's'}
                </span>
                <button
                  type="button"
                  onClick={handleResetExpertFilters}
                  className="text-xs text-emerald-300 hover:text-white underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            </div>
          </div>

          {/* Expert Cards Grid or Empty State */}
          {loadingExperts ? (
            <div className="rounded-2xl bg-[#0f3830] border border-emerald-500/20 p-12 text-center">
              <div className="w-8 h-8 border-3 border-emerald-400/20 border-t-[#4de1b7] rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold text-emerald-200">
                Loading expert directory...
              </p>
            </div>
          ) : experts.length === 0 ? (
            <div className="rounded-2xl bg-[#0f3830] border border-emerald-500/20 p-10 text-center space-y-3">
              <Users className="w-10 h-10 text-emerald-400/60 mx-auto" />
              <div>
                <h4 className="text-base font-bold text-white">
                  No experts match your filters
                </h4>
                <p className="text-xs text-emerald-100/65 max-w-sm mx-auto mt-0.5">
                  Try clearing your search terms or broadening the consultation type.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResetExpertFilters}
                  className="px-4 py-1.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Show all experts
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {experts.map((expert) => (
                <ExpertCard
                  key={expert._id}
                  expert={expert}
                  onViewProfile={(exp) => setSelectedExpertProfile(exp)}
                  onRequestConsultation={handleRequestConsultationClick}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: DESCRIBE YOUR GREENHOUSE PROBLEM (Stages 5 & 6)   */}
      {/* ========================================================= */}
      {activeSubTab === 'problem' && (
        <ProblemSubmissionPortal
          currentUser={currentUser}
          onOpenLogin={onOpenLogin}
          onViewExpertProfile={(exp) => setSelectedExpertProfile(exp)}
          onSelectExpertForBooking={(exp, problemReport = null) => {
            handleRequestConsultationClick(exp, problemReport);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* VIEW 4: MY CONSULTATIONS & BOOKING (Stage 7)              */}
      {/* ========================================================= */}
      {activeSubTab === 'consultations' && (
        <ConsultationBookingPortal
          currentUser={currentUser}
          experts={experts}
          preselectedExpert={preselectedExpert}
          preselectedProblem={preselectedProblem}
          onOpenLogin={onOpenLogin}
          onClearPreselection={() => {
            setPreselectedExpert(null);
            setPreselectedProblem(null);
          }}
          onDirectoryUpdated={() => {
            fetchExperts();
            fetchNotifications();
          }}
        />
      )}

      {/* ========================================================= */}
      {/* VIEW 5: BECOME AN EXPERT & ADMIN VERIFICATION (Stage 4)   */}
      {/* ========================================================= */}
      {activeSubTab === 'apply' && (
        <ExpertApplicationPortal
          currentUser={currentUser}
          onOpenLogin={onOpenLogin}
          onDirectoryUpdated={fetchExperts}
        />
      )}

      {/* ========================================================= */}
      {/* VIEW 6: ADMIN GOVERNANCE & MODERATION (Stage 11)          */}
      {/* ========================================================= */}
      {activeSubTab === 'admin' && currentUser?.role === 'admin' && (
        <AdminManagementPortal
          currentUser={currentUser}
          onDirectoryUpdated={() => {
            fetchExperts();
            fetchNotifications();
          }}
        />
      )}

      {/* Detailed Expert Profile Modal (Section 6) */}
      <ExpertProfileModal
        expert={selectedExpertProfile}
        onClose={() => setSelectedExpertProfile(null)}
        onRequestConsultation={handleRequestConsultationClick}
      />
    </div>
  );
};

export default ExpertConnectView;
