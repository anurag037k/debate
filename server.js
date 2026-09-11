const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const dbURI = 'mongodb+srv://register79:Anuragkr67@vidhiora.6b0opee.mongodb.net/?appName=Vidhiora';

mongoose.connect(dbURI)
    .then(() => console.log('✅ Securely Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ Database Connection Error:', err));

const userSchema = new mongoose.Schema({
    registrationNumber: { type: Number },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    college: { type: String, required: true },
    qualification: { type: String, required: true },
    course: { type: String, required: true },
    city: { type: String, required: true },
    transactionId: { type: String, required: true },
    status: { type: String, default: "Pending Verification" },
    registrationDate: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

app.get('/api/registration-count', async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ count: 0 });
    }
});

app.post('/api/register', [
    body('fullName').trim().escape().notEmpty(),
    body('email').trim().normalizeEmail().isEmail(),
    body('phone').trim().escape().isNumeric(),
    body('college').trim().escape().notEmpty(),
    body('qualification').trim().escape().notEmpty(),
    body('course').trim().escape().notEmpty(),
    body('city').trim().escape().notEmpty(),
    body('transactionId').trim().escape().isLength({ min: 12, max: 12 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const currentCount = await User.countDocuments();
        const assignedNumber = currentCount + 1;

        const userDataToSave = {
            ...req.body,
            registrationNumber: assignedNumber
        };

        await User.create(userDataToSave);
        res.status(200).json({ success: true, registrationNumber: assignedNumber });
    } catch (error) {
        res.status(500).json({ success: false, errors: [{ msg: "Database error." }] });
    }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find().sort({ registrationDate: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

app.post('/api/admin/approve/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            { status: "Confirmed" }, 
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ success: false });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});
const path = require('path'); // Make sure path is imported

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Explicitly serve index.html on root request
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));