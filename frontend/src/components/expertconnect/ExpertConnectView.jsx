import React, { useState } from 'react';
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
} from 'lucide-react';

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
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');

  const handleSelectSpecialization = (specId) => {
    setSelectedSpecialization(specId);
    setActiveSubTab('directory');
  };

  return (
    <div className="space-y-8 pb-16">
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
                <span>Find a Greenhouse Expert</span>
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
              Verified Credentials Policy
            </span>
            <span>
              Only specialists reviewed and approved by SmartGrow Administrators are badged as Verified Agricultural Experts.
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
            { id: 'directory', label: 'Find an Expert', icon: Users },
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

        {selectedSpecialization !== 'All' && (
          <button
            type="button"
            onClick={() => setSelectedSpecialization('All')}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold cursor-pointer"
          >
            Specialization: {selectedSpecialization} ✕
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: PLATFORM OVERVIEW (Categories, How It Works, CTA) */}
      {/* ========================================================= */}
      {activeSubTab === 'overview' && (
        <div className="space-y-10">
          {/* Quick Action Feature Cards (Find an Expert, Submit Problem, My Consultations, Become an Expert) */}
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

          {/* Section: Featured Verified Experts (Honest Database Empty State prior to Stage 3/4 seeding) */}
          <div className="rounded-3xl bg-white/[0.06] border border-white/15 p-6 sm:p-8 backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Fabricated Credentials Guarantee</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white">
                Are You a Qualified Greenhouse Agronomist or Hydroponic Specialist?
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                SmartGrow ExpertConnect only displays real, database-backed expert profiles verified by platform administrators. Submit your academic qualifications and greenhouse experience to join the directory.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveSubTab('directory')}
                className="px-5 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer transition-all"
              >
                Browse Expert Directory
              </button>
              <button
                type="button"
                onClick={() => setActiveSubTab('apply')}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm cursor-pointer transition-all"
              >
                Apply as an Agricultural Expert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: FIND A GREENHOUSE EXPERT (Stage 2 Foundation)     */}
      {/* ========================================================= */}
      {activeSubTab === 'directory' && (
        <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-8 sm:p-12 text-center space-y-4 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-400/35 text-cyan-300 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Find a Greenhouse Expert
            {selectedSpecialization !== 'All' ? ` — ${selectedSpecialization}` : ''}
          </h3>
          <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
            In Stage 3, this directory connects directly to MongoDB (`/api/experts`) to display verified agricultural specialists, their qualifications, years of experience, consultation fees, and real consultation ratings.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveSubTab('apply')}
              className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs cursor-pointer"
            >
              Apply to Join Expert Directory
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
      {/* VIEW 3: DESCRIBE YOUR GREENHOUSE PROBLEM (Stage 2 Intro)  */}
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
              Browse Experts First
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
      {/* VIEW 4: MY CONSULTATIONS (Stage 2 Foundation)             */}
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
      {/* VIEW 5: BECOME AN EXPERT (Stage 2 Foundation)             */}
      {/* ========================================================= */}
      {activeSubTab === 'apply' && (
        <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-8 sm:p-12 text-center space-y-4 backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/35 text-amber-300 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Apply to Become a Verified SmartGrow Expert
          </h3>
          <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
            Agricultural graduates, greenhouse agronomists, plant pathologists, and IoT irrigation engineers can submit their qualifications and experience for Administrator verification in Stage 4.
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
    </div>
  );
};

export default ExpertConnectView;
