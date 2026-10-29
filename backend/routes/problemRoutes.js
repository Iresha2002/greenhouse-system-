const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ProblemReport = require('../models/ProblemReport');
const ExpertProfile = require('../models/ExpertProfile');
const { protect } = require('../middleware/authMiddleware');

// Rule-Based Mapping (Stage 6 Preview / Helper): Problem Category -> Relevant Expert Specializations
const CATEGORY_TO_SPECIALIZATIONS = {
  'Yellowing Leaves': ['Crop Nutrition', 'Nutrient Management', 'Plant Diseases', 'Greenhouse Management'],
  'Poor Crop Growth': ['Crop Nutrition', 'Greenhouse Management', 'Soil and Growing Media', 'Climate and Temperature Control'],
  'Nutrient Deficiency': ['Nutrient Management', 'Crop Nutrition', 'Hydroponics', 'Soil and Growing Media'],
  'Pest Problems': ['Pest Management', 'Sustainable Agriculture', 'Greenhouse Management'],
  'Plant Diseases': ['Plant Diseases', 'Crop Nutrition', 'Pest Management', 'Greenhouse Management'],
  'Irrigation Problems': ['Irrigation Systems', 'Hydroponics', 'Soil and Growing Media', 'Greenhouse Automation'],
  'Temperature and Humidity': ['Climate and Temperature Control', 'Greenhouse Management', 'Greenhouse Automation'],
  'Hydroponic System Problems': ['Hydroponics', 'Nutrient Management', 'Irrigation Systems'],
  'Sensor and Automation Problems': ['Sensor and IoT Systems', 'Greenhouse Automation', 'Climate and Temperature Control'],
  'Harvest Problems': ['Harvest Management', 'Crop Selection', 'Greenhouse Management'],
  'Other Agricultural Problems': ['Greenhouse Management', 'Sustainable Agriculture', 'Crop Selection']
};

// Helper to validate image URLs or data URIs (type & max size <= 2MB)
const validatePhotographs = (photos) => {
  if (!photos) return { valid: true, sanitized: [] };
  if (!Array.isArray(photos)) {
    return { valid: false, error: 'Photographs must be provided as an array of image URLs or data URIs' };
  }
  if (photos.length > 5) {
    return { valid: false, error: 'You can attach a maximum of 5 photographs per problem report' };
  }

  const sanitized = [];
  for (const raw of photos) {
    const str = String(raw || '').trim();
    if (!str) continue;

    if (str.startsWith('data:image/')) {
      const allowedMime = /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(str);
      if (!allowedMime) {
        return {
          valid: false,
          error: 'Uploaded images must be in JPEG, PNG, or WebP format'
        };
      }
      // Approx 2MB base64 length limit (~2.7M chars)
      if (str.length > 2800000) {
        return {
          valid: false,
          error: 'Each uploaded photograph must be smaller than 2 MB'
        };
      }
      sanitized.push(str);
    } else if (/^https?:\/\/.+/i.test(str)) {
      if (str.length > 1000) {
        return { valid: false, error: 'Photograph URL is too long' };
      }
      sanitized.push(str);
    } else {
      return {
        valid: false,
        error: 'Each photograph must be a valid https:// image URL or base64 image (JPEG, PNG, WebP)'
      };
    }
  }

  return { valid: true, sanitized };
};

// Helper: Compute rule-based matched experts for a problem report
const findMatchingExpertsForProblem = async (problem) => {
  const targetSpecs =
    CATEGORY_TO_SPECIALIZATIONS[problem.category] || ['Greenhouse Management'];

  const verifiedExperts = await ExpertProfile.find({
    verificationStatus: 'approved',
    isVerified: true
  }).select('-supportingDocuments -verificationNotes');

  const scoredMatches = verifiedExperts.map((exp) => {
    const matchedSpecs = (exp.specializations || []).filter((s) =>
      targetSpecs.includes(s)
    );
    const supportsPreferredMethod = (exp.consultationTypes || []).includes(
      problem.preferredConsultationType
    );

    let score = matchedSpecs.length * 10;
    if (supportsPreferredMethod) score += 5;
    if (exp.isAvailable) score += 4;

    const reasons = [];
    if (matchedSpecs.length > 0) {
      reasons.push(
        `Specializes in ${matchedSpecs.join(' and ')}`
      );
    } else {
      reasons.push(
        `Verified specialist in ${(exp.specializations || []).slice(0, 2).join(' and ')}`
      );
    }

    if (supportsPreferredMethod) {
      reasons.push(`offers ${problem.preferredConsultationType} consultations`);
    }
    if (exp.isAvailable) {
      reasons.push('currently available for booking');
    }

    return {
      expert: exp,
      matchScore: score,
      matchedSpecializations: matchedSpecs,
      explanation: `Recommended because this expert ${reasons.join(', ')}.`
    };
  });

  // Sort by highest match score, then years of experience
  scoredMatches.sort(
    (a, b) =>
      b.matchScore - a.matchScore ||
      (b.expert.yearsOfExperience || 0) - (a.expert.yearsOfExperience || 0)
  );

  return scoredMatches;
};

