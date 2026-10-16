const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// ==========================================
// PUBLIC CUSTOMER PRODUCT APIS
// ==========================================

// 1. GET ALL ACTIVE PRODUCTS (with search, category, stock filter, sorting)
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      inStockOnly,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      page = 1,
      limit = 50
    } = req.query;

    const query = { status: 'active' };

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // In Stock Only filter
    if (inStockOnly === 'true' || inStockOnly === true) {
      query.quantity = { $gt: 0 };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Text search query
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { farmerName: regex },
        { location: regex },
        { description: regex }
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price-low') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'price-high') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'newest') {
      sortOptions = { harvestDate: -1, createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: products
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// FARMER PRODUCT MANAGEMENT APIS (PROTECTED)
// ==========================================

// 2. GET LOGGED IN FARMER'S PRODUCTS
router.get('/farmer/my-products', protect, authorizeRoles('farmer'), async (req, res) => {
  try {
    const myProducts = await Product.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: myProducts.length,
      data: myProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET SINGLE PRODUCT BY ID (PUBLIC)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ error: 'Invalid product ID format' });
  }
});

// 4. CREATE A NEW CROP LISTING (FARMER ONLY)
router.post('/', protect, authorizeRoles('farmer'), async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      images,
      image,
      price,
      unit,
      quantity,
      lowStockThreshold,
      minOrderQuantity,
      harvestDate,
      isOrganicVerified,
      deliveryOptions,
      location,
      status
    } = req.body;

    // Validate required fields
    if (!name || !price || !unit || quantity === undefined) {
      return res.status(400).json({
        error: 'Missing required crop fields: name, price, unit, and quantity are mandatory'
      });
    }

    // Assemble images array safely
    const imagesList = [];
    if (Array.isArray(images) && images.length > 0) {
      imagesList.push(...images.filter(img => typeof img === 'string' && img.trim()));
    } else if (image && typeof image === 'string' && image.trim()) {
      imagesList.push(image.trim());
    }

    const product = new Product({
      name: name.trim(),
      category: category || 'Vegetables',
      description: description ? description.trim() : 'Locally harvested fresh produce from SmartGrow monitored greenhouse.',
      images: imagesList,
      price: Number(price),
      unit: unit.trim(),
      quantity: Number(quantity),
      lowStockThreshold: lowStockThreshold !== undefined ? Number(lowStockThreshold) : 10,
      minOrderQuantity: minOrderQuantity !== undefined ? Number(minOrderQuantity) : 1,
      farmer: req.user._id,
      farmerName: req.user.username,
      location: location && location.trim() ? location.trim() : req.user.location,
      harvestDate: harvestDate ? new Date(harvestDate) : new Date(),
      isOrganicVerified: Boolean(isOrganicVerified),
      deliveryOptions: deliveryOptions || { homeDelivery: true, farmPickup: true },
      status: status || 'active'
    });

    const savedProduct = await product.save();
    res.status(201).json({
      success: true,
      message: 'Crop listing created successfully',
      data: savedProduct
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 5. UPDATE MY CROP LISTING (FARMER ONLY - OWNERSHIP ENFORCED)
router.put('/:id', protect, authorizeRoles('farmer'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Strict Backend Ownership Check
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to modify another farmer\'s crop listing'
      });
    }

    const {
      name,
      category,
      description,
      images,
      image,
      price,
      unit,
      quantity,
      lowStockThreshold,
      minOrderQuantity,
      harvestDate,
      isOrganicVerified,
      deliveryOptions,
      location,
      status
    } = req.body;

    if (name) product.name = name.trim();
    if (category) product.category = category;
    if (description) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (unit) product.unit = unit;
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (lowStockThreshold !== undefined) product.lowStockThreshold = Number(lowStockThreshold);
    if (minOrderQuantity !== undefined) product.minOrderQuantity = Number(minOrderQuantity);
    if (location) product.location = location.trim();
    if (harvestDate) product.harvestDate = new Date(harvestDate);
    if (isOrganicVerified !== undefined) product.isOrganicVerified = Boolean(isOrganicVerified);
    if (deliveryOptions) product.deliveryOptions = deliveryOptions;
    if (status) product.status = status;

    if (Array.isArray(images) && images.length > 0) {
      product.images = images.filter(img => typeof img === 'string' && img.trim());
    } else if (image && typeof image === 'string' && image.trim()) {
      product.images = [image.trim()];
    }

    product.updatedAt = Date.now();

    const updatedProduct = await product.save();
    res.json({
      success: true,
      message: 'Crop listing updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. TOGGLE LISTING STATUS (ACTIVE / INACTIVE) (FARMER ONLY - OWNERSHIP ENFORCED)
router.patch('/:id/status', protect, authorizeRoles('farmer'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to modify another farmer\'s crop listing'
      });
    }

    const { status } = req.body;
    if (!status || !['active', 'inactive', 'draft'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value. Must be active, inactive, or draft' });
    }

    product.status = status;
    product.updatedAt = Date.now();
    await product.save();

    res.json({
      success: true,
      message: `Crop listing status changed to ${status}`,
      data: product
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 7. DELETE CROP LISTING (FARMER ONLY - OWNERSHIP ENFORCED)
router.delete('/:id', protect, authorizeRoles('farmer'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Forbidden: You do not have permission to delete another farmer\'s crop listing'
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Crop listing removed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
