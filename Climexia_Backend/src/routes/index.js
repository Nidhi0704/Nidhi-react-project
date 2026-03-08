'use strict';
const express = require('express');
const router = express.Router();

const {
  authRateLimiter,
  requireCustomer,
  requirePartner,
  requireAdmin,
  requireRole,
  requirePermission,
  applyCityScope,
  auditLog,
  uploadDocument,
  uploadProductImage,
  uploadServiceImage,
} = require('../middleware/index');

const { ROLES, PERMISSIONS } = require('../config/roles');

// Controllers
const customerAuth = require('../controllers/customerAuth.controller');
const partnerAuth = require('../controllers/partnerAuth.controller');
const adminAuth = require('../controllers/adminAuth.controller');
const catalog = require('../controllers/catalog.controller');
const booking = require('../controllers/booking.controller');
const admin = require('../controllers/admin.controller');
const dashboard = require('../controllers/dashboard.controller');
const support = require('../controllers/support.controller');

const { AMC, Order, Notification } = require('../models/index');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// ── CUSTOMER AUTH ─────────────────────────────────────────────────────────────
router.post('/auth/register', authRateLimiter, customerAuth.register);
router.post('/auth/login', authRateLimiter, customerAuth.login);
router.post('/auth/logout', customerAuth.logout);
router.post('/auth/refresh', customerAuth.refresh);
router.get('/auth/me', requireCustomer, customerAuth.getMe);
router.put('/auth/profile', requireCustomer, customerAuth.updateProfile);
router.post('/auth/address', requireCustomer, customerAuth.addAddress);
router.put('/auth/address/:id', requireCustomer, customerAuth.updateAddress);
router.delete('/auth/address/:id', requireCustomer, customerAuth.deleteAddress);

// ── PARTNER AUTH ──────────────────────────────────────────────────────────────
router.post('/partner/register', authRateLimiter, partnerAuth.register);
router.post('/partner/login', authRateLimiter, partnerAuth.login);
router.post('/partner/logout', partnerAuth.logout);
router.post('/partner/refresh', partnerAuth.refresh);
router.get('/partner/me', requirePartner, partnerAuth.getMe);
router.put('/partner/toggle-online', requirePartner, partnerAuth.toggleOnline);
router.post(
  '/partner/documents',
  requirePartner,
  uploadDocument.array('documents', 5),
  partnerAuth.uploadDocuments
);

// ── CATALOG (public) ──────────────────────────────────────────────────────────
router.get('/services', catalog.listServices);
router.get('/services/:id', catalog.getService);
router.get('/products', catalog.listProducts);
router.get('/products/:id', catalog.getProduct);
router.get('/parts', catalog.listParts);
router.get('/parts/:id', catalog.getPart);

// ── BOOKINGS ──────────────────────────────────────────────────────────────────
router.post('/bookings', requireCustomer, booking.createBooking);
router.get('/bookings/my', requireCustomer, booking.getMyBookings);
// Admin booking routes MUST come before :id to avoid route collision
router.get('/bookings/admin/all', requireAdmin, applyCityScope, requirePermission(PERMISSIONS.VIEW_BOOKINGS), booking.adminListBookings);
router.put('/bookings/admin/:id/assign', requireAdmin, requirePermission(PERMISSIONS.MANAGE_BOOKINGS), auditLog('ASSIGN_BOOKING', 'Booking'), booking.assignBooking);
router.put('/bookings/admin/:id/status', requireAdmin, requirePermission(PERMISSIONS.MANAGE_BOOKINGS), booking.updateBookingStatus);
// Partner booking routes
router.get('/bookings/partner/jobs', requirePartner, booking.getPartnerJobs);
router.put('/bookings/:id/accept', requirePartner, booking.acceptJob);
router.put('/bookings/:id/complete', requirePartner, booking.completeJob);
// Customer booking routes (generic :id last)
router.get('/bookings/:id', booking.getBooking);
router.put('/bookings/:id/cancel', requireCustomer, booking.cancelBooking);
router.post('/bookings/:id/review', requireCustomer, booking.addReview);

