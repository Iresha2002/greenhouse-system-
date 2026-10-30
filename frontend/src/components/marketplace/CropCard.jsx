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
    <div className="flex flex-col justify-between rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md p-5 shadow-lg shadow-black/10 hover:border-white/25 transition-all">
      <div className="space-y-3">
        {/* Top: Category & Available Stock */}
        <div className="flex items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-full bg-white/[0.10] border border-white/10 text-xs font-semibold text-white/90">
            {crop.category || 'Produce'}
          </span>
          <span className="text-xs text-emerald-400 font-semibold">
            {isOutOfStock ? (
              <span className="text-red-400">Out of stock</span>
            ) : (
              `${crop.quantity} ${crop.unit || 'kg'} available`
            )}
          </span>
        </div>

        {/* Organic Certification Tag */}
        {crop.isOrganicVerified !== false && (
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Organic certified</span>
          </div>
        )}

        {/* Crop Name & Description */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
            {crop.name}
          </h3>
          <p className="text-xs text-white/70 line-clamp-2 mt-1 leading-relaxed">
            {crop.description ||
              'Freshly harvested organic greenhouse produce cultivated with sustainable hydroponic practices.'}
          </p>
        </div>

        {/* Grower, Place, Harvested Metadata */}
        <div className="text-xs text-white/60 space-y-1 pt-1">
          <div>
            Grower:{' '}
            <span className="text-white/90 font-medium">
              {crop.farmerName || 'farmer_john'}
            </span>
          </div>
          <div>
            Place:{' '}
            <span className="text-white/90 font-medium">
              {crop.location || 'Matara Eco Bay 1'}
            </span>
          </div>
          <div>
            Harvested:{' '}
            <span className="text-white/90 font-medium">
              {formattedHarvestDate}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Area: Price & Action Buttons matching Page 2 */}
      <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
        <div>
          <span className="text-2xl font-extrabold text-white">
            ${Number(crop.price || 0).toFixed(2)}
          </span>
          <span className="text-xs text-white/70 ml-1">
            per {crop.unit || 'kg'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(crop)}
            className="py-2 px-4 rounded-full border border-white/25 bg-white/[0.06] hover:bg-white/[0.14] text-white text-xs font-bold text-center cursor-pointer transition-colors"
          >
            Details
          </button>
          <button
            type="button"
            onClick={() => onAddToCart && onAddToCart(crop)}
            disabled={isOutOfStock}
            className={`py-2 px-4 rounded-full text-xs font-bold text-center transition-colors shadow-sm ${
              isOutOfStock
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 cursor-pointer'
            }`}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropCard;
