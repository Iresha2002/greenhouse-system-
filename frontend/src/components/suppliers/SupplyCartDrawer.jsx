import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  Truck,
  Building2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { calculateSuppliesCart } from '../../services/api';

export const SupplyCartDrawer = ({
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

  // Re-verify prices and stock with backend whenever items or delivery method changes
  useEffect(() => {
    if (!isOpen || cartItems.length === 0) {
      setValidatedCart(null);
      return;
    }

    const syncCartWithServer = async () => {
      try {
        setCalculating(true);
        const payloadItems = cartItems.map((it) => ({
          supplyId: it.supplyId || it._id,
          quantity: it.cartQuantity || it.quantity || 1,
          name: it.name,
          price: it.price,
          unit: it.unit,
          supplierName: it.supplierName,
          location: it.location,
          minOrderQuantity: it.minOrderQuantity || 1,
          image: it.image || (Array.isArray(it.images) && it.images[0]) || '',
        }));
        const res = await calculateSuppliesCart(payloadItems, deliveryMethod);
        if (res && res.success) {
          setValidatedCart(res);
        }
      } catch (err) {
        console.error('Failed to validate supplies cart with server:', err);
      } finally {
        setCalculating(false);
      }
    };

    syncCartWithServer();
  }, [isOpen, cartItems, deliveryMethod]);

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
  const deliveryFee = deliveryMethod === 'pickup' || subtotal === 0 ? 0 : 3.50;
  const total = Number((subtotal + deliveryFee).toFixed(2));
  const uniqueSuppliers = validatedCart?.suppliers || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-[#0d3128] border-l border-sky-400/30 shadow-2xl flex flex-col text-white">
          {/* Drawer Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 text-sky-300 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white tracking-tight">
                  Your Supplies Basket
                </h2>
                <span className="text-xs text-white/55">
                  {cartItems.length}{' '}
                  {cartItems.length === 1 ? 'agricultural supply' : 'agricultural supplies'}{' '}
                  selected
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15"
              title="Close basket"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 text-white/30 flex items-center justify-center text-3xl mb-4">
                  ⚙️
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  Your Supplies Basket is Empty
                </h3>
                <p className="text-xs text-white/55 max-w-xs mb-6">
                  Add calibrated NPK fertilizers, F1 greenhouse seeds, solenoid valves, or IoT telemetry probes to begin your order.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition-all cursor-pointer shadow-lg"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Multi-Supplier Fulfilment Notice */}
                {uniqueSuppliers.length > 1 && (
                  <div className="p-3.5 rounded-2xl bg-sky-950/70 border border-sky-400/35 text-xs text-sky-200 flex items-start gap-2.5 shadow-md">
                    <Building2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Multi-Supplier Fulfilment Supported</span>
                      <span className="text-[11px] text-white/75">
                        Your basket includes supplies from {uniqueSuppliers.length} verified suppliers (
                        {uniqueSuppliers.map((s) => s.supplierName).join(', ')}). Each supplier
                        will process and dispatch their items independently.
                      </span>
                    </div>
                  </div>
                )}

                {/* Cart Items List */}
                <div className="space-y-3">
                  {displayItems.map((item) => {
                    const id = item.supplyId || item.productId || item._id;
                    const isOutOfStock =
                      item.availableStock !== undefined && item.availableStock <= 0;
                    const unitPrice =
                      typeof item.unitPrice === 'number'
                        ? item.unitPrice
                        : typeof item.price === 'number'
                        ? item.price
                        : Number(item.price) || 0;
                    const minOrderQty = item.minOrderQuantity || 1;
                    const quantity = Number(
                      item.validQuantity || item.cartQuantity || item.quantity || minOrderQty
                    );
                    const itemTotal =
                      typeof item.itemTotal === 'number'
                        ? item.itemTotal
                        : Number((unitPrice * quantity).toFixed(2));
                    const thumb =
                      item.image ||
                      (Array.isArray(item.images) && item.images.length > 0
                        ? item.images[0]
                        : '');

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
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl">⚙️</span>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                {item.name}
                              </h4>
                              <span className="text-xs font-extrabold text-sky-300 shrink-0">
                                ${itemTotal.toFixed(2)}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-[11px] text-white/55 my-0.5">
                              <Building2 className="w-3 h-3 text-sky-400 shrink-0" />
                              <span className="truncate">
                                {item.supplierName || 'Authorized Supplier'}
                              </span>
                              <span>•</span>
                              <span>
                                ${unitPrice.toFixed(2)} / {item.unit || 'piece'}
                              </span>
                            </div>

                            {/* Stock Warning Banner */}
                            {item.stockWarning && (
                              <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 my-1">
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                                <span>{item.stockWarning}</span>
                              </div>
                            )}

                            {/* Quantity Stepper & Remove Button */}
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                              <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onUpdateQuantity(id, Math.max(minOrderQty, quantity - 1))
                                  }
                                  disabled={quantity <= minOrderQty}
                                  className="w-6 h-6 rounded bg-white/5 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center text-white cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>

                                <span className="w-8 text-center text-xs font-extrabold text-white">
                                  {quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(id, quantity + 1)}
                                  disabled={
                                    item.availableStock !== undefined &&
                                    quantity >= item.availableStock
                                  }
                                  className="w-6 h-6 rounded bg-white/5 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center text-white cursor-pointer"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => onRemoveItem(id)}
                                className="text-white/45 hover:text-rose-300 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Remove supply from basket"
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

                {/* Fulfilment Method Selector */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70 block">
                    Select Delivery or Warehouse Collection
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        deliveryMethod === 'delivery'
                          ? 'bg-sky-500/20 border-sky-400/50 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-0.5">
                        <Truck className="w-3.5 h-3.5 text-sky-400" />
                        <span>Agri Courier</span>
                      </div>
                      <span className="text-[10px] text-white/55 block">
                        $3.50 • Islandwide Dispatch
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        deliveryMethod === 'pickup'
                          ? 'bg-sky-500/20 border-sky-400/50 text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-0.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Warehouse Pickup</span>
                      </div>
                      <span className="text-[10px] text-emerald-300 font-bold block">
                        FREE ($0.00)
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer: Server-Verified Price Summary & Actions */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-white/15 bg-black/35 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-white/70">
                  <span className="flex items-center gap-1.5">
                    Server-Verified Subtotal
                    {calculating && (
                      <RefreshCw className="w-3 h-3 animate-spin text-sky-400" />
                    )}
                  </span>
                  <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>
                    {deliveryMethod === 'pickup'
                      ? 'Warehouse Collection'
                      : 'Agri Courier Delivery Fee'}
                  </span>
                  <span className="font-bold text-sky-300">
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-sm font-extrabold text-white">
                  <span>Final Total</span>
                  <span className="text-lg text-sky-300">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-300/90 bg-emerald-950/50 border border-emerald-400/25 px-3 py-2 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Prices and stock quantities are verified against live MongoDB supplier records.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Continue Shopping
                </button>
                <button
                  type="button"
                  disabled={validatedCart?.hasUnavailableItems}
                  onClick={() =>
                    onProceedToCheckout({
                      deliveryMethod,
                      validatedCart,
                      subtotal,
                      deliveryFee,
                      total,
                    })
                  }
                  className="py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/25 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplyCartDrawer;
