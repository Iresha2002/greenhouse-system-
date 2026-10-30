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

    if (crop.quantity <= 0) {
      setNotification({
        type: 'error',
        message: `"${crop.name}" is currently sold out and cannot be added to cart.`,
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const maxAvail = crop.quantity !== undefined ? crop.quantity : 999;
    let clamped = false;

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((it) => (it.productId || it.id || it._id) === cropId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const requestedTotal = (updated[existingIdx].quantity || 1) + qty;
        if (requestedTotal > maxAvail) {
          clamped = true;
        }
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: Math.min(requestedTotal, maxAvail),
        };
        return updated;
      }

      if (qty > maxAvail) {
        clamped = true;
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
          quantity: Math.min(qty, maxAvail),
          availableStock: crop.quantity,
          farmerName: crop.farmerName || 'Verified Farm',
          location: crop.location || 'Greenhouse Bay',
          image: crop.image || (crop.images && crop.images[0]) || '',
        },
      ];
    });

    if (clamped) {
      setNotification({
        type: 'warning',
        message: `Cart clamped to maximum available stock (${maxAvail} ${crop.unit}) for "${crop.name}".`,
      });
    } else {
      setNotification({
        type: 'success',
        message: `Added ${qty} ${crop.unit} of "${crop.name}" to your basket!`,
      });
    }
    setTimeout(() => setNotification(null), 3500);
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

      {/* Top Page Header matching Page 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Buy fresh crops
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/70 mt-1">
            Pick a crop, add it to your basket, then choose delivery or pickup.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser?.role === 'farmer' && (
            <button
              type="button"
              onClick={() => setIsFarmerStudioOpen(true)}
              className="px-4 py-2 rounded-full border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10 text-xs font-semibold cursor-pointer transition-colors"
            >
              Farmer studio
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOrdersModalOpen(true)}
            className="px-4 py-2 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/[0.14] text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            My orders
          </button>

          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className="px-4 py-2 rounded-full bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Basket ({cartItems.reduce((acc, it) => acc + (it.quantity || 1), 0)})</span>
          </button>
        </div>
      </div>

      {/* Filter, Search & Categories Controls matching Page 2 */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crop, grower or place"
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 text-xs sm:text-sm focus:outline-none focus:border-[#4de1b7] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              showFilterPanel || locationFilter || minPrice || maxPrice
                ? 'bg-[#4de1b7] text-slate-950 font-bold border-transparent'
                : 'bg-white/[0.08] hover:bg-white/[0.14] text-white/90 border border-white/10'
            }`}
          >
            Filters
          </button>

          <button
            type="button"
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              inStockOnly
                ? 'bg-[#4de1b7] text-slate-950 font-bold border-transparent'
                : 'bg-white/[0.08] hover:bg-white/[0.14] text-white/90 border border-white/10'
            }`}
          >
            In stock only
          </button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-[#4de1b7] cursor-pointer"
            >
              <option value="newest" className="bg-[#0b2821] text-white">
                Sort: Newest harvest ▾
              </option>
              <option value="price-low" className="bg-[#0b2821] text-white">
                Price: Low to High
              </option>
              <option value="price-high" className="bg-[#0b2821] text-white">
                Price: High to Low
              </option>
              <option value="stock-high" className="bg-[#0b2821] text-white">
                Highest Stock
              </option>
            </select>
          </div>
        </div>

        {/* Category Pills matching Page 2: All produce, Vegetables, Fruits, Leafy greens, Herbs, Other */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All produce' },
            { id: 'Vegetables', label: 'Vegetables' },
            { id: 'Fruits', label: 'Fruits' },
            { id: 'Leafy Greens', label: 'Leafy greens' },
            { id: 'Herbs', label: 'Herbs' },
            { id: 'Other Produce', label: 'Other' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#4de1b7] text-slate-950 font-bold border-transparent shadow-sm'
                    : 'bg-white/[0.08] hover:bg-white/[0.14] text-white/90 border-white/10'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
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

      {/* Crops Results Header matching Page 2 */}
      <div className="flex items-center justify-between text-sm font-bold text-white px-1">
        <span>
          {filteredCrops.length} {filteredCrops.length === 1 ? 'crop' : 'crops'} available
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
            className="text-emerald-300 hover:text-emerald-200 underline text-xs font-semibold cursor-pointer"
          >
            Reset Filters
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
        <div className="rounded-2xl bg-white/[0.05] border border-white/15 p-16 text-center shadow-xl">
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
            className="px-5 py-2.5 rounded-full bg-[#4de1b7] text-slate-950 font-bold text-xs hover:bg-[#3bc7a1] transition-all cursor-pointer shadow-md"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

      {/* FULL CROP DETAILS MODAL (MATCHING PAGE 3 OF PDF) */}
      {activeModalCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-[#0f3830] border border-white/20 p-6 sm:p-8 shadow-2xl text-white max-h-[92vh] overflow-y-auto">
            {/* Top Navigation Row: Back to crops */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
              <button
                type="button"
                onClick={() => setActiveModalCrop(null)}
                className="text-xs sm:text-sm font-semibold text-emerald-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>← Back to crops</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModalCrop(null)}
                className="p-1 rounded-full text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Category tag & How you can get it */}
              <div className="md:col-span-4 space-y-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-white/[0.10] border border-white/10 text-xs font-semibold text-white/90">
                    {activeModalCrop.category || 'Vegetables'}
                  </span>
                </div>

                <div className="rounded-xl bg-[#0a2720] border border-white/10 p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                    How you can get it
                  </h4>
                  <div className="text-xs text-white/75 space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span>Home delivery</span>
                      <span className="text-emerald-400 font-semibold">1–2 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pick up at the farm</span>
                      <span className="text-emerald-400 font-semibold">Free</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Verified organic harvest ID, Name, Description, Specs Grid, Pricing */}
              <div className="md:col-span-8 space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-medium mb-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      Verified organic harvest ID:{' '}
                      <span className="font-mono text-white/90">
                        {String(activeModalCrop.id || activeModalCrop._id).slice(-6)}
                      </span>
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {activeModalCrop.name}
                  </h2>

                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed mt-1">
                    {activeModalCrop.description}
                  </p>
                </div>

                {/* Info Grid: Grower, Place, Harvested, In stock */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#0a2720] border border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] text-white/50 block">Grower</span>
                    <span className="font-bold text-white block mt-0.5 truncate">
                      {activeModalCrop.farmerName || 'farmer_john'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block">Place</span>
                    <span className="font-bold text-white block mt-0.5 truncate">
                      {activeModalCrop.location || 'Matara Eco Bay 1'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block">Harvested</span>
                    <span className="font-bold text-white block mt-0.5">
                      {activeModalCrop.harvestDate
                        ? new Date(activeModalCrop.harvestDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '16 Oct 2026'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block">In stock</span>
                    <span className="font-bold text-[#4de1b7] block mt-0.5">
                      {activeModalCrop.quantity} {activeModalCrop.unit || 'kg'}
                    </span>
                  </div>
                </div>

                {/* Price, Quantity Selector & Estimated Total */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-2xl font-extrabold text-white">
                        ${Number(activeModalCrop.price || 0).toFixed(2)}
                      </span>
                      <span className="text-xs text-white/70 ml-1">
                        per {activeModalCrop.unit || 'kg'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/70">Quantity</span>
                      <div className="flex items-center gap-2 bg-[#0a2720] border border-white/15 rounded-full px-2 py-1">
                        <button
                          type="button"
                          onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                        >
                          −
                        </button>
                        <span className="w-16 text-center text-xs font-bold text-white">
                          {modalQuantity} {activeModalCrop.unit || 'kg'}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setModalQuantity((q) =>
                              Math.min(activeModalCrop.quantity || 999, q + 1)
                            )
                          }
                          className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-white/70">
                    Estimated total{' '}
                    <span className="text-base font-bold text-white ml-1">
                      ${(Number(activeModalCrop.price || 0) * modalQuantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Actions: Add to cart & Close */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleAddToCart(activeModalCrop, modalQuantity);
                        setActiveModalCrop(null);
                      }}
                      disabled={activeModalCrop.quantity <= 0}
                      className="px-6 py-2.5 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm cursor-pointer transition-colors shadow-sm"
                    >
                      {activeModalCrop.quantity <= 0
                        ? 'Out of stock'
                        : `Add ${modalQuantity} ${activeModalCrop.unit || 'kg'} to cart`}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModalCrop(null)}
                      className="px-5 py-2.5 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/10 text-white font-bold text-xs sm:text-sm cursor-pointer transition-colors"
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
