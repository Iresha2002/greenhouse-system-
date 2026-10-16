const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');


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

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'farmer',
            phoneNumber,
            location
        });

        await user.save();
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role, phoneNumber: user.phoneNumber, location: user.location } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role, phoneNumber: user.phoneNumber, location: user.location } });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});





































module.exports = router;