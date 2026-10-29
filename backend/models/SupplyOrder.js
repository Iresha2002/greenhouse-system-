const mongoose = require('mongoose');

const supplyOrderItemSchema = new mongoose.Schema({
  supply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupplyProduct',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'Fertilizers'
  },
  brand: {
    type: String,
    default: ''
  },
  model: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  unit: {
    type: String,
    default: 'piece'
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
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplierName: {
    type: String,
    required: true
  },
  supplierLocation: {
    type: String,
    default: 'Colombo Supply Hub'
  },
  supplierStatus: {
    type: String,
    enum: [
      'pending',
      'accepted',
      'preparing',
      'ready_for_dispatch',
      'dispatched',
      'delivered',
      'cancelled',
      'rejected'
    ],
    default: 'pending'
  }
});

const supplyOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
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
  items: [supplyOrderItemSchema],
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
    enum: [
      'pending',
      'accepted',
      'preparing',
      'ready_for_dispatch',
      'dispatched',
      'delivered',
      'cancelled',
      'rejected'
    ],
    default: 'pending',
    index: true
  },
  statusHistory: [
    {
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
    }
  ],
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

module.exports = mongoose.model('SupplyOrder', supplyOrderSchema);
