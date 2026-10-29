import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Phone,
  User,
  Truck,
  Building2,
  Banknote,
  AlertCircle,
  Loader2,
  Check,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

const SRI_LANKA_DISTRICTS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
  'Jaffna',
  'Batticaloa',
  'Trincomalee',
];

export const SupplyCheckoutModal = ({
  isOpen,
  onClose,
  cartItems = [],
  initialFulfillmentMethod = 'delivery',
  validatedCart = null,
  currentUser = null,
  onPlaceSupplyOrder,
}) => {
  const [fulfillmentMethod, setFulfillmentMethod] = useState(initialFulfillmentMethod);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    district: 'Colombo',
    email: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setFulfillmentMethod(initialFulfillmentMethod || 'delivery');
  }, [initialFulfillmentMethod, isOpen]);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.username || prev.name,
        phone: currentUser.phoneNumber || prev.phone,
        address: currentUser.location || prev.address,
        email: currentUser.email || prev.email,
      }));
    }
  }, [currentUser, isOpen]);

  useEffect(() => {
    if (fulfillmentMethod === 'pickup') {
      setPaymentMethod('pay_on_pickup');
    } else {
      setPaymentMethod('cod');
    }
  }, [fulfillmentMethod]);

  if (!isOpen) return null;

  const displayItems = validatedCart?.items || cartItems;
  const subtotal =
    validatedCart?.subtotal ??
    cartItems.reduce(
      (acc, it) =>
        acc +
        (typeof it.unitPrice === 'number' ? it.unitPrice : Number(it.price) || 0) *
          (it.cartQuantity || it.quantity || 1),
      0
    );
  const deliveryFee = fulfillmentMethod === 'pickup' || subtotal === 0 ? 0 : 3.50;
  const finalTotal = Number((subtotal + deliveryFee).toFixed(2));
  const uniqueSuppliers = validatedCart?.suppliers || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate submission
    setErrorMessage('');

    if (!formData.name.trim()) {
      return setErrorMessage('Please enter your full name or farm/company name.');
    }

    const cleanPhone = formData.phone.replace(/[\s\-()]/g, '');
    if (!/^\+?[0-9]{9,15}$/.test(cleanPhone)) {
      return setErrorMessage('Please enter a valid contact phone number (9 to 15 digits).');
    }

    if (fulfillmentMethod === 'delivery' && !formData.address.trim()) {
      return setErrorMessage('Please enter your complete delivery address for courier dispatch.');
    }

    if (!formData.district) {
      return setErrorMessage('Please select your district / delivery area.');
    }

    if (displayItems.length === 0) {
      return setErrorMessage('Your Supplies Basket is empty.');
    }

    const orderPayload = {
      customerInfo: {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address:
          fulfillmentMethod === 'delivery'
            ? formData.address.trim()
            : 'Supplier Warehouse Self-Collection',
        district: formData.district,
        email: formData.email.trim(),
        notes: formData.notes.trim(),
      },
      fulfillmentMethod,
      paymentMethod: fulfillmentMethod === 'pickup' ? 'pay_on_pickup' : 'cod',
      subtotal,
      deliveryFee,
      total: finalTotal,
      items: displayItems.map((item) => ({
        supplyId: item.supplyId || item.productId || item._id,
        name: item.name,
        category: item.category,
        brand: item.brand || '',
        model: item.model || '',
        unit: item.unit || 'piece',
        unitPrice:
          typeof item.unitPrice === 'number' ? item.unitPrice : Number(item.price) || 0,
        quantity: Number(item.validQuantity || item.cartQuantity || item.quantity || 1),
        supplierId: item.supplierId || item.supplier || '',
        supplierName: item.supplierName || 'Authorized Agri Supplier',
        location: item.location || '',
        image:
          item.image ||
          (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : ''),
      })),
    };

    try {
      setIsSubmitting(true);
      await onPlaceSupplyOrder(orderPayload);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error || err.message || 'Failed to submit supply order.'
      );
    } finally {
      setIsSubmitting(false);
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
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Agricultural Supplies Checkout
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Verified B2B & Farmer Fulfilment
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Server-validated unit pricing and direct supplier dispatch
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Fulfilment, Customer Info & Payment Method */}
            <div className="lg:col-span-7 space-y-5">
              {/* 1. Delivery or Collection Method */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <span className="text-xs font-extrabold text-sky-300 uppercase tracking-wider block">
                  1. Delivery or Warehouse Collection Method
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod('delivery')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      fulfillmentMethod === 'delivery'
                        ? 'bg-sky-500/20 border-sky-400 text-white shadow-md'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Truck className="w-4 h-4 text-sky-400" />
                      {fulfillmentMethod === 'delivery' && (
                        <Check className="w-3.5 h-3.5 text-sky-300" />
                      )}
                    </div>
                    <div className="text-xs font-bold">Islandwide Agri-Courier</div>
                    <div className="text-[11px] text-white/60">$3.50 flat rate • 1-3 Days</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillmentMethod('pickup')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      fulfillmentMethod === 'pickup'
                        ? 'bg-sky-500/20 border-sky-400 text-white shadow-md'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                      {fulfillmentMethod === 'pickup' && (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      )}
                    </div>
                    <div className="text-xs font-bold">Supplier Warehouse Pickup</div>
                    <div className="text-[11px] text-emerald-300 font-bold">FREE ($0.00)</div>
                  </button>
                </div>
              </div>

              {/* 2. Customer & Delivery Details */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
                <span className="text-xs font-extrabold text-sky-300 uppercase tracking-wider block">
                  2. Customer & Delivery Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/75 mb-1">
                      Customer / Farm Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Farmer John / Matara Greenhouse"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/75 mb-1">
                      Contact Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g., 0771234567"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/75 mb-1">
                      District / Delivery Area *
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-sky-400"
                    >
                      {SRI_LANKA_DISTRICTS.map((d) => (
                        <option key={d} value={d} className="bg-slate-900 text-white">
                          {d} District
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/75 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="farmer@smartgrow.lk"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  {fulfillmentMethod === 'delivery' && (
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-white/75 mb-1">
                        Full Delivery Address *
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-white/40 absolute left-3 top-3" />
                        <textarea
                          rows="2"
                          required
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Greenhouse Bay road, street number, landmark..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-sky-400"
                        />
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-white/75 mb-1">
                      Special Fulfilment or Technical Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g., Include RS485 wiring pinout sheet / Call before delivery"
                      className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Payment Method (Section 4.5: Honest Payment Options) */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <span className="text-xs font-extrabold text-sky-300 uppercase tracking-wider block">
                  3. Payment Method
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fulfillmentMethod === 'delivery' ? (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/50 flex items-center gap-3">
                      <Banknote className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-extrabold text-white">Cash on Delivery (COD)</p>
                        <p className="text-[11px] text-white/65">
                          Pay cash upon inspecting supplies at your greenhouse
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-400/50 flex items-center gap-3">
                      <Banknote className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-extrabold text-white">
                          Pay on Warehouse Collection
                        </p>
                        <p className="text-[11px] text-white/65">
                          Pay directly at the supplier dispatch counter
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Online Payment Gateway Placeholder (Honest Disabled State) */}
                  <div
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/10 opacity-55 flex items-center gap-3 cursor-not-allowed"
                    title="Online payment gateway integration planned for future release"
                  >
                    <CreditCard className="w-5 h-5 text-white/40 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white/60">
                        Online Card / LANKAQR Gateway
                      </p>
                      <p className="text-[10px] text-amber-300/80 font-semibold">
                        Gateway Not Integrated Yet
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Order Summary & Submit */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div className="p-5 rounded-2xl bg-black/35 border border-white/15 space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-sky-300">
                  Order Summary ({displayItems.length} Items)
                </h3>

                {/* Multi-supplier breakdown badge */}
                {uniqueSuppliers.length > 0 && (
                  <div className="text-[11px] text-white/70 bg-white/[0.05] p-2.5 rounded-xl border border-white/10">
                    <span className="font-bold text-white block mb-0.5">
                      Fulfilled by {uniqueSuppliers.length} Supplier
                      {uniqueSuppliers.length > 1 ? 's' : ''}:
                    </span>
                    {uniqueSuppliers.map((s) => s.supplierName).join(' • ')}
                  </div>
                )}

                <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1 divide-y divide-white/10">
                  {displayItems.map((item) => {
                    const id = item.supplyId || item.productId || item._id;
                    const unitPrice =
                      typeof item.unitPrice === 'number'
                        ? item.unitPrice
                        : Number(item.price) || 0;
                    const qty = Number(
                      item.validQuantity || item.cartQuantity || item.quantity || 1
                    );
                    return (
                      <div key={id} className="pt-2.5 first:pt-0 flex justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{item.name}</p>
                          <p className="text-[11px] text-white/55">
                            {qty} × ${unitPrice.toFixed(2)} ({item.supplierName})
                          </p>
                        </div>
                        <span className="font-extrabold text-sky-300 shrink-0">
                          ${(unitPrice * qty).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-white/15 space-y-2 text-xs">
                  <div className="flex justify-between text-white/75">
                    <span>Supplies Subtotal</span>
                    <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/75">
                    <span>
                      {fulfillmentMethod === 'pickup'
                        ? 'Warehouse Pickup'
                        : 'Islandwide Courier Fee'}
                    </span>
                    <span className="font-bold text-sky-300">
                      {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/15 flex justify-between items-baseline text-base font-extrabold text-white">
                    <span>Total Payable</span>
                    <span className="text-2xl text-sky-300">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-sky-500/25 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Supply Order...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Place Supply Order (${finalTotal.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplyCheckoutModal;
