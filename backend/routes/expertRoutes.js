const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ExpertProfile = require('../models/ExpertProfile');
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

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

    // Only approved experts appear in the public directory
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

// ==========================================
// STAGE 4: EXPERT APPLICATION, PROFILE & ADMIN VERIFICATION APIS
// ==========================================

// 3. POST /api/experts/apply — Authenticated user submits an application to become a verified expert
router.post('/apply', protect, async (req, res) => {
  try {
    const {
      fullName,
      professionalTitle,
      qualifications,
      fieldOfStudy,
      yearsOfExperience,
      experienceSummary,
      biography,
      specializations,
      languages,
      profilePhoto,
      location,
      consultationTypes,
      consultationFee,
      supportingDocuments
    } = req.body;

    if (!fullName || !professionalTitle || !qualifications || !biography) {
      return res.status(400).json({
        success: false,
        error:
          'Please provide full name, professional title, educational qualifications, and professional biography'
      });
    }

    const validSpecs = Array.isArray(specializations)
      ? specializations.filter((s) => ExpertProfile.SPECIALIZATIONS.includes(s))
      : [];

    if (validSpecs.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one valid agricultural specialization'
      });
    }

    const validTypes = Array.isArray(consultationTypes)
      ? consultationTypes.filter((t) => ExpertProfile.CONSULTATION_TYPES.includes(t))
      : ['video', 'text'];

    const existingApplication = await ExpertProfile.findOne({ user: req.user._id });

    // Security rule: Applicants cannot mark themselves as 'approved' or 'isVerified: true'
    // If an already-approved expert updates their application via /apply, preserve their approved status;
    // otherwise assign 'pending' for Administrator review.
    const isAlreadyApproved =
      existingApplication &&
      existingApplication.verificationStatus === 'approved' &&
      existingApplication.isVerified === true;

    const safeDocs = Array.isArray(supportingDocuments)
      ? supportingDocuments
          .map((d) => String(d || '').trim())
          .filter((d) => d.length > 0 && d.length <= 500)
          .slice(0, 5)
      : [];

    const payload = {
      user: req.user._id,
      fullName: String(fullName).trim(),
      professionalTitle: String(professionalTitle).trim(),
      qualifications: String(qualifications).trim(),
      fieldOfStudy: String(fieldOfStudy || 'Agricultural Sciences').trim(),
      yearsOfExperience: Math.max(0, Number(yearsOfExperience) || 1),
      experienceSummary: String(experienceSummary || '').trim(),
      biography: String(biography).trim(),
      specializations: validSpecs,
      languages:
        Array.isArray(languages) && languages.length > 0
          ? languages.map((l) => String(l).trim()).filter(Boolean)
          : ['English', 'Sinhala'],
      profilePhoto: String(profilePhoto || '').trim(),
      location: String(location || req.user.location || 'Peradeniya Agricultural Hub').trim(),
      consultationTypes: validTypes.length > 0 ? validTypes : ['video', 'text'],
      consultationFee: Math.max(0, Number(consultationFee) || 0),
      supportingDocuments: safeDocs,
      verificationStatus: isAlreadyApproved ? 'approved' : 'pending',
      isVerified: isAlreadyApproved ? true : false,
      updatedAt: new Date()
    };

    const savedApplication = await ExpertProfile.findOneAndUpdate(
      { user: req.user._id },
      payload,
      { upsert: true, returnDocument: 'after' }
    );

    return res.status(201).json({
      success: true,
      message: isAlreadyApproved
        ? 'Your verified expert profile has been updated.'
        : 'Expert application submitted! Status is Pending Administrator Review.',
      application: savedApplication
    });
  } catch (error) {
    console.error('Submit expert application error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit expert application'
    });
  }
});

// 4. GET /api/experts/my-application — Get logged-in user's own expert application & verification status
router.get('/my-application', protect, async (req, res) => {
  try {
    const application = await ExpertProfile.findOne({ user: req.user._id });
    return res.status(200).json({
      success: true,
      application: application || null
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve your expert application status'
    });
  }
});

