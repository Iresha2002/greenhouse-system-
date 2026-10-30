import React from 'react';

export const SupplyCard = ({ supply, onViewDetails, onAddToCart }) => {
  const isOutOfStock = supply.quantity <= 0;
  const isLowStock = supply.quantity > 0 && supply.quantity <= (supply.lowStockThreshold || 5);
  const displayImage =
    supply.image ||
    (Array.isArray(supply.images) && supply.images.length > 0 ? supply.images[0] : '');

  // Power or tech specs preview
  const getPowerSpec = () => {
    if (!supply.specifications) return null;
    const { voltage, powerRequirements, communicationProtocol } = supply.specifications;
    if (voltage && communicationProtocol) return `Power: ${voltage} &middot; ${communicationProtocol}`;
    if (voltage) return `Power: ${voltage}`;
    if (powerRequirements) return `Power: ${powerRequirements}`;
    return null;
  };

  const powerSpec = getPowerSpec();
  const unitName = supply.unit || 'unit';

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 p-5 transition-all duration-300 hover:-translate-y-0.5 text-slate-900">
      <div>
        {/* Top Badges Row: Category & Stock Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
            {supply.category}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isOutOfStock
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : isLowStock
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {isOutOfStock ? 'Out of stock' : `${supply.quantity} ${unitName}s in stock`}
          </span>
        </div>

        {/* Secondary Info Badges: Sales / Featured / Warranty */}
        <div className="flex items-center gap-2 mb-3 text-[11px] text-slate-500">
          {supply.totalUnitsSold > 0 ? (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
              {supply.totalUnitsSold} {unitName} sold
            </span>
          ) : supply.isFeatured ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
              Featured
            </span>
          ) : null}

          {supply.warranty && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
              {supply.warranty}
            </span>
          )}
        </div>

        {/* Image Preview if available */}
        {displayImage && (
          <div className="aspect-16/10 w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-200 mb-3.5">
            <img
              src={displayImage}
              alt={supply.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Brand & Model line */}
        {(supply.brand || supply.model) && (
          <p className="text-xs font-semibold text-slate-400 mb-1">
            {[supply.brand, supply.model].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug mb-2 group-hover:text-emerald-800 transition-colors">
          {supply.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
          {supply.description || 'Heavy-duty agricultural supply engineered for greenhouse efficiency.'}
        </p>

        {/* Power spec if available */}
        {powerSpec && (
          <p
            className="text-xs text-slate-600 mb-2 font-mono"
            dangerouslySetInnerHTML={{ __html: powerSpec }}
          />
        )}

        {/* Seller Info */}
        <p className="text-xs text-slate-500 mb-4">
          Seller: <span className="text-slate-700 font-medium">{supply.supplierName || 'SmartGrow Automation Supplies'}</span>
          {supply.location && ` · ${supply.location}`}
        </p>
      </div>

      {/* Bottom Area: Price & Action Pills */}
      <div className="pt-3 border-t border-slate-100 mt-2">
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-xl sm:text-2xl font-black text-slate-950">
            ${typeof supply.price === 'number' ? supply.price.toFixed(2) : supply.price}
          </span>
          <span className="text-xs text-slate-500">per {unitName}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onViewDetails && onViewDetails(supply)}
            className="flex-1 py-2 px-3 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-all cursor-pointer text-center"
          >
            Details
          </button>

          <button
            type="button"
            onClick={() => onAddToCart && onAddToCart(supply)}
            disabled={isOutOfStock}
            className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all text-center ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#0b3b2c] hover:bg-[#07291e] text-white font-extrabold cursor-pointer shadow-xs'
            }`}
          >
            {isOutOfStock ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplyCard;