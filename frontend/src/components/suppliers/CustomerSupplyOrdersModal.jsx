import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { getMySupplyOrders, cancelSupplyOrder } from '../../services/api';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'Received by supplier' },
  { key: 'accepted', label: 'Accepted', desc: 'Confirmed by supplier' },
  { key: 'preparing', label: 'Packing', desc: 'Warehouse preparation' },
  { key: 'ready_for_dispatch', label: 'Ready', desc: 'QA checked' },
  { key: 'dispatched', label: 'In Transit', desc: 'Dispatched to address' },
  { key: 'delivered', label: 'Delivered', desc: 'Received by customer' },
];

export const CustomerSupplyOrdersModal = ({
  isOpen,
  onClose,
  currentUser = null,
  onOrderCancelled,
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'delivered' | 'cancelled'
  const [searchPhone, setSearchPhone] = useState(currentUser?.phoneNumber || '');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    if (currentUser?.phoneNumber && !searchPhone) {
      setSearchPhone(currentUser.phoneNumber);
    }
  }, [currentUser, searchPhone]);

  const fetchSupplyOrders = useCallback(async () => {
    try {
      setLoading(true);
      setActionError('');

      const params = {};
      if (searchPhone.trim()) {
        params.phone = searchPhone.trim();
      }

      const res = await getMySupplyOrders(params);
      if (res && Array.isArray(res.orders)) {
        setOrders(res.orders);
        if (res.orders.length > 0 && !expandedOrderId) {
          setExpandedOrderId(res.orders[0]._id);
        }
      } else {
        setOrders([]);
      }
    } catch (err) {
      setOrders([]);
      if (err.response?.status !== 401) {
        setActionError(err.response?.data?.error || 'Could not load supply order history.');
      }
    } finally {
      setLoading(false);
    }
  }, [searchPhone, expandedOrderId]);

  useEffect(() => {
    if (isOpen) {
      fetchSupplyOrders();
    }
  }, [isOpen, fetchSupplyOrders]);

  if (!isOpen) return null;

  const countActive = orders.filter((o) =>
    ['pending', 'accepted', 'preparing', 'ready_for_dispatch', 'dispatched'].includes(o.orderStatus || 'pending')
  ).length;
  const countDelivered = orders.filter((o) => (o.orderStatus || '') === 'delivered').length;
  const countCancelled = orders.filter((o) =>
    ['cancelled', 'rejected'].includes(o.orderStatus || '')
  ).length;

  const filteredOrders = orders.filter((order) => {
    const status = order.orderStatus || 'pending';
    if (activeTab === 'active') {
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

  const handleConfirmCancel = async (orderId) => {
    try {
      setIsSubmittingCancel(true);
      setActionError('');
      const res = await cancelSupplyOrder(
        orderId,
        cancelReason.trim() || 'Cancelled by customer prior to dispatch'
      );
      if (res && res.success) {
        setActionSuccess('Supply order cancelled successfully. Warehouse stock restored.');
        setCancellingOrderId(null);
        setCancelReason('');
        await fetchSupplyOrders();
        if (onOrderCancelled) onOrderCancelled();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setActionError(err.response?.data?.error || err.message || 'Failed to cancel supply order.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
            Pending Dispatch
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            Confirmed by Supplier
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30">
            Warehouse Packing
          </span>
        );
      case 'ready_for_dispatch':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30">
            Ready for Dispatch
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f6f9f8] animate-in fade-in duration-200 text-slate-900 pt-20 sm:pt-24">
      {/* Top Action Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 transition-all cursor-pointer shadow-2xs group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">&larr;</span>
          <span>Back to supplies</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Title & Subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            My orders
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            See where your order is, check what you bought, or cancel a pending order. Total orders: {orders.length}
          </p>
        </div>

        {/* Action Alerts */}
        {actionSuccess && (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Filter Pills & Phone Search Row matching Page 9 */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
          {/* Status Tabs matching Page 9: All orders | Active | Delivered | Cancelled */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#0b3b2c] text-white shadow-xs font-extrabold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold'
              }`}
            >
              All orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-[#0b3b2c] text-white shadow-xs font-extrabold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold'
              }`}
            >
              Active ({countActive})
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'delivered'
                  ? 'bg-[#0b3b2c] text-white shadow-xs font-extrabold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold'
              }`}
            >
              Delivered ({countDelivered})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cancelled'
                  ? 'bg-[#0b3b2c] text-white shadow-xs font-extrabold'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold'
              }`}
            >
              Cancelled ({countCancelled})
            </button>
          </div>

          {/* Phone Search Field + Find Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchSupplyOrders();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Phone number"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#0b3b2c] hover:bg-[#07291e] text-white font-extrabold text-xs transition-all cursor-pointer shadow-xs"
            >
              Find
            </button>
          </form>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <span className="text-xs">Loading supply orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State matching Page 9 */
          <div className="bg-white border border-slate-200 rounded-3xl p-12 sm:p-16 text-center max-w-lg mx-auto shadow-xs">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">No orders yet</h2>
            <p className="text-sm text-slate-500 mb-6">
              Orders that match this filter will show up here.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#0b3b2c] hover:bg-[#07291e] text-white font-extrabold text-sm transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
            >
              <span>Browse supplies</span>
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
                  className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 transition-all shadow-sm hover:shadow-md"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base text-slate-900">
                          Supply Order #{order._id?.slice(-6)?.toUpperCase()}
                        </span>
                        {getStatusBadge(order.orderStatus)}
                      </div>
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block font-semibold">Total</span>
                        <span className="text-base sm:text-lg font-black text-slate-950">
                          ${Number(order.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                        className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        title="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                    <span>
                      {order.items?.length || 0} supplies &middot; {order.deliveryMethod === 'pickup' ? 'Warehouse Pickup' : 'Agri Courier'}
                    </span>
                    <span className="text-slate-500">
                      Customer: {order.customerName} ({order.customerPhone})
                    </span>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-slate-100 space-y-6">
                      {/* Timeline steps */}
                      {order.orderStatus !== 'cancelled' && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Fulfillment Progress
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
                                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                                      : isPast
                                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                                      : 'bg-slate-50/50 border-slate-100 text-slate-400'
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
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Supplies Ordered
                        </h4>
                        <div className="space-y-2">
                          {order.items?.map((it, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-900"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{it.name}</span>
                                <span className="text-slate-500 block text-[11px]">
                                  {it.quantity} {it.unit || 'unit'} &times; ${Number(it.unitPrice || 0).toFixed(2)}
                                </span>
                              </div>
                              <span className="font-extrabold text-slate-950">
                                ${Number(it.totalPrice || (it.unitPrice * it.quantity) || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery and cancel */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div className="text-xs text-slate-600">
                          <span>Address: {order.deliveryAddress || 'Warehouse Depot Collection'}</span>
                        </div>

                        {canCancel && (
                          <div>
                            {cancellingOrderId === order._id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Reason for cancellation"
                                  value={cancelReason}
                                  onChange={(e) => setCancelReason(e.target.value)}
                                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                                />
                                <button
                                  onClick={() => handleConfirmCancel(order._id)}
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
                                className="px-3.5 py-1.5 rounded-full border border-rose-400/30 text-rose-300 hover:bg-rose-500/10 text-xs font-semibold cursor-pointer"
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

export default CustomerSupplyOrdersModal;