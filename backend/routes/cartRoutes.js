const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');

// ==========================================
// CART PRICE VALIDATION & CALCULATION API
// ==========================================

router.post('/calculate', async (req, res) => {
  try {
    const { items = [], deliveryMethod = 'delivery' } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Cart items must be provided as an array' });
    }

    if (items.length === 0) {
      return res.json({
        success: true,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
        uniqueFarmersCount: 0,
        farmers: [],
        hasUnavailableItems: false,
        hasStockIssues: false
      });
    }

    const validatedItems = [];
    let subtotal = 0;
    let hasUnavailableItems = false;
    let hasStockIssues = false;
    const farmersSet = new Map();

    for (const item of items) {
      const productId = item.productId || item.id || item._id;
      const requestedQty = Math.max(1, Number(item.quantity) || 1);

      // Check if valid ObjectId
      const isValidObjectId = mongoose.Types.ObjectId.isValid(productId);
      let product = null;

      if (isValidObjectId) {
        product = await Product.findById(productId);
      }

      if (!product) {
        // Fallback for fallback catalog items
        if (item.name && item.price) {
          const fallbackPrice = Number(item.price);
          const fallbackQty = Number(item.quantity) || 1;
          const itemTotal = Number((fallbackPrice * fallbackQty).toFixed(2));
          subtotal += itemTotal;

          const farmerName = item.farmerName || 'Verified Farm';
          farmersSet.set(farmerName, {
            farmerName,
            location: item.location || 'Greenhouse Bay'
          });

          validatedItems.push({
            productId: String(productId),
            name: item.name,
            category: item.category || 'Vegetables',
            unit: item.unit || 'kg',
            image: item.image || (item.images && item.images[0]) || '',
            unitPrice: fallbackPrice,
            requestedQuantity: fallbackQty,
            validQuantity: fallbackQty,
            itemTotal,
            availableStock: item.quantity !== undefined ? item.quantity : 50,
            farmerName,
            location: item.location || 'Greenhouse Bay',
            isUnavailable: false,
            stockWarning: null
          });
          continue;
        }

        // Product not found in database and no fallback provided
        hasUnavailableItems = true;
        validatedItems.push({
          productId: String(productId),
          name: item.name || 'Unavailable Crop',
          unitPrice: 0,
          requestedQuantity: requestedQty,
          validQuantity: 0,
          itemTotal: 0,
          isUnavailable: true,
          stockWarning: 'This crop listing is no longer available in the marketplace'
        });
        continue;
      }

      // Check active status
      if (product.status !== 'active') {
        hasUnavailableItems = true;
        validatedItems.push({
          productId: product._id.toString(),
          name: product.name,
          unitPrice: product.price,
          requestedQuantity: requestedQty,
          validQuantity: 0,
          itemTotal: 0,
          isUnavailable: true,
          stockWarning: 'This crop listing has been paused by the grower'
        });
        continue;
      }

      // Stock validation
      let validQuantity = requestedQty;
      let stockWarning = null;

      if (product.quantity <= 0) {
        hasStockIssues = true;
        validQuantity = 0;
        stockWarning = 'Out of Stock (0 available)';
      } else if (requestedQty > product.quantity) {
        hasStockIssues = true;
        validQuantity = product.quantity;
        stockWarning = `Reduced from ${requestedQty} to ${product.quantity} ${product.unit} (maximum available stock)`;
      }

      // Always use trusted MongoDB product price
      const unitPrice = Number(product.price);
      const itemTotal = Number((unitPrice * validQuantity).toFixed(2));
      subtotal += itemTotal;

      // Track multi-seller / farmer information
      const farmerId = product.farmer.toString();
      if (!farmersSet.has(farmerId)) {
        farmersSet.set(farmerId, {
          farmerId,
          farmerName: product.farmerName,
          location: product.location
        });
      }

      validatedItems.push({
        productId: product._id.toString(),
        name: product.name,
        category: product.category,
        unit: product.unit,
        image: product.images && product.images.length > 0 ? product.images[0] : (product.image || ''),
        unitPrice,
        requestedQuantity: requestedQty,
        validQuantity,
        itemTotal,
        availableStock: product.quantity,
        farmerId: product.farmer.toString(),
        farmerName: product.farmerName,
        location: product.location,
        minOrderQuantity: product.minOrderQuantity || 1,
        isOrganicVerified: product.isOrganicVerified,
        isUnavailable: false,
        stockWarning
      });
    }

    subtotal = Number(subtotal.toFixed(2));
    // Delivery fee: $2.50 flat rate, or $0 if collection / farm pickup
    const deliveryFee = deliveryMethod === 'pickup' || subtotal === 0 ? 0 : 2.50;
    const total = Number((subtotal + deliveryFee).toFixed(2));

    res.json({
      success: true,
      items: validatedItems,
      subtotal,
      deliveryFee,
      deliveryMethod,
      total,
      uniqueFarmersCount: farmersSet.size,
      farmers: Array.from(farmersSet.values()),
      hasUnavailableItems,
      hasStockIssues
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
