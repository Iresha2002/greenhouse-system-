import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  Truck,
  Store,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  RefreshCw,
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

  // Re-verify and calculate totals with the backend on item/method changes
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-[#0e3522] border-l border-white/20 shadow-2xl flex flex-col text-white">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Your Produce Basket</h2>
                <span className="text-xs text-white/50">
                  {cartItems.length} {cartItems.length === 1 ? 'crop item' : 'crop items'} selected
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15"
              title="Close cart"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 text-white/30 flex items-center justify-center text-3xl mb-4">
                  🧺
                </div>
                <h3 className="text-base font-bold text-white mb-1">Your Basket is Empty</h3>
                <p className="text-xs text-white/50 max-w-xs mb-6">
                  Discover fresh organic vegetables, fruits, and hydroponic greens harvested daily by local growers.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs transition-all cursor-pointer shadow-lg"
                >
                  Explore Marketplace
                </button>
              </div>
            ) : (
              <>
                {/* Multi-Farmer Notice if items from >1 grower */}
                {uniqueFarmers.length > 1 && (
                  <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-400/30 text-xs text-emerald-200 flex items-start gap-2.5 shadow-md">
                    <Store className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Multi-Grower Harvest Order</span>
                      <span className="text-[11px] text-white/70">
                        Items from {uniqueFarmers.length} verified growers will be freshly bundled and dispatched together.
                      </span>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-3">
                  {displayItems.map((item) => {
                    const id = item.productId || item.id || item._id;
                    const isOutOfStock = item.availableStock !== undefined && item.availableStock <= 0;
                    const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : (typeof item.price === 'number' ? item.price : 0);
                    const quantity = Number(item.validQuantity || item.quantity || 1);
                    const itemTotal = typeof item.itemTotal === 'number' ? item.itemTotal : (unitPrice * quantity);

                    return (
                      <div
                        key={id}
                        className={`p-4 rounded-2xl border transition-all ${
                          item.isUnavailable || isOutOfStock
                            ? 'bg-rose-950/30 border-rose-500/30'
                            : 'bg-white/[0.06] border-white/15'
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Item Thumbnail */}
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">
                                🌿
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-sm font-bold text-white tracking-tight truncate">
                                {item.name}
                              </h4>
                              <span className="text-xs font-extrabold text-emerald-300 shrink-0">
                                ${itemTotal.toFixed(2)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-white/50 my-0.5">
                              <Store className="w-3 h-3 text-emerald-400" />
                              <span className="truncate">{item.farmerName || 'Grower'}</span>
                              <span>•</span>
                              <span>${unitPrice.toFixed(2)} / {item.unit || 'kg'}</span>
                            </div>

                            {/* Stock Warning Banner */}
                            {item.stockWarning && (
                              <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 my-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>{item.stockWarning}</span>
                              </div>
                            )}

                            {/* Quantity Controls & Remove */}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                              <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(id, Math.max(1, (item.validQuantity || item.quantity) - 1))}
                                  disabled={item.quantity <= 1}
                                  className="w-6 h-6 rounded bg-white/5 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center text-white cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>

                                <span className="w-7 text-center text-xs font-bold text-white">
                                  {item.validQuantity || item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(id, (item.validQuantity || item.quantity) + 1)}
                                  disabled={item.availableStock !== undefined && (item.validQuantity || item.quantity) >= item.availableStock}
                                  className="w-6 h-6 rounded bg-white/5 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center text-white cursor-pointer"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                onClick={() => onRemoveItem(id)}
                                className="text-white/40 hover:text-rose-300 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Remove from basket"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Fulfillment Method */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                    Select Delivery or Pickup
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        deliveryMethod === 'delivery'
                          ? 'bg-emerald-500/20 border-emerald-400/50 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-0.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Eco Delivery</span>
                      </div>
                      <span className="text-[10px] text-white/50 block">$2.50 • 1-2 Days</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        deliveryMethod === 'pickup'
                          ? 'bg-emerald-500/20 border-emerald-400/50 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-0.5">
                        <Store className="w-3.5 h-3.5 text-sky-400" />
                        <span>Farm Pickup</span>
                      </div>
                      <span className="text-[10px] text-emerald-300 font-semibold block">Free • Same Day</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer & Order Calculations */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-white/[0.04] space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-white/60">
                  <span>Produce Subtotal:</span>
                  <span className="font-semibold text-white">
                    {calculating ? 'Calculating...' : `$${subtotal.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-white/60">
                  <span>Fulfillment Charge:</span>
                  <span className="font-semibold text-white">
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/10">
                  <span>Estimated Total:</span>
                  <span className="text-xl text-emerald-300 font-sans">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer"
                >
                  Continue Shopping
                </button>

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
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer hover:scale-102"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Backend Verified Prices • Protected Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
