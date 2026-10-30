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
      <div className="rounded-2xl bg-[#0f3830] border border-emerald-500/20 p-8 sm:p-10 text-center space-y-3">
        <Lock className="w-10 h-10 text-emerald-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">
          Sign in to describe your problem
        </h3>
        <p className="text-xs sm:text-sm text-emerald-100/70 max-w-md mx-auto leading-relaxed">
          Your problem report is saved to your account so you can track symptoms, attach photographs, and receive matched expert recommendations.
        </p>
        <button
          type="button"
          onClick={onOpenLogin}
          className="px-5 py-2.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-bold text-xs sm:text-sm cursor-pointer shadow"
        >
          Sign in to continue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback Banners */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-400/40 text-red-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STAGE 6: RULE-BASED EXPERT MATCHING RESULTS PANEL                     */}
      {/* ===================================================================== */}
      {activeReport && (
        <div className="rounded-2xl bg-[#0f3830] border border-emerald-500/30 p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-emerald-500/20">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended experts for {activeReport.reportNumber}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Matches for &ldquo;{activeReport.title}&rdquo; ({activeReport.category})
              </h3>
              <p className="text-xs text-emerald-100/70 mt-0.5">
                Matched by verified specializations and preferred method ({activeReport.preferredConsultationType}).
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveReport(null)}
              className="px-3.5 py-1.5 rounded-full bg-[#0a2720] hover:bg-[#14473d] text-emerald-100/80 text-xs font-semibold border border-emerald-500/20 cursor-pointer"
            >
              Hide matches
            </button>
          </div>

          {matchedExperts.length === 0 ? (
            <div className="rounded-xl bg-[#0a2720] border border-emerald-500/15 p-5 text-center text-xs text-emerald-100/70">
              No verified experts currently match this exact category. Please browse the full Expert Directory.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matchedExperts.slice(0, 4).map((match) => {
                const exp = match.expert;
                const initials = (exp.fullName || 'E')
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();
                return (
                  <div
                    key={exp._id}
                    className="rounded-xl bg-[#0a2720] border border-emerald-500/20 p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {exp.profilePhoto ? (
                            <img
                              src={exp.profilePhoto}
                              alt={exp.fullName}
                              className="w-10 h-10 rounded-full object-cover border border-emerald-400/30"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#165042] text-[#4de1b7] flex items-center justify-center font-bold text-xs">
                              {initials}
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {exp.fullName}
                            </h4>
                            <p className="text-xs text-emerald-300">
                              {exp.professionalTitle}
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                          Score: {match.matchScore}
                        </span>
                      </div>

                      {/* Rule-Based Match explanation */}
                      <p className="text-xs text-emerald-100/80 bg-[#0f3830] p-2.5 rounded-lg border border-emerald-500/15 leading-relaxed">
                        <strong className="text-emerald-300">Match reason:</strong> {match.explanation}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {(exp.specializations || []).map((spec) => {
                          const isMatched = (match.matchedSpecializations || []).includes(spec);
                          return (
                            <span
                              key={spec}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                isMatched
                                  ? 'bg-[#4de1b7] text-slate-950 font-bold'
                                  : 'bg-[#0f3830] text-emerald-100/70 border border-emerald-500/20'
                              }`}
                            >
                              {spec}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-emerald-500/15 flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">
                        ${Number(exp.consultationFee || 0).toFixed(0)} per session
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onViewExpertProfile && onViewExpertProfile(exp)}
                          className="px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-100 hover:text-white hover:bg-emerald-500/10 text-xs font-semibold cursor-pointer"
                        >
                          Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectExpertForBooking && onSelectExpertForBooking(exp, activeReport)}
                          className="px-3.5 py-1 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 text-xs font-bold cursor-pointer"
                        >
                          Book session
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
      <div className="rounded-2xl bg-[#0f3830] border border-emerald-500/20 p-5 sm:p-7 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Describe your problem
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/70 mt-1">
            Provide crop details, observed symptoms, conditions, and photos to get matched with verified specialists.
          </p>
        </div>

        <form onSubmit={handleSubmitProblem} className="space-y-5">
          {/* Section 1: Problem Summary & Crop Details */}
          <div className="space-y-3 pb-5 border-b border-emerald-500/15">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              1. Crop &amp; Problem details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7">
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Problem title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Yellowing lower tomato leaves with brown margins"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                />
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
                >
                  {PROBLEM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Affected crop / cultivar *
                </label>
                <input
                  type="text"
                  required
                  value={formData.affectedCrop}
                  onChange={(e) => setFormData({ ...formData, affectedCrop: e.target.value })}
                  placeholder="e.g. Beefsteak Tomato / Bell Pepper"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Greenhouse type
                </label>
                <select
                  value={formData.greenhouseType}
                  onChange={(e) => setFormData({ ...formData, greenhouseType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
                >
                  {GREENHOUSE_TYPES.map((gt) => (
                    <option key={gt} value={gt} className="bg-slate-900 text-white">
                      {gt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Growth stage
                </label>
                <select
                  value={formData.growthStage}
                  onChange={(e) => setFormData({ ...formData, growthStage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
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
              <label className="block text-xs font-semibold text-emerald-100/80 mb-1.5">
                Observed symptoms (select all that apply)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SYMPTOMS.map((sym) => {
                  const isSelected = formData.symptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#4de1b7] text-slate-950 font-bold border-[#4de1b7]'
                          : 'bg-[#0a2720] hover:bg-[#14473d] text-emerald-100/75 border-emerald-500/20'
                      }`}
                    >
                      {isSelected ? `✓ ${sym}` : sym}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                Detailed description *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain when this started, how many plants are affected, and any recent treatments applied..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
              />
            </div>
          </div>

          {/* Section 2: Environmental & Nutrient Readings */}
          <div className="space-y-3 pb-5 border-b border-emerald-500/15">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              2. Environment, irrigation &amp; nutrients (optional)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Date first noticed
                </label>
                <input
                  type="date"
                  value={formData.dateFirstNoticed}
                  onChange={(e) => setFormData({ ...formData, dateFirstNoticed: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Day / night temp (°C)
                </label>
                <input
                  type="text"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                  placeholder="e.g. 29°C / 19°C"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Humidity (%)
                </label>
                <input
                  type="text"
                  value={formData.humidity}
                  onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                  placeholder="e.g. 75% RH"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Light &amp; ventilation
                </label>
                <input
                  type="text"
                  value={formData.lightAndVentilation}
                  onChange={(e) => setFormData({ ...formData, lightAndVentilation: e.target.value })}
                  placeholder="e.g. 50% shade, exhaust fan"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Irrigation schedule
                </label>
                <input
                  type="text"
                  value={formData.irrigationInfo}
                  onChange={(e) => setFormData({ ...formData, irrigationInfo: e.target.value })}
                  placeholder="e.g. Drip 4x daily (150 mL per pulse)"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Nutrient formula &amp; EC / pH
                </label>
                <input
                  type="text"
                  value={formData.nutrientInfo}
                  onChange={(e) => setFormData({ ...formData, nutrientInfo: e.target.value })}
                  placeholder="e.g. Formula A+B, EC 2.0 mS/cm, pH 6.2"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Photos & Preferences */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              3. Photos &amp; consultation preference
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Attach leaf or plant photos (up to 5)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileUpload}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs text-white/80 file:mr-2.5 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-[#165042] file:text-[#4de1b7] file:font-semibold cursor-pointer"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Or add photo image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.photoUrlInput}
                    onChange={(e) => setFormData({ ...formData, photoUrlInput: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs text-white focus:outline-none focus:border-[#4de1b7]"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoUrl}
                    className="px-3 py-1.5 rounded-xl bg-[#0a2720] hover:bg-[#14473d] border border-emerald-500/20 text-white text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2 text-right text-xs text-emerald-100/60 pb-1">
                {formData.photographs.length} / 5 attached
              </div>
            </div>

            {formData.photographs.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {formData.photographs.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-20 rounded-xl overflow-hidden border border-emerald-500/30 bg-[#0a2720]"
                  >
                    <img
                      src={photo}
                      alt={`Crop photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center cursor-pointer"
                      title="Remove photograph"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Urgency level *
                </label>
                <select
                  value={formData.urgencyLevel}
                  onChange={(e) => setFormData({ ...formData, urgencyLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
                >
                  <option value="low" className="bg-slate-900 text-white">Low — General inquiry</option>
                  <option value="medium" className="bg-slate-900 text-white">Medium — Early symptoms on a few plants</option>
                  <option value="high" className="bg-slate-900 text-white">High — Spreading across the bay</option>
                  <option value="critical" className="bg-slate-900 text-white">Critical — Severe wilting / risk of crop loss</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                  Preferred consultation method *
                </label>
                <select
                  value={formData.preferredConsultationType}
                  onChange={(e) => setFormData({ ...formData, preferredConsultationType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
                >
                  <option value="video" className="bg-slate-900 text-white">Online Video Call</option>
                  <option value="text" className="bg-slate-900 text-white">Text and Photos</option>
                  <option value="phone" className="bg-slate-900 text-white">Phone Call</option>
                  <option value="in_person" className="bg-slate-900 text-white">Farm Visit</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {submitting ? 'Submitting...' : 'Submit problem & match experts'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* ===================================================================== */}
      {/* FARMER'S OWN PROBLEM REPORT HISTORY                                   */}
      {/* ===================================================================== */}
      <div className="rounded-2xl bg-[#0f3830] border border-emerald-500/20 p-5 sm:p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-emerald-500/15">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              My submitted problem reports ({myReports.length})
            </h3>
            <p className="text-xs text-emerald-100/70">
              Select any report to view matched experts or review historical recommendations.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchMyReports}
            className="px-3.5 py-1.5 rounded-full bg-[#0a2720] hover:bg-[#14473d] text-emerald-100/80 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/20 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingReports ? 'animate-spin text-emerald-300' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {myReports.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#0a2720] border border-emerald-500/15 text-center text-xs text-emerald-100/60">
            You have not submitted any problem reports yet.
          </div>
        ) : (
          <div className="divide-y divide-emerald-500/15 rounded-xl bg-[#0a2720] border border-emerald-500/15 overflow-hidden">
            {myReports.map((rep) => (
              <div
                key={rep._id}
                className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-[#103a31]/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 font-mono text-[11px] font-bold text-emerald-300">
                      {rep.reportNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#0f3830] text-[11px] font-semibold text-emerald-100 border border-emerald-500/20">
                      {rep.category}
                    </span>
                    <span className="text-[11px] text-emerald-100/60 capitalize">
                      {rep.urgencyLevel} urgency
                    </span>
                    <span className="text-[11px] text-emerald-300 capitalize font-medium">
                      • {rep.status}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    {rep.title} {rep.affectedCrop && <span className="text-emerald-300 font-normal">({rep.affectedCrop})</span>}
                  </h4>

                  <p className="text-xs text-emerald-100/70 line-clamp-2 leading-relaxed">
                    {rep.description}
                  </p>

                  <div className="text-[11px] text-emerald-100/50">
                    Submitted {new Date(rep.createdAt).toLocaleDateString()} • {rep.greenhouseType}
                    {rep.photographs?.length > 0 && ` • 📷 ${rep.photographs.length} photo(s)`}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleInspectPastReport(rep._id)}
                    className="px-3.5 py-1.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View matched experts</span>
                  </button>

                  {rep.status !== 'closed' ? (
                    <button
                      type="button"
                      onClick={() => handleToggleReportStatus(rep, 'closed')}
                      className="px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-100/70 hover:text-white hover:bg-emerald-500/10 text-xs font-semibold cursor-pointer"
                    >
                      Close
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleReportStatus(rep, 'open')}
                      className="px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-300 hover:text-white hover:bg-emerald-500/10 text-xs font-semibold cursor-pointer"
                    >
                      Reopen
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
