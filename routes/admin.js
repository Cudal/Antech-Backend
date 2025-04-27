const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ShowcaseImage = require('../models/ShowcaseImage');
const { adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer config for showcase image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/showcase'));
  },
  filename: function (req, file, cb) {
    cb(null, 'showcase-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Get dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get total users (all users)
    const totalUsers = await User.countDocuments();

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // DEBUG LOG
    console.log('DEBUG: This is the latest deployment!');

    // Calculate total revenue
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'username email');

    // RESPONSE DEBUG LOG
    console.log('RESPONSE DEBUG:', {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders
    });

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

// Get showcase image URL
router.get('/showcase-image', async (req, res) => {
  try {
    const img = await ShowcaseImage.findOne();
    res.json({ url: img ? img.url : null });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching showcase image' });
  }
});

// Admin upload/change showcase image
router.post('/showcase-image', adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const url = `/showcase/${req.file.filename}`;
    let img = await ShowcaseImage.findOne();
    if (img) {
      img.url = url;
      img.updatedAt = new Date();
      await img.save();
    } else {
      img = new ShowcaseImage({ url });
      await img.save();
    }
    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading showcase image' });
  }
});

module.exports = router; 