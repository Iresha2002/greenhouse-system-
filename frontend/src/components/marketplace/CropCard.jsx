import React from 'react';
import { ShoppingBag, Eye, MapPin, User, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

export const CropCard = ({ crop, onViewDetails, onAddToCart }) => {
  const isOutOfStock = crop.quantity <= 0;
  const isLowStock = crop.quantity > 0 && crop.quantity <= (crop.lowStockThreshold || 10);

  // Category badge colors
  const categoryColors = {
    'Vegetables': 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    'Fruits': 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    'Leafy Greens': 'bg-lime-500/20 text-lime-300 border-lime-400/30',
    'Herbs': 'bg-teal-500/20 text-teal-300 border-teal-400/30',
    'Other Produce': 'bg-purple-500/20 text-purple-300 border-purple-400/30',
  };

  const badgeClass = categoryColors[crop.category] || 'bg-white/10 text-white/80 border-white/20';

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/15 hover:border-emerald-400/40 p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-950/40 hover:-translate-y-1">
      {/* Background ambient radial glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />

      {/* Top Media / Thumbnail Section */}
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-black/30 border border-white/10 mb-4">
        {crop.image ? (
          <img
            src={crop.image}
            alt={crop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Fallback to organic badge if image URL fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center');
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-950/60 to-black/60 text-emerald-300/80">
            <span className="text-4xl mb-1">🌿</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">{crop.category}</span>
          </div>
        )}

        {/* Floating Category Pill */}
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border backdrop-blur-md shadow-md ${badgeClass}`}>
            {crop.category}
          </span>
        </div>

        {/* Floating Stock Indicator */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/80 text-white backdrop-blur-md border border-red-400/40 shadow-md flex items-center gap-1">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/80 text-amber-950 backdrop-blur-md border border-amber-300/40 shadow-md flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" />
              Low: {crop.quantity} {crop.unit}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/80 text-emerald-950 backdrop-blur-md border border-emerald-300/40 shadow-md flex items-center gap-1">
              {crop.quantity} {crop.unit} avail
            </span>
          )}
        </div>

        {/* Organic Certification Tag if verified */}
        {crop.isOrganicVerified && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-900/90 border border-emerald-400/40 text-[10px] font-bold text-emerald-300 backdrop-blur-md">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>Organic Certified</span>
          </div>
        )}
      </div>

      {/* Middle Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors line-clamp-1">
              {crop.name}
            </h3>
          </div>

          <p className="text-xs text-white/60 line-clamp-2 mb-3">
            {crop.description || 'Locally harvested fresh farm produce, cultivated with optimized hydroponic and organic greenhouse soil management.'}
          </p>

          {/* Farmer & Location Metadata */}
          <div className="space-y-1 mb-4 text-[11px] text-white/70">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-medium text-white/90 truncate">{crop.farmerName || 'Registered Farmer'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{crop.location || 'Greenhouse Bay'}</span>
            </div>
            {crop.harvestDate && (
              <div className="flex items-center gap-1.5 text-white/50">
                <Calendar className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <span>Harvested: {new Date(crop.harvestDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price & Action Bottom Area */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs text-white/50 block">Price per unit</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-white">
                  ${typeof crop.price === 'number' ? crop.price.toFixed(2) : crop.price}
                </span>
                <span className="text-xs font-semibold text-emerald-300">
                  / {crop.unit || 'kg'}
                </span>
              </div>
            </div>

            {crop.minOrderQuantity && crop.minOrderQuantity > 1 && (
              <span className="text-[10px] text-white/50">
                Min: {crop.minOrderQuantity} {crop.unit}
              </span>
            )}
          </div>

          {/* Buttons: View Details & Add to Cart */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetails && onViewDetails(crop)}
              className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer"
              title="View full crop details"
            >
              <Eye className="w-3.5 h-3.5 text-white/80" />
              <span>Details</span>
            </button>

            <button
              onClick={() => onAddToCart && onAddToCart(crop)}
              disabled={isOutOfStock}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md ${
                isOutOfStock
                  ? 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold cursor-pointer hover:shadow-emerald-500/25 hover:scale-[1.02]'
              }`}
              title={isOutOfStock ? 'Currently out of stock' : 'Add to cart'}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropCard;
