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
} from 'lucide-react';
import { getExpertsDirectory } from '../../services/api';
import ExpertCard from './ExpertCard';
import ExpertProfileModal from './ExpertProfileModal';
import ExpertApplicationPortal from './ExpertApplicationPortal';

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
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
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

  const handleRequestConsultationClick = (expert) => {
    showToast(
      `Selected ${expert.fullName} for consultation. Opening problem & booking workflow...`
    );
    setActiveSubTab('problem');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-cyan-950/95 border border-cyan-400/50 text-white shadow-2xl backdrop-blur-xl">
          <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Banner — SmartGrow ExpertConnect */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b3834] via-[#10443c] to-[#0c2d3a] border border-cyan-400/35 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/35 text-cyan-300 text-xs font-extrabold uppercase tracking-wider">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Greenhouse Agricultural Consultation Platform</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              SmartGrow ExpertConnect
            </h2>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Connect with greenhouse agriculture experts, solve farming challenges, and grow with confidence. Get verified guidance on hydroponic EC/pH balance, crop nutrition, plant pathology, pest control, and IoT climate automation.
            </p>

            {/* Primary Call-To-Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('directory')}
                className="px-5 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Find a Greenhouse Expert ({experts.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('problem')}
                className="px-5 py-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <FileWarning className="w-4 h-4 text-emerald-400" />
                <span>Describe Your Greenhouse Problem</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('consultations')}
                className="px-4 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4 text-cyan-300" />
                <span>My Consultations</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('apply')}
                className="px-4 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] border border-amber-400/30 text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>Become an Expert</span>
              </button>
            </div>
          </div>

          {/* Right Highlight Panel: Supported Consultation Formats & Integrity */}
          <div className="grid grid-cols-2 gap-3 shrink-0 lg:w-80">
            <div className="rounded-2xl bg-black/30 border border-white/15 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-extrabold uppercase mb-1">
                <Video className="w-4 h-4" />
                <span>Video & Live</span>
              </div>
              <p className="text-xs text-white/70">
                Inspect leaf symptoms & greenhouse setups via scheduled video sessions.
              </p>
            </div>

            <div className="rounded-2xl bg-black/30 border border-white/15 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-extrabold uppercase mb-1">
                <MessageSquare className="w-4 h-4" />
                <span>Text & Photos</span>
              </div>
              <p className="text-xs text-white/70">
                Share crop photos, sensor logs, and receive written treatment plans.
              </p>
            </div>

            <div className="rounded-2xl bg-black/30 border border-white/15 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-extrabold uppercase mb-1">
                <Phone className="w-4 h-4" />
                <span>Phone Advisory</span>
              </div>
              <p className="text-xs text-white/70">
                Direct scheduled phone calls for urgent irrigation or nutrient issues.
              </p>
            </div>

            <div className="rounded-2xl bg-black/30 border border-white/15 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-sky-300 text-xs font-extrabold uppercase mb-1">
                <MapPin className="w-4 h-4" />
                <span>Field Visit</span>
              </div>
              <p className="text-xs text-white/70">
                Book on-site greenhouse inspections where regional experts are available.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/65">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/35 text-cyan-300 font-extrabold uppercase text-[10px]">
              Live MongoDB Directory
            </span>
            <span>
              Connected to /api/experts — displaying only Administrator-Approved & Verified Agricultural Experts.
            </span>
          </div>

          {currentUser ? (
            <span className="text-cyan-300 font-semibold">
              Signed in as: {currentUser.username} ({currentUser.role})
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-cyan-300 hover:text-cyan-200 underline font-bold cursor-pointer"
            >
              Sign in to submit problems & book consultations →
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Pill Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/[0.06] p-2 rounded-2xl border border-white/15">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'overview', label: 'Platform Overview', icon: Sparkles },
            { id: 'directory', label: `Find an Expert (${experts.length})`, icon: Users },
            { id: 'problem', label: 'Submit a Problem', icon: FileWarning },
            { id: 'consultations', label: 'My Consultations', icon: CalendarCheck },
            { id: 'apply', label: 'Become an Expert', icon: Award },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-400 text-slate-950 font-extrabold shadow-md'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={fetchExperts}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingExperts ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Sync Directory</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: PLATFORM OVERVIEW (Categories, Featured, Workflow)*/}
      {/* ========================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-10">
          {/* Quick Action Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-3xl bg-white/[0.07] border border-white/15 hover:border-cyan-400/40 p-6 backdrop-blur-xl flex flex-col justify-between transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-1.5">
                  Find an Expert
                </h3>
                <p className="text-xs text-white/70 leading-relaxed mb-5">
                  Browse verified agronomists, hydroponic engineers, plant pathologists, and greenhouse automation specialists.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('directory')}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/30 text-cyan-200 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Explore Expert Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="rounded-3xl bg-white/[0.07] border border-white/15 hover:border-emerald-400/40 p-6 backdrop-blur-xl flex flex-col justify-between transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 mb-4">
                  <FileWarning className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-1.5">
                  Submit a Problem
                </h3>
                <p className="text-xs text-white/70 leading-relaxed mb-5">
                  Describe leaf yellowing, root rot, nutrient imbalances, or sensor faults and get matched with the right specialist.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('problem')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-400/30 text-emerald-200 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Report Greenhouse Issue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="rounded-3xl bg-white/[0.07] border border-white/15 hover:border-sky-400/40 p-6 backdrop-blur-xl flex flex-col justify-between transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 mb-4">
                  <CalendarCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-1.5">
                  My Consultations
                </h3>
                <p className="text-xs text-white/70 leading-relaxed mb-5">
                  Track your scheduled appointments, message your assigned agricultural expert, and review treatment recommendations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('consultations')}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/30 text-sky-200 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span>View Appointments & Notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="rounded-3xl bg-white/[0.07] border border-white/15 hover:border-amber-400/40 p-6 backdrop-blur-xl flex flex-col justify-between transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-4">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-white mb-1.5">
                  Become an Expert
                </h3>
                <p className="text-xs text-white/70 leading-relaxed mb-5">
                  Have academic qualifications or field expertise in greenhouse agriculture? Apply for verified consultant status.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('apply')}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/35 border border-amber-400/30 text-amber-200 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Submit Expert Application</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Featured Verified Experts Section (Backed by Real MongoDB Records) */}
          {experts.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 block mb-1">
                    Verified Specialists on Duty
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                    Featured Greenhouse & Hydroponic Experts
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('directory')}
                  className="text-xs font-extrabold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full Expert Directory ({experts.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {experts.slice(0, 4).map((expert) => (
                  <ExpertCard
                    key={expert._id}
                    expert={expert}
                    onViewProfile={(exp) => setSelectedExpertProfile(exp)}
                    onRequestConsultation={handleRequestConsultationClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: Agricultural Consultation Categories & Specializations (14 Categories) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 block mb-1">
                  14 Specialized Domains
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  Agricultural Consultation Categories
                </h3>
              </div>
              <p className="text-xs text-white/65">
                Select any specialization below to filter experts in that agricultural domain.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {EXPERT_SPECIALIZATIONS.map((spec) => {
                const SpecIcon = spec.icon;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => handleSelectSpecialization(spec.id)}
                    className={`text-left rounded-2xl bg-gradient-to-br ${spec.color} border p-4 hover:scale-[1.01] transition-all cursor-pointer flex flex-col justify-between gap-3`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-extrabold text-sm text-white">
                        {spec.label}
                      </span>
                      <SpecIcon className="w-5 h-5 shrink-0" />
                    </div>
                    <p className="text-xs text-white/75 leading-relaxed">
                      {spec.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: How SmartGrow ExpertConnect Works (4-Step Workflow) */}
          <div className="rounded-3xl bg-white/[0.06] border border-white/15 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 block mb-1">
                Step-by-Step Guidance Workflow
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                How SmartGrow ExpertConnect Works
              </h3>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                Designed for greenhouse farmers and hydroponic growers who need reliable, science-backed crop advice.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-2xl bg-black/30 border border-white/10 p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-black text-xs">
                    STEP 01
                  </span>
                  <FileWarning className="w-5 h-5 text-cyan-400" />
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  1. Describe Your Crop Problem
                </h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Record crop symptoms, growth stage, EC/pH readings, temperature/humidity logs, and attach clear leaf or root photos.
                </p>
              </div>

              <div className="rounded-2xl bg-black/30 border border-white/10 p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs">
                    STEP 02
                  </span>
                  <Users className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  2. Match With Verified Experts
                </h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Our rule-based matcher recommends verified specialists whose academic qualifications and field experience match your problem category.
                </p>
              </div>

              <div className="rounded-2xl bg-black/30 border border-white/10 p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 font-black text-xs">
                    STEP 03
                  </span>
                  <Clock className="w-5 h-5 text-sky-400" />
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  3. Book & Communicate
                </h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Pick an available appointment slot for video, text, phone, or on-site consultation and discuss observations directly with the expert.
                </p>
              </div>

              <div className="rounded-2xl bg-black/30 border border-white/10 p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs">
                    STEP 04
                  </span>
                  <ClipboardCheck className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  4. Receive Actionable Guidance
                </h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Access structured expert recommendations, root-cause observations, safe treatment precautions, and follow-up schedules in your history.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: FIND A GREENHOUSE EXPERT (Stage 3 Full Directory) */}
      {/* ========================================================= */}
      {activeSubTab === 'directory' && (
        <div className="space-y-6">
          {/* Directory Header & Specialization Pill Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 block mb-1">
                Verified Agricultural Specialists
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Find a Greenhouse Expert
              </h3>
            </div>
            <div className="text-xs text-white/65">
              Showing <span className="text-white font-bold">{experts.length}</span> verified agricultural expert
              {experts.length === 1 ? '' : 's'}
            </div>
          </div>

          {/* Horizontal Specialization Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedSpecialization('All')}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedSpecialization === 'All'
                  ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-extrabold shadow-md'
                  : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/80 border-white/10'
              }`}
            >
              All Specializations
            </button>
            {EXPERT_SPECIALIZATIONS.map((spec) => {
              const isSelected = selectedSpecialization === spec.id;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => setSelectedSpecialization(spec.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-extrabold shadow-md'
                      : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/80 border-white/10'
                  }`}
                >
                  {spec.label}
                </button>
              );
            })}
          </div>

          {/* Search, Qualification, Consultation Type, Availability & Fee Filter Panel */}
          <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-5 backdrop-blur-xl space-y-4 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search by Expert Name, Qualification, or Topic */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by expert name, degree (PhD, MSc), or crop topic..."
                  aria-label="Search agricultural experts"
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-black/35 border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Qualification Filter */}
              <div className="md:col-span-2">
                <select
                  value={selectedQualification}
                  onChange={(e) => setSelectedQualification(e.target.value)}
                  aria-label="Filter by qualification"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/35 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="All" className="bg-slate-900 text-white">
                    All Qualifications
                  </option>
                  <option value="PhD" className="bg-slate-900 text-white">
                    Doctorate (PhD)
                  </option>
                  <option value="MSc" className="bg-slate-900 text-white">
                    Master&apos;s (MSc)
                  </option>
                  <option value="BSc" className="bg-slate-900 text-white">
                    Bachelor&apos;s (BSc / Eng)
                  </option>
                </select>
              </div>

              {/* Consultation Type Filter */}
              <div className="md:col-span-3">
                <select
                  value={selectedConsultationType}
                  onChange={(e) => setSelectedConsultationType(e.target.value)}
                  aria-label="Filter by consultation method"
                  className="w-full px-3 py-2.5 rounded-xl bg-black/35 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="All" className="bg-slate-900 text-white">
                    All Consultation Methods
                  </option>
                  <option value="video" className="bg-slate-900 text-white">
                    📹 Online Video Call
                  </option>
                  <option value="text" className="bg-slate-900 text-white">
                    💬 Text & Photo Advisory
                  </option>
                  <option value="phone" className="bg-slate-900 text-white">
                    📞 Scheduled Phone Call
                  </option>
                  <option value="in_person" className="bg-slate-900 text-white">
                    🌱 On-Site Field Visit
                  </option>
                </select>
              </div>

              {/* Sort By */}
              <div className="md:col-span-2 relative">
                <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort experts"
                  className="w-full pl-8 pr-2.5 py-2.5 rounded-xl bg-black/35 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="availability" className="bg-slate-900 text-white">
                    Sort: Available First
                  </option>
                  <option value="experience" className="bg-slate-900 text-white">
                    Sort: Experience
                  </option>
                  <option value="rating" className="bg-slate-900 text-white">
                    Sort: Top Rated
                  </option>
                  <option value="feeAsc" className="bg-slate-900 text-white">
                    Fee: Low to High
                  </option>
                  <option value="feeDesc" className="bg-slate-900 text-white">
                    Fee: High to Low
                  </option>
                </select>
              </div>
            </div>

            {/* Bottom Filter Row: Availability Toggle, Max Fee Slider & Reset */}
            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setAvailableOnly((prev) => !prev)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    availableOnly
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                      : 'bg-white/5 border-white/15 text-white/70 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Available Now Only</span>
                </button>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/75 font-semibold">
                    Max Fee: <strong className="text-cyan-300">${maxFee}</strong>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={maxFee}
                    onChange={(e) => setMaxFee(Number(e.target.value))}
                    className="w-28 sm:w-36 accent-cyan-400 cursor-pointer"
                    aria-label="Maximum consultation fee slider"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetExpertFilters}
                className="text-xs font-bold text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </div>

          {/* Expert Cards Grid or Empty State */}
          {loadingExperts ? (
            <div className="rounded-3xl bg-white/[0.06] border border-white/15 p-16 text-center">
              <div className="w-10 h-10 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs sm:text-sm font-bold text-cyan-300">
                Loading verified greenhouse experts from MongoDB...
              </p>
            </div>
          ) : experts.length === 0 ? (
            <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-12 text-center space-y-4 backdrop-blur-xl">
              <Users className="w-12 h-12 text-cyan-400/70 mx-auto" />
              <div>
                <h4 className="text-lg font-extrabold text-white">
                  No Verified Agricultural Experts Match Your Filters
                </h4>
                <p className="text-xs text-white/65 max-w-md mx-auto mt-1">
                  Try clearing your search or specialization filters, or apply to join the SmartGrow ExpertConnect directory if you are a qualified agricultural specialist.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetExpertFilters}
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs cursor-pointer"
                >
                  Show All Verified Experts
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('apply')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
                >
                  Become an Expert
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      {/* VIEW 3: DESCRIBE YOUR GREENHOUSE PROBLEM (Stage 5 Next)   */}
      {/* ========================================================= */}
      {activeSubTab === 'problem' && (
        <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-8 sm:p-12 text-center space-y-4 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/35 text-emerald-300 flex items-center justify-center mx-auto">
            <FileWarning className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Describe Your Greenhouse Problem
          </h3>
          <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
            Supported problem categories include: {PROBLEM_CATEGORIES.join(', ')}. Full MongoDB problem submission and automatic rule-based expert matching will be activated in Stages 5 and 6.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSubTab('directory')}
              className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs cursor-pointer"
            >
              Browse Verified Experts ({experts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('overview')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
            >
              ← Back to Overview
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 4: MY CONSULTATIONS (Stages 7–9 Next)                */}
      {/* ========================================================= */}
      {activeSubTab === 'consultations' && (
        <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-8 sm:p-12 text-center space-y-4 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-400/35 text-sky-300 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            My Consultations & Expert Recommendations
          </h3>
          <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
            Your scheduled appointments, consultation chat history, and expert treatment recommendations will appear here once Consultation Booking, Messaging, and Recommendations are enabled in Stages 7–9.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('overview')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
            >
              ← Back to Overview
            </button>
          </div>
        </div>
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
