const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const SupplyOrder = require('../models/SupplyOrder');
const SupplyProduct = require('../models/SupplyProduct');
const User = require('../models/User');

// Helper to optionally resolve authenticated user from Bearer token
const getOptionalUser = async (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return await User.findById(decoded.id).select('-password');
    } catch {
      return null;
    }
  }
  return null;
};

// 1. POST /api/supply-orders — Place a new Agricultural Supplies Order with Atomic Stock Deduction
router.post('/', async (req, res) => {
  try {
    const { customerInfo, items, fulfillmentMethod, paymentMethod } = req.body;

    if (!customerInfo || !customerInfo.name || !customerInfo.phone || !customerInfo.district) {
      return res.status(400).json({
        success: false,
        error: 'Please provide customer name, contact phone, and district/delivery area'
      });
    }

    const cleanPhone = customerInfo.phone.replace(/[\s\-()]/g, '');
    if (!/^\+?[0-9]{9,15}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid contact phone number (9 to 15 digits)'
      });
    }

    const method = fulfillmentMethod === 'pickup' ? 'pickup' : 'delivery';
    if (
      method === 'delivery' &&
      (!customerInfo.address || customerInfo.address.trim().length === 0)
    ) {
      return res.status(400).json({
        success: false,
        error: 'A valid delivery address is required for courier dispatch'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Your Supplies Basket is empty'
      });
    }

    if (paymentMethod === 'online') {
      return res.status(400).json({
        success: false,
        error:
          'Online payment gateway is not yet integrated. Please select Cash on Delivery or Pay on Collection.'
      });
    }

    const resolvedPaymentMethod = method === 'pickup' ? 'pay_on_pickup' : 'cod';

    // Validate all items against trusted MongoDB SupplyProduct records
    const verifiedOrderItems = [];
    let calculatedSubtotal = 0;
    const suppliesToDeduct = [];

    for (const item of items) {
      const supplyId = item.supplyId || item.productId || item.id || item._id;
      const requestedQty = Number(item.quantity || item.cartQuantity);

      if (
        !supplyId ||
        isNaN(requestedQty) ||
        !Number.isInteger(requestedQty) ||
        requestedQty <= 0
      ) {
        return res.status(400).json({
          success: false,
          error: 'Supply quantities must be positive whole numbers'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(supplyId)) {
        return res.status(400).json({
          success: false,
          error: `Invalid supply product ID: "${supplyId}"`
        });
      }

      const supply = await SupplyProduct.findById(supplyId);
      if (!supply) {
        return res.status(404).json({
          success: false,
          error: `Agricultural supply with ID "${supplyId}" is no longer available`
        });
      }

      if (supply.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: `"${supply.name}" is currently inactive and cannot be ordered`
        });
      }

      if (supply.quantity < requestedQty) {
        return res.status(400).json({
          success: false,
          error: `Insufficient warehouse stock for "${supply.name}". Only ${supply.quantity} ${supply.unit} available (requested: ${requestedQty})`
        });
      }

      if (supply.minOrderQuantity && requestedQty < supply.minOrderQuantity) {
        return res.status(400).json({
          success: false,
          error: `Minimum order quantity for "${supply.name}" is ${supply.minOrderQuantity} ${supply.unit}`
        });
      }

      const itemTotal = parseFloat((supply.price * requestedQty).toFixed(2));
      calculatedSubtotal += itemTotal;

      verifiedOrderItems.push({
        supply: supply._id,
        name: supply.name,
        category: supply.category,
        brand: supply.brand || '',
        model: supply.model || '',
        image:
          supply.images && supply.images.length > 0
            ? supply.images[0]
            : supply.image || '',
        unit: supply.unit,
        price: supply.price, // Authoritative frozen unit price from MongoDB
        quantity: requestedQty,
        itemTotal,
        supplier: supply.supplier,
        supplierName: supply.supplierName,
        supplierLocation: supply.location,
        supplierStatus: 'pending'
      });

      suppliesToDeduct.push({
        supplyId: supply._id,
        deductQty: requestedQty,
        supplyName: supply.name
      });
    }

    // Atomic stock deduction with rollback if any item fails
    const deductedList = [];
    let deductionFailed = false;
    let failedReason = '';

    for (const { supplyId, deductQty, supplyName } of suppliesToDeduct) {
      const updated = await SupplyProduct.findOneAndUpdate(
        {
          _id: supplyId,
          quantity: { $gte: deductQty },
          status: 'active'
        },
        {
          $inc: { quantity: -deductQty },
          $set: { updatedAt: Date.now() }
        },
        { new: true }
      );

      if (!updated) {
        deductionFailed = true;
        failedReason = `Could not reserve stock for "${supplyName}". The requested quantity was claimed by another customer.`;
        break;
      }

      deductedList.push({ supplyId, deductQty });
    }

    if (deductionFailed) {
      for (const rb of deductedList) {
        await SupplyProduct.findByIdAndUpdate(rb.supplyId, {
          $inc: { quantity: rb.deductQty },
          $set: { updatedAt: Date.now() }
        });
      }
      return res.status(409).json({
        success: false,
        error: failedReason
      });
    }

    calculatedSubtotal = parseFloat(calculatedSubtotal.toFixed(2));
    const deliveryFee = method === 'delivery' ? 3.50 : 0.0;
    const finalTotal = parseFloat((calculatedSubtotal + deliveryFee).toFixed(2));

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `SUP-${dateStamp}-${randomSuffix}`;

    const user = await getOptionalUser(req);

    const newSupplyOrder = new SupplyOrder({
      orderNumber,
      customer: user ? user._id : null,
      customerInfo: {
        name: customerInfo.name.trim(),
        phone: customerInfo.phone.trim(),
        address: customerInfo.address ? customerInfo.address.trim() : '',
        district: customerInfo.district.trim(),
        email: customerInfo.email
          ? customerInfo.email.trim()
          : user
          ? user.email
          : '',
        notes: customerInfo.notes ? customerInfo.notes.trim() : ''
      },
      items: verifiedOrderItems,
      subtotal: calculatedSubtotal,
      deliveryFee,
      total: finalTotal,
      fulfillmentMethod: method,
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedAt: new Date(),
          note: 'Order placed via Agricultural Supplies Marketplace'
        }
      ]
    });

    const savedOrder = await newSupplyOrder.save();

    return res.status(201).json({
      success: true,
      message: 'Agricultural supply order placed successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Create supply order error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing your supply order',
      details: error.message
    });
  }
});

