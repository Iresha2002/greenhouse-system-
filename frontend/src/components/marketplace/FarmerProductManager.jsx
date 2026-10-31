import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  X,
  Store,
  ArrowLeft,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Layers,
  Image as ImageIcon,
  UploadCloud,
} from 'lucide-react';
import {
  getMyProducts,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  updateProductStock,
} from '../../services/api';
import FarmerOrdersManager from './FarmerOrdersManager';

const CATEGORIES = ['Vegetables', 'Fruits', 'Leafy Greens', 'Herbs', 'Other Produce'];

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

const UNITS = ['kg', 'g', 'pack', 'bundle', 'head', 'piece'];

export const FarmerProductManager = ({ currentUser, onBackToMarketplace }) => {
  const [activeTab, setActiveTab] = useState('listings');
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    description: '',
    price: '',
    unit: 'kg',
    quantity: '',
    lowStockThreshold: 10,
    minOrderQuantity: 1,
    location: currentUser?.location || '',
    harvestDate: new Date().toISOString().split('T')[0],
    isOrganicVerified: true,
    image: '',
    status: 'active',
  });

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState(null);

  // Fetch farmer's own products from MongoDB
  const fetchMyListings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getMyProducts();
      setMyProducts(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading farmer listings:', err);
      setError(err.response?.data?.error || 'Failed to load your crop listings');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Open modal for new crop
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Vegetables',
      description: '',
      price: '',
      unit: 'kg',
      quantity: '',
      lowStockThreshold: 10,
      minOrderQuantity: 1,
      location: currentUser?.location || '',
      harvestDate: new Date().toISOString().split('T')[0],
      isOrganicVerified: true,
      image: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  // Open modal for editing existing crop
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'Vegetables',
      description: product.description || '',
      price: product.price !== undefined ? product.price : '',
      unit: product.unit || 'kg',
      quantity: product.quantity !== undefined ? product.quantity : '',
      lowStockThreshold: product.lowStockThreshold || 10,
      minOrderQuantity: product.minOrderQuantity || 1,
      location: product.location || currentUser?.location || '',
      harvestDate: product.harvestDate
        ? new Date(product.harvestDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      isOrganicVerified: Boolean(product.isOrganicVerified),
      image: product.images && product.images.length > 0 ? product.images[0] : (product.image || ''),
      status: product.status || 'active',
    });
    setIsModalOpen(true);
  };


  const handleDirectImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setFormData((prev) => ({ ...prev, image: compressed }));
    } catch (err) {
      console.error('Image upload failed:', err);
      showNotification('Failed to process image. Please try another photo.', 'error');
    }
  };

  // Submit Add or Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.quantity || !formData.unit) {
      setError('Please fill out all required fields (Name, Price, Quantity, Unit).');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        description: formData.description.trim(),
        price: Number(formData.price),
        unit: formData.unit,
        quantity: Number(formData.quantity),
        lowStockThreshold: Number(formData.lowStockThreshold || 10),
        minOrderQuantity: Number(formData.minOrderQuantity || 1),
        location: formData.location.trim() || currentUser?.location || 'Greenhouse Estate',
        harvestDate: formData.harvestDate,
        isOrganicVerified: Boolean(formData.isOrganicVerified),
        image: formData.image.trim(),
        status: formData.status,
      };

      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);
        showNotification(`Listing "${payload.name}" updated successfully!`);
      } else {
        await createProduct(payload);
        showNotification(`New crop listing "${payload.name}" published to Marketplace!`);
      }

      setIsModalOpen(false);
      setSubmitting(false);
      fetchMyListings();
    } catch (err) {
      console.error('Save failed:', err);
      setError(err.response?.data?.error || 'Failed to save crop listing');
      setSubmitting(false);
    }
  };

  // Toggle active/inactive listing status
  const handleToggleStatus = async (product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      await toggleProductStatus(product._id, newStatus);
      showNotification(`Listing is now ${newStatus.toUpperCase()}`);
      fetchMyListings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change listing status');
    }
  };

  // Quick increment / decrement stock adjustment
  const handleQuickStockChange = async (product, delta) => {
    const newQty = Math.max(0, (product.quantity || 0) + delta);
    try {
      const res = await updateProductStock(product._id, newQty);
      showNotification(res.message || `Stock updated to ${newQty} ${product.unit}`);
      fetchMyListings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update stock');
    }
  };

  // Delete crop listing with confirmation
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteProduct(deletingId);
      showNotification('Crop listing was removed from marketplace.');
      setDeletingId(null);
      fetchMyListings();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete listing');
      setDeletingId(null);
    }
  };

  return (
    <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-500 text-emerald-950 font-bold shadow-2xl border border-emerald-300 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="ml-2 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                {activeTab === 'orders' ? 'Farmer Orders & Fulfillment • Portal' : 'Farmer Listing Studio • Portal'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {activeTab === 'orders' ? 'Harvest Orders & Fulfillment' : 'Manage Crop Listings'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mt-1">
              {activeTab === 'orders'
                ? 'Review customer harvest orders, track live fulfillment stages, coordinate dispatches, and monitor sales revenue.'
                : 'Publish fresh harvests, calibrate market prices, track real-time stock levels, and toggle listing visibility in the SmartGrow Marketplace.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onBackToMarketplace}
              className="px-4 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Back to Marketplace</span>
            </button>

            {activeTab === 'listings' && (
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 rounded-full bg-[#0b3b2c] hover:bg-[#07291e] text-white font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs hover:scale-102"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add New Crop</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Studio Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'listings'
              ? 'bg-[#0b3b2c] text-white shadow-xs font-extrabold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Crop Listings & Stock ({myProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#0b3b2c] text-white shadow-xs font-extrabold'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Harvest Orders & Fulfillment</span>
        </button>
      </div>

      {activeTab === 'orders' ? (
        <FarmerOrdersManager currentUser={currentUser} />
      ) : (
        <>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-300 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Listings Table / Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-[#0b3b2c] rounded-full animate-spin mb-4" />
          <p className="text-slate-600 font-semibold tracking-wide text-sm">
            Fetching your MongoDB crop inventory...
          </p>
        </div>
      ) : myProducts.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto mb-4 text-3xl">
            🌱
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Crop Listings Published Yet</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-6">
            You haven't listed any crops for sale. Add your first harvest now to reach direct consumers and wholesale buyers.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 rounded-full bg-[#0b3b2c] hover:bg-[#07291e] text-white font-extrabold text-xs transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Publish Your First Crop</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProducts.map((product) => {
            const isOutOfStock = product.quantity <= 0;
            const isLowStock = product.quantity > 0 && product.quantity <= (product.lowStockThreshold || 10);
            const isActive = product.status === 'active';
            const displayImage = product.images && product.images.length > 0 ? product.images[0] : product.image;

            return (
              <div
                key={product._id}
                className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between text-slate-900"
              >
                <div>
                  {/* Top Thumbnail & Status */}
                  <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-4">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🌿
                      </div>
                    )}

                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/95 text-slate-800 border border-slate-200 shadow-2xs backdrop-blur-md">
                        {product.category}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-2xs backdrop-blur-md ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Header Title & Pricing */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1">
                        {product.name}
                      </h3>
                      <span className="text-xs text-slate-500">{product.location}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-950 block">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-500">per {product.unit}</span>
                    </div>
                  </div>

                  {/* Stock Metrics & Quick Inventory Controls */}
                  <div className="my-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500 block text-[10px] font-semibold uppercase">Inventory Stock</span>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {product.quantity} {product.unit}
                        </span>
                      </div>

                      <div>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            Sold Out
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Low Stock ({product.quantity})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            In Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Inventory Adjustment Buttons */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 text-[11px]">
                      <span className="text-slate-500 text-[10px] font-semibold uppercase">Quick Adjust:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleQuickStockChange(product, -10)}
                          disabled={product.quantity <= 0}
                          className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-700 border border-slate-300 transition-all cursor-pointer font-bold text-xs shadow-2xs"
                          title="Reduce 10"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => handleQuickStockChange(product, -1)}
                          disabled={product.quantity <= 0}
                          className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-700 border border-slate-300 transition-all cursor-pointer font-bold text-xs shadow-2xs"
                          title="Reduce 1"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleQuickStockChange(product, +1)}
                          className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all cursor-pointer font-bold text-xs shadow-2xs"
                          title="Add 1"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleQuickStockChange(product, +10)}
                          className="px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all cursor-pointer font-bold text-xs shadow-2xs"
                          title="Add 10"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleToggleStatus(product)}
                    className="flex-1 py-2 px-3 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    title={isActive ? 'Deactivate listing' : 'Activate listing'}
                  >
                    {isActive ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{isActive ? 'Pause' : 'Activate'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(product)}
                    className="p-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all cursor-pointer shadow-2xs"
                    title="Edit crop details & pricing"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingId(product._id)}
                    className="p-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer shadow-2xs"
                    title="Delete crop listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}

      {/* ADD / EDIT CROP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer border border-slate-200 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                {editingProduct ? 'Edit Existing Listing' : 'New Harvest Publication'}
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {editingProduct ? `Edit "${editingProduct.name}"` : 'Publish Crop to Marketplace'}
              </h2>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Crop Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Crop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydroponic Cherry Tomatoes"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit of Measurement *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white cursor-pointer"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price per Unit ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="3.50"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Available Quantity ({formData.unit}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Location & Harvest Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Farm Location / Greenhouse Bay
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Matara Eco Bay 1"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Direct Photo Upload & URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Crop Photo (Upload Directly or Paste URL)
                </label>

                {formData.image ? (
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <img
                      src={formData.image}
                      alt="Crop preview"
                      className="w-20 h-20 rounded-xl object-cover border border-slate-300 shadow-2xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">Photo selected</p>
                      <p className="text-[11px] text-slate-500 mb-2">Ready to publish with this crop listing.</p>
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer shadow-2xs transition-colors">
                          Change photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleDirectImageUpload}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 cursor-pointer transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 transition-all cursor-pointer group text-center">
                      <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-emerald-700 mb-2 transition-colors" />
                      <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">
                        Click to upload photo directly from your device
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5">
                        PNG, JPG, WebP up to 10MB (automatically optimized)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleDirectImageUpload}
                      />
                    </label>

                    <input
                      type="url"
                      placeholder="Or paste an image link (https://...)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:border-emerald-600 focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Crop Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Cultivation conditions, freshness guarantee, taste profile..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white resize-none"
                />
              </div>

              {/* Verification & Status */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={formData.isOrganicVerified}
                    onChange={(e) =>
                      setFormData({ ...formData, isOrganicVerified: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-emerald-700 accent-[#0b3b2c]"
                  />
                  <span>Organic Verified Harvest</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.checked ? 'active' : 'inactive',
                      })
                    }
                    className="w-4 h-4 rounded text-emerald-700 accent-[#0b3b2c]"
                  />
                  <span>Active & Visible in Marketplace</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#0b3b2c] hover:bg-[#07291e] disabled:opacity-50 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer"
                >
                  {submitting ? 'Saving to Database...' : editingProduct ? 'Update Listing' : 'Publish Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 text-center shadow-2xl text-slate-900">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Crop Listing?</h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              Are you sure you want to permanently delete this crop listing from the SmartGrow marketplace? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerProductManager;
