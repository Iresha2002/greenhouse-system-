import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Phone,
  User,
  Truck,
  Store,
  CreditCard,
  Banknote,
  AlertCircle,
  Loader2,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const SRI_LANKA_DISTRICTS = [
  'Matara',
  'Galle',
  'Hambantota',
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Nuwara Eliya',
  'Matale',
  'Badulla',
  'Kurunegala',
  'Anuradhapura',
  'Ratnapura'
];

const CheckoutModal = ({
  isOpen,
  onClose,
  cartItems = [],
  fulfillmentMethod = 'delivery',
  onChangeFulfillmentMethod,
  cartCalculation = null,
  currentUser = null,
  onOrderSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    district: 'Matara',
    email: '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill user information if user is logged in
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.username || prev.name,
        phone: currentUser.phoneNumber || prev.phone,
        address: currentUser.location || prev.address,
        email: currentUser.email || prev.email,
        district: prev.district || 'Matara'
      }));
    }
  }, [currentUser, isOpen]);

  // Sync payment method with fulfillment
  useEffect(() => {
    if (fulfillmentMethod === 'pickup') {
      setPaymentMethod('pay_on_pickup');
    } else {
      setPaymentMethod('cod');
    }
  }, [fulfillmentMethod]);

  if (!isOpen) return null;

  const subtotal = cartCalculation?.subtotal ?? cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = fulfillmentMethod === 'delivery' ? 2.50 : 0.00;
  const finalTotal = subtotal + deliveryFee;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Form validation
    if (!formData.name.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setErrorMessage('Please enter a valid contact phone number');
      return;
    }

    if (fulfillmentMethod === 'delivery' && !formData.address.trim()) {
      setErrorMessage('Please enter a delivery destination address');
      return;
    }

    if (!formData.district) {
      setErrorMessage('Please select your delivery district');
      return;
    }

    if (cartItems.length === 0) {
      setErrorMessage('Your shopping basket is empty');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        customerInfo: {
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: fulfillmentMethod === 'delivery' ? formData.address.trim() : 'Farm Gate Pickup',
          district: formData.district,
          email: formData.email.trim(),
          notes: formData.notes.trim()
        },
        fulfillmentMethod,
        paymentMethod: fulfillmentMethod === 'pickup' ? 'pay_on_pickup' : 'cod',
        items: cartItems.map((item) => ({
          productId: item.productId || item.id || item._id,
          quantity: item.quantity
        }))
      };

      await onOrderSuccess(orderPayload);
    } catch (err) {
      console.error('Failed to place order:', err);
      const backendError = err.response?.data?.error || err.message || 'Failed to submit order. Please try again.';
      setErrorMessage(backendError);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-[#0f3824] border border-white/20 shadow-2xl text-white max-h-[92vh] flex flex-col">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Order Checkout
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Secure Direct-from-Farm
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Direct harvest dispatch with zero middleman price markups
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3 animate-in shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Customer & Delivery Details */}
            <div className="lg:col-span-7 space-y-5">
              {/* Fulfillment Method Selector */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider block">
                  1. Fulfillment Choice
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onChangeFulfillmentMethod && onChangeFulfillmentMethod('delivery')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      fulfillmentMethod === 'delivery'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Truck className="w-4 h-4 text-emerald-400" />
                      {fulfillmentMethod === 'delivery' && (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold">Eco Delivery</div>
                      <div className="text-[11px] text-white/60">Doorstep drop ($2.50 flat)</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChangeFulfillmentMethod && onChangeFulfillmentMethod('pickup')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      fulfillmentMethod === 'pickup'
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Store className="w-4 h-4 text-emerald-400" />
                      {fulfillmentMethod === 'pickup' && (
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold">Farm Gate Pickup</div>
                      <div className="text-[11px] text-emerald-300 font-bold">FREE ($0.00)</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recipient Details Form */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider block">
                  2. Recipient Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Kasun Perera"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-emerald-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1">
                      Contact Phone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 077 123 4567"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-emerald-400"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1">
                      District / Region *
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#0b2b1c] border border-white/20 text-white text-xs focus:outline-none focus:border-emerald-400"
                    >
                      {SRI_LANKA_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist} className="bg-[#0b2b1c] text-white">
                          {dist} District
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. customer@example.com"
                      className="w-full px-3 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                {fulfillmentMethod === 'delivery' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1">
                      Delivery Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/40" />
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="House / Bay / Street Address, landmarks..."
                        rows={2}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-emerald-400 resize-none"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-1">
                    Farmer Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Leave with gate security, harvest fresh morning only"
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                <span className="text-xs font-bold text-white/80 uppercase tracking-wider block">
                  3. Payment Method
                </span>

                <div className="space-y-2">
                  {/* Supported Cash Option */}
                  <label className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-emerald-400/30 cursor-pointer hover:bg-white/[0.06] transition-all">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === (fulfillmentMethod === 'pickup' ? 'pay_on_pickup' : 'cod')}
                        onChange={() => setPaymentMethod(fulfillmentMethod === 'pickup' ? 'pay_on_pickup' : 'cod')}
                        className="text-emerald-500 focus:ring-emerald-400"
                      />
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="text-xs font-bold text-white">
                            {fulfillmentMethod === 'pickup' ? 'Pay on Collection at Farm' : 'Cash on Delivery (COD)'}
                          </div>
                          <div className="text-[11px] text-white/60">
                            Pay in cash directly upon receipt of fresh produce
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      Zero Surcharge
                    </span>
                  </label>

                  {/* Unavailable Online Card Option - Clearly Marked Disabled */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        disabled
                        className="opacity-40"
                      />
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-white/40" />
                        <div>
                          <div className="text-xs font-semibold text-white/60">
                            Online Credit / Debit Card (Visa, Mastercard, PayHere)
                          </div>
                          <div className="text-[11px] text-amber-300/80">
                            Direct gateway integration currently in sandbox testing
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      Unavailable
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary & Placement */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                    Order Items ({cartItems.length})
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    {cartCalculation?.farmers?.length || 1} Farmer Producer(s)
                  </span>
                </div>

                {/* Item List */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.productId || item.id || item._id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/30 border border-white/10 shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-base">🌱</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white truncate text-[11px]">{item.name}</h4>
                          <div className="text-[10px] text-emerald-300/80 truncate">
                            {item.farmerName} • {item.quantity} {item.unit}
                          </div>
                        </div>
                      </div>
                      <div className="font-extrabold text-white text-xs shrink-0">
                        ${((item.price || item.unitPrice) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Breakdown */}
                <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-white/70">
                    <span>Produce Subtotal:</span>
                    <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/70">
                    <span>Fulfillment ({fulfillmentMethod === 'delivery' ? 'Home Delivery' : 'Farm Pickup'}):</span>
                    <span className="font-bold text-emerald-300">
                      {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-white/15 flex items-center justify-between text-sm font-extrabold text-white">
                    <span>Total Amount Due:</span>
                    <span className="text-xl text-emerald-300">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-[11px] text-emerald-300/90 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                  <span>
                    Your payment will be collected in person upon verified delivery/pickup of fresh produce.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || cartItems.length === 0}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/30 text-emerald-950 font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:scale-101"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Securing Harvest & Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Place Order • ${finalTotal.toFixed(2)}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-all cursor-pointer text-center"
                >
                  Back to Shopping Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
