import React, { useState } from 'react';
import {
  ClipboardCheck,
  X,
  Stethoscope,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Sprout,
  Save,
  FileText,
  Sparkles,
  CalendarClock,
} from 'lucide-react';
import { submitConsultationRecommendation } from '../../services/api';

export const ConsultationRecommendationModal = ({
  consultation,
  currentUser,
  onClose,
  onSaved,
}) => {
  const currentUserId = String(currentUser?._id || currentUser?.id || '');
  const isAssignedExpert =
    String(consultation?.expertUser || '') === currentUserId ||
    currentUser?.role === 'admin';

  const existingRec = consultation?.recommendation || {};

  const [formData, setFormData] = useState({
    diagnosisType: existingRec.diagnosisType || 'preliminary_opinion',
    expertNotes: consultation?.expertNotes || '',
    problemSummary:
      existingRec.problemSummary || consultation?.problemSummary || '',
    observations: existingRec.observations || '',
    possibleCauses: existingRec.possibleCauses || '',
    recommendedActions: existingRec.recommendedActions || '',
    preventiveMeasures: existingRec.preventiveMeasures || '',
    safetyPrecautions: existingRec.safetyPrecautions || '',
    followUpRecommendations: existingRec.followUpRecommendations || '',
    markCompleted: consultation?.status !== 'completed',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!consultation) return null;

  const hasPublishedRecommendation = Boolean(
    existingRec.observations && existingRec.recommendedActions
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    try {
      const res = await submitConsultationRecommendation(
        consultation._id,
        formData
      );
      if (res && res.success) {
        if (onSaved) onSaved(res.consultation, res.message);
        onClose();
      }
    } catch (err) {
      setErrorMsg(
        err?.response?.data?.error ||
          'Failed to save expert recommendation and consultation notes.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl bg-gradient-to-b from-[#0b2e2b] via-[#0d2730] to-[#081c24] border border-emerald-400/35 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/15 bg-black/30 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-400/35 font-mono text-xs font-extrabold text-emerald-300">
                {consultation.consultationNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-[11px] font-extrabold uppercase text-cyan-300">
                {formData.diagnosisType === 'confirmed_diagnosis'
                  ? 'Confirmed Field Diagnosis'
                  : 'Preliminary Agricultural Opinion'}
              </span>
            </div>

            <h3 className="text-lg sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                {isAssignedExpert
                  ? 'Record Expert Recommendation & Consultation Notes'
                  : 'Official Expert Recommendation & Treatment Summary'}
              </span>
            </h3>

            <p className="text-xs text-white/70">
              Specialist: <strong className="text-cyan-300">{consultation.expertName}</strong> (
              {consultation.expertTitle}) • Farmer:{' '}
              <strong className="text-white">{consultation.farmerName}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-white/80 hover:text-rose-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Section 19: Agricultural Advice Responsibility Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block mb-0.5">
                Agricultural Advisory &amp; Safety Responsibility Notice
              </strong>
              Recommendations are professional guidance based on the crop
              symptoms, photographs, and environmental readings provided during
              the consultation. They do not guarantee specific yield or chemical
              outcomes. Always verify dosage on product labels and observe
              pre-harvest intervals (PHI).
            </div>
          </div>

          {isAssignedExpert ? (
            /* =============================================================== */
            /* ASSIGNED EXPERT AUTHORING FORM (Section 12)                     */
            /* =============================================================== */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Assessment Classification (Section 19) *
                  </label>
                  <select
                    value={formData.diagnosisType}
                    onChange={(e) =>
                      setFormData({ ...formData, diagnosisType: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="preliminary_opinion" className="bg-slate-900">
                      Preliminary Opinion (Remote / Photo &amp; Sensor Review)
                    </option>
                    <option value="confirmed_diagnosis" className="bg-slate-900">
                      Confirmed Diagnosis (Lab / Direct Visual Verification)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    Problem Summary *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.problemSummary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        problemSummary: e.target.value,
                      })
                    }
                    placeholder="Concise summary of the greenhouse issue..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-emerald-300 mb-1">
                    1. Expert Observation *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.observations}
                    onChange={(e) =>
                      setFormData({ ...formData, observations: e.target.value })
                    }
                    placeholder="Describe observed leaf/root symptoms, EC/pH anomalies, or microclimate indicators..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cyan-300 mb-1">
                    2. Possible Cause / Root Factor *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.possibleCauses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        possibleCauses: e.target.value,
                      })
                    }
                    placeholder="Explain the likely physiological, nutritional, pathogen, or irrigation cause..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1">
                  3. Recommended Action &amp; Corrective Treatment Plan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.recommendedActions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recommendedActions: e.target.value,
                    })
                  }
                  placeholder="Step-by-step corrective instructions (e.g., target EC/pH, foliar calcium spray, biological control release, or irrigation adjustment)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-sky-300 mb-1">
                    4. Preventive Measures
                  </label>
                  <textarea
                    rows={2}
                    value={formData.preventiveMeasures}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preventiveMeasures: e.target.value,
                      })
                    }
                    placeholder="Long-term greenhouse hygiene, VPD targets, or fertigation checks to prevent recurrence..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    5. Safety or Chemical Usage Precautions (If Relevant)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.safetyPrecautions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        safetyPrecautions: e.target.value,
                      })
                    }
                    placeholder="PPE requirements, spray timing (avoid high heat), pre-harvest interval (PHI), or tank-mixing warnings..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-purple-300 mb-1">
                    6. Suggested Follow-Up Plan
                  </label>
                  <input
                    type="text"
                    value={formData.followUpRecommendations}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        followUpRecommendations: e.target.value,
                      })
                    }
                    placeholder="e.g., Re-measure runoff EC in 48 hours and upload new leaf photo in 5 days"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 mb-1">
                    7. Consultation Session Notes
                  </label>
                  <input
                    type="text"
                    value={formData.expertNotes}
                    onChange={(e) =>
                      setFormData({ ...formData, expertNotes: e.target.value })
                    }
                    placeholder="Additional session notes recorded during the consultation..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-emerald-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.markCompleted}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        markCompleted: e.target.checked,
                      })
                    }
                    className="accent-emerald-400 w-4 h-4"
                  />
                  <span>
                    Mark consultation as Completed and publish recommendation to
                    farmer&apos;s history
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {saving
                        ? 'Saving Recommendation...'
                        : 'Save & Publish Recommendation'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : !hasPublishedRecommendation ? (
            /* Farmer View Before Expert Has Published Recommendation */
            <div className="p-8 rounded-2xl bg-black/30 border border-white/10 text-center space-y-2">
              <Stethoscope className="w-10 h-10 text-cyan-400/70 mx-auto" />
              <h4 className="text-base font-extrabold text-white">
                Expert Recommendation Pending
              </h4>
              <p className="text-xs text-white/65 max-w-md mx-auto">
                Your assigned specialist ({consultation.expertName}) has not
                published the final written treatment recommendation yet. You
                can communicate with the expert via the Consultation Chat in the
                meantime.
              </p>
            </div>
          ) : (
            /* =============================================================== */
            /* FARMER READ-ONLY STRUCTURED RECOMMENDATION REPORT (Section 12)  */
            /* =============================================================== */
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/50 block mb-1">
                  Problem Summary
                </span>
                <p className="text-white font-semibold">
                  {existingRec.problemSummary || consultation.problemSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-400/30 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" />
                    Expert Observation
                  </span>
                  <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                    {existingRec.observations}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-400/30 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Possible Cause / Root Factor
                  </span>
                  <p className="text-white/90 leading-relaxed whitespace-pre-wrap">
                    {existingRec.possibleCauses}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 space-y-1.5">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Recommended Action &amp; Treatment Plan
                </span>
                <p className="text-white leading-relaxed whitespace-pre-wrap">
                  {existingRec.recommendedActions}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {existingRec.preventiveMeasures && (
                  <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-400/30 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-300 flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5" />
                      Preventive Measures
                    </span>
                    <p className="text-white/85 leading-relaxed whitespace-pre-wrap">
                      {existingRec.preventiveMeasures}
                    </p>
                  </div>
                )}

                {existingRec.safetyPrecautions && (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-400/40 space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Safety &amp; Chemical Usage Precautions
                    </span>
                    <p className="text-amber-100 leading-relaxed whitespace-pre-wrap">
                      {existingRec.safetyPrecautions}
                    </p>
                  </div>
                )}
              </div>

              {(existingRec.followUpRecommendations ||
                consultation.expertNotes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {existingRec.followUpRecommendations && (
                    <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-400/30 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5" />
                        Suggested Follow-Up
                      </span>
                      <p className="text-white/85 leading-relaxed">
                        {existingRec.followUpRecommendations}
                      </p>
                    </div>
                  )}

                  {consultation.expertNotes && (
                    <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/15 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/60 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        Consultation Session Notes
                      </span>
                      <p className="text-white/85 leading-relaxed">
                        {consultation.expertNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsultationRecommendationModal;
