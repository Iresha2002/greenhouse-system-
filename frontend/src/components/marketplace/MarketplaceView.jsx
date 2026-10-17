import React, { useState, useEffect, useMemo } from 'react';
import CropCard from './CropCard';
import FarmerProductManager from './FarmerProductManager';
import CartDrawer from './CartDrawer';
import CheckoutModal from './CheckoutModal';
import OrderConfirmationModal from './OrderConfirmationModal';
import CustomerOrdersModal from './CustomerOrdersModal';
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
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  Package,
} from 'lucide-react';
import { getProducts, createOrder } from '../../services/api';

// Initial fallback catalog matching SmartGrow high-standard organic produce
const FALLBACK_CROPS = [
  {
    _id: 'crop-1',
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
    deliveryOptions: { homeDelivery: true, farmPickup: true },
  },
  {
    _id: 'crop-2',
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
    deliveryOptions: { homeDelivery: true, farmPickup: true },
  },
  {
    _id: 'crop-3',
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
    deliveryOptions: { homeDelivery: true, farmPickup: true },
  },
  {
    _id: 'crop-4',
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
    deliveryOptions: { homeDelivery: true, farmPickup: false },
  },
  {
    _id: 'crop-5',
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
    deliveryOptions: { homeDelivery: true, farmPickup: true },
  },
  {
    _id: 'crop-6',
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
    deliveryOptions: { homeDelivery: true, farmPickup: true },
  },
  {
    _id: 'crop-7',
    name: 'Baby Leaf Spinach',
    category: 'Leafy Greens',
    description: 'Nutrient-rich young spinach leaves, gently washed and chilled immediately post-harvest.',
    price: 2.90,
    unit: 'pack',
    quantity: 0,
    farmerName: 'Central Highland Greens',
    location: 'Nuwara Eliya Polyhouse',
    harvestDate: '2026-10-12',
    isOrganicVerified: true,
    minOrderQuantity: 1,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    deliveryOptions: { homeDelivery: true, farmPickup: true },
  },
  {
    _id: 'crop-8',
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
    deliveryOptions: { homeDelivery: true, farmPickup: true },
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

export const MarketplaceView = ({ currentUser }) => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('smartgrow_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutFulfillmentMethod, setCheckoutFulfillmentMethod] = useState('delivery');
  const [cartCalculationData, setCartCalculationData] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [activeModalCrop, setActiveModalCrop] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [notification, setNotification] = useState(null);

  // Sync cartItems with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartgrow_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Could not persist cart to localStorage:', e);
    }
  }, [cartItems]);

  // Farmer Studio view toggle
  const [isFarmerStudioOpen, setIsFarmerStudioOpen] = useState(false);

  // Fetch real crops from MongoDB backend with live query params
  const fetchMarketplaceCrops = async (params = {}) => {
    try {
      setLoading(true);
      const queryParams = {
        search: params.search !== undefined ? params.search : searchQuery,
        category: (params.category !== undefined ? params.category : selectedCategory) !== 'all'
          ? (params.category !== undefined ? params.category : selectedCategory)
          : undefined,
        location: (params.location !== undefined ? params.location : locationFilter) || undefined,
        inStockOnly: (params.inStockOnly !== undefined ? params.inStockOnly : inStockOnly) ? true : undefined,
        minPrice: (params.minPrice !== undefined ? params.minPrice : minPrice) || undefined,
        maxPrice: (params.maxPrice !== undefined ? params.maxPrice : maxPrice) || undefined,
        sortBy: params.sortBy !== undefined ? params.sortBy : sortBy,
      };

      const res = await getProducts(queryParams);
      if (res && res.data && res.data.length > 0) {
        const backendCrops = res.data.map(p => ({
          ...p,
          id: p._id,
          image: p.images && p.images.length > 0 ? p.images[0] : p.image
        }));
        setCrops(backendCrops);
      } else if (res && res.success && Array.isArray(res.data)) {
        // Database returned 0 items for these specific search/filters
        setCrops([]);
      } else {
        setCrops(FALLBACK_CROPS);
      }
      setLoading(false);
    } catch (err) {
      console.warn('Backend products query failed, using verified fallback catalog:', err.message);
      setCrops(FALLBACK_CROPS);
      setLoading(false);
    }
  };

  // Live debounced search & filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMarketplaceCrops({
        search: searchQuery,
        category: selectedCategory,
        location: locationFilter,
        inStockOnly,
        minPrice,
        maxPrice,
        sortBy,
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, locationFilter, inStockOnly, minPrice, maxPrice, sortBy]);

  // Client-side quick filter pipeline (instantaneous response)
  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      if (selectedCategory !== 'all' && crop.category !== selectedCategory) {
        return false;
      }
      if (inStockOnly && crop.quantity <= 0) {
        return false;
      }
      if (locationFilter.trim() && !(crop.location || '').toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
      if (minPrice && crop.price < Number(minPrice)) {
        return false;
      }
      if (maxPrice && crop.price > Number(maxPrice)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (crop.name || '').toLowerCase().includes(q);
        const matchesFarmer = (crop.farmerName || '').toLowerCase().includes(q);
        const matchesLocation = (crop.location || '').toLowerCase().includes(q);
        const matchesDesc = (crop.description || '').toLowerCase().includes(q);
        return matchesName || matchesFarmer || matchesLocation || matchesDesc;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'stock-high') return (b.quantity || 0) - (a.quantity || 0);
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      return new Date(b.harvestDate || 0).getTime() - new Date(a.harvestDate || 0).getTime();
    });
  }, [crops, selectedCategory, locationFilter, minPrice, maxPrice, inStockOnly, searchQuery, sortBy]);

  // Handle Add to Cart action with quantity and stock bounds
  const handleAddToCart = (crop, qty = 1) => {
    const cropId = crop.id || crop._id;
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((it) => (it.productId || it.id || it._id) === cropId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = (updated[existingIdx].quantity || 1) + qty;
        const maxAvail = crop.quantity !== undefined ? crop.quantity : 999;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: Math.min(newQty, maxAvail),
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: cropId,
          id: cropId,
          _id: cropId,
          name: crop.name,
          category: crop.category,
          price: crop.price,
          unit: crop.unit,
          quantity: qty,
          availableStock: crop.quantity,
          farmerName: crop.farmerName || 'Verified Farm',
          location: crop.location || 'Greenhouse Bay',
          image: crop.image || (crop.images && crop.images[0]) || '',
        },
      ];
    });

    setNotification({
      type: 'success',
      message: `Added ${qty} ${crop.unit} of "${crop.name}" to your basket!`,
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Update item quantity in basket
  const handleUpdateCartQuantity = (productId, newQty) => {
    setCartItems((prev) =>
      prev.map((it) => {
        if ((it.productId || it.id || it._id) === productId) {
          return { ...it, quantity: newQty };
        }
        return it;
      })
    );
  };

  // Remove item from basket
  const handleRemoveCartItem = (productId) => {
    setCartItems((prev) =>
      prev.filter((it) => (it.productId || it.id || it._id) !== productId)
    );
  };

  // Proceed from Cart Drawer to Checkout Modal
  const handleProceedToCheckout = (calcData) => {
    setIsCartDrawerOpen(false);
    setCartCalculationData(calcData);
    setCheckoutFulfillmentMethod(calcData?.deliveryMethod || 'delivery');
    setIsCheckoutOpen(true);
  };

  // Submit Order to backend and process response
  const handlePlaceOrder = async (orderPayload) => {
    const res = await createOrder(orderPayload);
    if (res && res.success && res.order) {
      setConfirmedOrder(res.order);
      setCartItems([]);
      try {
        localStorage.removeItem('smartgrow_cart');
      } catch (e) {
        console.warn('Failed to clear cart storage:', e);
      }
      setIsCheckoutOpen(false);
      setIsConfirmationOpen(true);
      fetchMarketplaceCrops();
      setNotification({
        type: 'success',
        message: `Order #${res.order.orderNumber} successfully placed!`,
      });
      setTimeout(() => setNotification(null), 4000);
    } else {
      throw new Error(res?.error || 'Failed to place order');
    }
  };

  // Open details modal
  const handleOpenDetails = (crop) => {
    setActiveModalCrop(crop);
    setModalQuantity(crop.minOrderQuantity || 1);
  };

  // If farmer opened their management studio, render it
  if (isFarmerStudioOpen && currentUser?.role === 'farmer') {
    return (
      <FarmerProductManager
        currentUser={currentUser}
        onBackToMarketplace={() => {
          setIsFarmerStudioOpen(false);
          fetchMarketplaceCrops();
        }}
      />
    );
  }

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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/70 via-white/[0.08] to-emerald-900/50 backdrop-blur-2xl border border-white/20 p-6 sm:p-10 shadow-2xl">
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
                <span>Eco-Bay Local Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Action / Role Portal Access */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* My Orders / Tracking Button */}
              <button
                onClick={() => setIsOrdersModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 group text-white"
                title="Track order status and history"
              >
                <Package className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white/90">My Orders</span>
              </button>

              {/* Interactive Cart Button */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 group"
                title="Open shopping cart basket"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white/80">Basket:</span>
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 shadow-sm">
                  {cartItems.reduce((acc, it) => acc + (it.quantity || 1), 0)} items
                </span>
              </button>
            </div>

            {/* Farmer Listing Studio Shortcut */}
            {currentUser && currentUser.role === 'farmer' && (
              <button
                onClick={() => setIsFarmerStudioOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105"
              >
                <Store className="w-4 h-4 stroke-[2.5]" />
                <span>Farmer Studio • Manage Listings</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter, Search & Categories Controls */}
      <div className="space-y-4">
        {/* Search Input, Filter Button & Sort Options Bar */}
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

          {/* Controls: Filter Drawer Toggle, Stock Toggle & Sort Dropdown */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Advanced Filter Toggle Button */}
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                showFilterPanel || locationFilter || minPrice || maxPrice
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-md'
                  : 'bg-white/[0.06] text-white/80 border-white/15 hover:bg-white/10'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(locationFilter || minPrice || maxPrice) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

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
                <option value="stock-high">Highest Stock</option>
                <option value="name-asc">Crop Name (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Filters (Location & Price Range) */}
        {showFilterPanel && (
          <div className="p-4 sm:p-5 rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/15 shadow-xl space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Advanced Crop Filters
              </span>
              <button
                onClick={() => {
                  setLocationFilter('');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="text-xs text-white/50 hover:text-white underline cursor-pointer"
              >
                Clear Advanced
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Location Input & Quick Chips */}
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                  Farm Region / District
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="e.g. Matara, Galle, Nuwara Eliya..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {['Matara', 'Galle', 'Nuwara Eliya'].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setLocationFilter(locationFilter === loc ? '' : loc)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        locationFilter.toLowerCase() === loc.toLowerCase()
                          ? 'bg-amber-400 text-amber-950 font-bold border-amber-300'
                          : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1.5">
                  Price Range per Unit ($)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Min $"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 px-3 py-1.5 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-white/40 text-xs">to</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Max $"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 px-3 py-1.5 rounded-xl bg-white/[0.08] border border-white/15 text-white placeholder-white/40 text-xs focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Quick Status / Stock Info */}
              <div className="flex flex-col justify-end">
                <span className="text-[11px] text-white/60 mb-2">
                  Displaying certified smart greenhouse harvests with guaranteed direct pricing.
                </span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Live Inventory Sync Active
                </span>
              </div>
            </div>
          </div>
        )}

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
        {(searchQuery || selectedCategory !== 'all' || inStockOnly || locationFilter || minPrice || maxPrice) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setLocationFilter('');
              setMinPrice('');
              setMaxPrice('');
              setInStockOnly(false);
              setSortBy('newest');
            }}
            className="text-emerald-300 hover:text-emerald-200 underline font-semibold cursor-pointer"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Crops Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
          <p className="text-emerald-300 font-semibold tracking-wide text-sm">
            Fetching Fresh Crop Harvests...
          </p>
        </div>
      ) : filteredCrops.length === 0 ? (
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
              key={crop.id || crop._id}
              crop={crop}
              onViewDetails={handleOpenDetails}
              onAddToCart={(item) => handleAddToCart(item, 1)}
            />
          ))}
        </div>
      )}

      {/* FULL CROP DETAILS MODAL (PAGE-GRADE VIEW) */}
      {activeModalCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-[#0f3824] border border-white/20 p-6 sm:p-10 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
            {/* Ambient Modal Glow */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setActiveModalCrop(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15 z-10"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Body */}
            <div className="flex flex-col md:flex-row gap-8">
              {/* Image Preview & Badges */}
              <div className="w-full md:w-5/12 flex flex-col shrink-0">
                <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-black/40 border border-white/15 mb-4 shadow-xl">
                  {activeModalCrop.image ? (
                    <img
                      src={activeModalCrop.image}
                      alt={activeModalCrop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🌿
                    </div>
                  )}

                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-400/40 backdrop-blur-md">
                      {activeModalCrop.category}
                    </span>
                  </div>
                </div>

                {/* Delivery & Fulfillment Info */}
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <Truck className="w-4 h-4" />
                    <span>Fulfillment Options</span>
                  </div>
                  <div className="text-white/70 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Home Delivery:</span>
                      <span className="font-bold text-white">Available (1-2 Days)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Farm Gate Pickup:</span>
                      <span className="font-bold text-emerald-300">Free Collection</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crop Details Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {activeModalCrop.isOrganicVerified && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-emerald-950 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified Organic Harvest
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-white/50">
                      ID: {String(activeModalCrop.id || activeModalCrop._id).slice(-6)}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                    {activeModalCrop.name}
                  </h2>

                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-5">
                    {activeModalCrop.description}
                  </p>

                  {/* Metadata Matrix */}
                  <div className="grid grid-cols-2 gap-3 pb-5 mb-5 border-b border-white/10 text-xs text-white/80">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-white/40 block">Grower / Producer</span>
                      <div className="flex items-center gap-1.5 mt-0.5 font-bold text-white">
                        <Store className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="truncate">{activeModalCrop.farmerName || 'Verified Farm'}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-white/40 block">Origin Location</span>
                      <div className="flex items-center gap-1.5 mt-0.5 font-bold text-white">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span className="truncate">{activeModalCrop.location}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-white/40 block">Harvest Timestamp</span>
                      <div className="flex items-center gap-1.5 mt-0.5 font-bold text-white">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>
                          {activeModalCrop.harvestDate
                            ? new Date(activeModalCrop.harvestDate).toLocaleDateString()
                            : 'Fresh Daily'}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <span className="text-[10px] text-white/40 block">Current Stock</span>
                      <span className="mt-0.5 font-bold text-emerald-300 block">
                        {activeModalCrop.quantity} {activeModalCrop.unit} available
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price, Quantity Selector & Action Area */}
                <div>
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-xs text-white/50 block">Unit Price</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white">
                          ${typeof activeModalCrop.price === 'number' ? activeModalCrop.price.toFixed(2) : activeModalCrop.price}
                        </span>
                        <span className="text-sm font-semibold text-emerald-300">
                          / {activeModalCrop.unit}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    {activeModalCrop.quantity > 0 && (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-white/50 mb-1">Select Order Quantity</span>
                        <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-white">
                            {modalQuantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setModalQuantity((q) =>
                                Math.min(activeModalCrop.quantity, q + 1)
                              )
                            }
                            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Subtotal Calculation */}
                  {activeModalCrop.quantity > 0 && (
                    <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 mb-4 text-xs">
                      <span className="text-white/60">Estimated Total:</span>
                      <span className="text-base font-extrabold text-emerald-300">
                        ${(activeModalCrop.price * modalQuantity).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        handleAddToCart(activeModalCrop, modalQuantity);
                        setActiveModalCrop(null);
                      }}
                      disabled={activeModalCrop.quantity <= 0}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-white/30 text-emerald-950 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-102"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {activeModalCrop.quantity <= 0
                          ? 'Out of Stock'
                          : `Add ${modalQuantity} ${activeModalCrop.unit} to Cart`}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveModalCrop(null)}
                      className="py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer"
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

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        fulfillmentMethod={checkoutFulfillmentMethod}
        onChangeFulfillmentMethod={setCheckoutFulfillmentMethod}
        cartCalculation={cartCalculationData}
        currentUser={currentUser}
        onOrderSuccess={handlePlaceOrder}
      />

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={isConfirmationOpen}
        order={confirmedOrder}
        onClose={() => {
          setIsConfirmationOpen(false);
          setConfirmedOrder(null);
        }}
        onViewMyOrders={() => {
          setIsConfirmationOpen(false);
          setIsOrdersModalOpen(true);
        }}
      />

      {/* Customer Orders & Tracking Modal */}
      <CustomerOrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        currentUser={currentUser}
        onBrowseProduce={() => setIsOrdersModalOpen(false)}
      />
    </div>
  );
};

export default MarketplaceView;