// 1. GET /api/problems/categories — List supported problem categories
router.get('/categories', (req, res) => {
  return res.status(200).json({
    success: true,
    categories: ProblemReport.PROBLEM_CATEGORIES,
    urgencyLevels: ProblemReport.URGENCY_LEVELS
  });
});

// 2. POST /api/problems — Create a new greenhouse problem report (Protected)
router.post('/', protect, async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      affectedCrop,
      greenhouseType,
      growthStage,
      dateFirstNoticed,
      symptoms,
      environmentalConditions,
      irrigationInfo,
      nutrientInfo,
      photographs,
      urgencyLevel,
      preferredConsultationType
    } = req.body;

    if (!title || !category || !description || !affectedCrop) {
      return res.status(400).json({
        success: false,
        error:
          'Please provide problem title, problem category, affected crop, and detailed description'
      });
    }

    if (!ProblemReport.PROBLEM_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid problem category: "${category}"`
      });
    }

    const photoCheck = validatePhotographs(photographs);
    if (!photoCheck.valid) {
      return res.status(400).json({
        success: false,
        error: photoCheck.error
      });
    }

    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const reportNumber = `PRB-${datePart}-${randPart}`;

    const cleanSymptoms = Array.isArray(symptoms)
      ? symptoms.map((s) => String(s).trim()).filter(Boolean)
      : String(symptoms || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    const newReport = await ProblemReport.create({
      reportNumber,
      farmer: req.user._id,
      farmerName: req.user.username || 'Greenhouse Farmer',
      title: String(title).trim(),
      category,
      description: String(description).trim(),
      affectedCrop: String(affectedCrop).trim(),
      greenhouseType: String(greenhouseType || 'Poly-Tunnel Greenhouse').trim(),
      growthStage: String(growthStage || 'Vegetative Stage').trim(),
      dateFirstNoticed: dateFirstNoticed ? new Date(dateFirstNoticed) : new Date(),
      symptoms: cleanSymptoms,
      environmentalConditions: {
        temperature: String(environmentalConditions?.temperature || '').trim(),
        humidity: String(environmentalConditions?.humidity || '').trim(),
        lightAndVentilation: String(
          environmentalConditions?.lightAndVentilation || ''
        ).trim()
      },
      irrigationInfo: String(irrigationInfo || '').trim(),
      nutrientInfo: String(nutrientInfo || '').trim(),
      photographs: photoCheck.sanitized,
      urgencyLevel: ProblemReport.URGENCY_LEVELS.includes(urgencyLevel)
        ? urgencyLevel
        : 'medium',
      preferredConsultationType: ['video', 'text', 'phone', 'in_person'].includes(
        preferredConsultationType
      )
        ? preferredConsultationType
        : 'video',
      status: 'open'
    });

    const recommendedExperts = await findMatchingExpertsForProblem(newReport);

    return res.status(201).json({
      success: true,
      message:
        'Greenhouse problem report saved! Review your recommended agricultural experts below.',
      report: newReport,
      recommendedExperts
    });
  } catch (error) {
    console.error('Create problem report error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save greenhouse problem report'
    });
  }
});

// 3. GET /api/problems/my-problems — List logged-in farmer's own problem reports (Strict Ownership)
router.get('/my-problems', protect, async (req, res) => {
  try {
    const reports = await ProblemReport.find({ farmer: req.user._id }).sort({
      createdAt: -1
    });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve your greenhouse problem reports'
    });
  }
});

// 4. GET /api/problems/:id — Get single problem report + matched experts (Owner or Admin only)
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        error: 'Problem report not found'
      });
    }

    const report = await ProblemReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Problem report not found'
      });
    }

    // Security check: Farmers must only be able to access their own problem reports
    const isOwner = report.farmer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only view your own greenhouse problem reports'
      });
    }

    const recommendedExperts = await findMatchingExpertsForProblem(report);

    return res.status(200).json({
      success: true,
      report,
      recommendedExperts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve problem report details'
    });
  }
});

// 5. PATCH /api/problems/:id/status — Farmer updates or closes their own problem report
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['open', 'consultation_requested', 'resolved', 'closed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status "${status}"`
      });
    }

    const report = await ProblemReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Problem report not found'
      });
    }

    if (report.farmer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only update your own problem reports'
      });
    }

    report.status = status;
    report.updatedAt = new Date();
    await report.save();

    return res.status(200).json({
      success: true,
      message: `Problem report status updated to "${status}"`,
      report
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update problem report status'
    });
  }
});

module.exports = router;
