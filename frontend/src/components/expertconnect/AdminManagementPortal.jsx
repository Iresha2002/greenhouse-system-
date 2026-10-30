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
      <div className="p-8 rounded-2xl bg-[#0f3830] border border-emerald-500/20 text-center space-y-2">
        <ShieldAlert className="w-10 h-10 text-emerald-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Administrator access required</h3>
        <p className="text-xs text-emerald-100/70 max-w-sm mx-auto">
          You must be signed in with administrator privileges to access platform moderation tools.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0f3830] border border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Admin operations &amp; moderation
          </h2>
          <p className="text-xs text-emerald-100/70 mt-0.5">
            Monitor consultations, moderate reviews, and govern accounts.
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
          className="px-3.5 py-1.5 rounded-full bg-[#0a2720] hover:bg-[#14473d] text-emerald-100 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/20 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin text-emerald-300' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications / Feedback */}
      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-500/15 border border-red-400/30 text-red-200 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-emerald-500/15 pb-3">
        {[
          { id: 'stats', label: 'Platform analytics' },
          { id: 'consultations', label: 'All consultations' },
          { id: 'reviews', label: 'Review moderation' },
          { id: 'users', label: 'User governance' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#4de1b7] text-slate-950 font-bold'
                  : 'bg-[#0f3830] text-emerald-100/75 hover:text-white border border-emerald-500/20'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: STATS & ANALYTICS */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {[
              { label: 'Total Users', value: stats?.totalUsers ?? '—' },
              { label: 'Approved Experts', value: stats?.totalExperts ?? '—' },
              { label: 'Pending Apps', value: stats?.pendingApplications ?? '—' },
              { label: 'Problem Reports', value: stats?.totalProblems ?? '—' },
              { label: 'Consultations', value: stats?.totalConsultations ?? '—' },
              { label: 'Completed', value: stats?.completedConsultations ?? '—' },
              { label: 'Farmer Reviews', value: stats?.totalReviews ?? '—' }
            ].map((k, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#0f3830] border border-emerald-500/20 space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-100/60 block">
                  {k.label}
                </span>
                <span className="text-xl font-bold text-white">
                  {k.value}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Consultation breakdown */}
            <div className="p-4 rounded-xl bg-[#0f3830] border border-emerald-500/20 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Consultations by status
              </h3>
              <div className="space-y-1.5">
                {stats?.consultationsByStatus && Object.keys(stats.consultationsByStatus).length > 0 ? (
                  Object.entries(stats.consultationsByStatus).map(([st, cnt]) => (
                    <div key={st} className="flex items-center justify-between p-2 rounded-lg bg-[#0a2720]">
                      <span className="text-xs text-emerald-100 capitalize">
                        {st.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                        {cnt}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-emerald-100/50">No consultation records yet.</p>
                )}
              </div>
            </div>

            {/* Top Categories */}
            <div className="p-4 rounded-xl bg-[#0f3830] border border-emerald-500/20 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Top reported categories
              </h3>
              <div className="space-y-1.5">
                {stats?.topProblemCategories && stats.topProblemCategories.length > 0 ? (
                  stats.topProblemCategories.map((c) => (
                    <div key={c._id} className="flex items-center justify-between p-2 rounded-lg bg-[#0a2720]">
                      <span className="text-xs text-emerald-100">{c._id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                        {c.count} reports
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-emerald-100/50">No problem reports recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ALL CONSULTATIONS */}
      {activeTab === 'consultations' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0f3830] border border-emerald-500/20">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-emerald-100/40 shrink-0" />
              <input
                type="text"
                placeholder="Search by ID, farmer, expert, or crop..."
                value={consultationSearch}
                onChange={(e) => setConsultationSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0a2720] border border-emerald-500/25 text-xs text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#0a2720] border border-emerald-500/25 text-xs text-white focus:outline-none cursor-pointer"
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
            <p className="text-xs text-emerald-100/60 text-center py-6">Loading consultations...</p>
          ) : consultations.length === 0 ? (
            <p className="text-xs text-emerald-100/60 text-center py-6">No consultations match the filter.</p>
          ) : (
            <div className="space-y-2.5">
              {consultations.map((c) => (
                <div
                  key={c._id}
                  className="p-3.5 rounded-xl bg-[#0f3830] border border-emerald-500/20 space-y-1.5 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-300 font-bold">{c.consultationNumber}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#0a2720] text-[10px] font-semibold uppercase text-emerald-100 border border-emerald-500/20">
                        {c.consultationType}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-bold uppercase text-emerald-200">
                        {c.status}
                      </span>
                    </div>
                    <span className="text-emerald-100/50 font-mono text-[11px]">
                      {c.preferredDate} • {c.timeSlot}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-emerald-100/80">
                    <div>
                      Farmer: <strong className="text-white">{c.farmerName}</strong> ({c.farmer?.email || 'N/A'})
                    </div>
                    <div>
                      Expert: <strong className="text-white">{c.expertName}</strong> ({c.expertTitle || 'Specialist'})
                    </div>
                  </div>

                  <p className="text-emerald-100/70 line-clamp-1">
                    <span className="text-emerald-300 font-semibold">[{c.affectedCrop || c.problemCategory}]</span>{' '}
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
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[#0f3830] border border-emerald-500/20 text-xs text-emerald-100/80 leading-relaxed">
            Administrators can inspect farmer reviews. Inappropriate or abusive reviews can be removed, which automatically recalculates the expert&apos;s average rating.
          </div>

          {loadingReviews ? (
            <p className="text-xs text-emerald-100/60 text-center py-6">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-xs text-emerald-100/60 text-center py-6">No reviews submitted yet.</p>
          ) : (
            <div className="space-y-2.5">
              {reviews.map((r) => (
                <div
                  key={r._id}
                  className="p-3.5 rounded-xl bg-[#0f3830] border border-emerald-500/20 space-y-1.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <strong className="text-white">{r.farmerName}</strong>
                      <span className="text-amber-400 font-bold">{'★'.repeat(r.rating)}</span>
                      <span className="text-emerald-100/50 text-[11px]">
                        reviewed {r.expertProfile?.fullName || 'Expert'}
                      </span>
                    </div>
                    {r.comment && <p className="text-emerald-100/80 italic">&ldquo;{r.comment}&rdquo;</p>}
                    <span className="text-[10px] text-emerald-100/40 block">
                      Ref: {r.consultation?.consultationNumber || 'Completed Session'} • {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={deletingReviewId === r._id}
                    onClick={() => handleDeleteReview(r._id)}
                    className="px-3 py-1 rounded-full border border-red-500/30 text-red-300 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1 cursor-pointer self-start sm:self-auto shrink-0 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{deletingReviewId === r._id ? 'Removing...' : 'Remove'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: USER GOVERNANCE & SUSPENSION */}
      {activeTab === 'users' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0f3830] border border-emerald-500/20">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-emerald-100/40 shrink-0" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0a2720] border border-emerald-500/25 text-xs text-white placeholder:text-emerald-100/40 focus:outline-none focus:border-[#4de1b7]"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#0a2720] border border-emerald-500/25 text-xs text-white focus:outline-none cursor-pointer"
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
            <p className="text-xs text-emerald-100/60 text-center py-6">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-xs text-emerald-100/60 text-center py-6">No users match criteria.</p>
          ) : (
            <div className="space-y-2.5">
              {users.map((u) => {
                const isCurrentAdmin = u._id === currentUser?._id;
                return (
                  <div
                    key={u._id}
                    className={`p-3.5 rounded-xl border space-y-1.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      u.isSuspended
                        ? 'bg-[#181313] border-red-500/30'
                        : 'bg-[#0f3830] border-emerald-500/20'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-xs sm:text-sm">{u.username}</strong>
                        <span className="px-2 py-0.2 rounded-full bg-[#0a2720] text-emerald-300 text-[10px] font-bold uppercase border border-emerald-500/20">
                          {u.role}
                        </span>
                        {u.isSuspended && (
                          <span className="px-2 py-0.2 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold uppercase">
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="text-emerald-100/70">
                        {u.email} • {u.location || 'Sri Lanka'}
                      </div>
                      {u.isSuspended && u.suspensionReason && (
                        <p className="text-red-300 text-[11px]">
                          Reason: {u.suspensionReason}
                        </p>
                      )}
                    </div>

                    {!isCurrentAdmin && (
                      <button
                        type="button"
                        disabled={updatingUserId === u._id}
                        onClick={() => handleToggleSuspend(u)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-all ${
                          u.isSuspended
                            ? 'bg-[#4de1b7] text-slate-950 font-bold'
                            : 'border border-red-400/30 text-red-300 hover:bg-red-500/10'
                        }`}
                      >
                        {u.isSuspended ? (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>Reactivate</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3" />
                            <span>Suspend</span>
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
