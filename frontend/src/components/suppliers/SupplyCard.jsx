import React from 'react';
import {
  ShoppingBag,
  Eye,
  Building2,
  MapPin,
  Cpu,
  CheckCircle,
  AlertTriangle,
  Tag,
  ShieldCheck,
} from 'lucide-react';

export const SupplyCard = ({ supply, onViewDetails, onAddToCart }) => {
  const isOutOfStock = supply.quantity <= 0;
  const isLowStock =
    supply.quantity > 0 && supply.quantity <= (supply.lowStockThreshold || 5);

  // Category badge styling tailored to the 10 agricultural supply categories
  const categoryColors = {
    'Seeds': 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    'Fertilizers': 'bg-lime-500/20 text-lime-300 border-lime-400/30',
    'Crop Protection Products': 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    'Irrigation Equipment': 'bg-sky-500/20 text-sky-300 border-sky-400/30',
    'Greenhouse Equipment': 'bg-teal-500/20 text-teal-300 border-teal-400/30',
    'Smart Farming Devices': 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
    'IoT Components': 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
    'Farming Tools': 'bg-orange-500/20 text-orange-300 border-orange-400/30',
    'Growing Supplies': 'bg-green-500/20 text-green-300 border-green-400/30',
    'Hydroponic Equipment': 'bg-blue-500/20 text-blue-300 border-blue-400/30',
  };

  const badgeClass =
    categoryColors[supply.category] || 'bg-white/10 text-white/80 border-white/20';

  // Pick a concise technical/composition preview badge if provided
  const getQuickSpecSummary = () => {
    if (!supply.specifications) return null;
    const { composition, voltage, communicationProtocol, packageSize } =
      supply.specifications;
    if (composition) return `Formula: ${composition}`;
    if (voltage && communicationProtocol) return `${voltage} • ${communicationProtocol}`;
    if (voltage) return `Power: ${voltage}`;
    if (packageSize) return `Pack: ${packageSize}`;
    return null;
  };

  const quickSpec = getQuickSpecSummary();

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/15 hover:border-sky-400/40 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-950/40 hover:-translate-y-1">
      {/* Background ambient radial glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-sky-500/10 blur-2xl pointer-events-none group-hover:bg-sky-500/20 transition-all duration-500" />

      {/* Top Media / Thumbnail Section */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-black/30 border border-white/10 mb-4">
        {supply.image ? (
          <img
            src={supply.image}
            alt={supply.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.classList.add(
                'flex',
                'items-center',
                'justify-center'
              );
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-sky-950/60 to-black/60 text-sky-300/80">
            <span className="text-4xl mb-1">⚙️</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              {supply.category}
            </span>
          </div>
        )}

        {/* Floating Category Pill */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-md shadow-md ${badgeClass}`}
          >
            {supply.category}
          </span>
        </div>

        {/* Floating Stock Status Indicator */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/85 text-white backdrop-blur-md border border-red-400/40 shadow-md flex items-center gap-1">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/85 text-amber-950 backdrop-blur-md border border-amber-300/40 shadow-md flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" />
              Low: {supply.quantity} {supply.unit}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/85 text-emerald-950 backdrop-blur-md border border-emerald-300/40 shadow-md flex items-center gap-1">
              {supply.quantity} {supply.unit} in stock
            </span>
          )}
        </div>

        {/* Bottom Overlay Badges: Verified Supplier or Warranty */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
          {supply.isSupplierVerified && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-950/90 border border-sky-400/40 text-[10px] font-bold text-sky-300 backdrop-blur-md">
              <CheckCircle className="w-3 h-3 text-sky-400" />
              <span>Verified Supplier</span>
            </div>
          )}
          {supply.warranty && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-400/30 text-[10px] font-semibold text-emerald-300 backdrop-blur-md ml-auto">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>{supply.warranty}</span>
            </div>
          )}
        </div>
      </div>

      {/* Middle Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model Tag if provided */}
          {(supply.brand || supply.model) && (
            <div className="flex items-center gap-1.5 mb-1 text-[11px] font-semibold text-sky-300/90">
              <Tag className="w-3 h-3 text-sky-400 shrink-0" />
              <span className="truncate">
                {[supply.brand, supply.model].filter(Boolean).join(' • ')}
              </span>
            </div>
          )}

          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-sky-300 transition-colors line-clamp-1 mb-1">
            {supply.name}
          </h3>

          <p className="text-xs text-white/60 line-clamp-2 mb-3">
            {supply.description ||
              'Commercial-grade agricultural supply engineered for greenhouse automation and high-yield cultivation.'}
          </p>

          {/* Quick Spec / Composition Pill */}
          {quickSpec && (
            <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-[11px] text-emerald-300 font-medium">
              <Cpu className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{quickSpec}</span>
            </div>
          )}

          {/* Supplier & Location Metadata */}
          <div className="space-y-1 mb-4 text-[11px] text-white/70">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-medium text-white/90 truncate">
                {supply.supplierName || 'Authorized Agri Supplier'}
              </span>
            </div>
            {supply.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{supply.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Action Bottom Area */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs text-white/50 block">Unit price</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-white">
                  ${typeof supply.price === 'number' ? supply.price.toFixed(2) : supply.price}
                </span>
                <span className="text-xs font-semibold text-sky-300">
                  / {supply.unit || 'unit'}
                </span>
              </div>
            </div>

            {supply.minOrderQuantity && supply.minOrderQuantity > 1 && (
              <span className="text-[10px] text-white/50">
                Min Order: {supply.minOrderQuantity} {supply.unit}
              </span>
            )}
          </div>

          {/* Buttons: View Details & Add to Cart */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails && onViewDetails(supply)}
              className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer"
              title="View full specifications and product details"
            >
              <Eye className="w-3.5 h-3.5 text-white/80" />
              <span>View Details</span>
            </button>

            <button
              onClick={() => onAddToCart && onAddToCart(supply)}
              disabled={isOutOfStock}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                isOutOfStock
                  ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold cursor-pointer hover:shadow-sky-500/25 hover:scale-[1.02]'
              }`}
              title={isOutOfStock ? 'Currently out of stock' : 'Add supply to cart'}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyCard;
