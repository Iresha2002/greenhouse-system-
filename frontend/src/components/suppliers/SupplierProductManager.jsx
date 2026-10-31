import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Minus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Package,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  Save,
  Cpu,
  FlaskConical,
  Building2,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Layers,
  Tag,
  Truck,
  ClipboardList,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import {
  getMySupplyProducts,
  createSupplyProduct,
  updateSupplyProduct,
  toggleSupplyProductStatus,
  deleteSupplyProduct,
  updateSupplyProductStock,
  getSupplierIncomingOrders,
  updateSupplierOrderStatus,
} from '../../services/api';


const compressImageFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const CATEGORIES = [
  'Seeds',
  'Fertilizers',
  'Crop Protection Products',
  'Irrigation Equipment',
  'Greenhouse Equipment',
  'Smart Farming Devices',
  'IoT Components',
  'Farming Tools',
  'Growing Supplies',
  'Hydroponic Equipment',
];

const INITIAL_FORM = {
  name: '',
  category: 'Fertilizers',
  brand: '',
  model: '',
  sku: '',
  description: '',
  image: '',
  price: '',
  unit: 'piece',
  quantity: '',
  lowStockThreshold: 5,
  minOrderQuantity: 1,
  location: '',
  warranty: '',
  isFeatured: false,
  status: 'active',
  islandwideDelivery: true,
  warehousePickup: true,
  // Specifications
  composition: '',
  packageSize: '',
  voltage: '',
  powerRequirements: '',
  communicationProtocol: '',
  supportedInterfaces: '',
  operatingConditions: '',
  compatibility: '',
  applicationInstructions: '',
  safetyPrecautions: '',
};

