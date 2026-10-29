import React, { useState, useEffect, useCallback } from 'react';
import {
  Award,
  CheckCircle,
  Clock,
  XCircle,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  FileText,
  Lock,
  Send,
  RefreshCw,
  UserCheck,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import {
  submitExpertApplication,
  getMyExpertApplication,
  getAdminExpertApplications,
  verifyExpertApplication,
} from '../../services/api';

const ALL_SPECIALIZATIONS = [
  'Greenhouse Management',
  'Hydroponics',
  'Nutrient Management',
  'Soil and Growing Media',
  'Irrigation Systems',
  'Plant Diseases',
  'Pest Management',
  'Crop Nutrition',
  'Climate and Temperature Control',
  'Greenhouse Automation',
  'Sensor and IoT Systems',
  'Crop Selection',
  'Harvest Management',
  'Sustainable Agriculture',
];

const CONSULTATION_METHODS = [
  { id: 'video', label: 'Online Video Consultation' },
  { id: 'text', label: 'Text & Photo Advisory' },
  { id: 'phone', label: 'Scheduled Phone Consultation' },
  { id: 'in_person', label: 'On-Site Field Inspection' },
];

export const ExpertApplicationPortal = ({
  currentUser,
  onOpenLogin,
  onDirectoryUpdated,
}) => {
  const [myApplication, setMyApplication] = useState(null);
  const [loadingMyApp, setLoadingMyApp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    professionalTitle: '',
    qualifications: '',
    fieldOfStudy: '',
    yearsOfExperience: 3,
    experienceSummary: '',
    biography: '',
    specializations: ['Greenhouse Management', 'Crop Nutrition'],
    languages: 'English, Sinhala',
    profilePhoto: '',
    location: '',
    consultationTypes: ['video', 'text'],
    consultationFee: 15,
    supportingDocuments: '',
  });

  // Administrator Review Queue State
  const [adminApps, setAdminApps] = useState([]);
  const [adminMetrics, setAdminMetrics] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
  });
  const [adminFilter, setAdminFilter] = useState('all');
  const [adminUpdatingId, setAdminUpdatingId] = useState(null);
  const [adminNotesMap, setAdminNotesMap] = useState({});

  const isAdmin = currentUser?.role === 'admin';

  const fetchApplicationData = useCallback(async () => {
    if (!currentUser) return;
    setLoadingMyApp(true);
    setErrorMsg('');
    try {
      const myRes = await getMyExpertApplication();
      if (myRes && myRes.success && myRes.application) {
        const app = myRes.application;
        setMyApplication(app);
        setFormData({
          fullName: app.fullName || currentUser.username || '',
          professionalTitle: app.professionalTitle || '',
          qualifications: app.qualifications || '',
          fieldOfStudy: app.fieldOfStudy || 'Agricultural Sciences',
          yearsOfExperience: app.yearsOfExperience ?? 3,
          experienceSummary: app.experienceSummary || '',
          biography: app.biography || '',
          specializations:
            Array.isArray(app.specializations) && app.specializations.length > 0
              ? app.specializations
              : ['Greenhouse Management'],
          languages: Array.isArray(app.languages)
            ? app.languages.join(', ')
            : 'English, Sinhala',
          profilePhoto: app.profilePhoto || '',
          location: app.location || currentUser.location || '',
          consultationTypes:
            Array.isArray(app.consultationTypes) && app.consultationTypes.length > 0
              ? app.consultationTypes
              : ['video', 'text'],
          consultationFee: app.consultationFee ?? 15,
          supportingDocuments: Array.isArray(app.supportingDocuments)
            ? app.supportingDocuments.join(', ')
            : '',
        });
      } else {
        setMyApplication(null);
        setFormData((prev) => ({
          ...prev,
          fullName: currentUser.username || '',
          location: currentUser.location || 'Peradeniya Agricultural Hub',
        }));
      }

      if (isAdmin) {
        const adminRes = await getAdminExpertApplications();
        if (adminRes && adminRes.success) {
          setAdminApps(adminRes.applications || []);
          if (adminRes.metrics) setAdminMetrics(adminRes.metrics);
        }
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Failed to load expert application data.'
      );
    } finally {
      setLoadingMyApp(false);
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    fetchApplicationData();
  }, [fetchApplicationData]);

  const toggleSpecialization = (spec) => {
    setFormData((prev) => {
      const exists = prev.specializations.includes(spec);
      if (exists && prev.specializations.length === 1) return prev;
      return {
        ...prev,
        specializations: exists
          ? prev.specializations.filter((s) => s !== spec)
          : [...prev.specializations, spec],
      };
    });
  };

  const toggleConsultationMethod = (methodId) => {
    setFormData((prev) => {
      const exists = prev.consultationTypes.includes(methodId);
      if (exists && prev.consultationTypes.length === 1) return prev;
      return {
        ...prev,
        consultationTypes: exists
          ? prev.consultationTypes.filter((m) => m !== methodId)
          : [...prev.consultationTypes, methodId],
      };
    });
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (
      !formData.fullName.trim() ||
      !formData.professionalTitle.trim() ||
      !formData.qualifications.trim() ||
      !formData.biography.trim()
    ) {
      setErrorMsg(
        'Please complete Full Name, Professional Title, Educational Qualifications, and Biography.'
      );
      return;
    }

    if (formData.specializations.length === 0) {
      setErrorMsg('Please select at least one agricultural specialization.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        professionalTitle: formData.professionalTitle.trim(),
        qualifications: formData.qualifications.trim(),
        fieldOfStudy: formData.fieldOfStudy.trim() || 'Agricultural Sciences',
        yearsOfExperience: Number(formData.yearsOfExperience) || 1,
        experienceSummary: formData.experienceSummary.trim(),
        biography: formData.biography.trim(),
        specializations: formData.specializations,
        languages: formData.languages
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean),
        profilePhoto: formData.profilePhoto.trim(),
        location: formData.location.trim(),
        consultationTypes: formData.consultationTypes,
        consultationFee: Number(formData.consultationFee) || 0,
        supportingDocuments: formData.supportingDocuments
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
      };

      const res = await submitExpertApplication(payload);
      if (res && res.success) {
        setSuccessMsg(
          res.message || 'Expert application submitted successfully!'
        );
        await fetchApplicationData();
        if (onDirectoryUpdated) onDirectoryUpdated();
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Failed to submit expert application.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminVerify = async (appId, nextStatus) => {
    setAdminUpdatingId(appId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const note = adminNotesMap[appId] || '';
      const res = await verifyExpertApplication(appId, {
        status: nextStatus,
        verificationNotes: note,
      });
      if (res && res.success) {
        setSuccessMsg(res.message);
        await fetchApplicationData();
        if (onDirectoryUpdated) onDirectoryUpdated();
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Failed to update verification status.'
      );
    } finally {
      setAdminUpdatingId(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-8 sm:p-12 text-center space-y-4 backdrop-blur-xl">
        <Lock className="w-12 h-12 text-amber-400 mx-auto" />
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          Sign In Required to Apply as an Agricultural Expert
        </h3>
        <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
          To protect credential integrity, expert applications must be linked to an authenticated SmartGrow OS account and reviewed by a platform Administrator before appearing in the verified directory.
        </p>
        <button
          type="button"
          onClick={onOpenLogin}
          className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-xs sm:text-sm cursor-pointer shadow-lg shadow-cyan-500/20"
        >
          Sign In or Register Account
        </button>
      </div>
    );
  }

  const filteredAdminApps = adminApps.filter((app) => {
    if (adminFilter === 'all') return true;
    return app.verificationStatus === adminFilter;
  });

  const statusBadgeMeta = {
    pending: {
      label: 'Pending Administrator Review',
      style: 'bg-amber-500/20 border-amber-400/40 text-amber-300',
      icon: Clock,
    },
    under_review: {
      label: 'Under Academic & Credential Review',
      style: 'bg-sky-500/20 border-sky-400/40 text-sky-300',
      icon: Eye,
    },
    approved: {
      label: 'Approved & Verified in Public Directory',
      style: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300',
      icon: CheckCircle,
    },
    rejected: {
      label: 'Application Not Approved',
      style: 'bg-red-500/20 border-red-400/40 text-red-300',
      icon: XCircle,
    },
  };

  const currentStatusMeta =
    statusBadgeMeta[myApplication?.verificationStatus] || statusBadgeMeta.pending;
  const StatusIcon = currentStatusMeta.icon;

  return (
    <div className="space-y-8">
      {/* Notification Messages */}
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
      {/* ADMINISTRATOR VERIFICATION PANEL (Visible only when role === 'admin') */}
      {/* ===================================================================== */}
      {isAdmin && (
        <div className="rounded-3xl bg-gradient-to-br from-[#0e352f] via-[#113d38] to-[#0c2938] border border-amber-400/40 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/35 text-amber-300 text-xs font-extrabold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administrator Expert Verification Desk</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Review & Approve Agricultural Expert Applications
              </h3>
              <p className="text-xs text-white/70 mt-1">
                Only experts approved here receive the Verified badge and appear in the public Find a Greenhouse Expert directory.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchApplicationData}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loadingMyApp ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>

          {/* Admin KPI Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-black/30 border border-white/15 p-4">
              <span className="text-[11px] uppercase text-white/50 font-bold block">
                Total Applications
              </span>
              <span className="text-2xl font-extrabold text-white">
                {adminMetrics.total}
              </span>
            </div>
            <div className="rounded-2xl bg-black/30 border border-amber-400/30 p-4">
              <span className="text-[11px] uppercase text-amber-300/80 font-bold block">
                Pending Review
              </span>
              <span className="text-2xl font-extrabold text-amber-300">
                {adminMetrics.pending + adminMetrics.underReview}
              </span>
            </div>
            <div className="rounded-2xl bg-black/30 border border-emerald-400/30 p-4">
              <span className="text-[11px] uppercase text-emerald-300/80 font-bold block">
                Approved & Verified
              </span>
              <span className="text-2xl font-extrabold text-emerald-300">
                {adminMetrics.approved}
              </span>
            </div>
            <div className="rounded-2xl bg-black/30 border border-red-400/30 p-4">
              <span className="text-[11px] uppercase text-red-300/80 font-bold block">
                Rejected
              </span>
              <span className="text-2xl font-extrabold text-red-300">
                {adminMetrics.rejected}
              </span>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: `All (${adminMetrics.total})` },
              { id: 'pending', label: `Pending (${adminMetrics.pending})` },
              { id: 'under_review', label: `Under Review (${adminMetrics.underReview})` },
              { id: 'approved', label: `Approved (${adminMetrics.approved})` },
              { id: 'rejected', label: `Rejected (${adminMetrics.rejected})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setAdminFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  adminFilter === tab.id
                    ? 'bg-amber-400 text-slate-950 font-extrabold'
                    : 'bg-white/10 hover:bg-white/20 text-white/75'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Applications List */}
          <div className="divide-y divide-white/10 rounded-2xl bg-black/25 border border-white/10 overflow-hidden">
            {filteredAdminApps.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/60">
                No expert applications match the selected status filter.
              </div>
            ) : (
              filteredAdminApps.map((app) => {
                const badge =
                  statusBadgeMeta[app.verificationStatus] || statusBadgeMeta.pending;
                const isUpdating = adminUpdatingId === app._id;

                return (
                  <div key={app._id} className="p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-base font-extrabold text-white">
                            {app.fullName}
                          </h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.style}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-cyan-300">
                          {app.professionalTitle} • {app.yearsOfExperience} yrs exp
                        </p>
                        <p className="text-xs text-white/70 mt-1">
                          <strong>Qualifications:</strong> {app.qualifications} (
                          {app.fieldOfStudy})
                        </p>
                      </div>

                      <div className="text-right text-xs text-white/60">
                        <p>Applicant: {app.user?.email || 'Registered User'}</p>
                        <p>Fee: ${Number(app.consultationFee || 0).toFixed(2)}</p>
                      </div>
                    </div>

                    <p className="text-xs text-white/75 leading-relaxed">
                      {app.biography}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {(app.specializations || []).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-white/10 text-[11px] text-cyan-200 font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {Array.isArray(app.supportingDocuments) &&
                      app.supportingDocuments.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-amber-200">
                          <strong>Supporting Credentials (Admin-Only View):</strong>{' '}
                          {app.supportingDocuments.join(' • ')}
                        </div>
                      )}

                    {/* Admin Action Controls */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
                      <input
                        type="text"
                        value={
                          adminNotesMap[app._id] !== undefined
                            ? adminNotesMap[app._id]
                            : app.verificationNotes || ''
                        }
                        onChange={(e) =>
                          setAdminNotesMap({
                            ...adminNotesMap,
                            [app._id]: e.target.value,
                          })
                        }
                        placeholder="Optional administrator review note..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-amber-400"
                      />

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleAdminVerify(app._id, 'under_review')}
                          className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/40 text-sky-300 text-xs font-bold cursor-pointer"
                        >
                          Mark Under Review
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleAdminVerify(app._id, 'approved')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold cursor-pointer"
                        >
                          ✓ Approve & Verify Expert
                        </button>
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleAdminVerify(app._id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/35 border border-red-400/40 text-red-300 text-xs font-bold cursor-pointer"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* APPLICANT STATUS BANNER (If user has already submitted an application)*/}
      {/* ===================================================================== */}
      {myApplication && (
        <div className="rounded-3xl bg-white/[0.07] border border-cyan-400/35 p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <StatusIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="text-base sm:text-lg font-extrabold text-white">
                  Your Expert Application Status
                </h4>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-extrabold border ${currentStatusMeta.style}`}
                >
                  {currentStatusMeta.label}
                </span>
              </div>
              <p className="text-xs text-white/70">
                {myApplication.verificationStatus === 'approved'
                  ? 'Your profile is approved and publicly visible in the Find a Greenhouse Expert directory. You can update your profile details below.'
                  : 'Your qualifications are stored safely in MongoDB. Once a SmartGrow Administrator approves your application, your profile will automatically appear in the verified directory.'}
              </p>
              {myApplication.verificationNotes && (
                <p className="text-xs text-cyan-300 mt-1.5 font-semibold">
                  Reviewer Note: {myApplication.verificationNotes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* EXPERT APPLICATION & PROFILE SUBMISSION FORM                          */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-white/[0.07] border border-white/15 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>
              {myApplication
                ? 'Update Your Expert Application / Profile'
                : 'Become a Verified SmartGrow Agricultural Expert'}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white">
            Professional Qualifications & Specialization Application
          </h3>
          <p className="text-xs text-white/65 mt-1">
            Provide accurate academic credentials, greenhouse experience, and areas of specialization. Unverified applications are never shown as verified until approved by an administrator.
          </p>
        </div>

        <form onSubmit={handleSubmitApplication} className="space-y-6">
          {/* 1. Identity & Academic Credentials */}
          <div className="rounded-2xl bg-black/25 border border-white/10 p-5 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              1. Identity & Educational Qualifications
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Full Name & Academic Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="e.g., Dr. Kasun Wijesinghe, PhD"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Professional Title / Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.professionalTitle}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      professionalTitle: e.target.value,
                    })
                  }
                  placeholder="e.g., Greenhouse Agronomist & Crop Nutrition Specialist"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Educational Qualifications (Degrees & University) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.qualifications}
                  onChange={(e) =>
                    setFormData({ ...formData, qualifications: e.target.value })
                  }
                  placeholder="e.g., MSc Protected Horticulture, BSc Agriculture (Hons)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Primary Field of Study *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fieldOfStudy}
                  onChange={(e) =>
                    setFormData({ ...formData, fieldOfStudy: e.target.value })
                  }
                  placeholder="e.g., Plant Pathology & Hydroponic Systems"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* 2. Experience & Biography */}
          <div className="rounded-2xl bg-black/25 border border-white/10 p-5 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" />
              2. Agricultural Experience & Professional Biography
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  required
                  value={formData.yearsOfExperience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      yearsOfExperience: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Base Location / Agricultural Station
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Peradeniya / Nuwara Eliya"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Languages Spoken (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={(e) =>
                    setFormData({ ...formData, languages: e.target.value })
                  }
                  placeholder="English, Sinhala, Tamil"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Professional Biography (Displayed on your public profile) *
              </label>
              <textarea
                rows={3}
                required
                value={formData.biography}
                onChange={(e) =>
                  setFormData({ ...formData, biography: e.target.value })
                }
                placeholder="Describe how you help greenhouse farmers diagnose and solve crop, nutrient, pest, or automation problems..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Relevant Field & Greenhouse Experience Summary
              </label>
              <textarea
                rows={2}
                value={formData.experienceSummary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experienceSummary: e.target.value,
                  })
                }
                placeholder="Summarize commercial greenhouses, research institutes, or extension projects you have worked with..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* 3. Areas of Specialization (Select Multiple) */}
          <div className="rounded-2xl bg-black/25 border border-white/10 p-5 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              3. Select Areas of Specialization ({formData.specializations.length} selected) *
            </h4>
            <div className="flex flex-wrap gap-2">
              {ALL_SPECIALIZATIONS.map((spec) => {
                const isSelected = formData.specializations.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-extrabold shadow-sm'
                        : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/75 border-white/15'
                    }`}
                  >
                    {isSelected ? `✓ ${spec}` : spec}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Consultation Preferences, Fee & Verification Documents */}
          <div className="rounded-2xl bg-black/25 border border-white/10 p-5 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              4. Consultation Methods, Fee & Verification Credentials
            </h4>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-2">
                Preferred Consultation Methods *
              </label>
              <div className="flex flex-wrap gap-2">
                {CONSULTATION_METHODS.map((m) => {
                  const isSelected = formData.consultationTypes.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleConsultationMethod(m.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-extrabold'
                          : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/75 border-white/15'
                      }`}
                    >
                      {isSelected ? `✓ ${m.label}` : m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Consultation Fee ($ USD per session, 0 for Free)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.consultationFee}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consultationFee: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Profile Photograph URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.profilePhoto}
                  onChange={(e) =>
                    setFormData({ ...formData, profilePhoto: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Certificate / Credential Reference (Admin-Only)
                </label>
                <input
                  type="text"
                  value={formData.supportingDocuments}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supportingDocuments: e.target.value,
                    })
                  }
                  placeholder="e.g., Dept. of Agriculture Reg #AG-2041"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 cursor-pointer transition-all"
            >
              <Send className="w-4 h-4" />
              <span>
                {submitting
                  ? 'Saving Application...'
                  : myApplication
                  ? 'Save Application / Profile Updates'
                  : 'Submit Expert Application for Verification'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpertApplicationPortal;
