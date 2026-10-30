const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const ExpertProfile = require('../models/ExpertProfile');
const ProblemReport = require('../models/ProblemReport');
const Consultation = require('../models/Consultation');
const ExpertReview = require('../models/ExpertReview');
const ConsultationMessage = require('../models/ConsultationMessage');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { createNotification } = require('../utils/notificationHelper');

// All routes here require admin authentication
router.use(protect);
router.use(authorizeRoles('admin'));

// 1. GET /api/admin/expertconnect/stats — Overview metrics for the platform
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalExperts,
      pendingApplications,
      totalProblems,
      totalConsultations,
      completedConsultations,
      totalReviews
    ] = await Promise.all([
      User.countDocuments(),
      ExpertProfile.countDocuments({ verificationStatus: 'approved' }),
      ExpertProfile.countDocuments({ verificationStatus: 'pending' }),
      ProblemReport.countDocuments(),
      Consultation.countDocuments(),
      Consultation.countDocuments({ status: 'completed' }),
      ExpertReview.countDocuments()
    ]);

    // Aggregate consultation by status
    const statusAgg = await Consultation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const consultationsByStatus = {};
    statusAgg.forEach((s) => {
      consultationsByStatus[s._id] = s.count;
    });

    // Aggregate problems by category
    const catAgg = await ProblemReport.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalExperts,
        pendingApplications,
        totalProblems,
        totalConsultations,
        completedConsultations,
        totalReviews,
        consultationsByStatus,
        topProblemCategories: catAgg
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve platform statistics'
    });
  }
});

// 2. GET /api/admin/expertconnect/consultations — List all consultations across the platform with filters
router.get('/consultations', async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { consultationNumber: { $regex: search, $options: 'i' } },
        { farmerName: { $regex: search, $options: 'i' } },
        { expertName: { $regex: search, $options: 'i' } },
        { affectedCrop: { $regex: search, $options: 'i' } }
      ];
    }

    const consultations = await Consultation.find(filter)
      .populate('farmer', 'username email phoneNumber')
      .populate('expertUser', 'username email')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: consultations.length,
      consultations
    });
  } catch (error) {
    console.error('Admin consultations error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve platform consultations'
    });
  }
});

// 3. GET /api/admin/expertconnect/reviews — List all reviews with option to moderate
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await ExpertReview.find({})
      .populate('expertProfile', 'fullName professionalTitle profilePhoto')
      .populate('consultation', 'consultationNumber preferredDate')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Admin reviews error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve reviews'
    });
  }
});

// 4. DELETE /api/admin/expertconnect/reviews/:reviewId — Moderate/delete inappropriate review
router.delete('/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await ExpertReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    const expProfileId = review.expertProfile;
    await ExpertReview.findByIdAndDelete(reviewId);

    // Recalculate expert ratings
    const remainingReviews = await ExpertReview.find({ expertProfile: expProfileId });
    const count = remainingReviews.length;
    const sum = remainingReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avg = count > 0 ? Number((sum / count).toFixed(2)) : 0;

    await ExpertProfile.findByIdAndUpdate(expProfileId, {
      averageRating: avg,
      reviewsCount: count
    });

    return res.status(200).json({
      success: true,
      message: 'Review removed by administrator, expert ratings updated.',
      expertStats: { averageRating: avg, reviewsCount: count }
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
});

// 5. GET /api/admin/expertconnect/users — List platform users for moderation
router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user list'
    });
  }
});

// 6. PATCH /api/admin/expertconnect/users/:userId/suspend — Suspend or reactivate user account
router.patch('/users/:userId/suspend', async (req, res) => {
  try {
    const { userId } = req.params;
    const { isSuspended, suspensionReason } = req.body;

    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        error: 'Administrators cannot suspend their own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.isSuspended = Boolean(isSuspended);
    user.suspensionReason = isSuspended ? String(suspensionReason || 'Violation of platform terms').trim() : '';
    await user.save();

    // If expert, also toggle isAvailable
    if (user.role === 'expert') {
      await ExpertProfile.findOneAndUpdate(
        { user: user._id },
        { isAvailable: !isSuspended }
      );
    }

    // Send in-app notification to the user
    await createNotification({
      recipient: user._id,
      type: 'expert_application_status',
      title: isSuspended ? 'Account Suspended' : 'Account Reinstated',
      message: isSuspended
        ? `Your SmartGrow account has been suspended by administration. Reason: ${user.suspensionReason}`
        : 'Your SmartGrow account has been restored to active status.',
      linkTab: 'overview'
    });

    return res.status(200).json({
      success: true,
      message: isSuspended
        ? `Account for ${user.username} has been suspended.`
        : `Account for ${user.username} has been reactivated.`,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isSuspended: user.isSuspended,
        suspensionReason: user.suspensionReason
      }
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update user suspension status'
    });
  }
});

module.exports = router;