export const SupplierProductManager = ({ currentUser, onBackToMarketplace, onCatalogChanged }) => {
  const [mySupplies, setMySupplies] = useState([]);
  const [metrics, setMetrics] = useState({
    totalListed: 0,
    activeCount: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Delete Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Stage 6: Inventory Filter & Quick Stock Editor State
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'lowStock' | 'outOfStock'
  const [stockEditId, setStockEditId] = useState(null);
  const [stockEditValue, setStockEditValue] = useState('');
  const [thresholdEditValue, setThresholdEditValue] = useState('');
  const [stockUpdatingId, setStockUpdatingId] = useState(null);

  // Stage 9: Supplier Portal Tab ('catalog' | 'orders') & Order Fulfilment State
  const [portalTab, setPortalTab] = useState('catalog');
  const [supplierOrders, setSupplierOrders] = useState([]);
  const [orderMetrics, setOrderMetrics] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [orderFilter, setOrderFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const notifySuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const fetchSupplierData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [suppliesRes, ordersRes] = await Promise.all([
        getMySupplyProducts(),
        getSupplierIncomingOrders().catch(() => null),
      ]);

      if (suppliesRes && suppliesRes.success) {
        setMySupplies(suppliesRes.data || []);
        if (suppliesRes.metrics) setMetrics(suppliesRes.metrics);
      }

      if (ordersRes && ordersRes.success) {
        setSupplierOrders(ordersRes.orders || []);
        if (ordersRes.metrics) setOrderMetrics(ordersRes.metrics);
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || 'Failed to load your supplier catalog. Ensure you are signed in as a Supplier.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupplierData();
  }, [fetchSupplierData]);


  const handleDirectImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setFormData((prev) => ({ ...prev, image: compressed }));
    } catch (err) {
      console.error('Image upload failed:', err);
      setErrorMsg('Failed to process image. Please try another photo.');
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...INITIAL_FORM,
      location: currentUser?.location || 'Colombo Supply Hub',
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (supply) => {
    setEditingId(supply._id);
    const primaryImage =
      supply.image ||
      (Array.isArray(supply.images) && supply.images.length > 0 ? supply.images[0] : '');

    setFormData({
      name: supply.name || '',
      category: supply.category || 'Fertilizers',
      brand: supply.brand || '',
      model: supply.model || '',
      sku: supply.sku || '',
      description: supply.description || '',
      image: primaryImage,
      price: supply.price ?? '',
      unit: supply.unit || 'piece',
      quantity: supply.quantity ?? '',
      lowStockThreshold: supply.lowStockThreshold ?? 5,
      minOrderQuantity: supply.minOrderQuantity ?? 1,
      location: supply.location || currentUser?.location || '',
      warranty: supply.warranty || '',
      isFeatured: Boolean(supply.isFeatured),
      status: supply.status || 'active',
      islandwideDelivery: supply.deliveryOptions?.islandwideDelivery ?? true,
      warehousePickup: supply.deliveryOptions?.warehousePickup ?? true,
      composition: supply.specifications?.composition || '',
      packageSize: supply.specifications?.packageSize || '',
      voltage: supply.specifications?.voltage || '',
      powerRequirements: supply.specifications?.powerRequirements || '',
      communicationProtocol: supply.specifications?.communicationProtocol || '',
      supportedInterfaces: supply.specifications?.supportedInterfaces || '',
      operatingConditions: supply.specifications?.operatingConditions || '',
      compatibility: supply.specifications?.compatibility || '',
      applicationInstructions: supply.specifications?.applicationInstructions || '',
      safetyPrecautions: supply.specifications?.safetyPrecautions || '',
    });
    setErrorMsg('');
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Frontend Validation
    if (!formData.name.trim()) {
      return setErrorMsg('Product name is required.');
    }
    const numPrice = Number(formData.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return setErrorMsg('Unit price must be a number greater than 0.');
    }
    const numQty = Number(formData.quantity);
    if (formData.quantity === '' || isNaN(numQty) || numQty < 0) {
      return setErrorMsg('Stock quantity must be 0 or greater.');
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      sku: formData.sku.trim(),
      description: formData.description.trim(),
      images: formData.image.trim() ? [formData.image.trim()] : [],
      price: numPrice,
      unit: formData.unit.trim() || 'piece',
      quantity: numQty,
      lowStockThreshold: Number(formData.lowStockThreshold) || 5,
      minOrderQuantity: Math.max(1, Number(formData.minOrderQuantity) || 1),
      location: formData.location.trim(),
      warranty: formData.warranty.trim(),
      isFeatured: Boolean(formData.isFeatured),
      status: formData.status,
      deliveryOptions: {
        islandwideDelivery: Boolean(formData.islandwideDelivery),
        warehousePickup: Boolean(formData.warehousePickup),
      },
      specifications: {
        composition: formData.composition.trim(),
        packageSize: formData.packageSize.trim(),
        voltage: formData.voltage.trim(),
        powerRequirements: formData.powerRequirements.trim(),
        communicationProtocol: formData.communicationProtocol.trim(),
        supportedInterfaces: formData.supportedInterfaces.trim(),
        operatingConditions: formData.operatingConditions.trim(),
        compatibility: formData.compatibility.trim(),
        applicationInstructions: formData.applicationInstructions.trim(),
        safetyPrecautions: formData.safetyPrecautions.trim(),
      },
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateSupplyProduct(editingId, payload);
        notifySuccess(`Updated "${payload.name}" successfully!`);
      } else {
        await createSupplyProduct(payload);
        notifySuccess(`Listed new supply "${payload.name}" in the marketplace!`);
      }
      setIsFormOpen(false);
      await fetchSupplierData();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to save agricultural supply listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (supply) => {
    const nextStatus = supply.status === 'active' ? 'inactive' : 'active';
    try {
      await toggleSupplyProductStatus(supply._id, nextStatus);
      notifySuccess(
        `"${supply.name}" is now ${nextStatus === 'active' ? 'Active (Visible to customers)' : 'Inactive (Hidden)'}`
      );
      await fetchSupplierData();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update product status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteSupplyProduct(deleteTarget._id);
      notifySuccess(`Deleted "${deleteTarget.name}" permanently.`);
      setDeleteTarget(null);
      await fetchSupplierData();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to delete supply product.');
    } finally {
      setSubmitting(false);
    }
  };

  // Stage 6: Quick Inventory Adjustment (+1 / -1 / Set Exact / Mark Sold Out)
  const handleQuickStockAdjust = async (supply, payload) => {
    setStockUpdatingId(supply._id);
    setErrorMsg('');
    try {
      const res = await updateSupplyProductStock(supply._id, payload);
      notifySuccess(res.message || `Updated stock for "${supply.name}".`);
      setStockEditId(null);
      await fetchSupplierData();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update inventory stock.');
    } finally {
      setStockUpdatingId(null);
    }
  };

  const openInlineStockEditor = (supply) => {
    setStockEditId(supply._id);
    setStockEditValue(String(supply.quantity ?? 0));
    setThresholdEditValue(String(supply.lowStockThreshold ?? 5));
  };

  // Stage 9: Supplier Order Fulfilment & Status Lifecycle Update
  const handleUpdateOrderStatus = async (orderId, nextStatus, statusLabel) => {
    setUpdatingOrderId(orderId);
    setErrorMsg('');
    try {
      const res = await updateSupplierOrderStatus(orderId, { status: nextStatus });
      notifySuccess(res.message || `Order updated to "${statusLabel}".`);
      await fetchSupplierData();
      if (onCatalogChanged) onCatalogChanged();
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error || `Failed to update order status to "${statusLabel}".`
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredSupplierItems = mySupplies.filter((item) => {
    if (stockFilter === 'outOfStock') return item.quantity <= 0;
    if (stockFilter === 'lowStock') {
      return item.quantity > 0 && item.quantity <= (item.lowStockThreshold || 5);
    }
    return true;
  });

  const filteredSupplierOrders = supplierOrders.filter((ord) => {
    if (orderFilter === 'pending') return ord.supplierStatus === 'pending';
    if (orderFilter === 'active') {
      return ['accepted', 'preparing', 'ready_for_dispatch', 'dispatched'].includes(
        ord.supplierStatus
      );
    }
    if (orderFilter === 'completed') return ord.supplierStatus === 'delivered';
    if (orderFilter === 'cancelled') {
      return ['cancelled', 'rejected'].includes(ord.supplierStatus);
    }
    return true;
  });

  const lowOrOutItems = mySupplies.filter(
    (item) => item.quantity <= (item.lowStockThreshold || 5)
  );

  return (
    <div className="space-y-8 pb-16">
      {/* Top Notification Banners */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-950/95 border border-emerald-400/50 text-white shadow-2xl backdrop-blur-xl">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{successMsg}</span>
        </div>
      )}

      {/* Supplier Studio Header Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>Authorized Supplier Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {currentUser?.username || 'Supplier'} — Catalog & Specification Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Manage your agricultural inputs, greenhouse hardware, technical datasheets, and live stock availability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBackToMarketplace}
              className="px-4 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Customer Storefront</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-full bg-[#0b3b2c] hover:bg-[#07291e] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Supply Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Dashboard KPI Cards (Section 5.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-1">
            <span>Total Listed Supplies</span>
            <Package className="w-4 h-4 text-slate-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{metrics.totalListed}</p>
          <span className="text-[11px] text-slate-400">Owned by your supplier account</span>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold uppercase mb-1">
            <span>Low-Stock Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-700">{metrics.lowStockCount}</p>
          <span className="text-[11px] text-slate-400">At or below alert threshold</span>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-rose-800 text-xs font-bold uppercase mb-1">
            <span>Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-3xl font-extrabold text-rose-700">{metrics.outOfStockCount}</p>
          <span className="text-[11px] text-slate-400">Requires restocking</span>
        </div>

        {/* Stage 9: Order Fulfilment & Sales KPI Row */}
        <div
          onClick={() => {
            setPortalTab('orders');
            setOrderFilter('pending');
          }}
          className="rounded-2xl bg-amber-50/80 border border-amber-200 p-5 cursor-pointer hover:bg-amber-100/70 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold uppercase mb-1">
            <span>Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-900">{orderMetrics.pendingOrders}</p>
          <span className="text-[11px] text-amber-700/80">Awaiting supplier acceptance</span>
        </div>

        <div
          onClick={() => {
            setPortalTab('orders');
            setOrderFilter('completed');
          }}
          className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-5 cursor-pointer hover:bg-emerald-100/70 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase mb-1">
            <span>Completed Orders</span>
            <ClipboardList className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-900">{orderMetrics.completedOrders}</p>
          <span className="text-[11px] text-emerald-700/80">Successfully delivered</span>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-1">
            <span>Delivered Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-950">
            ${Number(orderMetrics.totalRevenue || 0).toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400">Verified supplier sales total</span>
        </div>
      </div>

      {/* Stage 9: Supplier Portal Section Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPortalTab('catalog')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              portalTab === 'catalog'
                ? 'bg-[#0b3b2c] text-white shadow-xs font-extrabold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs font-semibold'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Supply Catalog & Inventory ({mySupplies.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setPortalTab('orders')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              portalTab === 'orders'
                ? 'bg-[#0b3b2c] text-white shadow-xs font-extrabold'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs font-semibold'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Incoming Supply Orders ({orderMetrics.totalOrders})</span>
            {orderMetrics.pendingOrders > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                {orderMetrics.pendingOrders} New
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={fetchSupplierData}
          className="px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          <span>Sync Live Data</span>
        </button>
      </div>

      {errorMsg && !isFormOpen && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-400/40 text-red-200 text-xs sm:text-sm font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Stage 6: Low-Stock & Out-of-Stock Alert Banner */}
      {portalTab === 'catalog' && lowOrOutItems.length > 0 && (
        <div className="rounded-3xl bg-amber-500/10 border border-amber-400/35 p-5 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-amber-300">
                Inventory Restock Attention Required ({lowOrOutItems.length} item
                {lowOrOutItems.length > 1 ? 's' : ''})
              </h4>
              <p className="text-xs text-white/75 mt-0.5">
                {lowOrOutItems
                  .map(
                    (i) =>
                      `${i.name} (${i.quantity} ${i.unit} left, alert ≤ ${
                        i.lowStockThreshold || 5
                      })`
                  )
                  .join('  •  ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                setStockFilter((prev) => (prev === 'lowStock' ? 'all' : 'lowStock'))
              }
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                stockFilter === 'lowStock'
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-amber-300 border-amber-400/30'
              }`}
            >
              {stockFilter === 'lowStock' ? 'Show All Products' : 'Filter Low Stock'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2 (Stage 9): Incoming Supply Orders & Fulfilment Lifecycle */}
      {portalTab === 'orders' ? (
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Incoming Customer Supply Orders ({filteredSupplierOrders.length})
              </h3>
              <p className="text-xs text-slate-500">
                Manage order acceptance, warehouse preparation, islandwide dispatch, and final delivery confirmation for items supplied by {currentUser?.username}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: `All (${supplierOrders.length})` },
                { id: 'pending', label: `Pending (${orderMetrics.pendingOrders})` },
                { id: 'active', label: `Active (${orderMetrics.activeOrders})` },
                { id: 'completed', label: `Delivered (${orderMetrics.completedOrders})` },
                { id: 'cancelled', label: 'Cancelled / Rejected' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOrderFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    orderFilter === tab.id
                      ? 'bg-[#0b3b2c] text-white font-extrabold shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs font-semibold'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-14 text-center">
              <div className="w-9 h-9 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-emerald-800">Loading incoming supply orders...</p>
            </div>
          ) : filteredSupplierOrders.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Truck className="w-12 h-12 text-emerald-600/70 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900">No Incoming Supply Orders Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When farmers or greenhouse operators purchase your agricultural supplies, their orders and delivery addresses will appear here for fulfilment.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredSupplierOrders.map((order) => {
                const status = order.supplierStatus || order.orderStatus || 'pending';
                const isUpdating = updatingOrderId === order._id;

                const statusStyles = {
                  pending: 'bg-amber-50 text-amber-800 border-amber-200',
                  accepted: 'bg-blue-50 text-blue-800 border-blue-200',
                  preparing: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                  ready_for_dispatch: 'bg-purple-50 text-purple-800 border-purple-200',
                  dispatched: 'bg-cyan-50 text-cyan-800 border-cyan-200',
                  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  cancelled: 'bg-rose-50 text-rose-800 border-rose-200',
                  rejected: 'bg-rose-50 text-rose-800 border-rose-200',
                };

                const statusLabels = {
                  pending: 'Pending Acceptance',
                  accepted: 'Accepted',
                  preparing: 'Preparing in Warehouse',
                  ready_for_dispatch: 'Ready for Dispatch / Pickup',
                  dispatched: 'Dispatched / Out for Delivery',
                  delivered: 'Delivered & Completed',
                  cancelled: 'Cancelled by Customer',
                  rejected: 'Rejected by Supplier',
                };

                return (
                  <div key={order._id} className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors space-y-4">
                    {/* Top Row: Order Number, Date, Fulfilment Status, Supplier Revenue */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs sm:text-sm font-extrabold text-slate-900">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-slate-500">
                          Placed {new Date(order.createdAt).toLocaleString()}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                            statusStyles[status] || statusStyles.pending
                          }`}
                        >
                          {statusLabels[status] || status}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Your Supplier Allocation</span>
                        <span className="text-lg font-black text-slate-950">
                          ${Number(order.supplierSubtotal || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Middle Grid: Customer Delivery Info + Ordered Items for this Supplier */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Customer & Delivery Details */}
                      <div className="lg:col-span-5 rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 mb-1">
                          Customer & Fulfilment Details
                        </p>
                        <div className="flex items-center gap-2 text-slate-900 font-semibold">
                          <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{order.customerInfo?.name || order.customerName || 'Customer'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{order.customerInfo?.phone || order.contactPhone || 'N/A'}</span>
                        </div>
                        <div className="flex items-start gap-2 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            {order.fulfillmentMethod === 'pickup' ||
                            order.deliveryMethod === 'warehouse_pickup'
                              ? `Warehouse Collection (${order.customerInfo?.district || order.district || ''})`
                              : `${order.customerInfo?.address || order.deliveryAddress || ''}, ${
                                  order.customerInfo?.district || order.district || ''
                                }`}
                          </span>
                        </div>
                        <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold shadow-2xs">
                            {order.fulfillmentMethod === 'pickup' ||
                            order.deliveryMethod === 'warehouse_pickup'
                              ? '🏢 Warehouse Pickup'
                              : '🚚 Islandwide Delivery'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold shadow-2xs">
                            💳{' '}
                            {order.paymentMethod === 'pay_on_pickup' ||
                            order.paymentMethod === 'pay_on_collection'
                              ? 'Pay on Collection'
                              : 'Cash on Delivery'}
                          </span>
                        </div>
                        {(order.customerInfo?.notes || order.notes) && (
                          <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2 mt-2">
                            <strong>Note:</strong> {order.customerInfo?.notes || order.notes}
                          </p>
                        )}
                      </div>

                      {/* Ordered Items Owned by This Supplier */}
                      <div className="lg:col-span-7 rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-2.5">
                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                          Items Ordered From Your Catalog ({(order.myItems || []).length})
                        </p>
                        <div className="divide-y divide-slate-200">
                          {(order.myItems || []).map((item, idx) => (
                            <div key={idx} className="py-2 flex items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-3 min-w-0">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                    📦
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate">{item.name}</p>
                                  <p className="text-[11px] text-slate-500">
                                    {item.category} • ${Number(item.price || item.unitPrice || 0).toFixed(2)} / {item.unit}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                                  Qty: {item.quantity} {item.unit}
                                </span>
                                <p className="text-xs font-black text-slate-900 mt-1">
                                  ${Number(item.itemTotal || item.lineTotal || (item.price || 0) * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar: Order Status Lifecycle Transitions */}
                    {status !== 'cancelled' && status !== 'rejected' && status !== 'delivered' && (
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">
                          Update Fulfilment Stage:
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          {status === 'pending' && (
                            <>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleUpdateOrderStatus(order._id, 'rejected', 'Rejected')
                                }
                                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-40 text-rose-700 text-xs font-bold cursor-pointer transition-all"
                              >
                                ✕ Reject Order
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleUpdateOrderStatus(order._id, 'accepted', 'Accepted')
                                }
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer shadow-xs transition-all"
                              >
                                ✓ Accept Order
                              </button>
                            </>
                          )}

                          {status === 'accepted' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  order._id,
                                  'preparing',
                                  'Preparing in Warehouse'
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer shadow-xs transition-all"
                            >
                              📦 Start Warehouse Preparation
                            </button>
                          )}

                          {status === 'preparing' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleUpdateOrderStatus(
                                  order._id,
                                  'ready_for_dispatch',
                                  'Ready for Dispatch / Collection'
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer shadow-xs transition-all"
                            >
                              🚚 Ready for Dispatch / Pickup
                            </button>
                          )}

                          {status === 'ready_for_dispatch' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleUpdateOrderStatus(order._id, 'dispatched', 'Dispatched')
                              }
                              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white text-xs font-bold cursor-pointer shadow-xs transition-all"
                            >
                              🚚 Mark Dispatched
                            </button>
                          )}

                          {(status === 'ready_for_dispatch' || status === 'dispatched') && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleUpdateOrderStatus(order._id, 'delivered', 'Delivered')
                              }
                              className="px-4 py-2 rounded-xl bg-[#0b3b2c] hover:bg-[#07291e] disabled:opacity-40 text-white text-xs font-extrabold cursor-pointer shadow-xs transition-all"
                            >
                              ✓ Confirm Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* TAB 1: Supplier Product Listings Table */
        <div className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Your Agricultural Supply Listings ({filteredSupplierItems.length})
              </h3>
              <p className="text-xs text-slate-500">
                Only products created by your supplier account ({currentUser?.email}) are shown here. Use inline controls to adjust stock in real time.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: `All (${mySupplies.length})` },
                { id: 'lowStock', label: `Low Stock (${metrics.lowStockCount})` },
                { id: 'outOfStock', label: `Out of Stock (${metrics.outOfStockCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStockFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    stockFilter === tab.id
                      ? 'bg-[#0b3b2c] text-white font-extrabold shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs font-semibold'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <button
                type="button"
                onClick={fetchSupplierData}
                className="p-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs cursor-pointer"
                title="Refresh supplier listings"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-14 text-center">
              <div className="w-9 h-9 border-4 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-emerald-800">Loading your supplier listings...</p>
            </div>
          ) : mySupplies.length === 0 ? (
            <div className="p-12 text-center space-y-4">
              <Package className="w-12 h-12 text-slate-400 mx-auto" />
              <div>
                <h4 className="text-lg font-bold text-slate-900">No Supply Products Listed Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Start building your agricultural catalog by adding seeds, fertilizers, plant supplements, or greenhouse equipment.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-5 py-2.5 rounded-full bg-[#0b3b2c] hover:bg-[#07291e] text-white font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-xs"
              >
                + Create First Supply Listing
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50">
                    <th className="py-3.5 px-4 font-bold">Product & Brand</th>
                    <th className="py-3.5 px-4 font-bold">Category</th>
                    <th className="py-3.5 px-4 font-bold">Unit Price</th>
                    <th className="py-3.5 px-4 font-bold">Stock Level</th>
                    <th className="py-3.5 px-4 font-bold">Visibility</th>
                    <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {filteredSupplierItems.map((item) => {
                    const thumb =
                      item.image ||
                      (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '');
                    const isOut = item.quantity <= 0;
                    const isLow = item.quantity > 0 && item.quantity <= (item.lowStockThreshold || 5);
                    const isUpdatingThis = stockUpdatingId === item._id;

                    return (
                      <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                              {thumb ? (
                                <img src={thumb} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>⚙️</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                              <p className="text-[11px] text-slate-500">
                                {[item.brand, item.model, item.sku ? `SKU: ${item.sku}` : '']
                                  .filter(Boolean)
                                  .join(' • ') || 'Standard Supply'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-extrabold text-slate-900">
                          ${Number(item.price).toFixed(2)}{' '}
                          <span className="text-xs font-normal text-slate-400">/ {item.unit}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          {stockEditId === item._id ? (
                            <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-300">
                              <div>
                                <span className="text-[10px] text-slate-500 block">Qty</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={stockEditValue}
                                  onChange={(e) => setStockEditValue(e.target.value)}
                                  className="w-16 px-2 py-1 rounded bg-white border border-slate-300 text-slate-900 text-xs font-bold"
                                />
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block">Low Alert</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={thresholdEditValue}
                                  onChange={(e) => setThresholdEditValue(e.target.value)}
                                  className="w-14 px-2 py-1 rounded bg-white border border-slate-300 text-amber-700 text-xs font-bold"
                                />
                              </div>
                              <button
                                type="button"
                                disabled={isUpdatingThis}
                                onClick={() =>
                                  handleQuickStockAdjust(item, {
                                    quantity: Number(stockEditValue),
                                    lowStockThreshold: Number(thresholdEditValue),
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg bg-[#0b3b2c] hover:bg-[#07291e] text-white text-xs font-bold cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setStockEditId(null)}
                                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                {isOut ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                                    Out of Stock (0)
                                  </span>
                                ) : isLow ? (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                                    Low: {item.quantity} {item.unit}
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                                    {item.quantity} {item.unit}
                                  </span>
                                )}
                              </div>

                              {/* Quick Stepper & Restock Controls */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={isUpdatingThis || item.quantity <= 0}
                                  onClick={() => handleQuickStockAdjust(item, { adjustment: -1 })}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700 cursor-pointer"
                                  title="Decrease stock by 1"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={isUpdatingThis}
                                  onClick={() => handleQuickStockAdjust(item, { adjustment: 1 })}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700 cursor-pointer"
                                  title="Increase stock by 1"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={isUpdatingThis}
                                  onClick={() => handleQuickStockAdjust(item, { adjustment: 10 })}
                                  className="px-1.5 h-6 rounded bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[10px] font-bold cursor-pointer"
                                  title="Quick restock +10"
                                >
                                  +10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openInlineStockEditor(item)}
                                  className="px-2 h-6 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                                  title="Set exact stock & alert threshold"
                                >
                                  Set
                                </button>
                                {item.quantity > 0 && (
                                  <button
                                    type="button"
                                    disabled={isUpdatingThis}
                                    onClick={() => handleQuickStockAdjust(item, { quantity: 0 })}
                                    className="px-1.5 h-6 rounded bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-[10px] font-bold cursor-pointer"
                                    title="Mark Out of Stock (0)"
                                  >
                                    0
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(item)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 cursor-pointer transition-all ${
                              item.status === 'active'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : 'bg-slate-100 border-slate-200 text-slate-400'
                            }`}
                            title="Click to toggle Active / Inactive visibility"
                          >
                            {item.status === 'active' ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hidden</span>
                              </>
                            )}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 cursor-pointer"
                              title="Edit product & specifications"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Supply Product Modal */}
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          onClick={() => setIsFormOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl rounded-3xl bg-[#0e3327] border border-sky-400/40 p-6 sm:p-8 text-white shadow-2xl my-8 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
              {editingId ? 'Edit Agricultural Supply Listing' : 'Create New Agricultural Supply Listing'}
            </h3>
            <p className="text-xs text-white/65 mb-6">
              Provide accurate pricing, stock levels, and technical or composition specifications.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-500/20 border border-red-400/40 text-red-200 text-xs font-bold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-6">
              {/* Section 1: Core Product Information */}
              <div className="rounded-2xl bg-black/25 border border-white/10 p-4 sm:p-5 space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  1. Core Product & Inventory Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Industrial Brass Solenoid Valve (12V DC)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-900 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Brand / Manufacturer
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g., SenseCrop Telemetry"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Model Number
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g., SC-RS485-3IN1"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      SKU / Catalog Code
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g., SCT-RS485-01"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Unit Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="24.50"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Unit of Sale *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="piece, bag (5kg), kit"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Stock Qty *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Low Alert Qty
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lowStockThreshold}
                      onChange={(e) =>
                        setFormData({ ...formData, lowStockThreshold: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Min Order Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.minOrderQuantity}
                      onChange={(e) =>
                        setFormData({ ...formData, minOrderQuantity: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Product Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Warranty / Guarantee
                    </label>
                    <input
                      type="text"
                      value={formData.warranty}
                      onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                      placeholder="e.g., 1 Year Warranty"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Dispatch Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Kandy Tech Park"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>

                  <div className="sm:col-span-12">
                    <label className="block text-xs font-semibold text-white/80 mb-1">
                      Product Description *
                    </label>
                    <textarea
                      rows="2"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe key features, greenhouse applications, and benefits..."
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Technical & Agricultural Specifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hardware / IoT Specs */}
                <div className="rounded-2xl bg-sky-950/30 border border-sky-400/25 p-4 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    2A. Technical / Hardware Specs (Optional)
                  </h4>

                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">Operating Voltage</label>
                    <input
                      type="text"
                      value={formData.voltage}
                      onChange={(e) => setFormData({ ...formData, voltage: e.target.value })}
                      placeholder="e.g., 12V DC or 5V - 24V DC"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">Power Requirements</label>
                    <input
                      type="text"
                      value={formData.powerRequirements}
                      onChange={(e) =>
                        setFormData({ ...formData, powerRequirements: e.target.value })
                      }
                      placeholder="e.g., 15W / 1.25A peak hold"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">
                      Communication Protocol
                    </label>
                    <input
                      type="text"
                      value={formData.communicationProtocol}
                      onChange={(e) =>
                        setFormData({ ...formData, communicationProtocol: e.target.value })
                      }
                      placeholder="e.g., RS485 Modbus-RTU / Wi-Fi MQTT"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">
                      Supported Interfaces & Connectors
                    </label>
                    <input
                      type="text"
                      value={formData.supportedInterfaces}
                      onChange={(e) =>
                        setFormData({ ...formData, supportedInterfaces: e.target.value })
                      }
                      placeholder="e.g., G 3/4 BSP Port, IP68 4-pin cable"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">
                      Compatibility Information
                    </label>
                    <input
                      type="text"
                      value={formData.compatibility}
                      onChange={(e) => setFormData({ ...formData, compatibility: e.target.value })}
                      placeholder="e.g., SmartGrow Relay Node v2, ESP32"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Fertilizer / Seed / Bio-Input Specs */}
                <div className="rounded-2xl bg-emerald-950/30 border border-emerald-400/25 p-4 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4" />
                    2B. Composition & Usage Specs (Optional)
                  </h4>

                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">
                      Chemical Composition / Seed Variety
                    </label>
                    <input
                      type="text"
                      value={formData.composition}
                      onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                      placeholder="e.g., NPK 19-19-19 + Chelated Micro-nutrients"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">Packaging Size</label>
                    <input
                      type="text"
                      value={formData.packageSize}
                      onChange={(e) => setFormData({ ...formData, packageSize: e.target.value })}
                      placeholder="e.g., 5 kg moisture-lock foil bag"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">
                      Operating / Environmental Conditions
                    </label>
                    <input
                      type="text"
                      value={formData.operatingConditions}
                      onChange={(e) =>
                        setFormData({ ...formData, operatingConditions: e.target.value })
                      }
                      placeholder="e.g., -10°C to +60°C, 0.02 - 0.8 MPa"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">
                      Application / Usage Instructions
                    </label>
                    <input
                      type="text"
                      value={formData.applicationInstructions}
                      onChange={(e) =>
                        setFormData({ ...formData, applicationInstructions: e.target.value })
                      }
                      placeholder="e.g., Dissolve 1.5g - 2.0g per liter of water"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-white/70 mb-1">
                      Safety & Storage Precautions
                    </label>
                    <input
                      type="text"
                      value={formData.safetyPrecautions}
                      onChange={(e) =>
                        setFormData({ ...formData, safetyPrecautions: e.target.value })
                      }
                      placeholder="e.g., Store below 30°C in dry shade"
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Options & Visibility Flags */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-black/25 border border-white/10 text-xs">
                <div className="flex flex-wrap items-center gap-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.islandwideDelivery}
                      onChange={(e) =>
                        setFormData({ ...formData, islandwideDelivery: e.target.checked })
                      }
                      className="accent-sky-400"
                    />
                    <span>Islandwide Delivery Available</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.warehousePickup}
                      onChange={(e) =>
                        setFormData({ ...formData, warehousePickup: e.target.checked })
                      }
                      className="accent-sky-400"
                    />
                    <span>Warehouse Pickup Supported</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-amber-300 font-bold">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="accent-amber-400"
                    />
                    <span>⭐ Highlight as Featured Supply</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-white/60 font-semibold">Listing Status:</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-white font-bold"
                  >
                    <option value="active" className="bg-slate-900">
                      Active (Public)
                    </option>
                    <option value="inactive" className="bg-slate-900">
                      Inactive (Hidden)
                    </option>
                    <option value="draft" className="bg-slate-900">
                      Draft
                    </option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {submitting
                      ? 'Saving...'
                      : editingId
                      ? 'Save Supply Changes'
                      : 'Publish Supply Listing'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Destructive Delete Action (Section 3) */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-[#132a24] border border-red-400/40 p-6 text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-7 h-7 shrink-0" />
              <h4 className="text-lg font-extrabold text-white">Delete Supply Listing?</h4>
            </div>
            <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <span className="font-bold text-white">&ldquo;{deleteTarget.name}&rdquo;</span> from
              your supplier catalog? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-xs font-extrabold cursor-pointer"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierProductManager;
