import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Trash2,
  AlertTriangle,
  FileText,
  Star,
  Activity,
  UserX,
  UserCheck,
  CalendarCheck,
  Award
} from 'lucide-react';
import {
  getAdminPlatformStats,
  getAdminConsultations,
  getAdminReviews,
  deleteAdminReview,
  getAdminUsers,
  toggleUserSuspension
} from '../../services/api';

export const AdminManagementPortal = ({ currentUser, onDirectoryUpdated }) => {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'consultations' | 'reviews' | 'users'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Consultations state
  const [consultations, setConsultations] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [consultationSearch, setConsultationSearch] = useState('');

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Users state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // Action feedback
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Fetch overview stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await getAdminPlatformStats();
      if (res && res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to load platform stats.');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch consultations
  const fetchConsultations = useCallback(async () => {
    setLoadingConsultations(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (consultationSearch.trim()) params.search = consultationSearch.trim();
      const res = await getAdminConsultations(params);
      if (res && res.success) {
        setConsultations(res.consultations || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to load consultations.');
    } finally {
      setLoadingConsultations(false);
    }
  }, [statusFilter, consultationSearch]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await getAdminReviews();
      if (res && res.success) {
        setReviews(res.reviews || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to load reviews.');
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const params = {};
      if (userRoleFilter !== 'all') params.role = userRoleFilter;
      if (userSearch.trim()) params.search = userSearch.trim();
      const res = await getAdminUsers(params);
      if (res && res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to load users.');
    } finally {
      setLoadingUsers(false);
    }
  }, [userRoleFilter, userSearch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'consultations') fetchConsultations();
    if (activeTab === 'reviews') fetchReviews();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, fetchConsultations, fetchReviews, fetchUsers]);

  // Moderate/delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to remove this review for inappropriate content?')) return;
    setDeletingReviewId(reviewId);
    setErrorMsg('');
    try {
      const res = await deleteAdminReview(reviewId);
      if (res && res.success) {
        showFeedback(res.message);
        fetchReviews();
        if (onDirectoryUpdated) onDirectoryUpdated();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to delete review.');
    } finally {
      setDeletingReviewId(null);
    }
  };

  // Suspend/Reactivate user
  const handleToggleSuspend = async (user) => {
    const nextSuspended = !user.isSuspended;
    let reason = '';
    if (nextSuspended) {
      reason = window.prompt(`Provide a suspension reason for ${user.username}:`, 'Violation of agricultural consultation guidelines');
      if (reason === null) return;
    }
    setUpdatingUserId(user._id);
    setErrorMsg('');
    try {
      const res = await toggleUserSuspension(user._id, {
        isSuspended: nextSuspended,
        suspensionReason: reason
      });
      if (res && res.success) {
        showFeedback(res.message);
        fetchUsers();
        if (onDirectoryUpdated) onDirectoryUpdated();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update user status.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 rounded-3xl bg-rose-950/40 border border-rose-400/40 text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-extrabold text-white">Administrator Access Required</h3>
        <p className="text-xs text-white/70 max-w-md mx-auto">
          You must be logged in with platform administrator credentials to view management statistics and moderation tools.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-emerald-950/70 to-slate-900 border border-cyan-400/30 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Platform Governance &amp; Moderation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            SmartGrow ExpertConnect — Administrator Operations
          </h2>
          <p className="text-xs text-white/75 mt-1">
            Monitor consultation throughput, manage platform reviews, review accounts, and safeguard community standards.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchStats();
            if (activeTab === 'consultations') fetchConsultations();
            if (activeTab === 'reviews') fetchReviews();
            if (activeTab === 'users') fetchUsers();
          }}
          className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Notifications / Feedback */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white/[0.06] border border-white/10">
        {[
          { id: 'stats', label: 'Platform Analytics', icon: Activity },
          { id: 'consultations', label: 'All Consultations', icon: CalendarCheck },
          { id: 'reviews', label: 'Review Moderation', icon: Star },
          { id: 'users', label: 'User Governance', icon: Users }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-400 text-slate-950 shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: STATS & ANALYTICS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Total Users', value: stats?.totalUsers ?? '—', color: 'text-cyan-300' },
              { label: 'Approved Experts', value: stats?.totalExperts ?? '—', color: 'text-emerald-300' },
              { label: 'Pending Apps', value: stats?.pendingApplications ?? '—', color: 'text-amber-300' },
              { label: 'Problem Reports', value: stats?.totalProblems ?? '—', color: 'text-purple-300' },
              { label: 'Total Consultations', value: stats?.totalConsultations ?? '—', color: 'text-sky-300' },
              { label: 'Completed Sessions', value: stats?.completedConsultations ?? '—', color: 'text-teal-300' },
              { label: 'Farmer Reviews', value: stats?.totalReviews ?? '—', color: 'text-amber-400' }
            ].map((k, i) => (
              <div key={i} className="p-4 rounded-2xl bg-black/35 border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-white/50 block">
                  {k.label}
                </span>
                <span className={`text-2xl font-black ${k.color}`}>
                  {k.value}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consultation breakdown */}
            <div className="p-5 rounded-3xl bg-black/30 border border-white/10 space-y-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-cyan-400" />
                <span>Consultations by Lifecycle Status</span>
              </h3>
              <div className="space-y-2">
                {stats?.consultationsByStatus && Object.keys(stats.consultationsByStatus).length > 0 ? (
                  Object.entries(stats.consultationsByStatus).map(([st, cnt]) => (
                    <div key={st} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04]">
                      <span className="text-xs font-semibold text-white/80 capitalize">
                        {st.replace('_', ' ')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-black">
                        {cnt}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-white/50">No consultation records yet.</p>
                )}
              </div>
            </div>

            {/* Top Categories */}
            <div className="p-5 rounded-3xl bg-black/30 border border-white/10 space-y-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Top Reported Problem Categories</span>
              </h3>
              <div className="space-y-2">
                {stats?.topProblemCategories && stats.topProblemCategories.length > 0 ? (
                  stats.topProblemCategories.map((c) => (
                    <div key={c._id} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04]">
                      <span className="text-xs font-semibold text-white/80">{c._id}</span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-black">
                        {c.count} reports
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-white/50">No problem reports recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ALL CONSULTATIONS */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-black/30 border border-white/10">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-white/40 shrink-0" />
              <input
                type="text"
                placeholder="Search by ID, farmer, expert, or crop..."
                value={consultationSearch}
                onChange={(e) => setConsultationSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loadingConsultations ? (
            <p className="text-xs text-white/60 text-center py-8">Loading consultations...</p>
          ) : consultations.length === 0 ? (
            <p className="text-xs text-white/60 text-center py-8">No consultations match the filter.</p>
          ) : (
            <div className="space-y-3">
              {consultations.map((c) => (
                <div
                  key={c._id}
                  className="p-4 rounded-2xl bg-black/35 border border-white/10 space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-300 font-extrabold">{c.consultationNumber}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold uppercase text-white/80">
                        {c.consultationType}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[10px] font-black uppercase text-cyan-200">
                        {c.status}
                      </span>
                    </div>
                    <span className="text-white/50 font-mono text-[11px]">
                      {c.preferredDate} • {c.timeSlot}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-white/80">
                    <div>
                      Farmer: <strong className="text-white">{c.farmerName}</strong> ({c.farmer?.email || 'N/A'})
                    </div>
                    <div>
                      Expert: <strong className="text-white">{c.expertName}</strong> ({c.expertTitle || 'Specialist'})
                    </div>
                  </div>

                  <p className="text-white/70 line-clamp-1">
                    <span className="text-emerald-300 font-bold">[{c.affectedCrop || c.problemCategory}]</span>{' '}
                    {c.problemSummary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: REVIEW MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-200">
            Administrators can inspect all farmer reviews across the platform. Inappropriate, spam, or abusive reviews can be removed. Removing a review automatically updates the expert&apos;s genuine average rating score.
          </div>

          {loadingReviews ? (
            <p className="text-xs text-white/60 text-center py-8">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-white/60 text-center py-8">No reviews submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="p-4 rounded-2xl bg-black/35 border border-white/10 space-y-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-white">{r.farmerName}</span>
                      <span className="text-amber-400 font-black">{'★'.repeat(r.rating)}</span>
                      <span className="text-white/50 font-mono text-[10px]">
                        reviewed {r.expertProfile?.fullName || 'Expert'}
                      </span>
                    </div>
                    {r.comment && <p className="text-white/80 italic">&ldquo;{r.comment}&rdquo;</p>}
                    <span className="text-[10px] text-white/40 block">
                      Ref: {r.consultation?.consultationNumber || 'Completed Session'} • {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={deletingReviewId === r._id}
                    onClick={() => handleDeleteReview(r._id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{deletingReviewId === r._id ? 'Removing...' : 'Remove Review'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: USER GOVERNANCE & SUSPENSION */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-black/30 border border-white/10">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-white/40 shrink-0" />
              <input
                type="text"
                placeholder="Search by username, email, or hub..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-black/50 border border-white/15 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="expert">Experts</option>
              <option value="supplier">Suppliers</option>
              <option value="customer">Customers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {loadingUsers ? (
            <p className="text-xs text-white/60 text-center py-8">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-xs text-white/60 text-center py-8">No users match criteria.</p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => {
                const isCurrentAdmin = u._id === currentUser?._id;
                return (
                  <div
                    key={u._id}
                    className={`p-4 rounded-2xl border space-y-2 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      u.isSuspended
                        ? 'bg-rose-950/30 border-rose-400/40'
                        : 'bg-black/35 border-white/10'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{u.username}</span>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-200 text-[10px] font-black uppercase">
                          {u.role}
                        </span>
                        {u.isSuspended && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/25 border border-rose-400/40 text-rose-300 text-[10px] font-black uppercase">
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="text-white/70">
                        {u.email} • {u.location || 'Sri Lanka'} • Tel: {u.phoneNumber}
                      </div>
                      {u.isSuspended && u.suspensionReason && (
                        <p className="text-rose-300 text-[11px] font-semibold">
                          Reason: {u.suspensionReason}
                        </p>
                      )}
                    </div>

                    {!isCurrentAdmin && (
                      <button
                        type="button"
                        disabled={updatingUserId === u._id}
                        onClick={() => handleToggleSuspend(u)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0 transition-all ${
                          u.isSuspended
                            ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200'
                            : 'bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200'
                        }`}
                      >
                        {u.isSuspended ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Reactivate Account</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Suspend Account</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminManagementPortal;
