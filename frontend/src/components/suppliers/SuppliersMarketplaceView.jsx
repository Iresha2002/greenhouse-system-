import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SupplyCard from './SupplyCard';
import { getSupplyProducts } from '../../services/api';
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
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Filter & Search States (Section 4.1 & 4.2)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSupplier, setSelectedSupplier] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'inStock'
  const [maxPrice, setMaxPrice] = useState(150);
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'newest' | 'priceAsc' | 'priceDesc'
  const [activeCollectionTab, setActiveCollectionTab] = useState('all'); // 'all' | 'featured' | 'newArrivals'

  // Product Details Modal & Cart Preview Toast
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Fetch active supply products from MongoDB backend
  const fetchSuppliesCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSupplyProducts({ limit: 100 });
      if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
        const normalized = response.data.map((item, idx) => ({
          ...item,
          image:
            item.image ||
            (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : ''),
          isNewArrival: item.isNewArrival !== undefined ? item.isNewArrival : idx < 4,
        }));
        setSupplies(normalized);
        setIsUsingFallback(false);
      } else {
        setSupplies(SAMPLE_SUPPLIES_CATALOG);
        setIsUsingFallback(true);
      }
    } catch (err) {
      console.warn('Backend /api/supplies unreachable, falling back to local sample catalog:', err.message);
      setSupplies(SAMPLE_SUPPLIES_CATALOG);
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliesCatalog();
  }, [fetchSuppliesCatalog]);

  // Extract unique suppliers & brands from actual catalog data
  const uniqueSuppliers = useMemo(() => {
    const names = supplies.map((s) => s.supplierName).filter(Boolean);
    return ['All', ...Array.from(new Set(names))];
  }, [supplies]);

  const uniqueBrands = useMemo(() => {
    const brands = supplies.map((s) => s.brand).filter(Boolean);
    return ['All', ...Array.from(new Set(brands))];
  }, [supplies]);

  // Filter & Sort supplies
  const filteredSupplies = useMemo(() => {
    return supplies
      .filter((item) => {
        // Collection tab filter
        if (activeCollectionTab === 'featured' && !item.isFeatured) return false;
        if (activeCollectionTab === 'newArrivals' && !item.isNewArrival) return false;

        // Category filter
        if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

        // Supplier filter
        if (selectedSupplier !== 'All' && item.supplierName !== selectedSupplier) return false;

        // Brand filter
        if (selectedBrand !== 'All' && item.brand !== selectedBrand) return false;

        // Availability filter
        if (availabilityFilter === 'inStock' && item.quantity <= 0) return false;

        // Price filter
        if (item.price > maxPrice) return false;

        // Search by product name, brand, model, or supplier
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchName = item.name?.toLowerCase().includes(q);
          const matchBrand = item.brand?.toLowerCase().includes(q);
          const matchModel = item.model?.toLowerCase().includes(q);
          const matchSupplier = item.supplierName?.toLowerCase().includes(q);
          const matchCategory = item.category?.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchModel && !matchSupplier && !matchCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.price - b.price;
        if (sortBy === 'priceDesc') return b.price - a.price;
        if (sortBy === 'newest') return (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0);
        // default 'featured'
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [
    supplies,
    activeCollectionTab,
    selectedCategory,
    selectedSupplier,
    selectedBrand,
    availabilityFilter,
    maxPrice,
    searchQuery,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSupplier('All');
    setSelectedBrand('All');
    setAvailabilityFilter('all');
    setMaxPrice(150);
    setSortBy('featured');
    setActiveCollectionTab('all');
  };

  const handleOpenDetails = (supply) => {
    setSelectedSupply(supply);
    setDetailQty(supply.minOrderQuantity || 1);
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

  const totalBasketItems = cartItems.reduce((sum, item) => sum + item.cartQuantity, 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-sky-950/95 border border-sky-400/50 text-white shadow-2xl backdrop-blur-xl animate-bounce">
          <CheckCircle className="w-5 h-5 text-sky-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e392d] via-[#124235] to-[#0c2d38] border border-sky-400/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-extrabold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>B2B & Farmer Agricultural Supplies Exchange</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
              Certified Inputs, Automation & IoT Hardware
            </h2>
            <p className="text-sm sm:text-base text-white/75 leading-relaxed">
              Source calibrated water-soluble NPK fertilizers, F1 greenhouse seeds, brass solenoid valves,
              RS485 soil sensors, and closed-loop hydroponic dosing systems directly from verified suppliers.
            </p>
          </div>

          {/* Right Quick Stats & Basket Counter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md">
              <span className="text-[11px] uppercase tracking-wider text-white/50 font-bold block">
                Catalog Categories
              </span>
              <span className="text-xl font-extrabold text-sky-300">10 Sectors</span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-white/[0.07] border border-white/15 backdrop-blur-md">
              <span className="text-[11px] uppercase tracking-wider text-white/50 font-bold block">
                Active Listings
              </span>
              <span className="text-xl font-extrabold text-emerald-300">
                {supplies.length} Products
              </span>
            </div>

            <button
              onClick={() =>
                showToast(
                  totalBasketItems > 0
                    ? `Supplies Basket has ${totalBasketItems} item(s). Full Cart & Checkout activates in Stage 7.`
                    : 'Your Supplies Basket is empty. Click "Add to Cart" on any supply card!'
                )
              }
              className="relative px-5 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all flex items-center gap-2.5 shadow-lg shadow-sky-500/25 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Supplies Basket</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-950 text-sky-300 text-xs font-black">
                {totalBasketItems}
              </span>
            </button>
          </div>
        </div>

        {/* Database Connection & Stage Status Banner */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-white/60">
          <div className="flex items-center gap-2">
            {isUsingFallback ? (
              <>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold uppercase text-[10px]">
                  Offline Sample Fallback
                </span>
                <span>
                  Backend API unreachable — displaying fallback sample catalog.
                </span>
              </>
            ) : (
              <>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold uppercase text-[10px]">
                  Live MongoDB Catalog
                </span>
                <span>
                  Connected to /api/supplies — displaying real-time database inventory & technical specifications.
                </span>
              </>
            )}
            <button
              type="button"
              onClick={fetchSuppliesCatalog}
              className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-[11px] font-semibold transition-all cursor-pointer"
              title="Refresh supply catalog from MongoDB"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-sky-300' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
          {currentUser && (
            <span className="text-sky-300 font-semibold">
              Signed in as: {currentUser.fullName || currentUser.username} ({currentUser.role})
            </span>
          )}
        </div>
      </div>

      {/* Collection Tabs: All Supplies | Featured Supplies | New Arrivals */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 bg-white/[0.06] p-1.5 rounded-2xl border border-white/10">
          {[
            { id: 'all', label: 'All Agricultural Supplies' },
            { id: 'featured', label: '⭐ Featured Supplies' },
            { id: 'newArrivals', label: '🆕 New Arrivals' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCollectionTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCollectionTab === tab.id
                  ? 'bg-sky-500 text-slate-950 font-extrabold shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-white/60 font-medium">
          Showing <span className="text-white font-bold">{filteredSupplies.length}</span> of{' '}
          <span className="text-white font-bold">{supplies.length}</span> agricultural supplies
        </div>
      </div>

      {/* Configurable 10 Category Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-300/90 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            Browse by Agricultural Supply Category
          </span>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs text-sky-300 hover:text-sky-200 underline cursor-pointer"
            >
              Clear category ({selectedCategory})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {SUPPLY_CATEGORIES.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-lg shadow-sky-500/20 font-extrabold'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] text-white/80 border-white/10'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search, Filter & Sort Control Panel (Section 4.2) */}
      <div className="rounded-3xl bg-white/[0.07] backdrop-blur-xl border border-white/15 p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Input (Name, Brand, Model, Supplier) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by supply name, brand, model (e.g. RS485, NPK-19), or supplier..."
              aria-label="Search agricultural supplies"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-sky-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Supplier Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              aria-label="Filter by supplier"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              {uniqueSuppliers.map((sup) => (
                <option key={sup} value={sup} className="bg-slate-900 text-white">
                  {sup === 'All' ? 'All Suppliers' : `Supplier: ${sup}`}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              aria-label="Filter by brand"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400 cursor-pointer"
            >
              {uniqueBrands.map((brand) => (
                <option key={brand} value={brand} className="bg-slate-900 text-white">
                  {brand === 'All' ? 'All Brands' : `Brand: ${brand}`}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-2">
            <div className="relative">
              <ArrowUpDown className="w-3.5 h-3.5 text-sky-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort supplies"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-black/30 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="featured" className="bg-slate-900 text-white">
                  Sort: Featured
                </option>
                <option value="newest" className="bg-slate-900 text-white">
                  Sort: Newest
                </option>
                <option value="priceAsc" className="bg-slate-900 text-white">
                  Price: Low to High
                </option>
                <option value="priceDesc" className="bg-slate-900 text-white">
                  Price: High to Low
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Filter Row: Max Price Slider, Stock Toggle & Reset */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* Price Range Control */}
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-4 h-4 text-sky-400" />
              <label htmlFor="supply-price-range" className="text-xs text-white/80 font-semibold">
                Max Unit Price: <span className="text-sky-300 font-bold">${maxPrice}</span>
              </label>
              <input
                id="supply-price-range"
                type="range"
                min="5"
                max="150"
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-32 sm:w-44 accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setAvailabilityFilter((prev) => (prev === 'all' ? 'inStock' : 'all'))
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  availabilityFilter === 'inStock'
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                    : 'bg-white/5 border-white/15 text-white/70 hover:text-white'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>In-Stock Only</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-white/60 hover:text-white font-semibold underline cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
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

      {/* Product Details Modal (Section 4.3: Technical Specs, Composition, Warranty, Compatibility) */}
      {selectedSupply && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
          onClick={() => setSelectedSupply(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-3xl bg-[#103326] border border-sky-400/30 p-6 sm:p-8 text-white shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSupply(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
              aria-label="Close product details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Image & Badges */}
              <div className="space-y-4">
                <div className="aspect-4/3 w-full rounded-2xl overflow-hidden bg-black/40 border border-white/15">
                  <img
                    src={
                      selectedSupply.image ||
                      (Array.isArray(selectedSupply.images) && selectedSupply.images.length > 0
                        ? selectedSupply.images[0]
                        : '')
                    }
                    alt={selectedSupply.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold">
                    {selectedSupply.category}
                  </span>
                  {selectedSupply.warranty && (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {selectedSupply.warranty}
                    </span>
                  )}
                </div>

                {/* Delivery & Collection Options */}
                <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-4 space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    Fulfilment & Delivery Options
                  </h4>
                  <div className="text-xs text-white/75 space-y-1">
                    {selectedSupply.deliveryOptions?.islandwideDelivery && (
                      <p>✓ Islandwide Agri-Courier Delivery available</p>
                    )}
                    {selectedSupply.deliveryOptions?.warehousePickup && (
                      <p>✓ Direct Supplier Warehouse Collection supported</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Core Info & Technical Specifications */}
              <div className="flex flex-col justify-between space-y-4">
                <div>
                  {(selectedSupply.brand || selectedSupply.model) && (
                    <div className="text-xs font-bold text-sky-300 mb-1 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        {[selectedSupply.brand, selectedSupply.model].filter(Boolean).join(' • ')}
                      </span>
                    </div>
                  )}

                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
                    {selectedSupply.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/75 leading-relaxed mb-4">
                    {selectedSupply.description}
                  </p>

                  {/* Supplier & Stock Summary */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-black/25 border border-white/10 text-xs mb-4">
                    <div>
                      <span className="text-white/50 block">Supplier</span>
                      <span className="font-bold text-white">{selectedSupply.supplierName}</span>
                      {selectedSupply.location && (
                        <span className="text-[11px] text-white/60 block">
                          {selectedSupply.location}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-white/50 block">Available Stock</span>
                      <span className="font-bold text-emerald-300">
                        {selectedSupply.quantity} {selectedSupply.unit}
                      </span>
                      <span className="text-[11px] text-white/60 block">
                        Min Order: {selectedSupply.minOrderQuantity || 1} {selectedSupply.unit}
                      </span>
                    </div>
                  </div>

                  {/* Supplied Technical or Agricultural Specifications */}
                  {selectedSupply.specifications && (
                    <div className="rounded-2xl bg-white/[0.05] border border-white/10 p-4 space-y-2 mb-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4" />
                        Supplied Product Specifications
                      </h4>
                      <dl className="space-y-1.5 text-xs">
                        {selectedSupply.specifications.composition && (
                          <div>
                            <dt className="text-white/50 font-semibold">Composition / Formula:</dt>
                            <dd className="text-white/90">{selectedSupply.specifications.composition}</dd>
                          </div>
                        )}
                        {selectedSupply.specifications.packageSize && (
                          <div>
                            <dt className="text-white/50 font-semibold">Packaging Size:</dt>
                            <dd className="text-white/90">{selectedSupply.specifications.packageSize}</dd>
                          </div>
                        )}
                        {selectedSupply.specifications.voltage && (
                          <div>
                            <dt className="text-white/50 font-semibold">Voltage & Power:</dt>
                            <dd className="text-white/90">
                              {selectedSupply.specifications.voltage}
                              {selectedSupply.specifications.powerRequirements
                                ? ` (${selectedSupply.specifications.powerRequirements})`
                                : ''}
                            </dd>
                          </div>
                        )}
                        {selectedSupply.specifications.communicationProtocol && (
                          <div>
                            <dt className="text-white/50 font-semibold">Communication Protocol:</dt>
                            <dd className="text-white/90">
                              {selectedSupply.specifications.communicationProtocol}
                            </dd>
                          </div>
                        )}
                        {selectedSupply.specifications.supportedInterfaces && (
                          <div>
                            <dt className="text-white/50 font-semibold">Supported Interfaces:</dt>
                            <dd className="text-white/90">
                              {selectedSupply.specifications.supportedInterfaces}
                            </dd>
                          </div>
                        )}
                        {selectedSupply.specifications.operatingConditions && (
                          <div>
                            <dt className="text-white/50 font-semibold">Operating Conditions:</dt>
                            <dd className="text-white/90">
                              {selectedSupply.specifications.operatingConditions}
                            </dd>
                          </div>
                        )}
                        {selectedSupply.specifications.compatibility && (
                          <div>
                            <dt className="text-white/50 font-semibold">Compatibility:</dt>
                            <dd className="text-sky-300">
                              {selectedSupply.specifications.compatibility}
                            </dd>
                          </div>
                        )}
                        {selectedSupply.specifications.applicationInstructions && (
                          <div>
                            <dt className="text-white/50 font-semibold">Usage Instructions:</dt>
                            <dd className="text-white/90">
                              {selectedSupply.specifications.applicationInstructions}
                            </dd>
                          </div>
                        )}
                        {selectedSupply.specifications.safetyPrecautions && (
                          <div>
                            <dt className="text-amber-300/80 font-semibold">Safety Precautions:</dt>
                            <dd className="text-amber-200/90">
                              {selectedSupply.specifications.safetyPrecautions}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>

                {/* Bottom Price & Quantity Selector */}
                <div className="pt-4 border-t border-white/15 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-white/50 block">Unit Price</span>
                      <span className="text-2xl font-extrabold text-white">
                        ${selectedSupply.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-sky-300 font-semibold">
                        {' '}
                        / {selectedSupply.unit}
                      </span>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 bg-black/30 border border-white/15 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() =>
                          setDetailQty((q) =>
                            Math.max(selectedSupply.minOrderQuantity || 1, q - 1)
                          )
                        }
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-extrabold">{detailQty}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setDetailQty((q) => Math.min(selectedSupply.quantity, q + 1))
                        }
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        handleAddToCart(selectedSupply, detailQty);
                        setSelectedSupply(null);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        Add {detailQty} to Basket ($
                        {(selectedSupply.price * detailQty).toFixed(2)})
                      </span>
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

export default SuppliersMarketplaceView;