// ── AMC ───────────────────────────────────────────────────────────────────────
router.post('/amc', requireCustomer, async (req, res) => {
  const amc = await AMC.create({ customer: req.user._id, ...req.body, city: req.user.city });
  sendSuccess(res, { amc }, 'AMC request submitted', 201);
});
router.get('/amc/my', requireCustomer, async (req, res) => {
  const amcs = await AMC.find({ customer: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, { amcs });
});
router.get('/amc/admin/all', requireAdmin, applyCityScope, requirePermission(PERMISSIONS.VIEW_AMC), admin.listAMC);
router.put('/amc/admin/:id/activate', requireAdmin, requirePermission(PERMISSIONS.MANAGE_AMC), auditLog('ACTIVATE_AMC', 'AMC'), admin.activateAMC);
router.put('/amc/admin/:id/renew', requireAdmin, requirePermission(PERMISSIONS.MANAGE_AMC), auditLog('RENEW_AMC', 'AMC'), admin.renewAMC);
router.get('/amc/:id', requireCustomer, async (req, res) => {
  const amc = await AMC.findOne({ _id: req.params.id, customer: req.user._id });
  if (!amc) return sendError(res, 'AMC not found', 404);
  sendSuccess(res, { amc });
});

// ── ORDERS ────────────────────────────────────────────────────────────────────
router.post('/orders', requireCustomer, async (req, res) => {
  const order = await Order.create({ customer: req.user._id, ...req.body, city: req.user.city });
  sendSuccess(res, { order }, 'Order placed', 201);
});
router.get('/orders/my', requireCustomer, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const [data, total] = await Promise.all([
    Order.find({ customer: req.user._id }).skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 }),
    Order.countDocuments({ customer: req.user._id }),
  ]);
  sendPaginated(res, { data, total, page, limit });
});
router.get('/orders/admin/all', requireAdmin, applyCityScope, requirePermission(PERMISSIONS.VIEW_ORDERS), admin.listOrders);
router.put('/orders/admin/:id/status', requireAdmin, requirePermission(PERMISSIONS.MANAGE_ORDERS), admin.updateOrderStatus);

// ── SUPPORT ───────────────────────────────────────────────────────────────────
router.post('/support/tickets', requireCustomer, support.createTicket);
router.get('/support/tickets/my', requireCustomer, support.getMyTickets);
router.get('/support/tickets/:id', support.getTicket);          // auth checked inside handler
router.post('/support/tickets/:id/reply', support.replyToTicket); // auth checked inside handler

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
router.get('/notifications', requireCustomer, async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user._id,
    recipientType: 'user',
  }).sort({ createdAt: -1 }).limit(20);
  sendSuccess(res, { notifications });
});
router.put('/notifications/:id/read', requireCustomer, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  sendSuccess(res, {}, 'Marked as read');
});

// ── ADMIN AUTH ────────────────────────────────────────────────────────────────
router.post('/admin/auth/login', authRateLimiter, adminAuth.login);
router.post('/admin/auth/logout', adminAuth.logout);
router.post('/admin/auth/refresh', adminAuth.refresh);
router.get('/admin/auth/me', requireAdmin, adminAuth.getMe);
router.put('/admin/auth/change-password', requireAdmin, adminAuth.changePassword);
router.post('/admin/auth/forgot-password', authRateLimiter, adminAuth.forgotPassword);
router.post('/admin/auth/reset-password/:token', adminAuth.resetPassword);

// Staff management (super admin only)
router.get('/admin/auth/staff', requireAdmin, requireRole(ROLES.SUPER_ADMIN), adminAuth.listStaff);
router.post('/admin/auth/staff', requireAdmin, requireRole(ROLES.SUPER_ADMIN), auditLog('CREATE_STAFF', 'Admin'), adminAuth.createStaff);
router.get('/admin/auth/staff/:id', requireAdmin, requireRole(ROLES.SUPER_ADMIN), adminAuth.getStaff);
router.put('/admin/auth/staff/:id', requireAdmin, requireRole(ROLES.SUPER_ADMIN), auditLog('UPDATE_STAFF', 'Admin'), adminAuth.updateStaff);
router.delete('/admin/auth/staff/:id', requireAdmin, requireRole(ROLES.SUPER_ADMIN), auditLog('DELETE_STAFF', 'Admin'), adminAuth.deleteStaff);
router.put('/admin/auth/staff/:id/permissions', requireAdmin, requireRole(ROLES.SUPER_ADMIN), adminAuth.updatePermissions);

// ── ADMIN — USERS ─────────────────────────────────────────────────────────────
router.get('/admin/users', requireAdmin, requirePermission(PERMISSIONS.VIEW_USERS), admin.listUsers);
router.get('/admin/users/:id', requireAdmin, requirePermission(PERMISSIONS.VIEW_USERS), admin.getUser);
router.put('/admin/users/:id/block', requireAdmin, requirePermission(PERMISSIONS.MANAGE_USERS), auditLog('BLOCK_USER', 'User'), admin.blockUser);

