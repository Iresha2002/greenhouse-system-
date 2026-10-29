import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Package,
  CheckCircle,
  Truck,
  Building2,
  MapPin,
  AlertCircle,
  RotateCcw,
  Search,
  ChevronDown,
  ChevronUp,
  Receipt,
  Loader2,
} from 'lucide-react';
import { getMySupplyOrders, cancelSupplyOrder } from '../../services/api';

const STATUS_STEPS = [
  { key: 'pending', label: 'Pending', desc: 'Order received' },
  { key: 'accepted', label: 'Accepted', desc: 'Confirmed by supplier' },
  { key: 'preparing', label: 'Preparing', desc: 'Warehouse packing' },
  { key: 'ready_for_dispatch', label: 'Ready for Dispatch', desc: 'QA inspected' },
  { key: 'dispatched', label: 'Dispatched', desc: 'In transit / Ready' },
  { key: 'delivered', label: 'Delivered', desc: 'Fulfilled' },
];

export const CustomerSupplyOrdersModal = ({
  isOpen,
  onClose,
  currentUser = null,
  onOrderCancelled,
}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'completed' | 'cancelled'
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

  const filteredOrders = orders.filter((order) => {
    const status = order.orderStatus || 'pending';
    if (activeTab === 'active') {
      return [
        'pending',
        'accepted',
        'preparing',
        'ready_for_dispatch',
        'dispatched',
      ].includes(status);
    }
    if (activeTab === 'completed') {
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
        setActionSuccess(
          'Supply order cancelled successfully. Warehouse stock has been restored.'
        );
        setCancellingOrderId(null);
        setCancelReason('');
        await fetchSupplyOrders();
        if (onOrderCancelled) onOrderCancelled();
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setActionError(
        err.response?.data?.error || err.message || 'Failed to cancel supply order.'
      );
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pending Supplier Review
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
            Accepted
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30">
            Preparing in Warehouse
          </span>
        );
      case 'ready_for_dispatch':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
            Ready for Dispatch
          </span>
        );
      case 'dispatched':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1.5">
            <Truck className="w-3 h-3 text-sky-400" />
            Dispatched
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            Delivered
          </span>
        );
      case 'cancelled':
      case 'rejected':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30">
            {status === 'rejected' ? 'Rejected' : 'Cancelled'}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/10 text-white/70">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-[#0e3229] border border-sky-400/35 shadow-2xl text-white max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                My Agricultural Supply Orders
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  {orders.length} Total
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Track supplier dispatch status, inspect ordered hardware/inputs, or cancel pending orders
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15 self-end sm:self-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phone Lookup & Status Filter Bar */}
        <div className="px-6 py-4 border-b border-white/10 bg-black/25 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'active', label: 'Active' },
              { id: 'completed', label: 'Delivered' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-sky-500 text-slate-950 font-extrabold'
                    : 'bg-white/5 hover:bg-white/15 text-white/70'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Phone Lookup for Guest or Multi-Number Customers */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Lookup by phone (e.g. 0771234567)"
                className="pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>
            <button
              type="button"
              onClick={fetchSupplyOrders}
              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 border border-sky-400/30 text-sky-300 text-xs font-bold cursor-pointer"
            >
              Find
            </button>
          </div>
        </div>

        {/* Orders List Body */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {actionError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {actionSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-sky-300">Loading your supply orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Package className="w-12 h-12 text-sky-400/50 mx-auto" />
              <h3 className="text-base font-bold text-white">No Supply Orders Found</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                {currentUser
                  ? 'You have not placed any agricultural supply orders matching this filter yet.'
                  : 'Sign in or enter the phone number used during checkout above to view your supply orders.'}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              const currentStepIdx = STATUS_STEPS.findIndex(
                (s) => s.key === order.orderStatus
              );

              return (
                <div
                  key={order._id}
                  className="rounded-2xl bg-white/[0.05] border border-white/15 overflow-hidden transition-all"
                >
                  {/* Order Card Summary Header */}
                  <div
                    onClick={() =>
                      setExpandedOrderId(isExpanded ? null : order._id)
                    }
                    className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.04]"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-sm font-black text-sky-300 flex items-center gap-1.5">
                          <Receipt className="w-4 h-4" />
                          {order.orderNumber}
                        </span>
                        {getStatusBadge(order.orderStatus)}
                      </div>
                      <p className="text-[11px] text-white/55">
                        Placed on{' '}
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {order.items?.length || 0} item(s) •{' '}
                        {order.fulfillmentMethod === 'pickup'
                          ? 'Warehouse Pickup'
                          : 'Islandwide Courier'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-white/45 block">
                          Total Amount
                        </span>
                        <span className="text-base font-extrabold text-white">
                          ${Number(order.total).toFixed(2)}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-white/60" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/60" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {isExpanded && (
                    <div className="p-5 border-t border-white/10 bg-black/25 space-y-5 text-xs">
                      {/* Visual Status Progress Stepper (when not cancelled/rejected) */}
                      {!['cancelled', 'rejected'].includes(order.orderStatus) && (
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                          {STATUS_STEPS.map((step, idx) => {
                            const isCompleted = idx <= currentStepIdx;
                            return (
                              <div
                                key={step.key}
                                className={`p-2.5 rounded-xl border text-center ${
                                  isCompleted
                                    ? 'bg-sky-500/15 border-sky-400/40 text-sky-200'
                                    : 'bg-white/[0.02] border-white/10 text-white/35'
                                }`}
                              >
                                <p className="font-extrabold text-[11px]">{step.label}</p>
                                <p className="text-[10px] opacity-75">{step.desc}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Ordered Products & Supplier Breakdown */}
                      <div className="space-y-2">
                        <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-sky-300">
                          Ordered Supplies & Supplier Fulfilment Status
                        </h4>
                        <div className="divide-y divide-white/10 rounded-xl bg-white/[0.03] border border-white/10 p-3">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="py-2.5 first:pt-0 last:pb-0 flex flex-wrap items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span>⚙️</span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-white truncate">{item.name}</p>
                                  <p className="text-[11px] text-white/60 flex items-center gap-1.5">
                                    <Building2 className="w-3 h-3 text-sky-400 shrink-0" />
                                    <span>{item.supplierName}</span>
                                    <span>•</span>
                                    <span>
                                      {item.quantity} {item.unit} × ${Number(item.price).toFixed(2)}
                                    </span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold uppercase text-sky-300">
                                  {item.supplierStatus || order.orderStatus}
                                </span>
                                <span className="font-extrabold text-white">
                                  ${Number(item.itemTotal || item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery & Payment Info + Cancellation Control */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
                        <div className="text-[11px] text-white/70 space-y-0.5">
                          <p>
                            <span className="text-white/45">Destination:</span>{' '}
                            <span className="font-bold text-white">
                              {order.customerInfo?.address} ({order.customerInfo?.district})
                            </span>
                          </p>
                          <p>
                            <span className="text-white/45">Payment Method:</span>{' '}
                            <span className="font-bold text-emerald-300">
                              {order.paymentMethod === 'pay_on_pickup'
                                ? 'Pay on Warehouse Collection'
                                : 'Cash on Delivery (COD)'}{' '}
                              ({order.paymentStatus || 'pending'})
                            </span>
                          </p>
                        </div>

                        {/* Allow cancellation ONLY when orderStatus === 'pending' (Section 4.7) */}
                        {order.orderStatus === 'pending' && (
                          <div>
                            {cancellingOrderId === order._id ? (
                              <div className="flex flex-wrap items-center gap-2 bg-rose-950/40 border border-rose-400/40 p-2 rounded-xl">
                                <input
                                  type="text"
                                  value={cancelReason}
                                  onChange={(e) => setCancelReason(e.target.value)}
                                  placeholder="Reason for cancellation (optional)"
                                  className="px-2.5 py-1 rounded bg-black/50 border border-white/15 text-xs text-white"
                                />
                                <button
                                  type="button"
                                  disabled={isSubmittingCancel}
                                  onClick={() => handleConfirmCancel(order._id)}
                                  className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-xs font-extrabold cursor-pointer"
                                >
                                  {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancel'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCancellingOrderId(null)}
                                  className="px-2 py-1 text-white/60 hover:text-white text-xs cursor-pointer"
                                >
                                  Keep Order
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCancellingOrderId(order._id)}
                                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Cancel Pending Order</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSupplyOrdersModal;
