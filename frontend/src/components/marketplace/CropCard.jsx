import React from 'react';
import { CheckCircle } from 'lucide-react';

export const CropCard = ({ crop, onViewDetails, onAddToCart }) => {
  const isOutOfStock = crop.quantity <= 0;

  const formattedHarvestDate = crop.harvestDate
    ? new Date(crop.harvestDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '16 Oct 2026';

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md shadow-lg shadow-black/10 hover:border-white/25 transition-all text-white">
      {/* Top Banner with Photo matching Image 1 from PDF Page 2 */}
      <div className="relative bg-[#e8f4ed] p-3 rounded-t-2xl flex flex-col justify-between min-h-[170px] sm:min-h-[190px]">
        {/* Top Badges Row: Category & Available Stock */}
        <div className="flex items-center justify-between gap-2 z-10">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900/85 text-white text-[11px] font-semibold">
            {crop.category || 'Vegetables'}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/15 text-emerald-900 text-[11px] font-bold">
            {isOutOfStock ? (
              <span className="text-red-700 font-bold">Out of stock</span>
            ) : (
              `${crop.quantity} ${crop.unit || 'kg'} available`
            )}
          </span>
        </div>

        {/* Center: Crop Photo */}
        <div className="my-auto py-2 flex items-center justify-center">
          {crop.image ? (
            <img
              src={crop.image}
              alt={crop.name}
              className="h-28 sm:h-32 w-auto max-w-full object-contain rounded-lg drop-shadow-md hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl">
              🌱
            </div>
          )}
        </div>

        {/* Bottom of light banner: Organic certified */}
        {crop.isOrganicVerified !== false && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 z-10">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Organic certified</span>
          </div>
        )}
      </div>

      {/* Bottom Dark Section matching PDF Page 2 */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
            {crop.name}
          </h3>
          <p className="text-xs text-white/70 line-clamp-2 mt-1">
            {crop.description || 'Sweet vine-ripened organic produce from certified smart greenhouses.'}
          </p>

          {/* Metadata rows */}
          <div className="mt-3 space-y-1 text-xs text-white/70 font-sans">
            <p>
              <span className="text-white/40">Grower:</span>{' '}
              <span className="text-white/90 font-medium">{crop.farmerName || 'farmer_john'}</span>
            </p>
            <p>
              <span className="text-white/40">Place:</span>{' '}
              <span className="text-white/90 font-medium">{crop.location || 'Matara Eco Bay 1'}</span>
            </p>
            <p>
              <span className="text-white/40">Harvested:</span>{' '}
              <span className="text-white/90 font-medium">{formattedHarvestDate}</span>
            </p>
          </div>
        </div>

        {/* Price & Action Pills */}
        <div className="pt-2 border-t border-white/10">
          <div className="mb-3 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-white">
              ${typeof crop.price === 'number' ? crop.price.toFixed(2) : crop.price}
            </span>
            <span className="text-xs text-white/60">per {crop.unit || 'kg'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onViewDetails && onViewDetails(crop)}
              className="flex-1 py-2 px-3 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/10 text-white font-bold text-xs transition-all cursor-pointer text-center"
            >
              Details
            </button>

            <button
              type="button"
              onClick={() => onAddToCart && onAddToCart(crop)}
              disabled={isOutOfStock}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all text-center ${
                isOutOfStock
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-extrabold cursor-pointer shadow-md'
              }`}
            >
              {isOutOfStock ? 'Sold out' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropCard;