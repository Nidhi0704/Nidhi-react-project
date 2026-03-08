'use strict';
const { Booking, AMC, Order, AuditLog } = require('../models/index');
const User = require('../models/User');
const Partner = require('../models/Partner');
const { sendSuccess } = require('../utils/response');

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  const cityFilter = req.cityFilter || {};

  const [
    totalBookings,
    pendingBookings,
    completedBookings,
    totalUsers,
    activePartners,
    pendingPartners,
    totalAMC,
    activeAMC,
    totalOrders,
  ] = await Promise.all([
    Booking.countDocuments(cityFilter),
    Booking.countDocuments({ ...cityFilter, status: 'pending' }),
    Booking.countDocuments({ ...cityFilter, status: 'completed' }),
    User.countDocuments({ isActive: true }),
    Partner.countDocuments({ ...cityFilter, isActive: true, approvalStatus: 'approved' }),
    Partner.countDocuments({ approvalStatus: 'pending' }),
    AMC.countDocuments(cityFilter),
    AMC.countDocuments({ ...cityFilter, status: 'active' }),
    Order.countDocuments(cityFilter),
  ]);

  // Revenue: sum of completed bookings
  const revenueResult = await Booking.aggregate([
    { $match: { ...cityFilter, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  return sendSuccess(res, {
    stats: {
      bookings: { total: totalBookings, pending: pendingBookings, completed: completedBookings },
      users: { total: totalUsers },
      partners: { active: activePartners, pending: pendingPartners },
      amc: { total: totalAMC, active: activeAMC },
      orders: { total: totalOrders },
      revenue: { total: totalRevenue },
    },
  });
};

// GET /api/admin/dashboard/recent
const getRecentActivity = async (req, res) => {
  const cityFilter = req.cityFilter || {};

  const [recentBookings, recentUsers, recentPartners] = await Promise.all([
    Booking.find(cityFilter)
      .populate('customer', 'firstName lastName phone')
      .populate('service', 'name')
      .sort({ createdAt: -1 }).limit(5),
    User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName phone city createdAt'),
    Partner.find({ approvalStatus: 'pending' }).sort({ createdAt: -1 }).limit(5).select('firstName lastName phone partnerType createdAt'),
  ]);

  return sendSuccess(res, { recentBookings, recentUsers, recentPartners });
};

// GET /api/admin/dashboard/stats/bookings
const getBookingStats = async (req, res) => {
  const cityFilter = req.cityFilter || {};

  // Bookings per month for the last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);

  const monthlyStats = await Booking.aggregate([
    { $match: { ...cityFilter, createdAt: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  return sendSuccess(res, { monthlyStats });
};

// GET /api/admin/audit
const getAuditLogs = async (req, res) => {
  const { page = 1, limit = 50, admin: adminId } = req.query;
  const filter = {};
  if (adminId) filter.admin = adminId;

  const [data, total] = await Promise.all([
    AuditLog.find(filter)
      .populate('admin', 'name email role')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    AuditLog.countDocuments(filter),
  ]);

  return sendSuccess(res, { data, total });
};

module.exports = { getDashboard, getRecentActivity, getBookingStats, getAuditLogs };