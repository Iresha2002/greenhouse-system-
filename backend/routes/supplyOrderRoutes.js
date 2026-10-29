const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const SupplyOrder = require('../models/SupplyOrder');
const SupplyProduct = require('../models/SupplyProduct');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

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

// 2. GET /api/supply-orders/supplier/my-orders — Get Supplier's Incoming Orders & Sales Analytics
router.get(
  '/supplier/my-orders',
  protect,
  authorizeRoles('supplier'),
  async (req, res) => {
    try {
      const supplierId = req.user._id;
      const { status } = req.query;

      const allSupplierOrders = await SupplyOrder.find({
        'items.supplier': supplierId
      }).sort({ createdAt: -1 });

      let totalRevenue = 0;
      let pendingOrdersCount = 0;
      let activeOrdersCount = 0;
      let completedOrdersCount = 0;

      const formattedOrders = allSupplierOrders.map((order) => {
        const myItems = order.items.filter(
          (item) => item.supplier.toString() === supplierId.toString()
        );

        const supplierSubtotal = myItems.reduce(
          (acc, it) => acc + (it.itemTotal || it.price * it.quantity),
          0
        );

        const myStatus = myItems[0]?.supplierStatus || order.orderStatus;

        if (myStatus === 'pending') {
          pendingOrdersCount++;
        } else if (
          ['accepted', 'preparing', 'ready_for_dispatch', 'dispatched'].includes(myStatus)
        ) {
          activeOrdersCount++;
        } else if (myStatus === 'delivered') {
          completedOrdersCount++;
          totalRevenue += supplierSubtotal;
        }

        return {
          _id: order._id,
          orderNumber: order.orderNumber,
          customerInfo: order.customerInfo,
          fulfillmentMethod: order.fulfillmentMethod,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          supplierStatus: myStatus,
          createdAt: order.createdAt,
          statusHistory: order.statusHistory,
          myItems,
          supplierSubtotal: parseFloat(supplierSubtotal.toFixed(2)),
          totalOrderAmount: order.total
        };
      });

      let filteredOrders = formattedOrders;
      if (status && status !== 'all') {
        filteredOrders = formattedOrders.filter((o) => o.supplierStatus === status);
      }

      return res.status(200).json({
        success: true,
        metrics: {
          totalOrders: formattedOrders.length,
          pendingOrders: pendingOrdersCount,
          activeOrders: activeOrdersCount,
          completedOrders: completedOrdersCount,
          totalRevenue: parseFloat(totalRevenue.toFixed(2))
        },
        count: filteredOrders.length,
        orders: filteredOrders
      });
    } catch (error) {
      console.error('Get supplier orders error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve supplier incoming orders'
      });
    }
  }
);

// 2B. PATCH /api/supply-orders/:id/supplier-status — Supplier Updates Order Fulfilment Status
router.patch(
  '/:id/supplier-status',
  protect,
  authorizeRoles('supplier'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status: nextStatus, note } = req.body;
      const supplierId = req.user._id;

      const allowedTransitions = [
        'accepted',
        'preparing',
        'ready_for_dispatch',
        'dispatched',
        'delivered',
        'rejected'
      ];

      if (!allowedTransitions.includes(nextStatus)) {
        return res.status(400).json({
          success: false,
          error: `Invalid supplier status transition: "${nextStatus}"`
        });
      }

      const order = await SupplyOrder.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Supply order not found'
        });
      }

      if (order.orderStatus === 'cancelled') {
        return res.status(400).json({
          success: false,
          error: 'Cannot update an order that has already been cancelled'
        });
      }

      const supplierItems = order.items.filter(
        (item) => item.supplier.toString() === supplierId.toString()
      );

      if (supplierItems.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You do not have any supply items in this order'
        });
      }

      // If supplier rejects their items, restore warehouse stock for those items
      if (nextStatus === 'rejected') {
        for (const item of supplierItems) {
          if (item.supply && item.supplierStatus !== 'rejected') {
            await SupplyProduct.findByIdAndUpdate(item.supply, {
              $inc: { quantity: item.quantity },
              $set: { updatedAt: Date.now() }
            });
          }
        }
      }

      // Update supplierStatus on items owned by this supplier
      order.items.forEach((item) => {
        if (item.supplier.toString() === supplierId.toString()) {
          item.supplierStatus = nextStatus;
        }
      });

      // Synchronize overall orderStatus
      order.orderStatus = nextStatus;
      if (nextStatus === 'delivered') {
        order.paymentStatus = 'paid';
      }

      order.statusHistory.push({
        status: nextStatus,
        changedAt: new Date(),
        note:
          note ||
          `Fulfilment status updated to "${nextStatus}" by supplier ${
            req.user.username || ''
          }`
      });

      order.updatedAt = Date.now();
      const updatedOrder = await order.save();

      return res.status(200).json({
        success: true,
        message: `Supply order status updated to "${nextStatus}"`,
        order: updatedOrder
      });
    } catch (error) {
      console.error('Update supplier order status error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update supplier order status'
      });
    }
  }
);

// 3. GET /api/supply-orders/my-orders — Retrieve Customer's Own Supply Orders
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
    const order = await SupplyOrder.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Supply order not found'
      });
    }

    // Stage 10 Security Check: If order is linked to a registered customer account,
    // verify that the requester is the order owner or verified via matching contact phone
    const user = await getOptionalUser(req);
    const { reason, phone } = req.body;

    if (order.customer) {
      const isAuthenticatedOwner =
        user && order.customer.toString() === user._id.toString();
      const isPhoneVerified =
        phone &&
        order.customerInfo?.phone &&
        phone.replace(/[\s\-()]/g, '') ===
          order.customerInfo.phone.replace(/[\s\-()]/g, '');

      if (!isAuthenticatedOwner && !isPhoneVerified) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden: You are not authorized to cancel another customer\'s order'
        });
      }
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
