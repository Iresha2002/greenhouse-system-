import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Truck,
  Store,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { calculateCart } from '../../services/api';

export const CartDrawer = ({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' | 'pickup'
  const [validatedCart, setValidatedCart] = useState(null);
  const [calculating, setCalculating] = useState(false);

  // Re-verify and calculate totals with backend
  useEffect(() => {
    if (!isOpen || cartItems.length === 0) {
      setValidatedCart(null);
      return;
    }

    const syncCartWithServer = async () => {
      try {
        setCalculating(true);
        const res = await calculateCart(cartItems, deliveryMethod);
        if (res.success) {
          setValidatedCart(res);
        }
        setCalculating(false);
      } catch (err) {
        console.error('Failed to sync cart with server:', err);
        setCalculating(false);
      }
    };

    syncCartWithServer();
  }, [isOpen, cartItems, deliveryMethod]);

  if (!isOpen) return null;

  const displayItems = validatedCart?.items || cartItems;
  const subtotal = validatedCart?.subtotal ?? cartItems.reduce((acc, it) => acc + ((typeof it.price === 'number' ? it.price : (it.unitPrice || 0)) * (it.quantity || 1)), 0);
  const deliveryFee = deliveryMethod === 'pickup' || subtotal === 0 ? 0 : 2.50;
  const total = Number((subtotal + deliveryFee).toFixed(2));
  const uniqueFarmers = validatedCart?.farmers || [];
  const itemCount = cartItems.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#f6f9f8] animate-in fade-in duration-200 text-slate-900">
      {/* Top Header Bar matching Page 4 */}
      <div className="border-b border-slate-200 bg-white/90 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-black text-sm">
              SG
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">SmartGrow</span>
          </div>

          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
          >
            <span>&larr;</span>
            <span>Continue shopping</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Basket
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {itemCount} {itemCount === 1 ? 'crop selected' : 'crops selected'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-3xl flex items-center justify-center mx-auto mb-4">
              🧺
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Your basket is empty</h3>
            <p className="text-sm text-slate-500 mb-6">
              Fresh greenhouse crops are waiting for you in the marketplace.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#0b3b2c] hover:bg-[#07291e] text-white font-extrabold text-sm transition-all cursor-pointer shadow-xs"
            >
              Explore fresh produce &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Basket Items & Delivery/Pickup */}
            <div className="lg:col-span-7 space-y-6">
              {/* Multi-grower alert if applicable */}
              {uniqueFarmers.length > 1 && (
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs text-slate-700 flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Items from {uniqueFarmers.length} verified growers bundled for dispatch.</span>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3.5">
                {displayItems.map((item) => {
                  const id = item.productId || item.id || item._id;
                  const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : (typeof item.price === 'number' ? item.price : 0);
                  const qty = Number(item.validQuantity || item.quantity || 1);
                  const itemTotal = typeof item.itemTotal === 'number' ? item.itemTotal : (unitPrice * qty);
                  const unitName = item.unit || 'kg';

                  return (
                    <div
                      key={id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Image + Title + Grower Info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">🌱</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                            {item.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            {item.farmerName || 'farmer_john'} &middot; ${unitPrice.toFixed(2)} per {unitName}
                          </p>

                          {/* Stepper matching Page 4: "− 2 kg +" */}
                          <div className="flex items-center gap-2.5 mt-3">
                            <div className="inline-flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-sm font-semibold text-slate-900">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(id, Math.max(1, qty - 1))}
                                disabled={qty <= 1}
                                className="text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer text-base leading-none font-bold"
                                title="Decrease"
                              >
                                &minus;
                              </button>
                              <span className="text-xs font-bold min-w-10 text-center">
                                {qty} {unitName}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(id, qty + 1)}
                                disabled={item.availableStock !== undefined && qty >= item.availableStock}
                                className="text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer text-base leading-none font-bold"
                                title="Increase"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {item.stockWarning && (
                            <p className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              {item.stockWarning}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Total Price & Remove Button */}
                      <div className="flex flex-col items-end justify-between shrink-0 self-stretch py-1">
                        <span className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
                          ${itemTotal.toFixed(2)}
                        </span>
                        <button
                          onClick={() => onRemoveItem(id)}
                          className="text-xs text-slate-400 hover:text-rose-600 font-semibold transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery or pickup selector matching Page 4 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-slate-900">Delivery or pickup?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Eco Delivery Card */}
                  <div
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      deliveryMethod === 'delivery'
                        ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900">Eco Delivery</span>
                      <span className="text-xs font-bold text-emerald-800">$2.50</span>
                    </div>
                    <p className="text-xs text-slate-500">1–2 days</p>
                  </div>

                  {/* Farm Pickup Card */}
                  <div
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      deliveryMethod === 'pickup'
                        ? 'bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900">Farm Pickup</span>
                      <span className="text-xs font-bold text-emerald-800">Free</span>
                    </div>
                    <p className="text-xs text-slate-500">Same day</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Total Card matching Page 4 */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 sticky top-24 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Order total</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Produce subtotal</span>
                    <span className="font-bold text-slate-900">
                      {calculating ? '...' : `$${subtotal.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Delivery charge</span>
                    <span className="font-bold text-slate-900">
                      {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-4 flex justify-between items-baseline">
                    <span className="text-base font-bold text-slate-900">Total</span>
                    <span className="text-3xl font-black text-slate-950">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onProceedToCheckout &&
                    onProceedToCheckout({
                      items: validatedCart?.items || cartItems,
                      subtotal,
                      deliveryFee,
                      total,
                      deliveryMethod,
                      uniqueFarmers,
                    })
                  }
                  className="w-full py-3.5 px-6 rounded-full bg-[#0b3b2c] hover:bg-[#07291e] text-white font-extrabold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to checkout</span>
                  <span>&rarr;</span>
                </button>

                <p className="text-xs text-center text-slate-400 pt-1">
                  Prices are checked on our server before you pay.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;