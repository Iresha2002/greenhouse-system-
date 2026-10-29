import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Save,
  Package,
  CheckCircle,
  Lock,
} from 'lucide-react';
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
        // Fallback to currentUser prop if token expired or offline
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

    if (cleanName.length < 3) {
      setErrorMsg('Display name / username must be at least 3 characters.');
      return;
    }

    const digitsOnly = cleanPhone.replace(/[\s\-()]/g, '');
    if (!/^\+?[0-9]{9,15}$/.test(digitsOnly)) {
      setErrorMsg('Please enter a valid contact phone number (9 to 15 digits).');
      return;
    }

    if (cleanLocation.length < 3) {
      setErrorMsg('Default delivery address / district must be at least 3 characters.');
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
        setSuccessMsg(res.message || 'Account profile & delivery address saved.');
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Failed to update account profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-[#0d3126] border border-sky-400/35 p-6 sm:p-8 text-white shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 cursor-pointer"
          aria-label="Close Account Profile Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-extrabold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Account Profile & Delivery Preferences</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          My SmartGrow Marketplace Profile
        </h3>
        <p className="text-xs text-white/65 mt-1 mb-6">
          Manage your permitted account details and default agricultural supply delivery address. Sensitive credentials (passwords and tokens) are never exposed.
        </p>

        {!currentUser ? (
          <div className="rounded-2xl bg-black/30 border border-white/15 p-6 text-center space-y-4">
            <Lock className="w-10 h-10 text-amber-400 mx-auto" />
            <div>
              <h4 className="text-base font-bold text-white">
                Browsing as Guest Customer
              </h4>
              <p className="text-xs text-white/65 max-w-sm mx-auto mt-1">
                Sign in using the SmartGrow OS navigation bar to save your default farm delivery address and contact number across sessions. You can still view your guest orders using your phone number.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenOrderHistory) onOpenOrderHistory();
              }}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Lookup My Supply Orders</span>
            </button>
          </div>
        ) : loading ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-4 border-sky-400/20 border-t-sky-400 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-sky-300">Loading your account profile...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-400/40 text-red-200 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Read-Only Account Identity Row (Email & Role) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-black/30 border border-white/10 p-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-white/50 font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  Registered Email (Verified)
                </span>
                <p className="text-xs sm:text-sm font-bold text-white mt-1 truncate">
                  {profile?.email || currentUser.email}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-white/50 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Authorized Role
                </span>
                <p className="text-xs sm:text-sm font-extrabold uppercase text-emerald-300 mt-1">
                  {profile?.role || currentUser.role}
                </p>
              </div>
            </div>

            {/* Editable Permitted Fields */}
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Full Name / Farm or Business Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Contact Phone Number (Used for Order Dispatch Alerts) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  placeholder="e.g., 0771234567"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                Default Farm / Greenhouse Delivery Address & District *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Greenhouse Plot 4, Nuwara Eliya"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenOrderHistory) onOpenOrderHistory();
                }}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Package className="w-4 h-4 text-sky-300" />
                <span>View My Supply Orders</span>
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-sky-500/25 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