// ── ADMIN — PARTNERS ──────────────────────────────────────────────────────────
router.get('/admin/partners', requireAdmin, applyCityScope, requirePermission(PERMISSIONS.VIEW_PARTNERS), admin.listPartners);
router.get('/admin/partners/:id', requireAdmin, requirePermission(PERMISSIONS.VIEW_PARTNERS), admin.getPartner);
router.put('/admin/partners/:id/approve', requireAdmin, requirePermission(PERMISSIONS.APPROVE_PARTNERS), auditLog('APPROVE_PARTNER', 'Partner'), admin.approvePartner);
router.put('/admin/partners/:id/reject', requireAdmin, requirePermission(PERMISSIONS.APPROVE_PARTNERS), auditLog('REJECT_PARTNER', 'Partner'), admin.rejectPartner);
router.put('/admin/partners/:id/block', requireAdmin, requirePermission(PERMISSIONS.MANAGE_PARTNERS), auditLog('BLOCK_PARTNER', 'Partner'), admin.blockPartner);
router.put('/admin/partners/:id/kyc', requireAdmin, requirePermission(PERMISSIONS.MANAGE_PARTNERS), admin.updatePartnerKYC);

// ── ADMIN — CATALOG ───────────────────────────────────────────────────────────
router.post('/admin/services', requireAdmin, requirePermission(PERMISSIONS.MANAGE_CATALOG), uploadServiceImage.single('image'), catalog.createService);
router.put('/admin/services/:id', requireAdmin, requirePermission(PERMISSIONS.MANAGE_CATALOG), uploadServiceImage.single('image'), catalog.updateService);
router.delete('/admin/services/:id', requireAdmin, requirePermission(PERMISSIONS.MANAGE_CATALOG), catalog.deleteService);

router.post('/admin/products', requireAdmin, requirePermission(PERMISSIONS.MANAGE_CATALOG), uploadProductImage.array('images', 5), catalog.createProduct);
router.put('/admin/products/:id', requireAdmin, requirePermission(PERMISSIONS.MANAGE_CATALOG), uploadProductImage.array('images', 5), catalog.updateProduct);
router.delete('/admin/products/:id', requireAdmin, requirePermission(PERMISSIONS.MANAGE_CATALOG), catalog.deleteProduct);

router.post('/admin/parts', requireAdmin, requirePermission(PERMISSIONS.MANAGE_CATALOG), catalog.createPart);
router.put('/admin/parts/:id', requireAdmin, requirePermission(PERMISSIONS.MANAGE_CATALOG), catalog.updatePart);
router.delete('/admin/parts/:id', requireAdmin, requirePermission(PERMISSIONS.MANAGE_CATALOG), catalog.deletePart);

// ── ADMIN — SUPPORT ───────────────────────────────────────────────────────────
router.get('/admin/support/tickets', requireAdmin, requirePermission(PERMISSIONS.VIEW_SUPPORT), support.adminListTickets);
router.put('/admin/support/tickets/:id/assign', requireAdmin, requirePermission(PERMISSIONS.MANAGE_SUPPORT), support.assignTicket);
router.put('/admin/support/tickets/:id/close', requireAdmin, requirePermission(PERMISSIONS.MANAGE_SUPPORT), support.closeTicket);
router.post('/admin/support/tickets/:id/reply', requireAdmin, requirePermission(PERMISSIONS.MANAGE_SUPPORT), support.replyToTicket);

// ── ADMIN — DASHBOARD ─────────────────────────────────────────────────────────
router.get('/admin/dashboard', requireAdmin, applyCityScope, requirePermission(PERMISSIONS.VIEW_DASHBOARD), dashboard.getDashboard);
router.get('/admin/dashboard/recent', requireAdmin, applyCityScope, requirePermission(PERMISSIONS.VIEW_DASHBOARD), dashboard.getRecentActivity);
router.get('/admin/dashboard/stats/bookings', requireAdmin, applyCityScope, requirePermission(PERMISSIONS.VIEW_DASHBOARD), dashboard.getBookingStats);
router.get('/admin/audit', requireAdmin, requirePermission(PERMISSIONS.VIEW_AUDIT), dashboard.getAuditLogs);

module.exports = router;