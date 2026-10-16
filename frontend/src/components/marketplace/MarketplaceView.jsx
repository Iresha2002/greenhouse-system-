import React, { useState, useMemo } from 'react';
import CropCard from './CropCard';
import {
  Search,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Sparkles,
  Leaf,
  Layers,
  CheckCircle,
  X,
  MapPin,
  Calendar,
  AlertCircle,
  Store,
  SlidersHorizontal,
} from 'lucide-react';

// Initial verified crop batch data matching SmartGrow organic standards
const INITIAL_CROPS = [
  {
    id: 'crop-1',
    name: 'Hydroponic Cherry Tomatoes',
    category: 'Vegetables',
    description: 'Vine-ripened sweet cherry tomatoes grown in closed-loop nutrient film hydroponic tables. 100% pesticide-free.',
    price: 3.80,
    unit: 'kg',
    quantity: 45,
    farmerName: 'Farmer John',
    location: 'Matara Eco Bay 1',
    harvestDate: '2026-10-15',
    isOrganicVerified: true,
    minOrderQuantity: 1,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'crop-2',
    name: 'Crisp Butterhead Lettuce',
    category: 'Leafy Greens',
    description: 'Tender, sweet hydroponic butterhead heads. Harvested with root ball intact for maximum freshness and shelf life.',
    price: 2.20,
    unit: 'head',
    quantity: 28,
    farmerName: 'Lahiru Farm Estates',
    location: 'Galle Coastal Greenhouse',
    harvestDate: '2026-10-16',
    isOrganicVerified: true,
    minOrderQuantity: 1,
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'crop-3',
    name: 'Organic Bell Peppers (Mixed Trio)',
    category: 'Vegetables',
    description: 'Vibrant red, yellow, and green bell peppers packed with Vitamin C. Grown under controlled greenhouse spectrum LED lighting.',
    price: 4.50,
    unit: 'kg',
    quantity: 35,
    farmerName: 'Farmer John',
    location: 'Matara Eco Bay 2',
    harvestDate: '2026-10-14',
    isOrganicVerified: true,
    minOrderQuantity: 1,
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'crop-4',
    name: 'Greenhouse Alpine Strawberries',
    category: 'Fruits',
    description: 'Intensely fragrant and sweet alpine strawberries cultivated with climate-optimized automated misting.',
    price: 6.90,
    unit: 'pack',
    quantity: 12,
    farmerName: 'Central Highland Greens',
    location: 'Nuwara Eliya Polyhouse',
    harvestDate: '2026-10-16',
    isOrganicVerified: true,
    minOrderQuantity: 1,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'crop-5',
    name: 'Aromatic Sweet Basil',
    category: 'Herbs',
    description: 'Genovese sweet basil with lush, deep green leaves. Ideal for fresh pestos and Italian culinary dishes.',
    price: 1.80,
    unit: 'bundle',
    quantity: 50,
    farmerName: 'Lahiru Farm Estates',
    location: 'Galle Coastal Greenhouse',
    harvestDate: '2026-10-16',
    isOrganicVerified: true,
    minOrderQuantity: 2,
    image: 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'crop-6',
    name: 'English Seedless Cucumbers',
    category: 'Vegetables',
    description: 'Crisp, slender cucumbers with tender skin and refreshing flavor. Daily harvest from high-trellis greenhouse rows.',
    price: 2.50,
    unit: 'kg',
    quantity: 6,
    farmerName: 'Farmer John',
    location: 'Matara Eco Bay 1',
    harvestDate: '2026-10-13',
    isOrganicVerified: true,
    minOrderQuantity: 1,
    image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'crop-7',
    name: 'Baby Leaf Spinach',
    category: 'Leafy Greens',
    description: 'Nutrient-rich young spinach leaves, gently washed and chilled immediately post-harvest.',
    price: 2.90,
    unit: 'pack',
    quantity: 0, // Sold out test case
    farmerName: 'Central Highland Greens',
    location: 'Nuwara Eliya Polyhouse',
    harvestDate: '2026-10-12',
    isOrganicVerified: true,
    minOrderQuantity: 1,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'crop-8',
    name: 'Fresh Spearmint & Peppermint',
    category: 'Herbs',
    description: 'Refreshing aromatic mint sprigs grown with biological pest control and clean groundwater irrigation.',
    price: 1.50,
    unit: 'bundle',
    quantity: 32,
    farmerName: 'Lahiru Farm Estates',
    location: 'Galle Coastal Greenhouse',
    harvestDate: '2026-10-15',
    isOrganicVerified: true,
    minOrderQuantity: 1,
    image: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=600&auto=format&fit=crop&q=80',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Produce', icon: Layers },
  { id: 'Vegetables', label: 'Vegetables', icon: Leaf },
  { id: 'Fruits', label: 'Fruits', icon: Sparkles },
  { id: 'Leafy Greens', label: 'Leafy Greens', icon: Leaf },
  { id: 'Herbs', label: 'Herbs', icon: Sparkles },
  { id: 'Other Produce', label: 'Other Produce', icon: Store },
];

