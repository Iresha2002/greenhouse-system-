import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SupplyCard from './SupplyCard';
import SupplyDetailsModal from './SupplyDetailsModal';
import SupplierProductManager from './SupplierProductManager';
import SupplyCartDrawer from './SupplyCartDrawer';
import SupplyCheckoutModal from './SupplyCheckoutModal';
import SupplyOrderConfirmationModal from './SupplyOrderConfirmationModal';
import CustomerSupplyOrdersModal from './CustomerSupplyOrdersModal';
import { CustomerSupplyProfileModal } from './CustomerSupplyProfileModal';
import { getSupplyProducts, getSupplyFacets, createSupplyOrder } from '../../services/api';
import {
  Search,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Sparkles,
  Layers,
  CheckCircle,
  X,
  MapPin,
  AlertCircle,
  Building2,
  SlidersHorizontal,
  Truck,
  ShieldCheck,
  Plus,
  Minus,
  Package,
  Cpu,
  Wrench,
  Sprout,
  Droplets,
  FlaskConical,
  Tag,
  RefreshCw,
  User,
} from 'lucide-react';

// Configurable Agricultural Supply Categories (Section 4.1)
export const SUPPLY_CATEGORIES = [
  { id: 'All', label: 'All Supplies', icon: Layers },
  { id: 'Seeds', label: 'Seeds', icon: Sprout },
  { id: 'Fertilizers', label: 'Fertilizers', icon: FlaskConical },
  { id: 'Crop Protection Products', label: 'Crop Protection Products', icon: ShieldCheck },
  { id: 'Irrigation Equipment', label: 'Irrigation Equipment', icon: Droplets },
  { id: 'Greenhouse Equipment', label: 'Greenhouse Equipment', icon: Building2 },
  { id: 'Smart Farming Devices', label: 'Smart Farming Devices', icon: Sparkles },
  { id: 'IoT Components', label: 'IoT Components', icon: Cpu },
  { id: 'Farming Tools', label: 'Farming Tools', icon: Wrench },
  { id: 'Growing Supplies', label: 'Growing Supplies', icon: Package },
  { id: 'Hydroponic Equipment', label: 'Hydroponic Equipment', icon: Droplets },
];

