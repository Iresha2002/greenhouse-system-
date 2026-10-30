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
  Sparkles,
  Loader2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { getFarmerOrders, updateFarmerOrderStatus } from '../../services/api';

export const FarmerOrdersManager = ({ currentUser }) => {
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [notification, setNotification] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getFarmerOrders();
      if (res && res.success) {
        setOrders(res.orders || []);
        if (res.metrics) {
          setMetrics(res.metrics);
        }
      } else {
        setOrders([]);
      }
      setLoading(false);
    } catch (err) {
      console.warn('Error fetching farmer orders:', err.message);
      setOrders([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStatusTransition = async (orderId, nextStatus, note = '') => {
    try {
      setUpdatingId(orderId);
      const res = await updateFarmerOrderStatus(orderId, { status: nextStatus, note });
      if (res && res.success) {
        showNotification(`Order #${res.order?.orderNumber || orderId} transitioned to "${nextStatus.replace(/_/g, ' ')}"`);
        setRejectingId(null);
        setRejectReason('');
        await fetchOrders();
      }
      setUpdatingId(null);
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update order status', 'error');
      setUpdatingId(null);
    }
  };

  // Filter orders by status and search query
  const filteredOrders = orders.filter((order) => {
    const status = order.farmerStatus || order.orderStatus || 'pending';

    if (activeFilter === 'pending' && status !== 'pending') return false;
    if (activeFilter === 'harvesting' && !['accepted', 'preparing'].includes(status)) return false;
    if (activeFilter === 'ready' && status !== 'ready_for_dispatch') return false;
    if (activeFilter === 'dispatched' && status !== 'dispatched') return false;
    if (activeFilter === 'delivered' && status !== 'delivered') return false;
    if (activeFilter === 'rejected' && !['rejected', 'cancelled'].includes(status)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = (order.orderNumber || '').toLowerCase().includes(q);
      const matchCustomer = (order.customerInfo?.name || '').toLowerCase().includes(q);
      const matchPhone = (order.customerInfo?.phone || '').toLowerCase().includes(q);
      const matchDistrict = (order.customerInfo?.district || '').toLowerCase().includes(q);
      return matchNumber || matchCustomer || matchPhone || matchDistrict;
    }

    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pending Action
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/40">
            Order Accepted
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/40 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-300" />
            Harvesting In Progress
          </span>
        );
      case 'ready_for_dispatch':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/40">
            Packaged & Staged
          </span>
        );
      case 'dispatched':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/40 flex items-center gap-1.5">
            <Truck className="w-3 h-3 text-sky-400 animate-bounce" />
            In Transit / Dispatched
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            Delivered & Paid
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/40">
            {status}
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
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold shadow-2xl border transition-all animate-in slide-in-from-bottom-3 duration-200 ${
            notification.type === 'error'
              ? 'bg-rose-600 text-white border-rose-400'
              : 'bg-emerald-500 text-emerald-950 border-emerald-300'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-xs sm:text-sm">{notification.msg}</span>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Real-time Metrics Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Orders */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Received</span>
            <Package className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {metrics.totalOrders}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Across all harvest listings</span>
        </div>

        {/* Pending Orders */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Action</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-900">
            {metrics.pendingOrders}
          </div>
          <span className="text-[10px] text-amber-700/80 mt-1">Requires farm acceptance</span>
        </div>

        {/* In Preparation */}
        <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Harvests</span>
            <Sparkles className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-900">
            {metrics.activeOrders}
          </div>
          <span className="text-[10px] text-teal-700/80 mt-1">Picking & staging orders</span>
        </div>

        {/* Completed Orders */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delivered</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900">
            {metrics.completedOrders}
          </div>
          <span className="text-[10px] text-emerald-700/80 mt-1">Completed fulfillments</span>
        </div>

        {/* Gross Revenue */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Realized Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950">
            ${metrics.totalRevenue.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Verified delivered sales</span>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs scrollbar-none">
          {[
            { id: 'all', label: `All (${orders.length})` },
            { id: 'pending', label: `Pending (${metrics.pendingOrders})` },
            { id: 'harvesting', label: 'Harvesting' },
            { id: 'ready', label: 'Packaged' },
            { id: 'dispatched', label: 'Dispatched' },
            { id: 'delivered', label: `Delivered (${metrics.completedOrders})` },
            { id: 'rejected', label: 'Cancelled/Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-[#0b3b2c] text-white shadow-xs font-extrabold'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs font-semibold'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, customer, phone..."
            className="w-full pl-9 pr-3 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Orders List Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="w-9 h-9 text-emerald-600 animate-spin mb-3" />
          <p className="text-slate-600 font-semibold tracking-wide text-xs">
            Querying active greenhouse fulfillment orders...
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-16 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mx-auto text-3xl">
            📦
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Harvest Orders Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {activeFilter !== 'all'
              ? `No customer orders currently match the "${activeFilter}" filter state.`
              : 'You have not received any orders yet. Ensure your crop listings are marked "active" and well-stocked in the Marketplace!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const status = order.farmerStatus || order.orderStatus || 'pending';
            const isUpdating = updatingId === order._id;

            return (
              <div
                key={order._id}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden transition-all hover:shadow-md shadow-xs text-slate-900"
              >
                {/* Order Summary Bar */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                  className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-all"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 mt-1 sm:mt-0">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono font-bold text-sm text-slate-900 tracking-wide">
                          {order.orderNumber}
                        </span>
                        {getStatusBadge(status)}
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {order.fulfillmentMethod === 'pickup' ? 'Farm Gate Collection' : 'Home Delivery'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-slate-800 font-semibold">
                          <User className="w-3 h-3 text-emerald-600" />
                          {order.customerInfo?.name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {order.customerInfo?.phone}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          {order.customerInfo?.district}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financials & Expand Toggle */}
                  <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Your Farm Subtotal</span>
                      <span className="text-lg font-black text-slate-950">
                        ${order.farmerSubtotal?.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-2 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details and Lifecycle Transition Buttons */}
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 space-y-6 bg-slate-50/50 text-xs">
                    {/* Customer & Delivery Context */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Customer Delivery Instructions
                        </span>
                        <div className="text-slate-700 space-y-1">
                          <div>
                            <strong className="text-slate-900">Full Address:</strong> {order.customerInfo?.address || 'Pickup at Farm Gate'}
                          </div>
                          <div>
                            <strong className="text-slate-900">Contact Phone:</strong> {order.customerInfo?.phone}
                          </div>
                          {order.customerInfo?.notes && (
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] mt-2">
                              💬 Note from buyer: "{order.customerInfo?.notes}"
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Payment & Fulfillment Method
                        </span>
                        <div className="text-slate-700 space-y-1">
                          <div>
                            <strong className="text-slate-900">Fulfillment:</strong>{' '}
                            {order.fulfillmentMethod === 'pickup' ? 'Farm Gate Collection' : 'Direct Eco Delivery'}
                          </div>
                          <div>
                            <strong className="text-slate-900">Payment Mode:</strong>{' '}
                            {order.paymentMethod === 'pay_on_pickup' ? 'Pay on Collection' : 'Cash on Delivery (COD)'}
                          </div>
                          <div>
                            <strong className="text-slate-900">Payment Status:</strong>{' '}
                            <span className="capitalize text-emerald-700 font-bold">{order.paymentStatus || 'Pending'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Crops to Harvest for this Farmer */}
                    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                      <div className="p-3 bg-slate-50 font-bold text-slate-800 text-xs border-b border-slate-200 flex justify-between">
                        <span>Crops Ordered From Your Farm</span>
                        <span>Item Subtotal</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {order.myItems?.map((item, idx) => (
                          <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-sm">🌱</div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate text-xs sm:text-sm">{item.name}</div>
                                <div className="text-[11px] text-emerald-800">
                                  Quantity: <strong className="text-slate-900 font-extrabold">{item.quantity} {item.unit}</strong> × ${Number(item.price).toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <div className="font-extrabold text-slate-950 text-sm shrink-0">
                              ${Number(item.itemTotal || (item.price * item.quantity)).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-900">
                        <span>Total Revenue for Your Farm:</span>
                        <span className="text-slate-950 text-sm font-black">
                          ${order.farmerSubtotal?.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* One-Click Lifecycle Transition Controller */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase font-bold text-slate-500">
                          Order Fulfillment Actions
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Update status step-by-step as you harvest and dispatch
                        </span>
                      </div>

                      {/* State Transitions */}
                      {status === 'pending' && (
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <button
                            onClick={() => handleStatusTransition(order._id, 'accepted', 'Accepted by greenhouse farm')}
                            disabled={isUpdating}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#0b3b2c] hover:bg-[#07291e] disabled:opacity-50 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                          >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                            <span>Accept Order & Confirm Harvest</span>
                          </button>

                          {rejectingId === order._id ? (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason for rejection (e.g. crop damaged)..."
                                className="px-3 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-rose-400 flex-1 sm:w-60"
                              />
                              <button
                                onClick={() => handleStatusTransition(order._id, 'rejected', rejectReason || 'Rejected by farm')}
                                disabled={isUpdating}
                                className="px-3.5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer"
                              >
                                Confirm Reject
                              </button>
                              <button
                                onClick={() => setRejectingId(null)}
                                className="px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs cursor-pointer font-semibold"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setRejectingId(order._id);
                                setRejectReason('');
                              }}
                              disabled={isUpdating}
                              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              <span>Reject Order & Return Stock</span>
                            </button>
                          )}
                        </div>
                      )}

                      {status === 'accepted' && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleStatusTransition(order._id, 'preparing', 'Fresh greenhouse harvesting started')}
                            disabled={isUpdating}
                            className="px-5 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                          >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            <span>Start Fresh Harvesting</span>
                          </button>
                          <span className="text-[11px] text-slate-500">
                            Moves order to "Harvesting In Progress"
                          </span>
                        </div>
                      )}

                      {status === 'preparing' && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleStatusTransition(order._id, 'ready_for_dispatch', 'Crops harvested, washed, and boxed')}
                            disabled={isUpdating}
                            className="px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                          >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                            <span>Mark Packaged & Staged for Dispatch</span>
                          </button>
                          <span className="text-[11px] text-slate-500">
                            Signals quality check complete and ready for driver or pickup
                          </span>
                        </div>
                      )}

                      {status === 'ready_for_dispatch' && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleStatusTransition(order._id, 'dispatched', 'Order handed over to delivery route / courier')}
                            disabled={isUpdating}
                            className="px-5 py-2.5 rounded-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                          >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                            <span>Dispatch / Out for Delivery</span>
                          </button>
                          <span className="text-[11px] text-slate-500">
                            Notifies customer that harvest is on the move
                          </span>
                        </div>
                      )}

                      {status === 'dispatched' && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleStatusTransition(order._id, 'delivered', 'Order safely delivered and payment received')}
                            disabled={isUpdating}
                            className="px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                          >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            <span>Confirm Delivered & Completed</span>
                          </button>
                          <span className="text-[11px] text-emerald-800 font-semibold">
                            Marks order complete and finalizes revenue
                          </span>
                        </div>
                      )}

                      {['delivered', 'rejected', 'cancelled'].includes(status) && (
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>This order lifecycle is finalized ({status}).</span>
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
  );
};

export default FarmerOrdersManager;
