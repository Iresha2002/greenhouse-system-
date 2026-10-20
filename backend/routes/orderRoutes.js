const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Helper to extract user optionally from authorization header
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

// @route   POST /api/orders
// @desc    Place a new crop marketplace order with atomic stock deduction
// @access  Public / Authenticated
router.post('/', async (req, res) => {
  try {
    const { customerInfo, items, fulfillmentMethod, paymentMethod } = req.body;

    // 1. Basic validation
    if (!customerInfo || !customerInfo.name || !customerInfo.phone || !customerInfo.district) {
      return res.status(400).json({
        success: false,
        error: 'Please provide full name, contact phone, and district/delivery area'
      });
    }

    const method = fulfillmentMethod === 'pickup' ? 'pickup' : 'delivery';

    if (method === 'delivery' && (!customerInfo.address || customerInfo.address.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'A valid delivery address is required for home delivery'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Your shopping basket is empty. Please add crops before checkout'
      });
    }

    // Payment method validation
    if (paymentMethod === 'online') {
      return res.status(400).json({
        success: false,
        error: 'Online payment gateway is currently unavailable. Please choose Cash on Delivery or Pay on Collection.'
      });
    }

    const resolvedPaymentMethod = method === 'pickup' ? 'pay_on_pickup' : 'cod';

    // 2. Fetch all products and perform stock availability validation
    const verifiedOrderItems = [];
    let calculatedSubtotal = 0;
    const productsToUpdate = [];

    for (const item of items) {
      const productId = item.productId || item.id || item._id;
      const requestedQty = parseInt(item.quantity, 10);

      if (!productId || isNaN(requestedQty) || requestedQty <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid product item format in cart'
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product with ID "${productId}" is no longer available`
        });
      }

      if (product.status !== 'active') {
        return res.status(400).json({
          success: false,
          error: `"${product.name}" is currently inactive and cannot be ordered`
        });
      }

      if (product.quantity < requestedQty) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for "${product.name}". Only ${product.quantity} ${product.unit} available (requested: ${requestedQty})`
        });
      }

      // Check minimum order quantity if configured
      if (product.minOrderQuantity && requestedQty < product.minOrderQuantity) {
        return res.status(400).json({
          success: false,
          error: `Minimum order for "${product.name}" is ${product.minOrderQuantity} ${product.unit}`
        });
      }

      const itemTotal = parseFloat((product.price * requestedQty).toFixed(2));
      calculatedSubtotal += itemTotal;

      verifiedOrderItems.push({
        product: product._id,
        name: product.name,
        category: product.category,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        unit: product.unit,
        price: product.price, // Authoritative frozen unit price
        quantity: requestedQty,
        itemTotal,
        farmer: product.farmer,
        farmerName: product.farmerName,
        farmLocation: product.location,
        farmerStatus: 'pending'
      });

      productsToUpdate.push({
        productDoc: product,
        deductQty: requestedQty
      });
    }

    // 3. Apply atomic inventory deduction
    for (const { productDoc, deductQty } of productsToUpdate) {
      productDoc.quantity = Math.max(0, productDoc.quantity - deductQty);
      productDoc.updatedAt = Date.now();
      await productDoc.save();
    }

    // 4. Calculate final financial figures
    calculatedSubtotal = parseFloat(calculatedSubtotal.toFixed(2));
    const deliveryFee = method === 'delivery' ? 2.50 : 0.00;
    const finalTotal = parseFloat((calculatedSubtotal + deliveryFee).toFixed(2));

    // 5. Generate human-readable order tracking ID
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `ORD-${dateStamp}-${randomSuffix}`;

    // 6. Check for authenticated user
    const user = await getOptionalUser(req);

    // 7. Persist Order in MongoDB
    const newOrder = new Order({
      orderNumber,
      customer: user ? user._id : null,
      customerInfo: {
        name: customerInfo.name.trim(),
        phone: customerInfo.phone.trim(),
        address: customerInfo.address ? customerInfo.address.trim() : '',
        district: customerInfo.district.trim(),
        email: customerInfo.email ? customerInfo.email.trim() : (user ? user.email : ''),
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
          note: 'Order placed via Fresh Produce Marketplace'
        }
      ]
    });

    const savedOrder = await newOrder.save();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing your order',
      details: error.message
    });
  }
});