// Clearly labeled development sample catalog for Stage 2 UI testing (Section 3 & 4)
// Will be connected to MongoDB SupplyProduct API in Stage 3
const SAMPLE_SUPPLIES_CATALOG = [
  {
    _id: 'supply-sample-1',
    name: 'Calibrated Hydroponic NPK 19-19-19 Water-Soluble Fertilizer',
    category: 'Fertilizers',
    brand: 'AgroChem Lanka',
    model: 'NPK-19-PRO',
    supplierName: 'Ceylon AgriTech Nutrients',
    location: 'Colombo Industrial Zone',
    price: 24.50,
    unit: 'bag (5kg)',
    quantity: 42,
    lowStockThreshold: 8,
    minOrderQuantity: 1,
    isFeatured: true,
    isNewArrival: false,
    warranty: 'Quality Sealed',
    description:
      '100% chelated water-soluble balanced NPK fertilizer formulated for greenhouse drip fertigation and closed-loop hydroponic reservoirs. Prevents emitter clogging.',
    image:
      'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&auto=format&fit=crop&q=80',
    specifications: {
      composition: 'N 19% : P2O5 19% : K2O 19% + Chelated Micro-nutrients (Fe, Zn, Mn, B)',
      packageSize: '5 kg moisture-lock foil bag',
      applicationInstructions: 'Dissolve 1.5g - 2.0g per liter of irrigation water (Target EC: 1.6 - 2.2 mS/cm).',
      safetyPrecautions: 'Store in a cool, dry place below 30°C. Wear gloves when mixing concentrated stock solutions.',
    },
    deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
  },
  {
    _id: 'supply-sample-2',
    name: 'Industrial Brass Solenoid Valve (12V DC Normally Closed)',
    category: 'Irrigation Equipment',
    brand: 'HydroFlow Dynamics',
    model: 'HF-SV12-G34',
    supplierName: 'SmartGrow Automation Supplies',
    location: 'Kandy Tech Park',
    price: 18.90,
    unit: 'piece',
    quantity: 26,
    lowStockThreshold: 5,
    minOrderQuantity: 1,
    isFeatured: true,
    isNewArrival: true,
    warranty: '1 Year Warranty',
    description:
      'Heavy-duty forged brass solenoid valve for automated greenhouse irrigation zones and misting lines. Directly compatible with SmartGrow relay actuator modules.',
    image:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    specifications: {
      voltage: '12V DC (±10%)',
      powerRequirements: '15W / 1.25A peak hold',
      supportedInterfaces: 'G 3/4" BSP Threaded Port, 2-pin waterproof Molex lead',
      operatingConditions: 'Pressure: 0.02 - 0.8 MPa | Fluid Temp: 0°C to 85°C | IP65 Coil',
      compatibility: 'Compatible with SmartGrow OS Relay Nodes, ESP32/Arduino 12V MOSFET drivers, and PLC irrigation controllers.',
    },
    deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
  },
  {
    _id: 'supply-sample-3',
    name: 'Multi-Parameter Soil Moisture, EC & Temperature IoT Probe',
    category: 'IoT Components',
    brand: 'SenseCrop Telemetry',
    model: 'SC-RS485-3IN1',
    supplierName: 'SmartGrow Automation Supplies',
    location: 'Kandy Tech Park',
    price: 46.00,
    unit: 'kit',
    quantity: 14,
    lowStockThreshold: 5,
    minOrderQuantity: 1,
    isFeatured: true,
    isNewArrival: true,
    warranty: '2 Year Replacement',
    description:
      'Industrial 316L stainless-steel 3-probe soil telemetry sensor measuring volumetric water content, bulk electrical conductivity (EC), and root-zone temperature.',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    specifications: {
      voltage: '5V - 24V DC wide input',
      powerRequirements: '< 0.15W active measurement',
      communicationProtocol: 'RS485 Modbus-RTU / I2C Bridge included',
      supportedInterfaces: 'IP68 Epoxy-sealed housing with 5m shielded 4-core cable',
      operatingConditions: '-20°C to +70°C | 0-100% RH non-condensing',
      compatibility: 'Plug-and-play with SmartGrow Greenhouse Telemetry Node v2 and standard ESP32/STM32 UART gateways.',
    },
    deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
  },
  {
    _id: 'supply-sample-4',
    name: 'F1 Hybrid Greenhouse Salad Cucumber Seeds (Parthenocarpic)',
    category: 'Seeds',
    brand: 'TropiSeed Genetics',
    model: 'TS-CUC-F1-green',
    supplierName: 'GreenValley Seed Co.',
    location: 'Nuwara Eliya Highland Hub',
    price: 14.20,
    unit: 'pack (500 seeds)',
    quantity: 60,
    lowStockThreshold: 10,
    minOrderQuantity: 2,
    isFeatured: false,
    isNewArrival: true,
    warranty: '95% Germination Cert.',
    description:
      'High-yielding gynoecious parthenocarpic F1 cucumber seeds bred specifically for enclosed insect-netted greenhouses. Sets fruit without insect pollination.',
    image:
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=600&auto=format&fit=crop&q=80',
    specifications: {
      composition: 'Untreated Non-GMO F1 Hybrid Cucumis sativus seeds (Purity: 99.5%)',
      packageSize: '500 seeds hermetically sealed aluminum pouch',
      applicationInstructions: 'Sow in sterilized cocopeat plugs at 1.5cm depth. Optimal germination temp: 24°C - 28°C.',
    },
    deliveryOptions: { islandwideDelivery: true, warehousePickup: false },
  },
  {
    _id: 'supply-sample-5',
    name: 'UV-Stabilized 200-Micron Greenhouse Poly Film (Diffused)',
    category: 'Greenhouse Equipment',
    brand: 'PolyShield Agri',
    model: 'PS-UV200-6M',
    supplierName: 'Lanka PolyTunnel Structures',
    location: 'Kurunegala Supply Depot',
    price: 85.00,
    unit: 'roll (6m x 15m)',
    quantity: 4,
    lowStockThreshold: 5,
    minOrderQuantity: 1,
    isFeatured: false,
    isNewArrival: false,
    warranty: '3 Year UV Guarantee',
    description:
      '5-layer co-extruded polyethylene greenhouse cladding film with anti-drip inner coating and 88% PAR light transmission for uniform canopy illumination.',
    image:
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80',
    specifications: {
      packageSize: '6m width x 15m length (200 Micron thickness)',
      operatingConditions: 'Withstands wind loads up to 110 km/h and high tropical UV index',
      applicationInstructions: 'Install with smooth anti-drip side facing inside the greenhouse bay using PVC zig-zag lock profiles.',
    },
    deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
  },
  {
    _id: 'supply-sample-6',
    name: 'Automated Peristaltic Nutrient & pH Dosing Pump Controller',
    category: 'Hydroponic Equipment',
    brand: 'NutriPulse Labs',
    model: 'NP-DOSE-DUO',
    supplierName: 'SmartGrow Automation Supplies',
    location: 'Kandy Tech Park',
    price: 112.00,
    unit: 'system',
    quantity: 9,
    lowStockThreshold: 4,
    minOrderQuantity: 1,
    isFeatured: true,
    isNewArrival: true,
    warranty: '1 Year Warranty',
    description:
      'Dual-head precision peristaltic dosing pump with inline BNC pH & EC sensor ports. Automatically maintains target nutrient concentration in NFT hydroponic bays.',
    image:
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
    specifications: {
      voltage: '24V DC (AC/DC Adapter Included)',
      powerRequirements: '24W max',
      communicationProtocol: 'Wi-Fi MQTT + RS485 Telemetry Output',
      supportedInterfaces: '2x BNC Electrode Ports, Santoprene chemical-resistant peristaltic tubing (120 mL/min per head)',
      operatingConditions: '0°C to 50°C ambient | Acid/Alkali resistant tubing',
      compatibility: 'Direct integration with SmartGrow Hydroponic Closed-Loop Bay telemetry dashboard.',
    },
    deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
  },
  {
    _id: 'supply-sample-7',
    name: 'OMRI-Listed Cold-Pressed Neem Oil Bio-Insecticide (Azadirachtin 1500 ppm)',
    category: 'Crop Protection Products',
    brand: 'BioGuard Organics',
    model: 'BG-NEEM-1L',
    supplierName: 'Ceylon AgriTech Nutrients',
    location: 'Colombo Industrial Zone',
    price: 16.50,
    unit: 'bottle (1L)',
    quantity: 31,
    lowStockThreshold: 6,
    minOrderQuantity: 1,
    isFeatured: false,
    isNewArrival: false,
    warranty: 'Certified Bio-Input',
    description:
      'Broad-spectrum botanical crop protection emulsifiable concentrate for controlling whiteflies, aphids, thrips, and spider mites in organic greenhouses.',
    image:
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
    specifications: {
      composition: 'Cold-Pressed Neem Kernel Oil (Azadirachtin 0.15% EC / 1500 ppm) + Natural saponin emulsifier',
      packageSize: '1 Liter HDPE UV-opaque bottle with measuring cap',
      applicationInstructions: 'Dilute 3mL - 5mL per liter of water. Apply as fine foliar spray during early morning or dusk.',
      safetyPrecautions: 'Do not apply during peak sunlight (>32°C) to avoid leaf burn. Safe for zero-pre-harvest-interval (0-PHI) crops.',
    },
    deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
  },
  {
    _id: 'supply-sample-8',
    name: 'Washed Low-EC Buffered Coco Peat Grow Slabs (100x18x12 cm)',
    category: 'Growing Supplies',
    brand: 'CocoLanka Substrates',
    model: 'CL-SLAB-LOWEC',
    supplierName: 'GreenValley Seed Co.',
    location: 'Nuwara Eliya Highland Hub',
    price: 3.40,
    unit: 'slab',
    quantity: 150,
    lowStockThreshold: 25,
    minOrderQuantity: 10,
    isFeatured: false,
    isNewArrival: false,
    warranty: 'EC < 0.5 mS/cm Verified',
    description:
      'Triple-washed, calcium-buffered 70:30 coco peat to husk chip hydroponic grow bags with pre-cut plant holes and drainage slits for tomatoes and bell peppers.',
    image:
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80',
    specifications: {
      composition: '70% Buffered Coco Peat + 30% Crush Husk Chips (pH 5.8 - 6.4, EC < 0.5 mS/cm)',
      packageSize: 'Compressed 2.2kg slab (Expands to 100cm x 18cm x 12cm upon hydration)',
      applicationInstructions: 'Hydrate with 14 liters of calcium-nitrate nutrient solution before transplanting seedlings.',
    },
    deliveryOptions: { islandwideDelivery: true, warehousePickup: true },
  },
];

