const mongoose = require('mongoose');

// Configurable 10 Agricultural Supply Categories
const SUPPLY_CATEGORIES = [
  'Seeds',
  'Fertilizers',
  'Crop Protection Products',
  'Irrigation Equipment',
  'Greenhouse Equipment',
  'Smart Farming Devices',
  'IoT Components',
  'Farming Tools',
  'Growing Supplies',
  'Hydroponic Equipment'
];

const supplyProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Supply product name is required'],
    trim: true,
    maxlength: [140, 'Product name cannot exceed 140 characters']
  },
  category: {
    type: String,
    required: [true, 'Supply category is required'],
    enum: SUPPLY_CATEGORIES,
    default: 'Fertilizers'
  },
  brand: {
    type: String,
    trim: true,
    default: ''
  },
  model: {
    type: String,
    trim: true,
    default: ''
  },
  sku: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  price: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0.01, 'Price must be greater than zero']
  },
  unit: {
    type: String,
    required: [true, 'Unit of sale is required'],
    trim: true,
    default: 'piece'
  },
  quantity: {
    type: Number,
    required: [true, 'Available stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
    min: [0, 'Low stock threshold cannot be negative']
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order quantity must be at least 1']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplierName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  warranty: {
    type: String,
    trim: true,
    default: ''
  },
  // Technical & Agricultural Specifications (only supplied fields are stored/displayed)
  specifications: {
    composition: { type: String, trim: true, default: '' },
    packageSize: { type: String, trim: true, default: '' },
    voltage: { type: String, trim: true, default: '' },
    powerRequirements: { type: String, trim: true, default: '' },
    communicationProtocol: { type: String, trim: true, default: '' },
    supportedInterfaces: { type: String, trim: true, default: '' },
    operatingConditions: { type: String, trim: true, default: '' },
    compatibility: { type: String, trim: true, default: '' },
    applicationInstructions: { type: String, trim: true, default: '' },
    safetyPrecautions: { type: String, trim: true, default: '' }
  },
  deliveryOptions: {
    islandwideDelivery: { type: Boolean, default: true },
    warehousePickup: { type: Boolean, default: true }
  },
  isFeatured: {
    type: Boolean,
    default: false
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

// Indexes for fast filtering, search, and supplier lookups
supplyProductSchema.index({
  name: 'text',
  brand: 'text',
  model: 'text',
  supplierName: 'text',
  description: 'text'
});
supplyProductSchema.index({ category: 1, status: 1 });
supplyProductSchema.index({ supplier: 1 });
supplyProductSchema.index({ price: 1 });

module.exports = mongoose.model('SupplyProduct', supplyProductSchema);
module.exports.SUPPLY_CATEGORIES = SUPPLY_CATEGORIES;