export const MarketplaceView = ({ currentUser, onSwitchToFarmerPortal }) => {
  const [crops] = useState(INITIAL_CROPS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [activeModalCrop, setActiveModalCrop] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filter & Sort Pipeline
  const filteredCrops = useMemo(() => {
    return crops
      .filter((crop) => {
        // Category Filter
        if (selectedCategory !== 'all' && crop.category !== selectedCategory) {
          return false;
        }

        // In Stock Filter
        if (inStockOnly && crop.quantity <= 0) {
          return false;
        }

        // Search Query Filter (Crop name, farmer name, location, description)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = crop.name.toLowerCase().includes(q);
          const matchesFarmer = (crop.farmerName || '').toLowerCase().includes(q);
          const matchesLocation = (crop.location || '').toLowerCase().includes(q);
          const matchesDesc = (crop.description || '').toLowerCase().includes(q);
          return matchesName || matchesFarmer || matchesLocation || matchesDesc;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          return a.price - b.price;
        }
        if (sortBy === 'price-high') {
          return b.price - a.price;
        }
        // Default: newest
        return new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime();
      });
  }, [crops, selectedCategory, inStockOnly, searchQuery, sortBy]);

  // Handle Add to Cart action
  const handleAddToCart = (crop) => {
    setCartCount((prev) => prev + 1);
    setNotification({
      type: 'success',
      message: `Added 1 ${crop.unit} of "${crop.name}" to cart!`,
    });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500 text-emerald-950 font-bold shadow-2xl border border-emerald-300 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 text-emerald-950/70 hover:text-emerald-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-white/[0.07] to-emerald-900/40 backdrop-blur-2xl border border-white/20 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                Direct Farmer-to-Consumer Marketplace
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
              Fresh Produce Marketplace
            </h1>

            <p className="text-sm sm:text-base text-white/75 leading-relaxed font-normal">
              Directly purchase verified organic crops harvested from smart greenhouses and accredited local growers.
              Transparent pricing, verified harvest timestamps, and zero middleman markups.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-3 mt-5 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Traceable Harvests</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90">
                <Leaf className="w-3.5 h-3.5 text-lime-400" />
                <span>Zero Synthetic Pesticides</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/90">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Local Eco-Bay Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Action / Role Portal Access */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            {/* Cart Pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-lg">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-white/80">Active Cart:</span>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Farmer Listing Management Shortcut */}
            {currentUser && currentUser.role === 'farmer' && (
              <button
                onClick={onSwitchToFarmerPortal}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md hover:scale-105"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Farmer Portal • My Listings</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter, Search & Categories Controls */}
      <div className="space-y-4">
        {/* Search Input & Sort Options Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white/[0.08] backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-white/15 shadow-xl">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crops, growers, locations (e.g. Tomato, Lahiru, Matara)..."
              className="w-full pl-11 pr-10 py-2.5 rounded-2xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 text-sm focus:outline-none focus:border-emerald-400/60 focus:bg-white/[0.1] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls: Stock Toggle & Sort Dropdown */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* In-Stock Only Toggle */}
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/[0.06] border border-white/15 text-xs font-semibold text-white/80 cursor-pointer hover:bg-white/10 transition-colors select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-transparent border-white/30 cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>

            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-white/50 absolute left-3 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-8 pr-8 py-2 rounded-2xl bg-[#0f3824] border border-white/20 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400 cursor-pointer appearance-none shadow-sm"
              >
                <option value="newest">Newest Harvests</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-500 text-emerald-950 border-emerald-400 shadow-lg shadow-emerald-500/25 scale-102'
                    : 'bg-white/[0.06] text-white/70 hover:bg-white/15 hover:text-white border-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-950' : 'text-emerald-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Crops Results Header */}
      <div className="flex items-center justify-between text-xs text-white/60 px-1">
        <span>
          Showing <strong className="text-white font-bold">{filteredCrops.length}</strong> crop {filteredCrops.length === 1 ? 'batch' : 'batches'}
          {selectedCategory !== 'all' && ` in "${selectedCategory}"`}
        </span>
        {(searchQuery || selectedCategory !== 'all' || inStockOnly) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setInStockOnly(false);
              setSortBy('newest');
            }}
            className="text-emerald-300 hover:text-emerald-200 underline font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Crops Grid */}
      {filteredCrops.length === 0 ? (
        <div className="rounded-3xl bg-white/[0.05] border border-white/15 p-16 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-white/40 flex items-center justify-center mx-auto mb-4 text-2xl">
            🌱
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No matching crop listings found</h3>
          <p className="text-xs text-white/50 max-w-md mx-auto mb-6">
            We couldn't find any produce matching your current search query or category filters. Try expanding your search terms or clearing your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setInStockOnly(false);
            }}
            className="px-5 py-2.5 rounded-full bg-emerald-500 text-emerald-950 font-bold text-xs hover:bg-emerald-400 transition-all cursor-pointer shadow-md"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onViewDetails={(item) => setActiveModalCrop(item)}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* Crop Details Modal */}
      {activeModalCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-[#0f3824] border border-white/20 p-6 sm:p-8 shadow-2xl text-white">
            {/* Ambient Modal Glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setActiveModalCrop(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15 z-10"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Body */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image Preview */}
              <div className="w-full md:w-1/2 aspect-4/3 rounded-2xl overflow-hidden bg-black/40 border border-white/15 shrink-0">
                {activeModalCrop.image ? (
                  <img
                    src={activeModalCrop.image}
                    alt={activeModalCrop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    🌿
                  </div>
                )}
              </div>

              {/* Crop Details Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                      {activeModalCrop.category}
                    </span>
                    {activeModalCrop.isOrganicVerified && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-emerald-950">
                        ✓ Verified Organic
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                    {activeModalCrop.name}
                  </h2>

                  <p className="text-xs text-white/70 leading-relaxed mb-4">
                    {activeModalCrop.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-white/80 pb-4 mb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Grower: <strong>{activeModalCrop.farmerName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Farm Origin: {activeModalCrop.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span>Harvest Date: {activeModalCrop.harvestDate}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-xs text-white/50 block">Direct Farm Price</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white">
                          ${activeModalCrop.price.toFixed(2)}
                        </span>
                        <span className="text-sm font-semibold text-emerald-300">
                          / {activeModalCrop.unit}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80">
                      Stock: {activeModalCrop.quantity} {activeModalCrop.unit} available
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleAddToCart(activeModalCrop);
                        setActiveModalCrop(null);
                      }}
                      disabled={activeModalCrop.quantity <= 0}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/30 text-emerald-950 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{activeModalCrop.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>
                    <button
                      onClick={() => setActiveModalCrop(null)}
                      className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceView;
