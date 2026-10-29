const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const SupplyProduct = require('../models/SupplyProduct');
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

// ==========================================
// AGRICULTURAL SUPPLIES CART VALIDATION & CALCULATION API
// ==========================================

router.post('/calculate-supplies', async (req, res) => {
  try {
    const { items = [], deliveryMethod = 'delivery' } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Supply cart items must be provided as an array' });
    }

    if (items.length === 0) {
      return res.json({
        success: true,
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
        uniqueSuppliersCount: 0,
        suppliers: [],
        hasUnavailableItems: false,
        hasStockIssues: false
      });
    }

    const validatedItems = [];
    let subtotal = 0;
    let hasUnavailableItems = false;
    let hasStockIssues = false;
    const suppliersSet = new Map();

    for (const item of items) {
      const supplyId = item.supplyId || item.productId || item.id || item._id;
      const requestedQty = Math.max(1, Number(item.quantity || item.cartQuantity) || 1);

      const isValidObjectId = mongoose.Types.ObjectId.isValid(supplyId);
      let supply = null;

      if (isValidObjectId) {
        supply = await SupplyProduct.findById(supplyId);
      }

      if (!supply) {
        // Fallback for offline sample catalog items
        if (item.name && item.price) {
          const fallbackPrice = Number(item.price);
          const minQty = Number(item.minOrderQuantity) || 1;
          const validQty = Math.max(minQty, requestedQty);
          const itemTotal = Number((fallbackPrice * validQty).toFixed(2));
          subtotal += itemTotal;

          const supplierName = item.supplierName || 'Authorized Agri Supplier';
          suppliersSet.set(supplierName, {
            supplierName,
            location: item.location || 'Colombo Supply Hub'
          });

          validatedItems.push({
            supplyId: String(supplyId),
            name: item.name,
            category: item.category || 'Fertilizers',
            brand: item.brand || '',
            model: item.model || '',
            unit: item.unit || 'piece',
            image: item.image || (item.images && item.images[0]) || '',
            unitPrice: fallbackPrice,
            requestedQuantity: requestedQty,
            validQuantity: validQty,
            itemTotal,
            availableStock: item.quantity !== undefined ? item.quantity : 25,
            minOrderQuantity: minQty,
            supplierName,
            location: item.location || 'Colombo Supply Hub',
            isUnavailable: false,
            stockWarning: null
          });
          continue;
        }

        hasUnavailableItems = true;
        validatedItems.push({
          supplyId: String(supplyId),
          name: item.name || 'Unavailable Supply Item',
          unitPrice: 0,
          requestedQuantity: requestedQty,
          validQuantity: 0,
          itemTotal: 0,
          isUnavailable: true,
          stockWarning: 'This agricultural supply is no longer listed'
        });
        continue;
      }

      // Check active status
      if (supply.status !== 'active') {
        hasUnavailableItems = true;
        validatedItems.push({
          supplyId: supply._id.toString(),
          name: supply.name,
          unitPrice: supply.price,
          requestedQuantity: requestedQty,
          validQuantity: 0,
          itemTotal: 0,
          isUnavailable: true,
          stockWarning: 'This supply item is currently paused by the supplier'
        });
        continue;
      }

      // Stock & minimum order validation
      const minOrderQty = supply.minOrderQuantity || 1;
      let validQuantity = Math.max(minOrderQty, requestedQty);
      let stockWarning = null;

      if (supply.quantity <= 0) {
        hasStockIssues = true;
        validQuantity = 0;
        stockWarning = 'Out of Stock (0 available)';
      } else if (validQuantity > supply.quantity) {
        hasStockIssues = true;
        validQuantity = supply.quantity;
        stockWarning = `Adjusted to ${supply.quantity} ${supply.unit} (maximum warehouse stock available)`;
      } else if (requestedQty < minOrderQty) {
        stockWarning = `Adjusted to minimum order quantity (${minOrderQty} ${supply.unit})`;
      }

      // Always recalculate using trusted backend unit price
      const unitPrice = Number(supply.price);
      const itemTotal = Number((unitPrice * validQuantity).toFixed(2));
      subtotal += itemTotal;

      // Preserve supplier info for multi-supplier fulfilment
      const supplierId = supply.supplier.toString();
      if (!suppliersSet.has(supplierId)) {
        suppliersSet.set(supplierId, {
          supplierId,
          supplierName: supply.supplierName,
          location: supply.location
        });
      }

      validatedItems.push({
        supplyId: supply._id.toString(),
        name: supply.name,
        category: supply.category,
        brand: supply.brand || '',
        model: supply.model || '',
        unit: supply.unit,
        image:
          supply.images && supply.images.length > 0
            ? supply.images[0]
            : supply.image || '',
        unitPrice,
        requestedQuantity: requestedQty,
        validQuantity,
        itemTotal,
        availableStock: supply.quantity,
        minOrderQuantity: minOrderQty,
        supplierId,
        supplierName: supply.supplierName,
        location: supply.location,
        warranty: supply.warranty || '',
        isUnavailable: false,
        stockWarning
      });
    }

    subtotal = Number(subtotal.toFixed(2));
    // Courier delivery fee: $3.50 flat rate per order (or $0 for warehouse pickup)
    const deliveryFee = deliveryMethod === 'pickup' || subtotal === 0 ? 0 : 3.50;
    const total = Number((subtotal + deliveryFee).toFixed(2));

    res.json({
      success: true,
      items: validatedItems,
      subtotal,
      deliveryFee,
      deliveryMethod,
      total,
      uniqueSuppliersCount: suppliersSet.size,
      suppliers: Array.from(suppliersSet.values()),
      hasUnavailableItems,
      hasStockIssues
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
