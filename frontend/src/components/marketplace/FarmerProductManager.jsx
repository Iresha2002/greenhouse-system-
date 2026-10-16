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
} from 'lucide-react';
import {
  getMyProducts,
  createProduct,
  updateProduct,
  toggleProductStatus,
  deleteProduct,
  updateProductStock,
} from '../../services/api';

const CATEGORIES = ['Vegetables', 'Fruits', 'Leafy Greens', 'Herbs', 'Other Produce'];
const UNITS = ['kg', 'g', 'pack', 'bundle', 'head', 'piece'];

export const FarmerProductManager = ({ currentUser, onBackToMarketplace }) => {
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-white/[0.08] to-emerald-900/50 backdrop-blur-2xl border border-white/20 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                Farmer Listing Studio • Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Manage Crop Listings
            </h1>
            <p className="text-xs sm:text-sm text-white/70 max-w-xl mt-1">
              Publish fresh harvests, calibrate market prices, track real-time stock levels, and toggle listing visibility in the SmartGrow Marketplace.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onBackToMarketplace}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-105"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add New Crop</span>
            </button>
          </div>
        </div>
      </div>

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
          <div className="w-10 h-10 border-4 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
          <p className="text-emerald-300 font-semibold tracking-wide text-sm">
            Fetching your MongoDB crop inventory...
          </p>
        </div>
      ) : myProducts.length === 0 ? (
        <div className="rounded-3xl bg-white/[0.05] border border-white/15 p-16 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center mx-auto mb-4 text-3xl">
            🌱
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Crop Listings Published Yet</h3>
          <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto mb-6">
            You haven't listed any crops for sale. Add your first harvest now to reach direct consumers and wholesale buyers.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs transition-all cursor-pointer shadow-lg hover:scale-105 inline-flex items-center gap-2"
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
                className="relative overflow-hidden rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/15 p-5 shadow-xl flex flex-col justify-between hover:border-emerald-400/30 transition-all"
              >
                <div>
                  {/* Top Thumbnail & Status */}
                  <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-black/40 border border-white/10 mb-4">
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
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
                        {product.category}
                      </span>
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md ${
                          isActive
                            ? 'bg-emerald-500/80 text-emerald-950 border-emerald-400'
                            : 'bg-zinc-700/80 text-zinc-300 border-zinc-500'
                        }`}
                      >
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Header Title & Pricing */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
                        {product.name}
                      </h3>
                      <span className="text-xs text-white/50">{product.location}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-emerald-300 block">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-white/50">per {product.unit}</span>
                    </div>
                  </div>

                  {/* Stock Metrics & Quick Inventory Controls */}
                  <div className="my-3 p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-white/50 block text-[10px]">Inventory Stock</span>
                        <span className="font-extrabold text-white text-sm">
                          {product.quantity} {product.unit}
                        </span>
                      </div>

                      <div>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                            Sold Out
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Low Stock ({product.quantity})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            In Stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Inventory Adjustment Buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                      <span className="text-white/40 text-[10px]">Quick Adjust:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleQuickStockChange(product, -10)}
                          disabled={product.quantity <= 0}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 disabled:opacity-30 text-white/80 hover:text-white border border-white/10 transition-all cursor-pointer font-bold"
                          title="Reduce 10"
                        >
                          -10
                        </button>
                        <button
                          onClick={() => handleQuickStockChange(product, -1)}
                          disabled={product.quantity <= 0}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 disabled:opacity-30 text-white/80 hover:text-white border border-white/10 transition-all cursor-pointer font-bold"
                          title="Reduce 1"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleQuickStockChange(product, +1)}
                          className="px-2 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 transition-all cursor-pointer font-bold"
                          title="Add 1"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleQuickStockChange(product, +10)}
                          className="px-2 py-0.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 transition-all cursor-pointer font-bold"
                          title="Add 10"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                  <button
                    onClick={() => handleToggleStatus(product)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 flex items-center justify-center gap-1.5 cursor-pointer"
                    title={isActive ? 'Deactivate listing' : 'Activate listing'}
                  >
                    {isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{isActive ? 'Pause' : 'Activate'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(product)}
                    className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 transition-all cursor-pointer"
                    title="Edit crop details & pricing"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingId(product._id)}
                    className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-all cursor-pointer"
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

      {/* ADD / EDIT CROP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-[#0f3824] border border-white/20 p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/15 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                {editingProduct ? 'Edit Existing Listing' : 'New Harvest Publication'}
              </span>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {editingProduct ? `Edit "${editingProduct.name}"` : 'Publish Crop to Marketplace'}
              </h2>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Crop Name */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Crop Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hydroponic Cherry Tomatoes"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Category & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0b2b1c] border border-white/20 text-white text-sm focus:outline-none focus:border-emerald-400"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Unit of Measurement *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0b2b1c] border border-white/20 text-white text-sm focus:outline-none focus:border-emerald-400"
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
                  <label className="block text-xs font-semibold text-white/80 mb-1">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Available Quantity ({formData.unit}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="50"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Location & Harvest Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Farm Location / Greenhouse Bay
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Matara Eco Bay 1"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white text-sm focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Crop Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1">
                  Crop Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Cultivation conditions, freshness guarantee, taste profile..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-emerald-400 resize-none"
                />
              </div>

              {/* Verification & Status */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white/80 select-none">
                  <input
                    type="checkbox"
                    checked={formData.isOrganicVerified}
                    onChange={(e) =>
                      setFormData({ ...formData, isOrganicVerified: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-emerald-500 bg-transparent border-white/30"
                  />
                  <span>Organic Verified Harvest</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white/80 select-none">
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.checked ? 'active' : 'inactive',
                      })
                    }
                    className="w-4 h-4 rounded text-emerald-500 bg-transparent border-white/30"
                  />
                  <span>Active & Visible in Marketplace</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-extrabold text-xs transition-all shadow-lg cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#0f3824] border border-rose-500/30 p-6 text-center shadow-2xl text-white">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Crop Listing?</h3>
            <p className="text-xs text-white/70 mb-5 leading-relaxed">
              Are you sure you want to permanently delete this crop listing from the SmartGrow marketplace? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg cursor-pointer"
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
