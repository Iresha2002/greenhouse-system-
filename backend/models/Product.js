const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true,
    maxlength: [100, 'Crop name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Vegetables', 'Fruits', 'Leafy Greens', 'Herbs', 'Other Produce'],
    default: 'Vegetables'
  },
  description: {
    type: String,
    required: [true, 'Crop description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be greater than zero']
  },
  unit: {
    type: String,
    required: [true, 'Unit of measurement is required'],
    enum: ['kg', 'g', 'pack', 'bundle', 'head', 'piece'],
    default: 'kg'
  },
  quantity: {
    type: Number,
    required: [true, 'Available quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order quantity must be at least 1']
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  harvestDate: {
    type: Date,
    default: Date.now
  },
  isOrganicVerified: {
    type: Boolean,
    default: false
  },
  deliveryOptions: {
    homeDelivery: { type: Boolean, default: true },
    farmPickup: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for optimal query efficiency
productSchema.index({ name: 'text', description: 'text', location: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ farmer: 1 });

module.exports = mongoose.model('Product', productSchema);
