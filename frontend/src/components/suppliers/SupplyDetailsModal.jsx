import React, { useState, useEffect } from 'react';
import {
  X,
  Tag,
  Building2,
  MapPin,
  ShieldCheck,
  Truck,
  Cpu,
  FlaskConical,
  Package,
  ShoppingBag,
  Zap,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Layers,
  Info,
} from 'lucide-react';

export const SupplyDetailsModal = ({
  supply,
  relatedSupplies = [],
  onClose,
  onAddToCart,
  onBuyNow,
  onSelectRelated,
}) => {
  const minQty = supply?.minOrderQuantity || 1;
  const [quantity, setQuantity] = useState(minQty);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (supply) {
      setQuantity(supply.minOrderQuantity || 1);
      setActiveImageIndex(0);
    }
  }, [supply]);

  if (!supply) return null;

  const isOutOfStock = supply.quantity <= 0;
  const isLowStock =
    supply.quantity > 0 && supply.quantity <= (supply.lowStockThreshold || 5);

  // Build clean image list from supplied images only
  const galleryImages =
    Array.isArray(supply.images) && supply.images.length > 0
      ? supply.images
      : supply.image
      ? [supply.image]
      : [];

  const currentImage = galleryImages[activeImageIndex] || '';

  const specs = supply.specifications || {};
  const hasTechnicalSpecs = Boolean(
    specs.voltage ||
      specs.powerRequirements ||
      specs.communicationProtocol ||
      specs.supportedInterfaces ||
      specs.operatingConditions ||
      specs.compatibility
  );

  const hasAgriInputSpecs = Boolean(
    specs.composition ||
      specs.packageSize ||
      specs.applicationInstructions ||
      specs.safetyPrecautions
  );

  const handleQtyChange = (nextVal) => {
    const num = Number(nextVal);
    if (isNaN(num)) return;
    const clamped = Math.max(minQty, Math.min(supply.quantity || minQty, num));
    setQuantity(clamped);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-gradient-to-br from-[#0e3528] via-[#10382b] to-[#0b2933] border border-sky-400/35 p-6 sm:p-8 text-white shadow-2xl my-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer z-10"
          aria-label="Close product details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Breadcrumb Pill */}
        <div className="flex flex-wrap items-center gap-2 mb-5 text-xs">
          <span className="px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            {supply.category}
          </span>

          {supply.sku && (
            <span className="px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/15 text-white/60 font-mono">
              SKU: {supply.sku}
            </span>
          )}

          {supply.isFeatured && (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Featured Supply
            </span>
          )}

          {supply.warranty && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {supply.warranty}
            </span>
          )}
        </div>

        {/* Main 2-Column Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Column: Gallery, Supplier Card & Delivery Options (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Primary Product Image */}
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-black/40 border border-white/15 shadow-inner">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={supply.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-sky-300/60">
                  <Package className="w-12 h-12 mb-2" />
                  <span className="text-xs uppercase font-bold">{supply.category}</span>
                </div>
              )}

              {/* Stock Overlay Badge */}
              <div className="absolute top-3 right-3">
                {isOutOfStock ? (
                  <span className="px-3 py-1 rounded-full bg-red-500/90 text-white text-xs font-extrabold shadow-lg">
                    Out of Stock
                  </span>
                ) : isLowStock ? (
                  <span className="px-3 py-1 rounded-full bg-amber-500/90 text-amber-950 text-xs font-extrabold shadow-lg flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Low Stock ({supply.quantity} {supply.unit})
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-emerald-950 text-xs font-extrabold shadow-lg flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    In Stock ({supply.quantity} {supply.unit})
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Switcher if multiple images exist */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-sky-400 scale-105'
                        : 'border-white/15 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Supplier Information Card */}
            <div className="rounded-2xl bg-white/[0.06] border border-white/15 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Authorized Supplier
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-400/30">
                  Direct Fulfilment
                </span>
              </div>
              <p className="text-sm font-extrabold text-white">
                {supply.supplierName || 'SmartGrow Verified Supplier'}
              </p>
              {supply.location && (
                <div className="flex items-center gap-1.5 text-xs text-white/70">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Dispatch Location: {supply.location}</span>
                </div>
              )}
            </div>

            {/* Delivery & Collection Options */}
            <div className="rounded-2xl bg-white/[0.06] border border-white/15 p-4 space-y-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Delivery & Collection Options
              </h4>
              <div className="space-y-1.5 text-xs text-white/80">
                {supply.deliveryOptions?.islandwideDelivery ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Islandwide Agricultural Courier Delivery Available</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-white/40">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Courier Delivery Not Available for This Item</span>
                  </div>
                )}

                {supply.deliveryOptions?.warehousePickup ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>Warehouse / Depot Self-Collection Supported</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-white/40">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Direct Delivery Only (No Warehouse Pickup)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Title, Pricing, Specifications & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              {/* Brand & Model */}
              {(supply.brand || supply.model) && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-500/15 border border-sky-400/30 text-xs font-bold text-sky-300">
                  <Tag className="w-3.5 h-3.5 text-sky-400" />
                  <span>
                    {supply.brand && `Brand: ${supply.brand}`}
                    {supply.brand && supply.model && '  •  '}
                    {supply.model && `Model: ${supply.model}`}
                  </span>
                </div>
              )}

              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                {supply.name}
              </h2>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                {supply.description}
              </p>

              {/* Key Pricing & Order Limits Bar */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-black/30 border border-white/15">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-white/50 block">
                    Unit Price
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-white">
                    ${Number(supply.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-sky-300 font-semibold block">
                    per {supply.unit}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-white/50 block">
                    Available Stock
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-emerald-300">
                    {supply.quantity} {supply.unit}
                  </span>
                  <span className="text-[11px] text-white/50 block">
                    Verified inventory
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-white/50 block">
                    Min Order Qty
                  </span>
                  <span className="text-base sm:text-lg font-extrabold text-amber-300">
                    {minQty} {supply.unit}
                  </span>
                  <span className="text-[11px] text-white/50 block">
                    Minimum per order
                  </span>
                </div>
              </div>

              {/* Technical Specifications Block (for IoT, Irrigation, Smart Farming, Hydroponics) */}
              {hasTechnicalSpecs && (
                <div className="rounded-2xl bg-sky-950/35 border border-sky-400/25 p-4 space-y-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-300 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-sky-400" />
                    Technical & Hardware Specifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {specs.voltage && (
                      <div className="p-2.5 rounded-xl bg-black/25 border border-white/10">
                        <span className="text-white/50 block font-semibold">Operating Voltage</span>
                        <span className="text-white font-bold">{specs.voltage}</span>
                      </div>
                    )}
                    {specs.powerRequirements && (
                      <div className="p-2.5 rounded-xl bg-black/25 border border-white/10">
                        <span className="text-white/50 block font-semibold">Power Requirements</span>
                        <span className="text-white font-bold">{specs.powerRequirements}</span>
                      </div>
                    )}
                    {specs.communicationProtocol && (
                      <div className="p-2.5 rounded-xl bg-black/25 border border-white/10">
                        <span className="text-white/50 block font-semibold">
                          Communication Protocol
                        </span>
                        <span className="text-white font-bold">{specs.communicationProtocol}</span>
                      </div>
                    )}
                    {specs.supportedInterfaces && (
                      <div className="p-2.5 rounded-xl bg-black/25 border border-white/10">
                        <span className="text-white/50 block font-semibold">
                          Supported Interfaces
                        </span>
                        <span className="text-white font-bold">{specs.supportedInterfaces}</span>
                      </div>
                    )}
                    {specs.operatingConditions && (
                      <div className="sm:col-span-2 p-2.5 rounded-xl bg-black/25 border border-white/10">
                        <span className="text-white/50 block font-semibold">
                          Operating Environment
                        </span>
                        <span className="text-white font-bold">{specs.operatingConditions}</span>
                      </div>
                    )}
                    {specs.compatibility && (
                      <div className="sm:col-span-2 p-2.5 rounded-xl bg-sky-500/10 border border-sky-400/30">
                        <span className="text-sky-300 block font-bold">
                          System Compatibility
                        </span>
                        <span className="text-white/90">{specs.compatibility}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Agricultural Input Details (for Seeds, Fertilizers, Crop Protection, Growing Supplies) */}
              {hasAgriInputSpecs && (
                <div className="rounded-2xl bg-emerald-950/35 border border-emerald-400/25 p-4 space-y-2.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                    Product Composition, Packaging & Usage Guide
                  </h4>
                  <div className="space-y-2 text-xs">
                    {specs.composition && (
                      <div className="p-2.5 rounded-xl bg-black/25 border border-white/10">
                        <span className="text-white/50 block font-semibold">
                          Active Composition / Material
                        </span>
                        <span className="text-white font-bold">{specs.composition}</span>
                      </div>
                    )}
                    {specs.packageSize && (
                      <div className="p-2.5 rounded-xl bg-black/25 border border-white/10">
                        <span className="text-white/50 block font-semibold">Packaging Size</span>
                        <span className="text-white font-bold">{specs.packageSize}</span>
                      </div>
                    )}
                    {specs.applicationInstructions && (
                      <div className="p-2.5 rounded-xl bg-black/25 border border-white/10">
                        <span className="text-white/50 block font-semibold">
                          Application / Usage Instructions
                        </span>
                        <span className="text-white/90">{specs.applicationInstructions}</span>
                      </div>
                    )}
                    {specs.safetyPrecautions && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/30">
                        <span className="text-amber-300 block font-bold">
                          Safety & Storage Precautions
                        </span>
                        <span className="text-amber-100/90">{specs.safetyPrecautions}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Purchase Action Bar: Quantity Stepper + Add to Cart + Buy Now */}
            <div className="pt-4 border-t border-white/15 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white/80">Order Quantity:</span>
                  <div className="flex items-center gap-1 bg-black/40 border border-white/15 rounded-xl p-1">
                    <button
                      type="button"
                      disabled={isOutOfStock || quantity <= minQty}
                      onClick={() => handleQtyChange(quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 flex items-center justify-center text-white cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={minQty}
                      max={supply.quantity || minQty}
                      value={quantity}
                      onChange={(e) => handleQtyChange(e.target.value)}
                      className="w-14 text-center bg-transparent text-sm font-extrabold text-white focus:outline-none"
                      aria-label="Order quantity"
                    />
                    <button
                      type="button"
                      disabled={isOutOfStock || quantity >= supply.quantity}
                      onClick={() => handleQtyChange(quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 flex items-center justify-center text-white cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-white/50 block">Estimated Subtotal</span>
                  <span className="text-xl font-extrabold text-sky-300">
                    ${(Number(supply.price) * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    onAddToCart && onAddToCart(supply, quantity);
                    onClose();
                  }}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 border ${
                    isOutOfStock
                      ? 'bg-white/5 text-white/30 border-white/10 cursor-not-allowed'
                      : 'bg-white/10 hover:bg-white/20 text-white border-sky-400/40 cursor-pointer'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-sky-300" />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Supplies Basket'}</span>
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    if (onBuyNow) {
                      onBuyNow(supply, quantity);
                    } else if (onAddToCart) {
                      onAddToCart(supply, quantity);
                      onClose();
                    }
                  }}
                  className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg ${
                    isOutOfStock
                      ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/25 cursor-pointer'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>
                    {isOutOfStock
                      ? 'Unavailable'
                      : `Buy Now ($${(Number(supply.price) * quantity).toFixed(2)})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Supplies in Same Category */}
        {relatedSupplies.length > 0 && (
          <div className="mt-7 pt-5 border-t border-white/15">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/60 mb-3">
              More Supplies in {supply.category}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {relatedSupplies.slice(0, 3).map((rel) => (
                <button
                  key={rel._id}
                  type="button"
                  onClick={() => onSelectRelated && onSelectRelated(rel)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-left transition-all cursor-pointer"
                >
                  <img
                    src={
                      rel.image ||
                      (Array.isArray(rel.images) && rel.images.length > 0 ? rel.images[0] : '')
                    }
                    alt={rel.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 bg-black/30"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{rel.name}</p>
                    <p className="text-[11px] text-sky-300 font-extrabold">
                      ${Number(rel.price).toFixed(2)} / {rel.unit}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupplyDetailsModal;
