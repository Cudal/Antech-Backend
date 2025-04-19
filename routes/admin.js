const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

// Get dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get total products
    const totalProducts = await Product.countDocuments();

    // Get total orders
    const totalOrders = await Order.countDocuments();

    // Get active users (users who have placed at least one order)
    const activeUsers = await Order.distinct('user').length;

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

    res.json({
      totalProducts,
      totalOrders,
      activeUsers,
      totalRevenue,
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

module.exports = router; 