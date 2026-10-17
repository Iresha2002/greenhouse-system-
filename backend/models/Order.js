const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Vegetables'
  },
  image: {
    type: String,
    default: ''
  },
  unit: {
    type: String,
    default: 'kg'
  },
  price: {
    type: Number,
    required: true,
    min: 0.01
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  itemTotal: {
    type: Number,
    required: true
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
  farmLocation: {
    type: String,
    default: 'Eco Bay'
  },
  farmerStatus: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready_for_dispatch', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allows guest checkout while linking user if logged in
  },
  customerInfo: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      required: [true, 'District / delivery area is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  fulfillmentMethod: {
    type: String,
    enum: ['delivery', 'pickup'],
    default: 'delivery'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'pay_on_pickup', 'online'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'accepted', 'preparing', 'ready_for_dispatch', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for fast querying
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ 'items.farmer': 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