// 2. GET /api/supply-orders/my-orders — Retrieve Customer's Own Supply Orders
router.get('/my-orders', async (req, res) => {
  try {
    const user = await getOptionalUser(req);
    const { phone, status } = req.query;

    const queryConditions = [];

    if (user) {
      queryConditions.push({ customer: user._id });
      if (user.phoneNumber) {
        queryConditions.push({ 'customerInfo.phone': user.phoneNumber });
      }
      if (user.email) {
        queryConditions.push({ 'customerInfo.email': user.email });
      }
    }

    if (phone && phone.trim()) {
      queryConditions.push({ 'customerInfo.phone': phone.trim() });
    }

    if (queryConditions.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Please sign in or enter your contact phone number to view your supply orders'
      });
    }

    const filter = { $or: queryConditions };
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    const orders = await SupplyOrder.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get customer supply orders error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve supply order history'
    });
  }
});

// 3. GET /api/supply-orders/:id — Get Single Supply Order by ID or Order Number
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let order = null;

    if (id.startsWith('SUP-')) {
      order = await SupplyOrder.findOne({ orderNumber: id });
    } else if (mongoose.Types.ObjectId.isValid(id)) {
      order = await SupplyOrder.findById(id);
    } else {
      return res.status(404).json({
        success: false,
        error: 'Supply order not found (invalid order identifier)'
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Supply order not found'
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve supply order details'
    });
  }
});

// 4. PATCH /api/supply-orders/:id/cancel — Customer Cancels Pending Order & Restores Stock
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await SupplyOrder.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Supply order not found'
      });
    }

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Order cannot be cancelled because its status is already "${order.orderStatus}"`
      });
    }

    // Restore stock for each ordered supply item
    for (const item of order.items) {
      if (item.supply) {
        await SupplyProduct.findByIdAndUpdate(item.supply, {
          $inc: { quantity: item.quantity },
          $set: { updatedAt: Date.now() }
        });
      }
    }

    order.orderStatus = 'cancelled';
    order.items.forEach((it) => {
      it.supplierStatus = 'cancelled';
    });
    order.statusHistory.push({
      status: 'cancelled',
      changedAt: new Date(),
      note: reason || 'Cancelled by customer prior to supplier acceptance'
    });
    order.updatedAt = Date.now();

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: 'Supply order cancelled and warehouse inventory restored',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Cancel supply order error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel supply order'
    });
  }
});

module.exports = router;
