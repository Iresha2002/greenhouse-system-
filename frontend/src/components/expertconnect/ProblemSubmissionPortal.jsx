import React, { useState, useEffect, useCallback } from 'react';
import {
  FileWarning,
  Sprout,
  Thermometer,
  Droplets,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Lock,
  Send,
  Clock,
  Eye,
  CalendarPlus,
  RefreshCw,
} from 'lucide-react';
import {
  createProblemReport,
  getMyProblemReports,
  getProblemReportById,
  updateProblemReportStatus,
} from '../../services/api';

const PROBLEM_CATEGORIES = [
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

const GREENHOUSE_TYPES = [
  'Poly-Tunnel Greenhouse',
  'Automated Smart Glasshouse',
  'Closed-Loop NFT Hydroponic Bay',
  'Dutch-Bucket Coco Peat Bay',
  'Shade-Net Nursery House',
];

const GROWTH_STAGES = [
  'Seedling / Nursery Stage',
  'Early Vegetative Stage',
  'Flowering & Pollination Stage',
  'Fruiting / Pod Development',
  'Pre-Harvest Maturity',
];

const COMMON_SYMPTOMS = [
  'Interveinal Leaf Chlorosis (Yellowing)',
  'Leaf Curl or Cupping',
  'Brown Necrotic Leaf Spots',
  'White Powdery Coating on Leaves',
  'Wilting During Daytime',
  'Stunted Root Growth / Root Rot',
  'Blossom-End Rot on Fruit',
  'Sticky Honeydew / Whiteflies',
  'EC / pH Drift in Reservoir',
];

export const ProblemSubmissionPortal = ({
  currentUser,
  onOpenLogin,
  onViewExpertProfile,
  onSelectExpertForBooking,
}) => {
  const [myReports, setMyReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Matched Experts for the most recently submitted or selected problem report
  const [activeReport, setActiveReport] = useState(null);
  const [matchedExperts, setMatchedExperts] = useState([]);

  // Problem Submission Form State (Section 8)
  const [formData, setFormData] = useState({
    title: '',
    category: 'Yellowing Leaves',
    affectedCrop: '',
    greenhouseType: 'Poly-Tunnel Greenhouse',
    growthStage: 'Early Vegetative Stage',
    dateFirstNoticed: new Date().toISOString().slice(0, 10),
    description: '',
    symptoms: ['Interveinal Leaf Chlorosis (Yellowing)'],
    temperature: '',
    humidity: '',
    lightAndVentilation: '',
    irrigationInfo: '',
    nutrientInfo: '',
    urgencyLevel: 'medium',
    preferredConsultationType: 'video',
    photographs: [],
    photoUrlInput: '',
  });

  const fetchMyReports = useCallback(async () => {
    if (!currentUser) return;
    setLoadingReports(true);
    try {
      const res = await getMyProblemReports();
      if (res && res.success) {
        setMyReports(res.reports || []);
      }
    } catch {
      // Ignore initial load error
    } finally {
      setLoadingReports(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  const toggleSymptom = (symptom) => {
    setFormData((prev) => {
      const exists = prev.symptoms.includes(symptom);
      return {
        ...prev,
        symptoms: exists
          ? prev.symptoms.filter((s) => s !== symptom)
          : [...prev.symptoms, symptom],
      };
    });
  };

  // Validate and attach local image file (JPEG, PNG, WebP <= 2MB)
  const handleFileUpload = (e) => {
    setErrorMsg('');
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.photographs.length + files.length > 5) {
      setErrorMsg('You can attach a maximum of 5 photographs per problem report.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        setErrorMsg(`"${file.name}" is not supported. Please upload JPEG, PNG, or WebP images.`);
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg(`"${file.name}" exceeds the 2 MB maximum file size limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormData((prev) => ({
            ...prev,
            photographs: [...prev.photographs, reader.result].slice(0, 5),
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleAddPhotoUrl = () => {
    setErrorMsg('');
    const url = formData.photoUrlInput.trim();
    if (!url) return;
    if (!/^https?:\/\/.+/i.test(url)) {
      setErrorMsg('Please enter a valid https:// image URL.');
      return;
    }
    if (formData.photographs.length >= 5) {
      setErrorMsg('Maximum 5 photographs allowed per problem report.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      photographs: [...prev.photographs, url],
      photoUrlInput: '',
    }));
  };

  const handleRemovePhoto = (idx) => {
    setFormData((prev) => ({
      ...prev,
      photographs: prev.photographs.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmitProblem = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (
      !formData.title.trim() ||
      !formData.affectedCrop.trim() ||
      !formData.description.trim()
    ) {
      setErrorMsg(
        'Please provide a Problem Title, Affected Crop, and Detailed Description.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        affectedCrop: formData.affectedCrop.trim(),
        greenhouseType: formData.greenhouseType,
        growthStage: formData.growthStage,
        dateFirstNoticed: formData.dateFirstNoticed,
        description: formData.description.trim(),
        symptoms: formData.symptoms,
        environmentalConditions: {
          temperature: formData.temperature.trim(),
          humidity: formData.humidity.trim(),
          lightAndVentilation: formData.lightAndVentilation.trim(),
        },
        irrigationInfo: formData.irrigationInfo.trim(),
        nutrientInfo: formData.nutrientInfo.trim(),
        photographs: formData.photographs,
        urgencyLevel: formData.urgencyLevel,
        preferredConsultationType: formData.preferredConsultationType,
      };

      const res = await createProblemReport(payload);
      if (res && res.success) {
        setSuccessMsg(
          res.message ||
            'Greenhouse problem report saved! See your matched experts below.'
        );
        setActiveReport(res.report);
        setMatchedExperts(res.recommendedExperts || []);
        setFormData((prev) => ({
          ...prev,
          title: '',
          affectedCrop: '',
          description: '',
          photographs: [],
        }));
        await fetchMyReports();
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Failed to submit greenhouse problem report.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleInspectPastReport = async (reportId) => {
    setErrorMsg('');
    try {
      const res = await getProblemReportById(reportId);
      if (res && res.success) {
        setActiveReport(res.report);
        setMatchedExperts(res.recommendedExperts || []);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Failed to load matched experts for this report.'
      );
    }
  };

  const handleToggleReportStatus = async (report, nextStatus) => {
    try {
      await updateProblemReportStatus(report._id, nextStatus);
      await fetchMyReports();
      if (activeReport && activeReport._id === report._id) {
        setActiveReport({ ...activeReport, status: nextStatus });
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Failed to update problem report status.'
      );
    }
  };

  if (!currentUser) {
    return (
      <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-8 sm:p-12 text-center space-y-4 backdrop-blur-xl">
        <Lock className="w-12 h-12 text-emerald-400 mx-auto" />
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          Sign In to Submit Your Greenhouse Problem Report
        </h3>
        <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
          Each agricultural problem report is privately linked to your farmer account so you can track symptoms, attach crop photographs, and receive matched expert recommendations.
        </p>
        <button
          type="button"
          onClick={onOpenLogin}
          className="px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          Sign In to Describe Your Problem
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Feedback Banners */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-400/40 text-red-200 text-xs sm:text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STAGE 6: RULE-BASED EXPERT MATCHING RESULTS PANEL                     */}
      {/* ===================================================================== */}
      {activeReport && (
        <div className="rounded-3xl bg-gradient-to-br from-[#0c3932] via-[#114239] to-[#0c2d3a] border border-emerald-400/45 p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/35 text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rule-Based Expert Matching — {activeReport.reportNumber}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Recommended Experts for &ldquo;{activeReport.title}&rdquo; ({activeReport.category})
              </h3>
              <p className="text-xs text-white/75 mt-1">
                Matched using verified expert specializations, availability, and your preferred consultation method ({activeReport.preferredConsultationType}). Note: Automated matching helps connect you with relevant specialists and is not a confirmed agricultural diagnosis.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveReport(null)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-xs font-bold cursor-pointer"
            >
              Hide Matches
            </button>
          </div>

          {matchedExperts.length === 0 ? (
            <div className="rounded-2xl bg-black/30 border border-white/10 p-6 text-center text-xs text-white/70">
              No verified experts are currently available for this category. Please browse the full Expert Directory.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedExperts.slice(0, 4).map((match) => {
                const exp = match.expert;
                return (
                  <div
                    key={exp._id}
                    className="rounded-2xl bg-black/35 border border-emerald-400/30 p-5 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {exp.profilePhoto ? (
                            <img
                              src={exp.profilePhoto}
                              alt={exp.fullName}
                              className="w-12 h-12 rounded-xl object-cover border border-cyan-400/30"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center font-extrabold text-cyan-300">
                              {(exp.fullName || 'E')[0]}
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm sm:text-base font-extrabold text-white">
                              {exp.fullName}
                            </h4>
                            <p className="text-xs text-cyan-300 font-semibold">
                              {exp.professionalTitle}
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold shrink-0">
                          Match Score: {match.matchScore}
                        </span>
                      </div>

                      {/* Transparent Rule-Based Explanation */}
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/25 text-xs text-emerald-200 leading-relaxed">
                        <strong>Why Recommended:</strong> {match.explanation}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(exp.specializations || []).map((spec) => {
                          const isMatched = (
                            match.matchedSpecializations || []
                          ).includes(spec);
                          return (
                            <span
                              key={spec}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                isMatched
                                  ? 'bg-emerald-400 text-slate-950'
                                  : 'bg-white/10 text-white/75'
                              }`}
                            >
                              {spec}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-white">
                        Fee: ${Number(exp.consultationFee || 0).toFixed(2)} / session
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onViewExpertProfile && onViewExpertProfile(exp)
                          }
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-300" />
                          <span>Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onSelectExpertForBooking &&
                            onSelectExpertForBooking(exp, activeReport)
                          }
                          className="px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-extrabold flex items-center gap-1 cursor-pointer"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>Book Consultation</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* STAGE 5: DESCRIBE YOUR GREENHOUSE PROBLEM FORM                        */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-2">
            <FileWarning className="w-3.5 h-3.5" />
            <span>Greenhouse Diagnostic Intake</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Describe Your Greenhouse Problem
          </h3>
          <p className="text-xs text-white/65 mt-1">
            Provide crop details, observed symptoms, environmental readings, and photographs so our rule-based matcher can connect you with the right verified specialist.
          </p>
        </div>

        <form onSubmit={handleSubmitProblem} className="space-y-6">
          {/* Section 1: Problem Summary & Crop Details */}
          <div className="rounded-2xl bg-black/25 border border-white/10 p-5 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Sprout className="w-4 h-4" />
              1. Problem Category, Affected Crop & Growth Stage
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-7">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Severe yellowing on lower tomato leaves with brown margins"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Problem Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  {PROBLEM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Affected Crop / Cultivar *
                </label>
                <input
                  type="text"
                  required
                  value={formData.affectedCrop}
                  onChange={(e) =>
                    setFormData({ ...formData, affectedCrop: e.target.value })
                  }
                  placeholder="e.g., F1 Beefsteak Tomato / Bell Pepper"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Greenhouse / System Type
                </label>
                <select
                  value={formData.greenhouseType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      greenhouseType: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  {GREENHOUSE_TYPES.map((gt) => (
                    <option key={gt} value={gt} className="bg-slate-900 text-white">
                      {gt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Crop Growth Stage
                </label>
                <select
                  value={formData.growthStage}
                  onChange={(e) =>
                    setFormData({ ...formData, growthStage: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  {GROWTH_STAGES.map((gs) => (
                    <option key={gs} value={gs} className="bg-slate-900 text-white">
                      {gs}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-2">
                Observed Symptoms (Click to select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map((sym) => {
                  const isSelected = formData.symptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-extrabold'
                          : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/75 border-white/15'
                      }`}
                    >
                      {isSelected ? `✓ ${sym}` : sym}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Detailed Problem Description *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Explain how the issue started, how many plants are affected, and any fertilizers or sprays applied recently..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Section 2: Environmental, Irrigation & Nutrient Conditions */}
          <div className="rounded-2xl bg-black/25 border border-white/10 p-5 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Thermometer className="w-4 h-4" />
              2. Environmental, Irrigation & Nutrient Conditions (If Known)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Date First Noticed
                </label>
                <input
                  type="date"
                  value={formData.dateFirstNoticed}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dateFirstNoticed: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Day/Night Temp (°C)
                </label>
                <input
                  type="text"
                  value={formData.temperature}
                  onChange={(e) =>
                    setFormData({ ...formData, temperature: e.target.value })
                  }
                  placeholder="e.g., 31°C day / 20°C night"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Relative Humidity (%)
                </label>
                <input
                  type="text"
                  value={formData.humidity}
                  onChange={(e) =>
                    setFormData({ ...formData, humidity: e.target.value })
                  }
                  placeholder="e.g., 78% RH"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Light & Ventilation
                </label>
                <input
                  type="text"
                  value={formData.lightAndVentilation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lightAndVentilation: e.target.value,
                    })
                  }
                  placeholder="e.g., 50% shade net, exhaust fans"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  <Droplets className="w-3.5 h-3.5 inline mr-1 text-sky-400" />
                  Irrigation Schedule & Water Source
                </label>
                <input
                  type="text"
                  value={formData.irrigationInfo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      irrigationInfo: e.target.value,
                    })
                  }
                  placeholder="e.g., Drip 4x daily (150 mL per pulse), bore-well water"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Nutrient Formula, EC (mS/cm) & pH Readings
                </label>
                <input
                  type="text"
                  value={formData.nutrientInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, nutrientInfo: e.target.value })
                  }
                  placeholder="e.g., Albert's Solution + CalNit, EC 2.1 mS/cm, pH 6.3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Photographs, Urgency & Preferred Consultation Type */}
          <div className="rounded-2xl bg-black/25 border border-white/10 p-5 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" />
              3. Crop Photographs (Up to 5 Images) & Urgency Level
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Upload Local Photographs (JPEG, PNG, WebP ≤ 2MB)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white/80 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:text-cyan-300 file:font-bold cursor-pointer"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Or Add Photograph Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.photoUrlInput}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        photoUrlInput: e.target.value,
                      })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 text-right text-xs text-white/60">
                {formData.photographs.length} / 5 attached
              </div>
            </div>

            {formData.photographs.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {formData.photographs.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/20 bg-black/40 group"
                  >
                    <img
                      src={photo}
                      alt={`Crop symptom ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center cursor-pointer"
                      title="Remove photograph"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Urgency Level *
                </label>
                <select
                  value={formData.urgencyLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, urgencyLevel: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="low" className="bg-slate-900 text-white">
                    🟢 Low — General optimization & prevention
                  </option>
                  <option value="medium" className="bg-slate-900 text-white">
                    🟡 Medium — Early symptoms on a few plants
                  </option>
                  <option value="high" className="bg-slate-900 text-white">
                    🟠 High — Spreading across greenhouse bay
                  </option>
                  <option value="critical" className="bg-slate-900 text-white">
                    🔴 Critical — Severe wilting / risk of crop loss
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Preferred Consultation Method *
                </label>
                <select
                  value={formData.preferredConsultationType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferredConsultationType: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="video" className="bg-slate-900 text-white">
                    📹 Online Video Consultation
                  </option>
                  <option value="text" className="bg-slate-900 text-white">
                    💬 Text & Photo Consultation
                  </option>
                  <option value="phone" className="bg-slate-900 text-white">
                    📞 Scheduled Phone Advisory
                  </option>
                  <option value="in_person" className="bg-slate-900 text-white">
                    🌱 In-Person Greenhouse Visit
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Submitting & Matching Experts...'
                  : 'Submit Problem & Find Matching Experts'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* ===================================================================== */}
      {/* FARMER'S OWN PROBLEM REPORT HISTORY                                   */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-6 sm:p-8 backdrop-blur-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              My Submitted Greenhouse Problem Reports ({myReports.length})
            </h3>
            <p className="text-xs text-white/60">
              Only problem reports created by your account ({currentUser.email}) are visible here. Click &ldquo;View Matched Experts&rdquo; on any report to see specialist recommendations.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMyReports}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingReports ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {myReports.length === 0 ? (
          <div className="p-8 rounded-2xl bg-black/25 border border-white/10 text-center text-xs text-white/60">
            You have not submitted any greenhouse problem reports yet.
          </div>
        ) : (
          <div className="divide-y divide-white/10 rounded-2xl bg-black/25 border border-white/10 overflow-hidden">
            {myReports.map((rep) => (
              <div
                key={rep._id}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/[0.03]"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 font-mono text-xs font-extrabold text-emerald-300">
                      {rep.reportNumber}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-xs font-bold text-cyan-300">
                      {rep.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[11px] font-bold uppercase text-amber-300">
                      Urgency: {rep.urgencyLevel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-[11px] font-bold uppercase text-sky-300">
                      Status: {rep.status}
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    {rep.title} — <span className="text-emerald-300">{rep.affectedCrop}</span>
                  </h4>

                  <p className="text-xs text-white/70 line-clamp-2">
                    {rep.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/55">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Submitted {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                    <span>• {rep.greenhouseType}</span>
                    <span>• {rep.growthStage}</span>
                    {rep.photographs?.length > 0 && (
                      <span>• 📷 {rep.photographs.length} photo(s)</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleInspectPastReport(rep._id)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View Matched Experts</span>
                  </button>

                  {rep.status !== 'closed' ? (
                    <button
                      type="button"
                      onClick={() => handleToggleReportStatus(rep, 'closed')}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/75 text-xs font-bold cursor-pointer"
                    >
                      Mark Closed
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleReportStatus(rep, 'open')}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 text-xs font-bold cursor-pointer"
                    >
                      Reopen Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemSubmissionPortal;