export const SuppliersMarketplaceView = ({ currentUser }) => {
  // Catalog state backed by MongoDB /api/supplies with graceful offline fallback
  const [supplies, setSupplies] = useState([]);
  const [totalMatchingCount, setTotalMatchingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Dynamic facets from backend (/api/supplies/facets)
  const [facetSuppliers, setFacetSuppliers] = useState([]);
  const [facetBrands, setFacetBrands] = useState([]);
  const [maxCatalogPrice, setMaxCatalogPrice] = useState(150);

  // Filter & Search States (Section 4.1 & 4.2)
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'inStock'
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(150);
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'newest' | 'priceAsc' | 'priceDesc'
  const [activeCollectionTab, setActiveCollectionTab] = useState('all'); // 'all' | 'featured' | 'newArrivals'

  // Product Details Modal, Supplier Studio View, Cart Drawer, Checkout & Order History Modals
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [isSupplierStudioOpen, setIsSupplierStudioOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [confirmedSupplyOrder, setConfirmedSupplyOrder] = useState(null);
  const [isCustomerOrdersOpen, setIsCustomerOrdersOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('smartgrow_supplies_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [toastMessage, setToastMessage] = useState(null);

  // Persist supplies basket in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smartgrow_supplies_cart', JSON.stringify(cartItems));
    } catch {
      // Ignore storage quota errors
    }
  }, [cartItems]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Debounce search input by 250ms before querying backend
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load supplier & brand facets once on mount
  useEffect(() => {
    const loadFacets = async () => {
      try {
        const res = await getSupplyFacets();
        if (res && res.success && res.data) {
          setFacetSuppliers(res.data.suppliers || []);
          setFacetBrands(res.data.brands || []);
          if (res.data.maxCatalogPrice) {
            setMaxCatalogPrice(res.data.maxCatalogPrice);
            setMaxPrice(res.data.maxCatalogPrice);
          }
        }
      } catch {
        // Fallback facets derived locally if offline
      }
    };
    loadFacets();
  }, []);

  // Fetch filtered & sorted supply products from MongoDB backend
  const fetchSuppliesCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: 100,
        sortBy,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedSupplier !== 'All') params.supplier = selectedSupplier;
      if (selectedBrand !== 'All') params.brand = selectedBrand;
      if (availabilityFilter === 'inStock') params.inStockOnly = 'true';
      if (activeCollectionTab === 'featured') params.featuredOnly = 'true';
      if (minPrice > 0) params.minPrice = minPrice;
      if (maxPrice < maxCatalogPrice) params.maxPrice = maxPrice;

      const response = await getSupplyProducts(params);
      if (response && response.success && Array.isArray(response.data)) {
        const normalized = response.data.map((item, idx) => ({
          ...item,
          image:
            item.image ||
            (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : ''),
          isNewArrival: item.isNewArrival !== undefined ? item.isNewArrival : idx < 4,
        }));
        setSupplies(normalized);
        setTotalMatchingCount(response.total ?? normalized.length);
        setIsUsingFallback(false);
      } else {
        setSupplies(SAMPLE_SUPPLIES_CATALOG);
        setTotalMatchingCount(SAMPLE_SUPPLIES_CATALOG.length);
        setIsUsingFallback(true);
      }
    } catch (err) {
      console.warn('Backend /api/supplies unreachable, falling back to local sample catalog:', err.message);
      setSupplies(SAMPLE_SUPPLIES_CATALOG);
      setTotalMatchingCount(SAMPLE_SUPPLIES_CATALOG.length);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    selectedCategory,
    selectedSupplier,
    selectedBrand,
    availabilityFilter,
    activeCollectionTab,
    minPrice,
    maxPrice,
    maxCatalogPrice,
    sortBy,
  ]);

  useEffect(() => {
    fetchSuppliesCatalog();
  }, [fetchSuppliesCatalog]);

  // Unique suppliers & brands (from backend facets or local catalog fallback)
  const uniqueSuppliers = useMemo(() => {
    if (facetSuppliers.length > 0) return ['All', ...facetSuppliers];
    const names = supplies.map((s) => s.supplierName).filter(Boolean);
    return ['All', ...Array.from(new Set(names))];
  }, [facetSuppliers, supplies]);

  const uniqueBrands = useMemo(() => {
    if (facetBrands.length > 0) return ['All', ...facetBrands];
    const brands = supplies.map((s) => s.brand).filter(Boolean);
    return ['All', ...Array.from(new Set(brands))];
  }, [facetBrands, supplies]);

  // Final list (applies client-side filtering as well if offline fallback is active)
  const filteredSupplies = useMemo(() => {
    return supplies
      .filter((item) => {
        if (activeCollectionTab === 'featured' && !item.isFeatured) return false;
        if (activeCollectionTab === 'newArrivals' && !item.isNewArrival) return false;
        if (activeCollectionTab === 'bestSelling' && !(item.totalUnitsSold > 0)) return false;
        if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
        if (selectedSupplier !== 'All' && item.supplierName !== selectedSupplier) return false;
        if (selectedBrand !== 'All' && item.brand !== selectedBrand) return false;
        if (availabilityFilter === 'inStock' && item.quantity <= 0) return false;
        if (item.price < minPrice || item.price > maxPrice) return false;

        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = item.name?.toLowerCase().includes(q);
          const matchBrand = item.brand?.toLowerCase().includes(q);
          const matchModel = item.model?.toLowerCase().includes(q);
          const matchSku = item.sku?.toLowerCase().includes(q);
          const matchSupplier = item.supplierName?.toLowerCase().includes(q);
          const matchCategory = item.category?.toLowerCase().includes(q);
          if (
            !matchName &&
            !matchBrand &&
            !matchModel &&
            !matchSku &&
            !matchSupplier &&
            !matchCategory
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.price - b.price;
        if (sortBy === 'priceDesc') return b.price - a.price;
        if (sortBy === 'popular' || activeCollectionTab === 'bestSelling') {
          return (b.totalUnitsSold || 0) - (a.totalUnitsSold || 0);
        }
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [
    supplies,
    activeCollectionTab,
    selectedCategory,
    selectedSupplier,
    selectedBrand,
    availabilityFilter,
    minPrice,
    maxPrice,
    searchQuery,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setSelectedCategory('All');
    setSelectedSupplier('All');
    setSelectedBrand('All');
    setAvailabilityFilter('all');
    setMinPrice(0);
    setMaxPrice(maxCatalogPrice);
    setSortBy('featured');
    setActiveCollectionTab('all');
  };

  const handleOpenDetails = (supply) => {
    setSelectedSupply(supply);
  };

  const handleBuyNow = (supply, qtyToBuy = null) => {
    handleAddToCart(supply, qtyToBuy);
    setSelectedSupply(null);
    setIsCartDrawerOpen(true);
  };

  const handleAddToCart = (supply, qtyToAdd = null) => {
    if (supply.quantity <= 0) return;
    const minQty = supply.minOrderQuantity || 1;
    const quantity = qtyToAdd || minQty;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i._id === supply._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const nextQty = Math.min(supply.quantity, updated[existingIndex].cartQuantity + quantity);
        updated[existingIndex] = { ...updated[existingIndex], cartQuantity: nextQty };
        return updated;
      }
      return [...prev, { ...supply, cartQuantity: Math.min(supply.quantity, quantity) }];
    });

    showToast(`Added ${quantity} × ${supply.name} to your Supplies Basket`);
  };

  const handleUpdateCartQuantity = (supplyId, nextQty) => {
    setCartItems((prev) =>
      prev.map((item) => {
        const id = item.supplyId || item.productId || item._id;
        if (id !== supplyId) return item;
        const minQty = item.minOrderQuantity || 1;
        const maxQty = item.quantity !== undefined ? item.quantity : 999;
        return {
          ...item,
          cartQuantity: Math.max(minQty, Math.min(maxQty, Number(nextQty) || minQty)),
        };
      })
    );
  };

  const handleRemoveCartItem = (supplyId) => {
    setCartItems((prev) =>
      prev.filter((item) => (item.supplyId || item.productId || item._id) !== supplyId)
    );
  };

  const handleProceedToCheckout = (summaryData) => {
    setCheckoutData(summaryData);
    setIsCartDrawerOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handlePlaceSupplyOrder = async (orderPayload) => {
    const res = await createSupplyOrder(orderPayload);
    if (res && res.success && res.order) {
      setCartItems([]);
      setIsCheckoutModalOpen(false);
      setConfirmedSupplyOrder(res.order);
      await fetchSuppliesCatalog();
    }
  };

  const totalBasketItems = cartItems.reduce((sum, item) => sum + item.cartQuantity, 0);

  // If user is a supplier and opened the Supplier Studio Portal
  if (isSupplierStudioOpen && currentUser?.role === 'supplier') {
    return (
      <SupplierProductManager
        currentUser={currentUser}
        onBackToMarketplace={() => setIsSupplierStudioOpen(false)}
        onCatalogChanged={fetchSuppliesCatalog}
      />
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-sky-950/95 border border-sky-400/50 text-white shadow-2xl backdrop-blur-xl animate-bounce">
          <CheckCircle className="w-5 h-5 text-sky-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header matching Page 6: Buy farm supplies */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Buy farm supplies
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Seeds, plant food, sensors and more. 10 sectors &middot; {supplies.length} products.
          </p>
        </div>

        {/* Action Pills matching Page 6: My profile, My orders, Basket */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {currentUser?.role === 'supplier' && (
            <button
              type="button"
              onClick={() => setIsSupplierStudioOpen(true)}
              className="px-4 py-2 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/10 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Supplier Studio
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/10 text-white font-bold text-xs transition-all cursor-pointer"
          >
            My profile
          </button>

          <button
            type="button"
            onClick={() => setIsCustomerOrdersOpen(true)}
            className="px-4 py-2 rounded-full border border-white/20 bg-white/[0.06] hover:bg-white/10 text-white font-bold text-xs transition-all cursor-pointer"
          >
            My orders
          </button>

          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className="px-5 py-2 rounded-full bg-[#4de1b7] hover:bg-[#3bc7a1] text-slate-950 font-extrabold text-xs transition-all cursor-pointer shadow-md"
          >
            Basket ({totalBasketItems})
          </button>
        </div>
      </div>

      {/* Live status line matching Page 6 */}
      <div className="flex items-center justify-between text-xs text-white/50 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span>
            {isUsingFallback ? 'Sample fallback catalog' : 'Live stock list'}
            {currentUser && ` · Signed in as ${currentUser.fullName || currentUser.username} (${currentUser.role})`}
          </span>
          <button
            type="button"
            onClick={fetchSuppliesCatalog}
            className="text-[#4de1b7] hover:underline cursor-pointer ml-2"
          >
            Refresh list
          </button>
        </div>
      </div>

      {/* Collection Pills: All supplies | Featured | Best sellers | New arrivals */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All supplies' },
          { id: 'featured', label: 'Featured' },
          { id: 'bestSelling', label: 'Best sellers' },
          { id: 'newArrivals', label: 'New arrivals' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCollectionTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCollectionTab === tab.id
                ? 'bg-white text-slate-950 font-black'
                : 'bg-white/[0.06] border border-white/15 text-white/80 hover:bg-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 10 Sector Category Pills matching Page 6 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-wrap">
        {[
          { id: 'All', label: 'All' },
          { id: 'Seeds', label: 'Seeds' },
          { id: 'Fertilizers', label: 'Fertilizers' },
          { id: 'Crop Protection Products', label: 'Crop protection' },
          { id: 'Irrigation Equipment', label: 'Irrigation' },
          { id: 'Greenhouse Equipment', label: 'Greenhouse equipment' },
          { id: 'Smart Farming Devices', label: 'Smart farming devices' },
          { id: 'IoT Components', label: 'IoT components' },
          { id: 'Hydroponic Equipment', label: 'Hydroponic equipment' },
          { id: 'Growing Supplies', label: 'Growing supplies' },
          { id: 'Farming Tools', label: 'Farming tools' },
        ].map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[#4de1b7] text-slate-950 shadow-md'
                  : 'bg-white/[0.07] border border-white/15 text-white/80 hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls matching Page 6 */}
      <div className="bg-white/[0.07] border border-white/15 backdrop-blur-md rounded-2xl p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search supplies"
            className="w-full pl-9 pr-3 py-2 rounded-full bg-white/[0.06] border border-white/15 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#4de1b7]"
          />
        </div>

        {/* Suppliers Dropdown */}
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="px-3.5 py-2 rounded-full bg-white/[0.06] border border-white/15 text-xs text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
        >
          {uniqueSuppliers.map((sup) => (
            <option key={sup} value={sup} className="bg-[#0b2821] text-white">
              {sup === 'All' ? 'All suppliers ▾' : sup}
            </option>
          ))}
        </select>

        {/* Brands Dropdown */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="px-3.5 py-2 rounded-full bg-white/[0.06] border border-white/15 text-xs text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
        >
          {uniqueBrands.map((brand) => (
            <option key={brand} value={brand} className="bg-[#0b2821] text-white">
              {brand === 'All' ? 'All brands ▾' : brand}
            </option>
          ))}
        </select>

        {/* Sort By Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3.5 py-2 rounded-full bg-white/[0.06] border border-white/15 text-xs text-white focus:outline-none focus:border-[#4de1b7] cursor-pointer"
        >
          <option value="featured" className="bg-[#0b2821] text-white">Sort: Featured ▾</option>
          <option value="popular" className="bg-[#0b2821] text-white">Sort: Best sellers ▾</option>
          <option value="newest" className="bg-[#0b2821] text-white">Sort: Newest ▾</option>
          <option value="priceAsc" className="bg-[#0b2821] text-white">Price: Low to High</option>
          <option value="priceDesc" className="bg-[#0b2821] text-white">Price: High to Low</option>
        </select>

        {/* In-stock toggle pill */}
        <button
          type="button"
          onClick={() => setAvailabilityFilter((prev) => (prev === 'all' ? 'inStock' : 'all'))}
          className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
            availabilityFilter === 'inStock'
              ? 'bg-[#4de1b7]/20 border-[#4de1b7] text-[#4de1b7]'
              : 'bg-white/[0.06] border-white/15 text-white/70 hover:bg-white/10'
          }`}
        >
          In stock only
        </button>

        {/* Price tag */}
        <span className="text-xs text-white/60 font-semibold px-2">
          Price $0 – ${maxPrice}
        </span>

        {/* Reset filters */}
        <button
          type="button"
          onClick={handleResetFilters}
          className="text-xs text-white/50 hover:text-white underline cursor-pointer ml-auto"
        >
          Reset filters
        </button>
      </div>

      {/* Showing count matching Page 6 */}
      <div className="text-xs text-white/60">
        Showing {filteredSupplies.length} of {supplies.length} supplies
      </div>

      {/* Product Grid, Loading State, or Empty State */}
      {loading ? (
        <div className="rounded-3xl bg-white/[0.06] border border-white/15 p-16 text-center max-w-xl mx-auto my-8">
          <div className="w-10 h-10 border-4 border-sky-400/20 border-t-sky-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sky-300 font-bold text-sm tracking-wide">
            Loading Agricultural Supplies Catalog from MongoDB...
          </p>
        </div>
      ) : filteredSupplies.length === 0 ? (
        <div className="rounded-3xl bg-white/[0.06] border border-white/15 p-12 text-center max-w-xl mx-auto my-8">
          <AlertCircle className="w-12 h-12 text-sky-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-xl font-bold text-white mb-2">
            No Matching Agricultural Supplies Found
          </h3>
          <p className="text-xs sm:text-sm text-white/65 mb-6">
            No supplies matched your current search or filter settings. Try broadening your price range or resetting the category filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Reset Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSupplies.map((supply) => (
            <SupplyCard
              key={supply._id}
              supply={supply}
              onViewDetails={handleOpenDetails}
              onAddToCart={(item) => handleAddToCart(item, item.minOrderQuantity || 1)}
            />
          ))}
        </div>
      )}

      {/* Dedicated Product Details View Modal (Section 4.3) */}
      <SupplyDetailsModal
        supply={selectedSupply}
        relatedSupplies={
          selectedSupply
            ? supplies.filter(
                (item) =>
                  item.category === selectedSupply.category &&
                  item._id !== selectedSupply._id
              )
            : []
        }
        onClose={() => setSelectedSupply(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onSelectRelated={(rel) => setSelectedSupply(rel)}
      />

      {/* Stage 7: Supplies Shopping Cart Drawer (Section 4.4) */}
      <SupplyCartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Stage 7: Supplies Checkout Modal (Section 4.5) */}
      <SupplyCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        initialFulfillmentMethod={checkoutData?.deliveryMethod || 'delivery'}
        validatedCart={checkoutData?.validatedCart || null}
        currentUser={currentUser}
        onPlaceSupplyOrder={handlePlaceSupplyOrder}
      />

      {/* Stage 8: Supply Order Confirmation Modal (Section 4.6) */}
      <SupplyOrderConfirmationModal
        isOpen={Boolean(confirmedSupplyOrder)}
        order={confirmedSupplyOrder}
        onClose={() => setConfirmedSupplyOrder(null)}
        onViewOrderHistory={() => {
          setConfirmedSupplyOrder(null);
          setIsCustomerOrdersOpen(true);
        }}
      />

      {/* Stage 8: Customer Supply Order History Modal (Section 4.7) */}
      <CustomerSupplyOrdersModal
        isOpen={isCustomerOrdersOpen}
        onClose={() => setIsCustomerOrdersOpen(false)}
        currentUser={currentUser}
        onOrderCancelled={fetchSuppliesCatalog}
      />

      {/* Stage 10: Customer Account Profile & Delivery Address Modal (Section 4.8) */}
      <CustomerSupplyProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onOpenOrderHistory={() => setIsCustomerOrdersOpen(true)}
      />
    </div>
  );
};

export default SuppliersMarketplaceView;