// @route   GET /api/orders/farmer/my-orders
// @desc    Get orders and sales metrics for authenticated farmer
// @access  Private (Farmer)
router.get('/farmer/my-orders', protect, async (req, res) => {
  try {
    const farmerId = req.user._id;
    const { status } = req.query;

    // Find all orders that have at least one crop from this farmer
    const allFarmerOrders = await Order.find({
      'items.farmer': farmerId
    }).sort({ createdAt: -1 });

    // Calculate farmer-specific financials and counts
    let totalRevenue = 0;
    let pendingCount = 0;
    let activeCount = 0;
    let completedCount = 0;

    const formattedOrders = allFarmerOrders.map(order => {
      // Isolate only the items grown by this farmer
      const myItems = order.items.filter(
        item => item.farmer.toString() === farmerId.toString()
      );

      const farmerSubtotal = myItems.reduce((acc, it) => acc + (it.itemTotal || (it.price * it.quantity)), 0);

      // Determine farmer's operational status
      const myStatus = myItems[0]?.farmerStatus || order.orderStatus;

      if (myStatus === 'pending') pendingCount++;
      else if (['accepted', 'preparing', 'ready_for_dispatch', 'dispatched'].includes(myStatus)) activeCount++;
      else if (myStatus === 'delivered') {
        completedCount++;
        totalRevenue += farmerSubtotal;
      }

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        customerInfo: order.customerInfo,
        fulfillmentMethod: order.fulfillmentMethod,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        farmerStatus: myStatus,
        createdAt: order.createdAt,
        statusHistory: order.statusHistory,
        myItems,
        farmerSubtotal: parseFloat(farmerSubtotal.toFixed(2)),
        totalOrderAmount: order.total
      };
    });

    // Apply status filter if provided
    let filteredOrders = formattedOrders;
    if (status && status !== 'all') {
      filteredOrders = formattedOrders.filter(o => o.farmerStatus === status);
    }

    return res.status(200).json({
      success: true,
      metrics: {
        totalOrders: formattedOrders.length,
        pendingOrders: pendingCount,
        activeOrders: activeCount,
        completedOrders: completedCount,
        totalRevenue: parseFloat(totalRevenue.toFixed(2))
      },
      count: filteredOrders.length,
      orders: filteredOrders
    });
  } catch (error) {
    console.error('Fetch farmer orders error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve farmer order records'
    });
  }
});

// @route   PATCH /api/orders/:id/farmer-status
// @desc    Update order lifecycle stage for farmer crops
// @access  Private (Farmer)
router.patch('/:id/farmer-status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status: nextStatus, note } = req.body;
    const farmerId = req.user._id;

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
        error: `Invalid status transition: "${nextStatus}"`
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Verify farmer has items in this order
    const farmerItems = order.items.filter(
      item => item.farmer.toString() === farmerId.toString()
    );

    if (farmerItems.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You do not have crop items in this order'
      });
    }

    // If rejecting, restore the inventory for this farmer's rejected items
    if (nextStatus === 'rejected') {
      for (const item of farmerItems) {
        if (item.product) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { quantity: item.quantity },
            $set: { updatedAt: Date.now() }
          });
        }
      }
    }

    // Update farmerStatus on items belonging to this farmer
    order.items.forEach(item => {
      if (item.farmer.toString() === farmerId.toString()) {
        item.farmerStatus = nextStatus;
      }
    });

    // Update overall orderStatus
    order.orderStatus = nextStatus;
    if (nextStatus === 'delivered') {
      order.paymentStatus = 'paid';
    }

    order.statusHistory.push({
      status: nextStatus,
      changedAt: new Date(),
      note: note || `Status updated to ${nextStatus} by grower ${req.user.username || ''}`
    });

    order.updatedAt = Date.now();
    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${nextStatus}"`,
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update farmer order status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get order history for customer (authenticated or by phone)
// @access  Public / Private
router.get('/my-orders', async (req, res) => {
  try {
    const user = await getOptionalUser(req);
    const { phone, status } = req.query;

    let queryConditions = [];

    if (user) {
      queryConditions.push({ customer: user._id });
      if (user.phoneNumber) {
        queryConditions.push({ 'customerInfo.phone': user.phoneNumber });
      }
      if (user.email) {
        queryConditions.push({ 'customerInfo.email': user.email });
      }
    }

    if (phone) {
      queryConditions.push({ 'customerInfo.phone': phone.trim() });
    }

    if (queryConditions.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Please sign in or provide your registered phone number to view order history'
      });
    }

    const filter = { $or: queryConditions };
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Fetch customer orders error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve order history'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details by ID or orderNumber
// @access  Public / Protected
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    if (id.startsWith('ORD-')) {
      order = await Order.findOne({ orderNumber: id });
    } else if (require('mongoose').Types.ObjectId.isValid(id)) {
      order = await Order.findById(id);
    } else {
      return res.status(404).json({
        success: false,
        error: 'Order not found (invalid order identifier)'
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Fetch order by ID error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve order details'
    });
  }
});

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel an order (only if pending) and restore stock
// @access  Public (matching order) / Private
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.orderStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Order cannot be cancelled because it is already "${order.orderStatus}"`
      });
    }

    // Restore stock to each product
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: item.quantity },
          $set: { updatedAt: Date.now() }
        });
      }
    }

    order.orderStatus = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      changedAt: new Date(),
      note: reason || 'Cancelled by customer'
    });

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order cancelled and crop inventory restored',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel order'
    });
  }
});

module.exports = router;
