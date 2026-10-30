import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Store,
  MapPin,
  Calendar,
  AlertCircle,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronUp,
  Receipt,
  User,
  Phone,
  Loader2,
} from 'lucide-react';
import { getMyOrders, cancelOrder } from '../../services/api';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'Received by greenhouse' },
  { key: 'accepted', label: 'Accepted', desc: 'Confirmed by grower' },
  { key: 'preparing', label: 'Harvesting', desc: 'Fresh crop picking' },
  { key: 'ready_for_dispatch', label: 'Packaged', desc: 'Quality checked' },
  { key: 'dispatched', label: 'In Transit', desc: 'On delivery route' },
  { key: 'delivered', label: 'Delivered', desc: 'Received by customer' },
];

export const CustomerOrdersModal = ({
  isOpen,
  onClose,
  currentUser = null,
  onBrowseProduce,
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'in_progress' | 'delivered' | 'cancelled'
  const [searchPhone, setSearchPhone] = useState(currentUser?.phoneNumber || '');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setActionError('');

      const params = {};
      if (searchPhone.trim()) {
        params.phone = searchPhone.trim();
      }

      const res = await getMyOrders(params);
      if (res && res.orders) {
        setOrders(res.orders);
        if (res.orders.length > 0 && !expandedOrderId) {
          setExpandedOrderId(res.orders[0]._id);
        }
      } else {
        setOrders([]);
      }
      setLoading(false);
    } catch (err) {
      console.warn('Could not fetch orders:', err.message);
      setOrders([]);
      setLoading(false);
    }
  }, [searchPhone, expandedOrderId]);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen, fetchOrders]);

  if (!isOpen) return null;

  const countInProgress = orders.filter((o) =>
    ['pending', 'accepted', 'preparing', 'ready_for_dispatch', 'dispatched'].includes(o.orderStatus || 'pending')
  ).length;
  const countDelivered = orders.filter((o) => (o.orderStatus || '') === 'delivered').length;
  const countCancelled = orders.filter((o) =>
    ['cancelled', 'rejected'].includes(o.orderStatus || '')
  ).length;

  const filteredOrders = orders.filter((order) => {
    const status = order.orderStatus || 'pending';
    if (activeTab === 'in_progress') {
      return ['pending', 'accepted', 'preparing', 'ready_for_dispatch', 'dispatched'].includes(status);
    }
    if (activeTab === 'delivered') {
      return status === 'delivered';
    }
    if (activeTab === 'cancelled') {
      return ['cancelled', 'rejected'].includes(status);
    }
    return true;
  });

  const handleCancelOrderSubmit = async (orderId) => {
    try {
      setIsSubmittingCancel(true);
      setActionError('');
      const res = await cancelOrder(orderId, cancelReason || 'Cancelled by customer');
      if (res && res.success) {
        setActionSuccess('Order cancelled successfully. Crop inventory restored.');
        setCancellingOrderId(null);
        setCancelReason('');
        fetchOrders();
        setTimeout(() => setActionSuccess(''), 4000);
      }
      setIsSubmittingCancel(false);
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to cancel order');
      setIsSubmittingCancel(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
            Pending Confirmation
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            Accepted by Farm
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30">
            Harvesting
          </span>
        );
      case 'ready_for_dispatch':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30">
            Packaged
          </span>
        );
      case 'dispatched':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
            In Transit
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#4de1b7]/20 text-[#4de1b7] border border-[#4de1b7]/30">
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-400/30">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/70">
            {status}
          </span>
        );
    }
  };

  const getStepIndex = (status) => {
    return STATUS_STEPS.findIndex((s) => s.key === status);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071f19]/95 backdrop-blur-xl animate-in fade-in duration-200 text-white">
      {/* Top Header Bar matching Page 5 */}
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
            <span>Back to crops</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Title & Subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            My crop orders
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Follow your orders from the farm to your door. Total orders: {orders.length}
          </p>
        </div>

        {/* Action Alerts */}
        {actionSuccess && (
          <div className="mb-5 p-3 rounded-2xl bg-white/[0.08] border border-[#4de1b7]/40 text-[#4de1b7] text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Filter Pills & Phone Search Row matching Page 5 */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#4de1b7] text-slate-950 shadow-md'
                  : 'bg-white/[0.07] border border-white/15 text-white/80 hover:bg-white/10'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'in_progress'
                  ? 'bg-[#4de1b7] text-slate-950 shadow-md'
                  : 'bg-white/[0.07] border border-white/15 text-white/80 hover:bg-white/10'
              }`}
            >
              In progress ({countInProgress})
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'delivered'
                  ? 'bg-[#4de1b7] text-slate-950 shadow-md'
                  : 'bg-white/[0.07] border border-white/15 text-white/80 hover:bg-white/10'
              }`}
            >
              Delivered ({countDelivered})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cancelled'
                  ? 'bg-[#4de1b7] text-slate-950 shadow-md'
                  : 'bg-white/[0.07] border border-white/15 text-white/80 hover:bg-white/10'
              }`}
            >
              Cancelled ({countCancelled})
            </button>
          </div>

          {/* Phone Search Field + Find Button matching Page 5 */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrders();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Phone number"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/15 rounded-full px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#4de1b7]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md"
            >
              Find
            </button>
          </form>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-white/50">
            <Loader2 className="w-8 h-8 animate-spin text-[#4de1b7] mb-2" />
            <span className="text-xs">Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State matching Page 5 */
          <div className="bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-2xl p-12 sm:p-16 text-center max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">No orders yet</h2>
            <p className="text-sm text-white/60 mb-6">
              Fresh greenhouse crops are waiting for you.
            </p>
            <button
              onClick={() => {
                onClose();
                if (onBrowseProduce) onBrowseProduce();
              }}
              className="px-6 py-2.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-bold text-sm transition-all cursor-pointer shadow-lg inline-flex items-center gap-2"
            >
              <span>Explore fresh produce</span>
              <span>&rarr;</span>
            </button>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              const currentStep = getStepIndex(order.orderStatus);
              const canCancel = ['pending', 'accepted'].includes(order.orderStatus);

              return (
                <div
                  key={order._id}
                  className="bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-2xl p-5 sm:p-6 transition-all"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm sm:text-base text-white">
                            Order #{order._id?.slice(-6)?.toUpperCase()}
                          </span>
                          {getStatusBadge(order.orderStatus)}
                        </div>
                        <span className="text-xs text-white/50 mt-0.5 block">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-white/50 block">Total</span>
                        <span className="text-base sm:text-lg font-bold text-[#4de1b7]">
                          ${Number(order.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                        title="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/70">
                    <span>
                      {order.items?.length || 0} items &middot; {order.deliveryMethod === 'pickup' ? 'Farm Pickup' : 'Eco Delivery'}
                    </span>
                    <span className="text-white/50">
                      Deliver to: {order.customerName} ({order.customerPhone})
                    </span>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-white/10 space-y-6">
                      {/* Timeline steps */}
                      {order.orderStatus !== 'cancelled' && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-3">
                            Delivery Progress
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                            {STATUS_STEPS.map((step, idx) => {
                              const isPast = idx <= currentStep;
                              const isCurrent = idx === currentStep;
                              return (
                                <div
                                  key={step.key}
                                  className={`p-2.5 rounded-xl border text-center transition-all ${
                                    isCurrent
                                      ? 'bg-white/[0.12] border-[#4de1b7] text-[#4de1b7]'
                                      : isPast
                                      ? 'bg-white/[0.06] border-white/20 text-white'
                                      : 'bg-white/[0.02] border-white/5 text-white/30'
                                  }`}
                                >
                                  <div className="text-xs font-bold">{step.label}</div>
                                  <div className="text-[10px] opacity-70 mt-0.5">{step.desc}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Items */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">
                          Items Purchased
                        </h4>
                        <div className="space-y-2">
                          {order.items?.map((it, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-white">{it.name}</span>
                                <span className="text-white/50 block text-[11px]">
                                  {it.quantity} {it.unit || 'kg'} &times; ${Number(it.unitPrice || 0).toFixed(2)}
                                </span>
                              </div>
                              <span className="font-bold text-white">
                                ${Number(it.totalPrice || (it.unitPrice * it.quantity) || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery and actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div className="text-xs text-white/60">
                          <span>Address: {order.deliveryAddress || 'Pickup at farm'}</span>
                        </div>

                        {canCancel && (
                          <div>
                            {cancellingOrderId === order._id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Reason for cancelling"
                                  value={cancelReason}
                                  onChange={(e) => setCancelReason(e.target.value)}
                                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                />
                                <button
                                  onClick={() => handleCancelOrderSubmit(order._id)}
                                  disabled={isSubmittingCancel}
                                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                                >
                                  {isSubmittingCancel ? 'Cancelling...' : 'Confirm'}
                                </button>
                                <button
                                  onClick={() => setCancellingOrderId(null)}
                                  className="px-2 py-1 text-xs text-white/50 hover:text-white"
                                >
                                  Back
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCancellingOrderId(order._id)}
                                className="px-3.5 py-1.5 rounded-full border border-rose-400/30 text-rose-300 hover:bg-rose-500/10 text-xs font-semibold"
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrdersModal;