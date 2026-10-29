const express = require('express');
const router = express.Router();
const SupplyProduct = require('../models/SupplyProduct');
const SupplyOrder = require('../models/SupplyOrder');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Helper to escape user regex input safely
const escapeRegex = (text = '') => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ==========================================
// PUBLIC AGRICULTURAL SUPPLIES MARKETPLACE APIS
// ==========================================

// 1. GET CONFIGURABLE SUPPLY CATEGORIES
router.get('/categories', (req, res) => {
  res.json({
    success: true,
    data: SupplyProduct.SUPPLY_CATEGORIES
  });
});

// 1B. GET DYNAMIC FILTER FACETS (Unique Suppliers, Brands & Max Price across active catalog)
router.get('/facets', async (req, res) => {
  try {
    const activeSupplies = await SupplyProduct.find(
      { status: 'active' },
      'supplierName brand price location'
    );

    const suppliers = Array.from(
      new Set(activeSupplies.map((s) => s.supplierName).filter(Boolean))
    ).sort();

    const brands = Array.from(
      new Set(activeSupplies.map((s) => s.brand).filter(Boolean))
    ).sort();

    const locations = Array.from(
      new Set(activeSupplies.map((s) => s.location).filter(Boolean))
    ).sort();

    const highestPrice = activeSupplies.reduce(
      (max, item) => (item.price > max ? item.price : max),
      150
    );

    res.json({
      success: true,
      data: {
        suppliers,
        brands,
        locations,
        maxCatalogPrice: Math.ceil(highestPrice / 10) * 10
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET ALL ACTIVE SUPPLY PRODUCTS (Search, Category, Brand, Supplier, Price, Stock, Sort & Pagination)
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      supplier,
      brand,
      location,
      inStockOnly,
      featuredOnly,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      page = 1,
      limit = 50
    } = req.query;

    const query = { status: 'active' };

    // Category validation & filter
    if (category && category !== 'All' && category !== 'all') {
      if (!SupplyProduct.SUPPLY_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Invalid supply category: ${category}` });
      }
      query.category = category;
    }

    // In-Stock filter
    if (inStockOnly === 'true' || inStockOnly === true) {
      query.quantity = { $gt: 0 };
    }

    // Featured filter
    if (featuredOnly === 'true' || featuredOnly === true) {
      query.isFeatured = true;
    }

    // Supplier filter
    if (supplier && supplier.trim() && supplier !== 'All' && supplier !== 'all') {
      query.supplierName = new RegExp(`^${escapeRegex(supplier.trim())}$`, 'i');
    }

    // Brand filter
    if (brand && brand.trim() && brand !== 'All' && brand !== 'all') {
      query.brand = new RegExp(`^${escapeRegex(brand.trim())}$`, 'i');
    }

    // Location filter
    if (location && location.trim() && location !== 'All' && location !== 'all') {
      query.location = new RegExp(escapeRegex(location.trim()), 'i');
    }

    // Price range validation & filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      let numMin = null;
      let numMax = null;

      if (minPrice !== undefined && minPrice !== '') {
        numMin = Number(minPrice);
        if (isNaN(numMin) || numMin < 0) {
          return res.status(400).json({ error: 'minPrice must be a non-negative number' });
        }
        query.price.$gte = numMin;
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        numMax = Number(maxPrice);
        if (isNaN(numMax) || numMax < 0) {
          return res.status(400).json({ error: 'maxPrice must be a non-negative number' });
        }
        query.price.$lte = numMax;
      }
      if (numMin !== null && numMax !== null && numMin > numMax) {
        return res.status(400).json({ error: 'minPrice cannot be greater than maxPrice' });
      }
    }

    // Multi-field search (name, brand, model, sku, supplierName, category, description, specifications)
    if (search && search.trim()) {
      const safeRegex = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [
        { name: safeRegex },
        { brand: safeRegex },
        { model: safeRegex },
        { sku: safeRegex },
        { supplierName: safeRegex },
        { category: safeRegex },
        { description: safeRegex },
        { 'specifications.composition': safeRegex },
        { 'specifications.communicationProtocol': safeRegex },
        { 'specifications.compatibility': safeRegex }
      ];
    }

    // Sorting options
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'priceAsc' || sortBy === 'price-low') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'priceDesc' || sortBy === 'price-high') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'featured') {
      sortOptions = { isFeatured: -1, createdAt: -1 };
    } else if (sortBy === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const pageLimit = Math.max(1, Math.min(100, Number(limit) || 50));
    const skip = (currentPage - 1) * pageLimit;

    const total = await SupplyProduct.countDocuments(query);
    const suppliesDocs = await SupplyProduct.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit)
      .lean();

    // Stage 11 (Section 4.1 & 4.2): Compute genuine order counts per supply product from SupplyOrder collection
    const salesAggregation = await SupplyOrder.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['cancelled', 'rejected'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.supply',
          totalUnitsSold: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    const salesMap = {};
    for (const row of salesAggregation) {
      if (row._id) {
        salesMap[row._id.toString()] = {
          totalUnitsSold: row.totalUnitsSold || 0,
          orderCount: row.orderCount || 0
        };
      }
    }

    let supplies = suppliesDocs.map((item) => {
      const stats = salesMap[item._id.toString()] || { totalUnitsSold: 0, orderCount: 0 };
      return {
        ...item,
        totalUnitsSold: stats.totalUnitsSold,
        orderCount: stats.orderCount
      };
    });

    if (sortBy === 'popular' || sortBy === 'bestSelling') {
      supplies = supplies.sort(
        (a, b) =>
          (b.totalUnitsSold || 0) - (a.totalUnitsSold || 0) ||
          (b.orderCount || 0) - (a.orderCount || 0)
      );
    }

    res.json({
      success: true,
      count: supplies.length,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / pageLimit),
      data: supplies
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// SUPPLIER PORTAL PRODUCT MANAGEMENT APIS (PROTECTED)
// ==========================================

// 3. GET LOGGED-IN SUPPLIER'S OWN SUPPLY LISTINGS + DASHBOARD METRICS
router.get('/supplier/my-supplies', protect, authorizeRoles('supplier'), async (req, res) => {
  try {
    const mySupplies = await SupplyProduct.find({ supplier: req.user._id }).sort({
      createdAt: -1
    });

    const totalListed = mySupplies.length;
    const activeCount = mySupplies.filter((s) => s.status === 'active').length;
    const outOfStockCount = mySupplies.filter((s) => s.quantity <= 0).length;
    const lowStockCount = mySupplies.filter(
      (s) => s.quantity > 0 && s.quantity <= (s.lowStockThreshold || 5)
    ).length;

    res.json({
      success: true,
      count: totalListed,
      metrics: {
        totalListed,
        activeCount,
        outOfStockCount,
        lowStockCount
      },
      data: mySupplies
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET SINGLE SUPPLY PRODUCT BY ID (PUBLIC)
router.get('/:id', async (req, res) => {
  try {
    const supply = await SupplyProduct.findById(req.params.id);
    if (!supply) {
      return res.status(404).json({ error: 'Agricultural supply product not found' });
    }
    res.json({
      success: true,
      data: supply
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid supply product ID format' });
  }
});

// 5. CREATE NEW AGRICULTURAL SUPPLY LISTING (SUPPLIER ONLY)
router.post('/', protect, authorizeRoles('supplier'), async (req, res) => {
  try {
    const {
      name,
      category,
      brand,
      model,
      sku,
      description,
      images,
      image,
      price,
      unit,
      quantity,
      lowStockThreshold,
      minOrderQuantity,
      location,
      warranty,
      specifications,
      deliveryOptions,
      isFeatured,
      status
    } = req.body;

    if (!name || price === undefined || !unit || quantity === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: name, price, unit, and quantity are mandatory'
      });
    }

    if (category && !SupplyProduct.SUPPLY_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Invalid supply category: ${category}` });
    }

    const numPrice = Number(price);
    const numQty = Number(quantity);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({ error: 'Unit price must be greater than zero' });
    }
    if (isNaN(numQty) || numQty < 0) {
      return res.status(400).json({ error: 'Stock quantity cannot be negative' });
    }

    const imagesList = [];
    if (Array.isArray(images) && images.length > 0) {
      imagesList.push(...images.filter((img) => typeof img === 'string' && img.trim()));
    } else if (image && typeof image === 'string' && image.trim()) {
      imagesList.push(image.trim());
    }

    const supply = new SupplyProduct({
      name: name.trim(),
      category: category || 'Fertilizers',
      brand: brand ? brand.trim() : '',
      model: model ? model.trim() : '',
      sku: sku ? sku.trim() : '',
      description: description
        ? description.trim()
        : 'Commercial agricultural supply for SmartGrow greenhouse operations.',
      images: imagesList,
      price: numPrice,
      unit: unit.trim(),
      quantity: numQty,
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 5,
      minOrderQuantity: minOrderQuantity !== undefined ? Math.max(1, Number(minOrderQuantity)) : 1,
      supplier: req.user._id,
      supplierName: req.user.username,
      location: location && location.trim() ? location.trim() : req.user.location,
      warranty: warranty ? warranty.trim() : '',
      specifications: {
        composition: specifications?.composition?.trim() || '',
        packageSize: specifications?.packageSize?.trim() || '',
        voltage: specifications?.voltage?.trim() || '',
        powerRequirements: specifications?.powerRequirements?.trim() || '',
        communicationProtocol: specifications?.communicationProtocol?.trim() || '',
        supportedInterfaces: specifications?.supportedInterfaces?.trim() || '',
        operatingConditions: specifications?.operatingConditions?.trim() || '',
        compatibility: specifications?.compatibility?.trim() || '',
        applicationInstructions: specifications?.applicationInstructions?.trim() || '',
        safetyPrecautions: specifications?.safetyPrecautions?.trim() || ''
      },
      deliveryOptions: deliveryOptions || {
        islandwideDelivery: true,
        warehousePickup: true
      },
      isFeatured: Boolean(isFeatured),
      status: status && ['active', 'inactive', 'draft'].includes(status) ? status : 'active'
    });

    const savedSupply = await supply.save();
    res.status(201).json({
      success: true,
      message: 'Agricultural supply product listed successfully',
      data: savedSupply
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. UPDATE EXISTING SUPPLY LISTING (SUPPLIER ONLY - STRICT OWNERSHIP ENFORCED)
router.put('/:id', protect, authorizeRoles('supplier'), async (req, res) => {
  try {
    const supply = await SupplyProduct.findById(req.params.id);
    if (!supply) {
      return res.status(404).json({ error: 'Agricultural supply product not found' });
    }

    if (supply.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to edit another supplier's product listing"
      });
    }

    const {
      name,
      category,
      brand,
      model,
      sku,
      description,
      images,
      image,
      price,
      unit,
      quantity,
      lowStockThreshold,
      minOrderQuantity,
      location,
      warranty,
      specifications,
      deliveryOptions,
      isFeatured,
      status
    } = req.body;

    if (name !== undefined) supply.name = name.trim();
    if (category !== undefined) {
      if (!SupplyProduct.SUPPLY_CATEGORIES.includes(category)) {
        return res.status(400).json({ error: `Invalid supply category: ${category}` });
      }
      supply.category = category;
    }
    if (brand !== undefined) supply.brand = brand.trim();
    if (model !== undefined) supply.model = model.trim();
    if (sku !== undefined) supply.sku = sku.trim();
    if (description !== undefined) supply.description = description.trim();
    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({ error: 'Unit price must be greater than zero' });
      }
      supply.price = numPrice;
    }
    if (unit !== undefined) supply.unit = unit.trim();
    if (quantity !== undefined) {
      const numQty = Number(quantity);
      if (isNaN(numQty) || numQty < 0) {
        return res.status(400).json({ error: 'Stock quantity cannot be negative' });
      }
      supply.quantity = numQty;
    }
    if (lowStockThreshold !== undefined) supply.lowStockThreshold = Number(lowStockThreshold);
    if (minOrderQuantity !== undefined) {
      supply.minOrderQuantity = Math.max(1, Number(minOrderQuantity));
    }
    if (location !== undefined) supply.location = location.trim();
    if (warranty !== undefined) supply.warranty = warranty.trim();
    if (isFeatured !== undefined) supply.isFeatured = Boolean(isFeatured);
    if (status && ['active', 'inactive', 'draft'].includes(status)) {
      supply.status = status;
    }
    if (deliveryOptions) {
      supply.deliveryOptions = {
        islandwideDelivery: Boolean(deliveryOptions.islandwideDelivery),
        warehousePickup: Boolean(deliveryOptions.warehousePickup)
      };
    }
    if (specifications) {
      supply.specifications = {
        composition: specifications.composition?.trim() ?? supply.specifications?.composition ?? '',
        packageSize: specifications.packageSize?.trim() ?? supply.specifications?.packageSize ?? '',
        voltage: specifications.voltage?.trim() ?? supply.specifications?.voltage ?? '',
        powerRequirements:
          specifications.powerRequirements?.trim() ?? supply.specifications?.powerRequirements ?? '',
        communicationProtocol:
          specifications.communicationProtocol?.trim() ??
          supply.specifications?.communicationProtocol ??
          '',
        supportedInterfaces:
          specifications.supportedInterfaces?.trim() ??
          supply.specifications?.supportedInterfaces ??
          '',
        operatingConditions:
          specifications.operatingConditions?.trim() ??
          supply.specifications?.operatingConditions ??
          '',
        compatibility:
          specifications.compatibility?.trim() ?? supply.specifications?.compatibility ?? '',
        applicationInstructions:
          specifications.applicationInstructions?.trim() ??
          supply.specifications?.applicationInstructions ??
          '',
        safetyPrecautions:
          specifications.safetyPrecautions?.trim() ??
          supply.specifications?.safetyPrecautions ??
          ''
      };
    }

    if (Array.isArray(images)) {
      supply.images = images.filter((img) => typeof img === 'string' && img.trim());
    } else if (image !== undefined) {
      supply.images = image && image.trim() ? [image.trim()] : [];
    }

    supply.updatedAt = Date.now();
    const updated = await supply.save();

    res.json({
      success: true,
      message: 'Supply product updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 7. TOGGLE LISTING STATUS (ACTIVE / INACTIVE / DRAFT) (SUPPLIER ONLY - OWNERSHIP ENFORCED)
router.patch('/:id/status', protect, authorizeRoles('supplier'), async (req, res) => {
  try {
    const supply = await SupplyProduct.findById(req.params.id);
    if (!supply) {
      return res.status(404).json({ error: 'Agricultural supply product not found' });
    }

    if (supply.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to change another supplier's listing status"
      });
    }

    const { status } = req.body;
    if (!status || !['active', 'inactive', 'draft'].includes(status)) {
      return res
        .status(400)
        .json({ error: 'Invalid status. Must be active, inactive, or draft' });
    }

    supply.status = status;
    supply.updatedAt = Date.now();
    await supply.save();

    res.json({
      success: true,
      message: `Supply listing status updated to ${status}`,
      data: supply
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 8. DELETE SUPPLY PRODUCT LISTING (SUPPLIER ONLY - OWNERSHIP ENFORCED)
router.delete('/:id', protect, authorizeRoles('supplier'), async (req, res) => {
  try {
    const supply = await SupplyProduct.findById(req.params.id);
    if (!supply) {
      return res.status(404).json({ error: 'Agricultural supply product not found' });
    }

    if (supply.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to delete another supplier's listing"
      });
    }

    await SupplyProduct.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Supply product listing deleted permanently'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. UPDATE SUPPLY INVENTORY STOCK & LOW-STOCK THRESHOLD (SUPPLIER ONLY - OWNERSHIP ENFORCED)
router.patch('/:id/stock', protect, authorizeRoles('supplier'), async (req, res) => {
  try {
    const { quantity, adjustment, lowStockThreshold } = req.body;

    const supply = await SupplyProduct.findById(req.params.id);
    if (!supply) {
      return res.status(404).json({ error: 'Agricultural supply product not found' });
    }

    if (supply.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to modify another supplier's inventory"
      });
    }

    // Apply either absolute quantity or relative +/- adjustment
    if (quantity !== undefined) {
      const numQuantity = Number(quantity);
      if (isNaN(numQuantity) || numQuantity < 0) {
        return res.status(400).json({ error: 'Stock quantity must be a non-negative number' });
      }
      supply.quantity = Math.floor(numQuantity);
    } else if (adjustment !== undefined) {
      const numAdj = Number(adjustment);
      if (isNaN(numAdj)) {
        return res.status(400).json({ error: 'Stock adjustment must be a valid number' });
      }
      const nextQty = supply.quantity + Math.floor(numAdj);
      if (nextQty < 0) {
        return res.status(400).json({ error: 'Stock quantity cannot be reduced below zero' });
      }
      supply.quantity = nextQty;
    } else if (lowStockThreshold === undefined) {
      return res.status(400).json({ error: 'Provide quantity, adjustment, or lowStockThreshold' });
    }

    if (lowStockThreshold !== undefined) {
      const numThreshold = Number(lowStockThreshold);
      if (isNaN(numThreshold) || numThreshold < 0) {
        return res.status(400).json({ error: 'lowStockThreshold must be a non-negative number' });
      }
      supply.lowStockThreshold = Math.floor(numThreshold);
    }

    supply.updatedAt = Date.now();
    await supply.save();

    const threshold = supply.lowStockThreshold ?? 5;
    const isOutOfStock = supply.quantity <= 0;
    const isLowStock = supply.quantity > 0 && supply.quantity <= threshold;

    res.json({
      success: true,
      message: isOutOfStock
        ? `Marked "${supply.name}" as Out of Stock (0 ${supply.unit})`
        : isLowStock
        ? `Low-stock alert: "${supply.name}" has ${supply.quantity} ${supply.unit} remaining (threshold: ${threshold})`
        : `Inventory updated: "${supply.name}" now has ${supply.quantity} ${supply.unit} in stock`,
      inventoryStatus: isOutOfStock ? 'OUT_OF_STOCK' : isLowStock ? 'LOW_STOCK' : 'IN_STOCK',
      data: supply
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