// 5. PUT /api/experts/my-profile — Verified expert updates their own permitted profile & availability
router.put('/my-profile', protect, async (req, res) => {
  try {
    const profile = await ExpertProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Expert profile not found. Please submit an expert application first.'
      });
    }

    const {
      professionalTitle,
      biography,
      experienceSummary,
      specializations,
      languages,
      profilePhoto,
      location,
      consultationTypes,
      consultationFee,
      isAvailable,
      availabilitySchedule
    } = req.body;

    if (professionalTitle !== undefined) {
      profile.professionalTitle = String(professionalTitle).trim();
    }
    if (biography !== undefined) {
      profile.biography = String(biography).trim();
    }
    if (experienceSummary !== undefined) {
      profile.experienceSummary = String(experienceSummary).trim();
    }
    if (Array.isArray(specializations) && specializations.length > 0) {
      const validSpecs = specializations.filter((s) =>
        ExpertProfile.SPECIALIZATIONS.includes(s)
      );
      if (validSpecs.length > 0) profile.specializations = validSpecs;
    }
    if (Array.isArray(languages) && languages.length > 0) {
      profile.languages = languages.map((l) => String(l).trim()).filter(Boolean);
    }
    if (profilePhoto !== undefined) {
      profile.profilePhoto = String(profilePhoto).trim();
    }
    if (location !== undefined) {
      profile.location = String(location).trim();
    }
    if (Array.isArray(consultationTypes) && consultationTypes.length > 0) {
      const validTypes = consultationTypes.filter((t) =>
        ExpertProfile.CONSULTATION_TYPES.includes(t)
      );
      if (validTypes.length > 0) profile.consultationTypes = validTypes;
    }
    if (consultationFee !== undefined) {
      profile.consultationFee = Math.max(0, Number(consultationFee) || 0);
    }
    if (typeof isAvailable === 'boolean') {
      profile.isAvailable = isAvailable;
    }
    if (availabilitySchedule && typeof availabilitySchedule === 'object') {
      profile.availabilitySchedule = {
        ...profile.availabilitySchedule,
        ...availabilitySchedule
      };
    }

    // Security guard: Never allow self-modification of verificationStatus or isVerified here
    profile.updatedAt = new Date();
    const updated = await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Expert profile and availability updated successfully',
      profile: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to update expert profile'
    });
  }
});

// 6. GET /api/experts/admin/applications — Administrator lists all expert applications (Pending, Under Review, Approved, Rejected)
router.get(
  '/admin/applications',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { status } = req.query;
      const filter = {};
      if (status && status !== 'all') {
        filter.verificationStatus = status;
      }

      const applications = await ExpertProfile.find(filter)
        .populate('user', 'username email phoneNumber role location')
        .sort({ updatedAt: -1 });

      const allApps = await ExpertProfile.find({});
      const metrics = {
        total: allApps.length,
        pending: allApps.filter((a) => a.verificationStatus === 'pending').length,
        underReview: allApps.filter((a) => a.verificationStatus === 'under_review').length,
        approved: allApps.filter((a) => a.verificationStatus === 'approved').length,
        rejected: allApps.filter((a) => a.verificationStatus === 'rejected').length
      };

      return res.status(200).json({
        success: true,
        metrics,
        count: applications.length,
        applications
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve expert applications for administrator review'
      });
    }
  }
);

// 7. PATCH /api/experts/admin/applications/:id/verify — Administrator approves, rejects, or marks under_review
router.patch(
  '/admin/applications/:id/verify',
  protect,
  authorizeRoles('admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, verificationNotes } = req.body;

      const allowedStatuses = ['pending', 'under_review', 'approved', 'rejected'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid verification status "${status}"`
        });
      }

      const application = await ExpertProfile.findById(id);
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Expert application not found'
        });
      }

      application.verificationStatus = status;
      application.isVerified = status === 'approved';
      if (verificationNotes !== undefined) {
        application.verificationNotes = String(verificationNotes).trim();
      }
      application.updatedAt = new Date();
      await application.save();

      // If approved, promote the applicant's User account role to 'expert' (unless they are an admin)
      if (status === 'approved' && application.user) {
        const applicantUser = await User.findById(application.user);
        if (applicantUser && applicantUser.role !== 'admin') {
          applicantUser.role = 'expert';
          await applicantUser.save();
        }
      }

      return res.status(200).json({
        success: true,
        message:
          status === 'approved'
            ? `Approved ${application.fullName} as a Verified Agricultural Expert!`
            : `Updated application status for ${application.fullName} to "${status}".`,
        application
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update expert verification status'
      });
    }
  }
);

// 8. GET /api/experts/:id — Retrieve detailed public profile for a single verified expert
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
