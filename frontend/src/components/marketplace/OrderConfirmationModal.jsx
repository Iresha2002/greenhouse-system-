import React from 'react';
import {
  CheckCircle,
  Truck,
  Store,
  Calendar,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Receipt
} from 'lucide-react';

const OrderConfirmationModal = ({
  isOpen,
  order,
  onClose,
  onViewMyOrders
}) => {
  if (!isOpen || !order) return null;

  const {
    orderNumber,
    customerInfo,
    items = [],
    subtotal,
    deliveryFee,
    total,
    fulfillmentMethod,
    paymentMethod,
    orderStatus,
    createdAt
  } = order;

  const formattedDate = new Date(createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#0f3824] border border-emerald-400/30 shadow-2xl text-white max-h-[92vh] flex flex-col">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#34a86b]/15 blur-3xl pointer-events-none" />

        {/* Header / Celebration Banner */}
        <div className="p-6 sm:p-8 text-center border-b border-white/10 relative">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-lg shadow-emerald-500/30 animate-in zoom-in-75 duration-300">
            <CheckCircle className="w-9 h-9" />
          </div>

          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 mb-1 inline-block">
            Order Confirmed & Logged
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Thank You for Supporting Local Farms!
          </h2>
          <p className="text-xs text-white/70 max-w-md mx-auto">
            Your fresh crop order has been successfully sent to the respective greenhouse growers.
          </p>

          {/* Tracking ID Badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-emerald-400/30 shadow-inner">
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-white/60">Tracking ID:</span>
            <span className="text-sm font-mono font-black text-emerald-300 tracking-wider">
              {orderNumber}
            </span>
          </div>
        </div>

        {/* Scrollable Summary Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          {/* Status & Method Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/40 block">Order Status</span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm font-extrabold text-amber-300 capitalize">
                  {orderStatus || 'Pending'}
                </span>
              </div>
              <span className="text-[11px] text-white/60 block">Awaiting grower dispatch prep</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/40 block">Fulfillment Method</span>
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                {fulfillmentMethod === 'pickup' ? (
                  <>
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span>Farm Gate Collection</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>Eco Doorstep Delivery</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-white/60 block">
                {paymentMethod === 'pay_on_pickup' ? 'Pay upon collection' : 'Cash on Delivery (COD)'}
              </span>
            </div>
          </div>

          {/* Delivery & Recipient Information */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Delivery & Contact Destination
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-white/80 text-[11px]">
              <div>
                <span className="text-white/40 block">Customer Name</span>
                <span className="font-bold text-white">{customerInfo?.name}</span>
              </div>
              <div>
                <span className="text-white/40 block">Phone Contact</span>
                <span className="font-bold text-white">{customerInfo?.phone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-white/40 block">Destination</span>
                <span className="font-semibold text-white">
                  {customerInfo?.address} ({customerInfo?.district} District)
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Crops Matrix */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-white/80 font-bold border-b border-white/10 pb-2">
              <span>Harvested Crop Items ({items.length})</span>
              <span>Subtotal</span>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">🌿</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{item.name}</div>
                      <div className="text-white/50 text-[10px]">
                        {item.quantity} {item.unit} × ${Number(item.price).toFixed(2)} • Grower: {item.farmerName}
                      </div>
                    </div>
                  </div>
                  <div className="font-extrabold text-white shrink-0">
                    ${Number(item.itemTotal || (item.price * item.quantity)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-white/70">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-white">${Number(subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fulfillment Fee:</span>
                <span className="text-emerald-300">
                  {Number(deliveryFee) === 0 ? 'FREE' : `$${Number(deliveryFee).toFixed(2)}`}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-extrabold text-white">
                <span>Total Amount:</span>
                <span className="text-emerald-300 text-lg">${Number(total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3 bg-white/[0.02] shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/15"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            Continue Shopping
          </button>

          {onViewMyOrders && (
            <button
              onClick={onViewMyOrders}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <span>View Order Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;
