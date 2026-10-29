const express = require('express');
const router = express.Router();
const SupplyProduct = require('../models/SupplyProduct');

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
    const supplies = await SupplyProduct.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit);

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

// 3. GET SINGLE SUPPLY PRODUCT BY ID (PUBLIC)
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

module.exports = router;
