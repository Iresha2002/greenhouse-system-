const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ExpertProfile = require('../models/ExpertProfile');

const escapeRegex = (text = '') => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 1. GET /api/experts/specializations — List all 14 configurable specializations & consultation types
router.get('/specializations', (req, res) => {
  return res.status(200).json({
    success: true,
    specializations: ExpertProfile.SPECIALIZATIONS,
    consultationTypes: ExpertProfile.CONSULTATION_TYPES
  });
});

// 2. GET /api/experts — List, search, filter, and sort verified agricultural experts
router.get('/', async (req, res) => {
  try {
    const {
      search,
      specialization,
      qualification,
      consultationType,
      availableOnly,
      verifiedOnly = 'true',
      minFee,
      maxFee,
      sortBy = 'experience',
      page = 1,
      limit = 50
    } = req.query;

    // Only approved experts appear in the public directory by default
    const query = {
      verificationStatus: 'approved'
    };

    if (verifiedOnly === 'true' || verifiedOnly === true) {
      query.isVerified = true;
    }

    if (availableOnly === 'true' || availableOnly === true) {
      query.isAvailable = true;
    }

    // Filter by specialization
    if (
      specialization &&
      specialization.trim() &&
      specialization !== 'All' &&
      specialization !== 'all'
    ) {
      query.specializations = specialization.trim();
    }

    // Filter by qualification keyword (e.g., PhD, MSc, BSc)
    if (
      qualification &&
      qualification.trim() &&
      qualification !== 'All' &&
      qualification !== 'all'
    ) {
      query.qualifications = new RegExp(escapeRegex(qualification.trim()), 'i');
    }

    // Filter by consultation type ('video', 'text', 'phone', 'in_person')
    if (
      consultationType &&
      consultationType.trim() &&
      consultationType !== 'All' &&
      consultationType !== 'all'
    ) {
      query.consultationTypes = consultationType.trim();
    }

    // Filter by fee range
    if (minFee !== undefined || maxFee !== undefined) {
      query.consultationFee = {};
      if (minFee !== undefined && minFee !== '') {
        const numMin = Number(minFee);
        if (!isNaN(numMin) && numMin >= 0) {
          query.consultationFee.$gte = numMin;
        }
      }
      if (maxFee !== undefined && maxFee !== '') {
        const numMax = Number(maxFee);
        if (!isNaN(numMax) && numMax >= 0) {
          query.consultationFee.$lte = numMax;
        }
      }
      if (Object.keys(query.consultationFee).length === 0) {
        delete query.consultationFee;
      }
    }

    // Search by expert name, title, qualifications, specialization, or biography
    if (search && search.trim()) {
      const safeRegex = new RegExp(escapeRegex(search.trim()), 'i');
      query.$or = [
        { fullName: safeRegex },
        { professionalTitle: safeRegex },
        { qualifications: safeRegex },
        { fieldOfStudy: safeRegex },
        { specializations: safeRegex },
        { biography: safeRegex },
        { location: safeRegex }
      ];
    }

    // Sorting options
    let sortOptions = { isAvailable: -1, yearsOfExperience: -1 };
    if (sortBy === 'availability') {
      sortOptions = { isAvailable: -1, yearsOfExperience: -1 };
    } else if (sortBy === 'rating') {
      sortOptions = { averageRating: -1, completedConsultationsCount: -1, yearsOfExperience: -1 };
    } else if (sortBy === 'feeAsc') {
      sortOptions = { consultationFee: 1 };
    } else if (sortBy === 'feeDesc') {
      sortOptions = { consultationFee: -1 };
    } else if (sortBy === 'experience') {
      sortOptions = { yearsOfExperience: -1 };
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const pageLimit = Math.max(1, Math.min(100, Number(limit) || 50));
    const skip = (currentPage - 1) * pageLimit;

    // Never expose private supportingDocuments in public directory endpoints
    const total = await ExpertProfile.countDocuments(query);
    const experts = await ExpertProfile.find(query)
      .select('-supportingDocuments -verificationNotes')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit);

    return res.status(200).json({
      success: true,
      count: experts.length,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / pageLimit),
      data: experts
    });
  } catch (error) {
    console.error('Get experts directory error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve expert directory'
    });
  }
});

// 3. GET /api/experts/:id — Retrieve detailed public profile for a single verified expert
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Agricultural expert profile not found'
      });
    }

    const expert = await ExpertProfile.findOne({
      _id: id,
      verificationStatus: 'approved'
    }).select('-supportingDocuments -verificationNotes');

    if (!expert) {
      return res.status(404).json({
        success: false,
        error: 'Verified expert profile not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: expert
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve expert profile details'
    });
  }
});

module.exports = router;
