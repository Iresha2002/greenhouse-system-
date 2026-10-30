import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getAccountProfile, updateAccountProfile } from '../../services/api';

export const CustomerSupplyProfileModal = ({
  isOpen,
  onClose,
  currentUser,
  onOpenOrderHistory,
}) => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    phoneNumber: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentUser) {
      setProfile(null);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await getAccountProfile();
        if (res && res.success && res.user) {
          setProfile(res.user);
          setFormData({
            username: res.user.username || '',
            phoneNumber: res.user.phoneNumber || '',
            location: res.user.location || '',
          });
        }
      } catch (err) {
        setProfile(currentUser);
        setFormData({
          username: currentUser.username || '',
          phoneNumber: currentUser.phoneNumber || '',
          location: currentUser.location || '',
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanName = formData.username.trim();
    const cleanPhone = formData.phoneNumber.trim();
    const cleanLocation = formData.location.trim();

    if (cleanName.length < 2) {
      setErrorMsg('Name must be at least 2 characters.');
      return;
    }

    setSaving(true);
    try {
      const res = await updateAccountProfile({
        username: cleanName,
        phoneNumber: cleanPhone,
        location: cleanLocation,
      });

      if (res && res.success && res.user) {
        setProfile(res.user);
        setSuccessMsg(res.message || 'Profile changes saved successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update account profile.');
    } finally {
      setSaving(false);
    }
  };

  const userEmail = profile?.email || currentUser?.email || 'user@smartgrow.lk';
  const userRole = (profile?.role || currentUser?.role || 'Customer').toUpperCase();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071f19]/95 backdrop-blur-xl animate-in fade-in duration-200 text-white">
      {/* Top Header Bar matching Page 10 */}
      <div className="border-b border-white/10 bg-[#0a2720]/80 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4de1b7]/20 border border-[#4de1b7]/40 flex items-center justify-center text-[#4de1b7] font-black text-sm">
              SG
            </div>
            <span className="text-lg font-bold text-white tracking-tight">SmartGrow</span>
          </div>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#4de1b7] hover:text-[#3bc7a1] transition-colors cursor-pointer"
          >
            <span>&larr;</span>
            <span>Back to supplies</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            My profile
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Your details and delivery address. Passwords are never shown.
          </p>
        </div>

        {/* Feedback Alerts */}
        {successMsg && (
          <div className="mb-5 p-3 rounded-2xl bg-white/[0.08] border border-[#4de1b7]/40 text-[#4de1b7] text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-2xl p-6 sm:p-8">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-white/50">
              <Loader2 className="w-7 h-7 animate-spin text-[#4de1b7] mb-2" />
              <span className="text-xs">Loading profile details...</span>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Row 1: Email & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">
                    Email (verified)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={userEmail}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white/70 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5">
                    Your role
                  </label>
                  <input
                    type="text"
                    disabled
                    value={userRole}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white/70 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Row 2: Name or farm name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-white">
                    Name or farm name
                  </label>
                  <span className="text-[11px] text-white/40">Required</span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. SmartGrow Admin or Green Hills Farm"
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#4de1b7]"
                />
              </div>

              {/* Row 3: Phone number */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-white">
                    Phone number
                  </label>
                  <span className="text-[11px] text-white/40">Required. We use it to text you when your order ships.</span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="e.g. 0770000001"
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#4de1b7]"
                />
              </div>

              {/* Row 4: Delivery address and district */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-white">
                    Delivery address and district
                  </label>
                  <span className="text-[11px] text-white/40">Required. Your farm or greenhouse.</span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Colombo HQ or Nuwara Eliya Station"
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#4de1b7]"
                />
              </div>

              {/* Actions Row matching Page 10 */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenOrderHistory) onOpenOrderHistory();
                  }}
                  className="px-5 py-2.5 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/10 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  View my orders
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSupplyProfileModal;