require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to allow requests from your Netlify domain
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*', // Replace with your Netlify URL in .env
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // 5 second timeout
}).then(() => {
    console.log('Connected to MongoDB successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err.message);
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Profile Schema
const profileSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true,
        match: /^[a-z0-9_]{3,30}$/ 
    },
    walletAddress: { 
        type: String, 
        required: true, 
        unique: true 
    },
    displayName: String,
    bio: String,
    role: {
        type: String,
        enum: ['individual', 'trader', 'artist', 'collector'],
        default: 'individual'
    },
    socialLinks: [{
        platform: String,
        username: String
    }],
    // Role-specific fields
    tradingExperience: String,
    tradingPairs: String,
    artStyle: String,
    galleryLink: String,
    collectionFocus: String,
    collectionSize: String,
    interests: String,
    experienceLevel: String,
    bannerImage: String,
    profilePic: String,
    themeColors: {
        primary: String,
        secondary: String
    },
    createdAt: { type: Date, default: Date.now }
});

const Profile = mongoose.model('Profile', profileSchema);

// Check username availability
app.get('/api/check-username/:username', async (req, res) => {
    try {
        const username = req.params.username.toLowerCase();
        const existingProfile = await Profile.findOne({ username });
        res.json({ available: !existingProfile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check wallet availability
app.get('/api/check-wallet/:address', async (req, res) => {
    try {
        const existingProfile = await Profile.findOne({ walletAddress: req.params.address });
        res.json({ available: !existingProfile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create initial profile
app.post('/api/profiles', async (req, res) => {
    try {
        const { username, walletAddress, role } = req.body;

        // Validate username format
        if (!username.match(/^[a-z0-9_]{3,30}$/)) {
            throw new Error('Invalid username format. Use only letters, numbers, and underscores.');
        }

        // Check if username exists
        const existingUsername = await Profile.findOne({ username });
        if (existingUsername) {
            throw new Error('Username already taken');
        }

        // Check if wallet exists
        const existingWallet = await Profile.findOne({ walletAddress });
        if (existingWallet) {
            throw new Error('Wallet already has a profile');
        }

        // Create initial profile
        const profile = new Profile({
            username,
            walletAddress,
            role,
            displayName: username
        });

        await profile.save();
        res.status(201).json(profile);
    } catch (error) {
        console.error('Error creating profile:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update profile
app.put('/api/profiles/:username', async (req, res) => {
    try {
        const username = req.params.username.toLowerCase();
        const profile = await Profile.findOne({ username });
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Update allowed fields
        const allowedUpdates = [
            'displayName', 'bio', 'role', 'socialLinks',
            'tradingExperience', 'tradingPairs', 'artStyle',
            'galleryLink', 'collectionFocus', 'collectionSize',
            'interests', 'experienceLevel', 'bannerImage', 'profilePic', 'themeColors'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                profile[field] = req.body[field];
            }
        });

        await profile.save();
        res.json(profile);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get profile
app.get('/api/profiles/:username', async (req, res) => {
    try {
        const username = req.params.username.toLowerCase();
        const profile = await Profile.findOne({ username });
        
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// File upload configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Upload profile picture
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
