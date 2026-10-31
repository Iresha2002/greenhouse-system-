const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', async (req, res) => {
    const { username, email, password, role, phoneNumber, location } = req.body;
    try {
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ error: 'Email is already registered' });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ error: 'Username is already taken' });
            }
        }

        // Security check: only allow valid roles
        const allowedRoles = ['farmer', 'supplier', 'customer', 'expert', 'admin'];
        const safeRole = allowedRoles.includes(role) ? role : 'farmer';

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username: String(username || '').trim(),
            email: String(email || '').trim().toLowerCase(),
            password: hashedPassword,
            role: safeRole,
            phoneNumber: String(phoneNumber || '').trim(),
            location: String(location || '').trim()
        });

        await user.save();
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                location: user.location,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: String(email || '').trim() });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        if (user.isSuspended) {
            return res.status(403).json({
                error: `Account suspended: ${user.suspensionReason || 'Please contact platform administration.'}`
            });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                location: user.location,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Stage 10 (Section 4.8): GET /api/auth/profile — View permitted account details (no password/token exposure)
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, error: 'Account profile not found' });
        }
        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                location: user.location,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Failed to retrieve account profile' });
    }
});

// Stage 10 (Section 4.8): PUT /api/auth/profile — Update permitted profile fields (username, phoneNumber, location)
// Explicitly prevents role escalation or password/email tampering
router.put('/profile', protect, async (req, res) => {
    try {
        const { username, phoneNumber, location } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Account profile not found' });
        }

        if (username !== undefined) {
            const cleanUsername = String(username).trim();
            if (cleanUsername.length < 3 || cleanUsername.length > 60) {
                return res.status(400).json({
                    success: false,
                    error: 'Username / Display Name must be between 3 and 60 characters'
                });
            }
            if (cleanUsername !== user.username) {
                const duplicate = await User.findOne({ username: cleanUsername, _id: { $ne: user._id } });
                if (duplicate) {
                    return res.status(400).json({
                        success: false,
                        error: 'That username is already in use by another account'
                    });
                }
                user.username = cleanUsername;
            }
        }

        if (phoneNumber !== undefined) {
            const cleanPhone = String(phoneNumber).trim();
            const digitsOnly = cleanPhone.replace(/[\s\-()]/g, '');
            if (!/^\+?[0-9]{9,15}$/.test(digitsOnly)) {
                return res.status(400).json({
                    success: false,
                    error: 'Please enter a valid contact phone number (9 to 15 digits)'
                });
            }
            user.phoneNumber = cleanPhone;
        }

        if (location !== undefined) {
            const cleanLocation = String(location).trim();
            if (cleanLocation.length < 3 || cleanLocation.length > 200) {
                return res.status(400).json({
                    success: false,
                    error: 'Delivery address / location must be between 3 and 200 characters'
                });
            }
            user.location = cleanLocation;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Account profile & delivery details updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                phoneNumber: user.phoneNumber,
                location: user.location,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to update account profile'
        });
    }
});

module.exports = router;
