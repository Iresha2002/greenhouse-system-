import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Minus,
  Plus,
} from 'lucide-react';

export const SupplyDetailsModal = ({
  supply,
  onClose,
  onAddToCart,
}) => {
  const minQty = supply?.minOrderQuantity || 1;
  const [quantity, setQuantity] = useState(minQty);

  useEffect(() => {
    if (supply) {
      setQuantity(supply.minOrderQuantity || 1);
    }
  }, [supply]);

  if (!supply) return null;

  const isOutOfStock = supply.quantity <= 0;
  const unitName = supply.unit || 'unit';
  const specs = supply.specifications || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#071f19]/95 backdrop-blur-xl animate-in fade-in duration-200 text-white">
      {/* Top Header Bar matching Page 7 */}
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
            <span>Back to supplies</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Seller & Fulfillment matching Page 7 */}
          <div className="lg:col-span-4 space-y-4">
            {/* Seller Card */}
            <div className="bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-2xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-white/50 tracking-wider">Seller</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#4de1b7]/15 text-[#4de1b7] border border-[#4de1b7]/30">
                  Ships directly
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                {supply.supplierName || 'SmartGrow Automation Supplies'}
              </h3>
              <p className="text-xs text-white/60">
                Ships from {supply.location || 'Kandy Tech Park'}
              </p>
            </div>

            {/* Delivery or pickup Card */}
            <div className="bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-2xl p-5 sm:p-6 space-y-3">
              <h4 className="text-xs uppercase font-bold text-white/50 tracking-wider">Delivery or pickup</h4>
              <div className="space-y-2 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <span className="text-[#4de1b7] font-bold">&check;</span>
                  <span>Courier delivery across the island</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#4de1b7] font-bold">&check;</span>
                  <span>Pick up from the warehouse</span>
                </div>
              </div>
            </div>

            {/* Product Image preview if present */}
            {supply.image && (
              <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/30 aspect-4/3">
                <img src={supply.image} alt={supply.name} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Right Column: Details, Specs, Price and Actions matching Page 7 */}
          <div className="lg:col-span-8 bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-2xl p-6 sm:p-8 space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white font-semibold">
                {supply.category}
              </span>
              {supply.sku && (
                <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/60 font-mono">
                  SKU: {supply.sku}
                </span>
              )}
              {supply.isFeatured && (
                <span className="px-3 py-1 rounded-full bg-[#4de1b7]/15 border border-[#4de1b7]/30 text-[#4de1b7] font-semibold">
                  Featured
                </span>
              )}
              {supply.warranty && (
                <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/70">
                  {supply.warranty}
                </span>
              )}
            </div>

            {/* Brand / Model */}
            {(supply.brand || supply.model) && (
              <p className="text-sm font-semibold text-white/50">
                {[supply.brand, supply.model].filter(Boolean).join(' · ')}
              </p>
            )}

            {/* Title & Description */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {supply.name}
              </h1>
              <p className="text-sm text-white/70 mt-2 leading-relaxed">
                {supply.description || 'Heavy-duty agricultural equipment for modern farming.'}
              </p>
            </div>

            {/* 3 Stats: Price, In Stock, Minimum Order */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/10">
              <div>
                <span className="text-xs text-white/50 block">Price</span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  ${Number(supply.price).toFixed(2)}
                </span>
                <span className="text-xs text-white/60 block">/ {unitName}</span>
              </div>

              <div>
                <span className="text-xs text-white/50 block">In stock</span>
                <span className="text-base sm:text-lg font-bold text-[#4de1b7]">
                  {supply.quantity} {unitName}s
                </span>
              </div>

              <div>
                <span className="text-xs text-white/50 block">Minimum order</span>
                <span className="text-base sm:text-lg font-bold text-white">
                  {minQty} {unitName}
                </span>
              </div>
            </div>

            {/* Technical details grid matching Page 7 */}
            <div className="space-y-3 pt-2">
              <h3 className="text-base font-bold text-white">Technical details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
                <div>
                  <span className="text-white/50 block">Voltage</span>
                  <span className="text-white font-semibold">
                    {specs.voltage || '24V DC (adapter included)'}
                  </span>
                </div>

                <div>
                  <span className="text-white/50 block">Power</span>
                  <span className="text-white font-semibold">
                    {specs.powerRequirements || '24W max'}
                  </span>
                </div>

                <div>
                  <span className="text-white/50 block">Connection</span>
                  <span className="text-white font-semibold">
                    {specs.communicationProtocol || specs.supportedInterfaces || 'Wi-Fi MQTT + RS485 telemetry output'}
                  </span>
                </div>

                <div>
                  <span className="text-white/50 block">Ports / Compatibility</span>
                  <span className="text-white font-semibold">
                    {specs.compatibility || '2 BNC electrode ports, chemical-resistant tubing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper & Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-white/60">Quantity:</span>
                <div className="inline-flex items-center gap-3 bg-white/[0.08] border border-white/15 rounded-lg px-2.5 py-1 text-sm font-semibold text-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(minQty, quantity - 1))}
                    disabled={quantity <= minQty}
                    className="text-white/60 hover:text-white disabled:opacity-30 cursor-pointer text-base leading-none"
                  >
                    &minus;
                  </button>
                  <span className="text-xs font-bold min-w-8 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(supply.quantity, quantity + 1))}
                    disabled={quantity >= supply.quantity}
                    className="text-white/60 hover:text-white disabled:opacity-30 cursor-pointer text-base leading-none"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart && onAddToCart(supply, quantity);
                    onClose();
                  }}
                  disabled={isOutOfStock}
                  className="px-6 py-2.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-md disabled:opacity-40"
                >
                  Add to cart
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/10 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyDetailsModal;