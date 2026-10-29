import React from 'react';
import {
  CheckCircle,
  Truck,
  Building2,
  MapPin,
  ShoppingBag,
  Receipt,
  ArrowRight,
} from 'lucide-react';

export const SupplyOrderConfirmationModal = ({
  isOpen,
  order,
  onClose,
  onViewOrderHistory,
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
    createdAt,
  } = order;

  const formattedDate = new Date(createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#0e3229] border border-sky-400/35 shadow-2xl text-white max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Celebration Header */}
        <div className="p-6 sm:p-8 text-center border-b border-white/10 relative">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center text-sky-300 shadow-lg shadow-sky-500/30">
            <CheckCircle className="w-9 h-9" />
          </div>

          <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-300 mb-1 inline-block">
            Supply Order Confirmed & Logged in MongoDB
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            Your Agricultural Supplies Order is Confirmed!
          </h2>
          <p className="text-xs text-white/70 max-w-md mx-auto">
            Warehouse stock has been reserved and your order has been routed to the respective verified suppliers.
          </p>

          {/* Order ID Pill */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-sky-400/30 shadow-inner">
            <Receipt className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-white/60">Order ID:</span>
            <span className="text-sm font-mono font-black text-sky-300 tracking-wider">
              {orderNumber}
            </span>
          </div>
          <p className="text-[11px] text-white/50 mt-1.5">Placed on {formattedDate}</p>
        </div>

        {/* Scrollable Summary Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1 text-xs">
          {/* Status & Fulfilment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/45 block">
                Order Status
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-sm font-extrabold text-amber-300 capitalize">
                  {orderStatus || 'Pending'}
                </span>
              </div>
              <span className="text-[11px] text-white/60 block">
                Awaiting supplier warehouse acceptance
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/45 block">
                Fulfilment & Payment
              </span>
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                {fulfillmentMethod === 'pickup' ? (
                  <>
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span>Warehouse Collection</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-sky-400" />
                    <span>Islandwide Agri-Courier</span>
                  </>
                )}
              </div>
              <span className="text-[11px] text-white/60 block">
                {paymentMethod === 'pay_on_pickup'
                  ? 'Pay on Warehouse Collection'
                  : 'Cash on Delivery (COD)'}
              </span>
            </div>
          </div>

          {/* Delivery & Contact Destination */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-300 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              Customer & Delivery Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="text-white/45 block">Customer Name</span>
                <span className="font-bold text-white">{customerInfo?.name}</span>
              </div>
              <div>
                <span className="text-white/45 block">Phone Number</span>
                <span className="font-bold text-white">{customerInfo?.phone}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-white/45 block">Delivery / Collection Address</span>
                <span className="font-semibold text-white">
                  {customerInfo?.address} ({customerInfo?.district} District)
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Supplies Table */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-white/80 font-bold border-b border-white/10 pb-2">
              <span>Ordered Agricultural Supplies ({items.length})</span>
              <span>Subtotal</span>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 text-[11px]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center">
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
                      <div className="font-bold text-white truncate">{item.name}</div>
                      <div className="text-white/55 text-[10px]">
                        {item.quantity} {item.unit} × ${Number(item.price).toFixed(2)} •{' '}
                        Supplier: {item.supplierName}
                      </div>
                    </div>
                  </div>
                  <div className="font-extrabold text-sky-300 shrink-0">
                    ${Number(item.itemTotal || item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-white/75">
              <div className="flex justify-between">
                <span>Supplies Subtotal:</span>
                <span className="text-white font-bold">${Number(subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery / Collection Fee:</span>
                <span className="text-sky-300 font-bold">
                  {Number(deliveryFee) === 0 ? 'FREE' : `$${Number(deliveryFee).toFixed(2)}`}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-extrabold text-white">
                <span>Total Payable:</span>
                <span className="text-sky-300 text-lg">${Number(total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-end gap-3 bg-white/[0.02] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/15"
          >
            <ShoppingBag className="w-4 h-4 text-sky-400" />
            <span>Continue Shopping</span>
          </button>

          {onViewOrderHistory && (
            <button
              type="button"
              onClick={onViewOrderHistory}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              <span>View My Supply Orders</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplyOrderConfirmationModal;
