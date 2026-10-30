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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl bg-[#0b2821] border border-emerald-500/25 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-500/20 bg-[#0f3830] flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0a2720] border border-emerald-500/30 font-mono text-xs font-bold text-emerald-300">
                {consultation.consultationNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[11px] font-bold uppercase text-emerald-200">
                {formData.diagnosisType === 'confirmed_diagnosis'
                  ? 'Confirmed diagnosis'
                  : 'Preliminary opinion'}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isAssignedExpert
                  ? 'Consultation recommendations & treatment plan'
                  : 'Expert recommendation summary'}
              </span>
            </h3>

            <p className="text-xs text-emerald-100/70">
              Specialist: <strong className="text-white">{consultation.expertName}</strong> • Farmer:{' '}
              <strong className="text-white">{consultation.farmerName}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#0a2720] hover:bg-red-500/20 text-emerald-100/80 hover:text-red-200 border border-emerald-500/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0a251e]">
          {/* Advisory Notice */}
          <div className="p-3 rounded-xl bg-[#0f3830] border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-100/80 leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block mb-0.5">
                Agricultural safety notice
              </strong>
              Recommendations are professional guidance based on symptoms and readings observed during consultation. Always verify product dosage labels and observe pre-harvest intervals (PHI).
            </div>
          </div>

          {isAssignedExpert ? (
            /* ASSIGNED EXPERT AUTHORING FORM */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                    Assessment type *
                  </label>
                  <select
                    value={formData.diagnosisType}
                    onChange={(e) =>
                      setFormData({ ...formData, diagnosisType: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white focus:outline-none focus:border-[#4de1b7]"
                  >
                    <option value="preliminary_opinion" className="bg-slate-900">
                      Preliminary opinion (remote review)
                    </option>
                    <option value="confirmed_diagnosis" className="bg-slate-900">
                      Confirmed diagnosis (direct verification)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                    Problem summary *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.problemSummary}
                    onChange={(e) =>
                      setFormData({ ...formData, problemSummary: e.target.value })
                    }
                    placeholder="Short summary of greenhouse problem..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">
                    1. Observations *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.observations}
                    onChange={(e) =>
                      setFormData({ ...formData, observations: e.target.value })
                    }
                    placeholder="Describe observed leaf/root symptoms or readings..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-300 mb-1">
                    2. Possible cause *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formData.possibleCauses}
                    onChange={(e) =>
                      setFormData({ ...formData, possibleCauses: e.target.value })
                    }
                    placeholder="Explain the likely pathogen, nutritional, or climate cause..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-300 mb-1">
                  3. Recommended actions &amp; treatment plan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.recommendedActions}
                  onChange={(e) =>
                    setFormData({ ...formData, recommendedActions: e.target.value })
                  }
                  placeholder="Step-by-step corrective instructions (target EC/pH, sprays, or climate adjustments)..."
                  className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                    4. Preventive measures
                  </label>
                  <textarea
                    rows={2}
                    value={formData.preventiveMeasures}
                    onChange={(e) =>
                      setFormData({ ...formData, preventiveMeasures: e.target.value })
                    }
                    placeholder="Longer-term greenhouse hygiene or fertigation checks..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                    5. Safety &amp; chemical precautions
                  </label>
                  <textarea
                    rows={2}
                    value={formData.safetyPrecautions}
                    onChange={(e) =>
                      setFormData({ ...formData, safetyPrecautions: e.target.value })
                    }
                    placeholder="PPE, spray timing, pre-harvest interval (PHI)..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                    6. Suggested follow-up
                  </label>
                  <input
                    type="text"
                    value={formData.followUpRecommendations}
                    onChange={(e) =>
                      setFormData({ ...formData, followUpRecommendations: e.target.value })
                    }
                    placeholder="e.g. Re-check runoff EC in 3 days"
                    className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-emerald-100/80 mb-1">
                    7. Session notes
                  </label>
                  <input
                    type="text"
                    value={formData.expertNotes}
                    onChange={(e) =>
                      setFormData({ ...formData, expertNotes: e.target.value })
                    }
                    placeholder="Additional notes from consultation..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0a2720] border border-emerald-500/25 text-xs sm:text-sm text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-emerald-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.markCompleted}
                    onChange={(e) =>
                      setFormData({ ...formData, markCompleted: e.target.checked })
                    }
                    className="accent-[#4de1b7] w-4 h-4"
                  />
                  <span>Mark consultation as completed and publish to farmer</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full border border-emerald-500/30 text-white/70 hover:text-white text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save & publish'}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : !hasPublishedRecommendation ? (
            <div className="p-8 rounded-xl bg-[#0f3830] border border-emerald-500/20 text-center space-y-2">
              <Stethoscope className="w-8 h-8 text-emerald-400/60 mx-auto" />
              <h4 className="text-sm font-bold text-white">
                Recommendation pending
              </h4>
              <p className="text-xs text-emerald-100/65 max-w-sm mx-auto">
                Your assigned expert ({consultation.expertName}) has not yet published the written recommendations. You can message them via chat in the meantime.
              </p>
            </div>
          ) : (
            /* FARMER READ-ONLY STRUCTURED REPORT */
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-[#0f3830] border border-emerald-500/20">
                <span className="text-[10px] font-bold uppercase text-emerald-100/50 block mb-0.5">
                  Problem summary
                </span>
                <p className="text-white font-medium">
                  {existingRec.problemSummary || consultation.problemSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0f3830] border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-300 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5" />
                    Expert observation
                  </span>
                  <p className="text-emerald-100/90 leading-relaxed whitespace-pre-wrap">
                    {existingRec.observations}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0f3830] border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Possible cause
                  </span>
                  <p className="text-emerald-100/90 leading-relaxed whitespace-pre-wrap">
                    {existingRec.possibleCauses}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#124235] border border-emerald-400/35 space-y-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#4de1b7]" />
                  Recommended actions &amp; treatment plan
                </span>
                <p className="text-emerald-50 leading-relaxed whitespace-pre-wrap">
                  {existingRec.recommendedActions}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {existingRec.preventiveMeasures && (
                  <div className="p-3.5 rounded-xl bg-[#0f3830] border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-300 flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5" />
                      Preventive measures
                    </span>
                    <p className="text-emerald-100/85 leading-relaxed whitespace-pre-wrap">
                      {existingRec.preventiveMeasures}
                    </p>
                  </div>
                )}

                {existingRec.safetyPrecautions && (
                  <div className="p-3.5 rounded-xl bg-[#0f3830] border border-emerald-500/20 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-amber-300 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Safety precautions
                    </span>
                    <p className="text-amber-100/90 leading-relaxed whitespace-pre-wrap">
                      {existingRec.safetyPrecautions}
                    </p>
                  </div>
                )}
              </div>

              {(existingRec.followUpRecommendations || consultation.expertNotes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {existingRec.followUpRecommendations && (
                    <div className="p-3.5 rounded-xl bg-[#0f3830] border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-emerald-300 flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5" />
                        Follow-up plan
                      </span>
                      <p className="text-emerald-100/85 leading-relaxed">
                        {existingRec.followUpRecommendations}
                      </p>
                    </div>
                  )}

                  {consultation.expertNotes && (
                    <div className="p-3.5 rounded-xl bg-[#0f3830] border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-emerald-100/50 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        Consultation session notes
                      </span>
                      <p className="text-emerald-100/85 leading-relaxed">
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
