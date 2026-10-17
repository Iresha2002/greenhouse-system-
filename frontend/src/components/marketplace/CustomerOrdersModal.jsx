import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
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
  ExternalLink
} from 'lucide-react';
import { getMyOrders, cancelOrder } from '../../services/api';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', desc: 'Received by greenhouse' },
  { key: 'accepted', label: 'Accepted', desc: 'Confirmed by grower' },
  { key: 'preparing', label: 'Harvesting', desc: 'Fresh crop picking' },
  { key: 'ready_for_dispatch', label: 'Packaged', desc: 'Quality checked' },
  { key: 'dispatched', label: 'In Transit', desc: 'On delivery route' },
  { key: 'delivered', label: 'Delivered', desc: 'Received by customer' }
];

export const CustomerOrdersModal = ({
  isOpen,
  onClose,
  currentUser = null,
  onBrowseProduce
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

  // Filter orders by active status tab
  const filteredOrders = orders.filter((order) => {
    const status = order.orderStatus || 'pending';
    if (activeTab === 'active') {
      return ['pending', 'accepted', 'preparing', 'ready_for_dispatch', 'dispatched'].includes(status);
    }
    if (activeTab === 'completed') {
      return status === 'delivered';
    }
    if (activeTab === 'cancelled') {
      return ['cancelled', 'rejected'].includes(status);
    }
    return true; // 'all'
  });

  const handleCancelOrderSubmit = async (orderId) => {
    try {
      setIsSubmittingCancel(true);
      setActionError('');
      const res = await cancelOrder(orderId, cancelReason || 'Cancelled by customer');
      if (res && res.success) {
        setActionSuccess('Order cancelled successfully. Crop inventory has been restored.');
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
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Pending Grower Prep
          </span>
        );
      case 'accepted':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
            Accepted by Farm
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-400/30">
            Fresh Harvesting
          </span>
        );
      case 'ready_for_dispatch':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
            Packaged & Ready
          </span>
        );
      case 'dispatched':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1.5">
            <Truck className="w-3 h-3 text-sky-400 animate-bounce" />
            Dispatched In Transit
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
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30">
            Cancelled
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

  const getStepIndex = (status) => {
    return STATUS_STEPS.findIndex((s) => s.key === status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-[#0f3824] border border-white/20 shadow-2xl text-white max-h-[92vh] flex flex-col">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                My Crop Orders & Tracking
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  {orders.length} Total
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Track harvest dispatch, view seller information, and inspect fulfillment milestones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification Banners */}
        {actionSuccess && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Search & Tabs Filter Bar */}
        <div className="p-6 pb-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-emerald-500 text-emerald-950 shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                All ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'active'
                    ? 'bg-amber-500 text-amber-950 shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                In Progress ({orders.filter((o) => ['pending', 'accepted', 'preparing', 'ready_for_dispatch', 'dispatched'].includes(o.orderStatus)).length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'completed'
                    ? 'bg-emerald-500 text-emerald-950 shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Delivered ({orders.filter((o) => o.orderStatus === 'delivered').length})
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'cancelled'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Cancelled ({orders.filter((o) => ['cancelled', 'rejected'].includes(o.orderStatus)).length})
              </button>
            </div>

            {/* Phone Lookup for Guest or Switch account */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-52">
                <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-white/40" />
                <input
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
                  placeholder="Lookup phone number..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <button
                onClick={fetchOrders}
                className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 transition-all cursor-pointer"
                title="Search Orders"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Orders Scrollable List */}
        <div className="overflow-y-auto p-6 space-y-4 flex-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-xs text-white/70">Retrieving crop harvest orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white/[0.02] border border-white/10 p-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center text-3xl">
                🌾
              </div>
              <h3 className="text-lg font-bold text-white">No Orders Found</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto">
                {activeTab !== 'all'
                  ? `No orders matching filter "${activeTab}". Try checking "All Orders" or search with your contact number.`
                  : 'You have not placed any crop orders yet. Explore fresh greenhouse harvests in our marketplace!'}
              </p>
              {onBrowseProduce && (
                <button
                  onClick={() => {
                    onClose();
                    onBrowseProduce();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-emerald-950 font-extrabold text-xs hover:bg-emerald-400 transition-all cursor-pointer shadow-lg inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Explore Fresh Produce
                </button>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              const currentStepIdx = getStepIndex(order.orderStatus);
              const isCancelled = ['cancelled', 'rejected'].includes(order.orderStatus);

              return (
                <div
                  key={order._id}
                  className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden transition-all hover:border-white/20 shadow-lg"
                >
                  {/* Card Header Bar */}
                  <div
                    onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-white tracking-wide truncate">
                            {order.orderNumber}
                          </span>
                          {getStatusBadge(order.orderStatus)}
                        </div>
                        <div className="text-[11px] text-white/50 flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span>•</span>
                          <span>{order.items?.length || 0} produce item(s)</span>
                          <span>•</span>
                          <span className="capitalize">{order.fulfillmentMethod === 'pickup' ? 'Farm Pickup' : 'Eco Delivery'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      <div className="text-right">
                        <div className="text-xs text-white/50">Total Amount</div>
                        <div className="text-base font-extrabold text-emerald-300">
                          ${order.total?.toFixed(2)}
                        </div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/10 text-white/70">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Card Expanded Details */}
                  {isExpanded && (
                    <div className="p-5 border-t border-white/10 space-y-6 bg-black/20 text-xs">
                      {/* Visual Timeline Stepper (if not cancelled) */}
                      {!isCancelled ? (
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                          <span className="text-[10px] uppercase font-bold text-white/50 block mb-3">
                            Fulfillment Journey & Milestones
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-1">
                            {STATUS_STEPS.map((step, idx) => {
                              const isCompleted = currentStepIdx >= idx;
                              const isCurrent = currentStepIdx === idx;
                              return (
                                <div key={step.key} className="flex flex-col items-center text-center p-2 rounded-lg relative">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                                      isCurrent
                                        ? 'bg-emerald-400 text-emerald-950 ring-4 ring-emerald-400/30 font-black'
                                        : isCompleted
                                        ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                                        : 'bg-white/5 text-white/30 border border-white/10'
                                    }`}
                                  >
                                    {isCompleted ? '✓' : idx + 1}
                                  </div>
                                  <div className={`text-[11px] font-bold ${isCurrent ? 'text-emerald-300' : isCompleted ? 'text-white' : 'text-white/40'}`}>
                                    {step.label}
                                  </div>
                                  <div className="text-[9px] text-white/40 hidden sm:block">
                                    {step.desc}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>This order was cancelled. Reserved inventory has been automatically restored to the marketplace.</span>
                        </div>
                      )}

                      {/* Recipient & Fulfillment Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-white/50 block">Recipient Information</span>
                          <div className="space-y-1 text-white/80">
                            <div><strong className="text-white">Name:</strong> {order.customerInfo?.name}</div>
                            <div><strong className="text-white">Phone:</strong> {order.customerInfo?.phone}</div>
                            <div><strong className="text-white">District:</strong> {order.customerInfo?.district}</div>
                            {order.customerInfo?.address && (
                              <div><strong className="text-white">Address:</strong> {order.customerInfo?.address}</div>
                            )}
                            {order.customerInfo?.notes && (
                              <div className="text-[11px] text-amber-300/80 italic">"{order.customerInfo?.notes}"</div>
                            )}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
                          <span className="text-[10px] uppercase font-bold text-white/50 block">Payment & Method</span>
                          <div className="space-y-1 text-white/80">
                            <div>
                              <strong className="text-white">Payment:</strong>{' '}
                              {order.paymentMethod === 'pay_on_pickup' ? 'Pay on Collection' : 'Cash on Delivery (COD)'}
                            </div>
                            <div>
                              <strong className="text-white">Payment Status:</strong>{' '}
                              <span className="capitalize">{order.paymentStatus || 'Pending'}</span>
                            </div>
                            <div>
                              <strong className="text-white">Fulfillment:</strong>{' '}
                              {order.fulfillmentMethod === 'pickup' ? 'Farm Gate Collection (Free)' : 'Eco Doorstep Delivery ($2.50)'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Itemized Crop Table */}
                      <div className="rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-3 bg-white/[0.03] font-bold text-white/80 text-[11px] border-b border-white/10 flex justify-between">
                          <span>Harvested Produce Items</span>
                          <span>Item Total</span>
                        </div>
                        <div className="divide-y divide-white/5">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-black/40 overflow-hidden border border-white/10 shrink-0">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs">🌿</div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-white truncate">{item.name}</div>
                                  <div className="text-[10px] text-emerald-300/80">
                                    {item.quantity} {item.unit} × ${Number(item.price).toFixed(2)} • Grower: {item.farmerName} ({item.farmLocation || 'Farm Bay'})
                                  </div>
                                </div>
                              </div>
                              <div className="font-extrabold text-white shrink-0">
                                ${Number(item.itemTotal || (item.price * item.quantity)).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-white/[0.02] border-t border-white/10 space-y-1 text-[11px] text-white/70">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span className="text-white">${order.subtotal?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fulfillment Fee:</span>
                            <span className="text-emerald-300">
                              {order.deliveryFee === 0 ? 'FREE' : `$${order.deliveryFee?.toFixed(2)}`}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-white/10 flex justify-between text-xs font-extrabold text-white">
                            <span>Final Total:</span>
                            <span className="text-emerald-300 text-sm">${order.total?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Actions: Customer Cancellation (Only if Pending) */}
                      {order.orderStatus === 'pending' && (
                        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <p className="text-[11px] text-white/50">
                            Need to change your harvest request? You can cancel while the order is pending.
                          </p>

                          {cancellingOrderId === order._id ? (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <input
                                type="text"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Reason for cancellation..."
                                className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-rose-400 flex-1 sm:w-48"
                              />
                              <button
                                onClick={() => handleCancelOrderSubmit(order._id)}
                                disabled={isSubmittingCancel}
                                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                {isSubmittingCancel ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Cancel'}
                              </button>
                              <button
                                onClick={() => setCancellingOrderId(null)}
                                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer"
                              >
                                Back
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setCancellingOrderId(order._id);
                                setCancelReason('');
                              }}
                              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Cancel Order & Return Stock
                            </button>
                          )}
                        </div>
                      )}
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

export default CustomerOrdersModal;
