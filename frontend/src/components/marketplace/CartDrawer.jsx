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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071f19]/95 backdrop-blur-xl animate-in fade-in duration-200 text-white">
      {/* Top Header Bar matching Page 4 */}
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
            <span>Continue shopping</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Your produce basket
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {itemCount} {itemCount === 1 ? 'crop selected' : 'crops selected'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-2xl p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-white/10 text-3xl flex items-center justify-center mx-auto mb-4">
              🧺
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Your basket is empty</h3>
            <p className="text-sm text-white/60 mb-6">
              Fresh greenhouse crops are waiting for you in the marketplace.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-bold text-sm transition-all cursor-pointer shadow-lg"
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
                <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-[#4de1b7]/30 text-xs text-[#4de1b7] flex items-center gap-2.5">
                  <Store className="w-4 h-4 shrink-0" />
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
                      className="bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:border-white/25"
                    >
                      {/* Image + Title + Grower Info */}
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-black/30 border border-white/10 shrink-0 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">🌱</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                            {item.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                            {item.farmerName || 'farmer_john'} &middot; ${unitPrice.toFixed(2)} per {unitName}
                          </p>

                          {/* Stepper matching Page 4: "− 2 kg +" */}
                          <div className="flex items-center gap-2.5 mt-3">
                            <div className="inline-flex items-center gap-3 bg-white/[0.08] border border-white/15 rounded-lg px-2.5 py-1 text-sm font-semibold text-white">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(id, Math.max(1, qty - 1))}
                                disabled={qty <= 1}
                                className="text-white/60 hover:text-white disabled:opacity-30 cursor-pointer text-base leading-none"
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
                                className="text-white/60 hover:text-white disabled:opacity-30 cursor-pointer text-base leading-none"
                                title="Increase"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {item.stockWarning && (
                            <p className="text-[11px] text-amber-300 font-medium mt-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              {item.stockWarning}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Total Price & Remove Button */}
                      <div className="flex flex-col items-end justify-between shrink-0 self-stretch py-1">
                        <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          ${itemTotal.toFixed(2)}
                        </span>
                        <button
                          onClick={() => onRemoveItem(id)}
                          className="text-xs text-white/50 hover:text-rose-300 transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery or pickup selector matching Page 4 */}
              <div className="bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-2xl p-5 sm:p-6 space-y-4">
                <h3 className="text-base font-bold text-white">Delivery or pickup?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Eco Delivery Card */}
                  <div
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      deliveryMethod === 'delivery'
                        ? 'bg-white/[0.12] border-[#4de1b7] ring-1 ring-[#4de1b7]'
                        : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">Eco Delivery</span>
                      <span className="text-xs font-bold text-[#4de1b7]">$2.50</span>
                    </div>
                    <p className="text-xs text-white/60">1–2 days</p>
                  </div>

                  {/* Farm Pickup Card */}
                  <div
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      deliveryMethod === 'pickup'
                        ? 'bg-white/[0.12] border-[#4de1b7] ring-1 ring-[#4de1b7]'
                        : 'bg-white/[0.04] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">Farm Pickup</span>
                      <span className="text-xs font-bold text-[#4de1b7]">Free</span>
                    </div>
                    <p className="text-xs text-white/60">Same day</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Total Card matching Page 4 */}
            <div className="lg:col-span-5">
              <div className="bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-2xl p-6 sm:p-7 space-y-5 sticky top-24">
                <h3 className="text-lg font-bold text-white tracking-tight">Order total</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Produce subtotal</span>
                    <span className="font-semibold text-white">
                      {calculating ? '...' : `$${subtotal.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-white/70">
                    <span>Delivery charge</span>
                    <span className="font-semibold text-white">
                      {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="border-t border-white/15 pt-4 flex justify-between items-baseline">
                    <span className="text-base font-bold text-white">Total</span>
                    <span className="text-3xl font-extrabold text-[#4de1b7]">
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
                  className="w-full py-3.5 px-6 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-extrabold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:shadow-[#4de1b7]/25 hover:shadow-xl"
                >
                  <span>Proceed to checkout</span>
                  <span>&rarr;</span>
                </button>

                <p className="text-xs text-center text-white/50 pt-1">
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