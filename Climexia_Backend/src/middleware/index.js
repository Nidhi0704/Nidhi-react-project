'use strict';
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const { verifyAccessToken } = require('../utils/jwt');
const { sendError } = require('../utils/response');
const { ROLES, ADMIN_ROLES, PERMISSIONS } = require('../config/roles');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Partner = require('../models/Partner');
const { AuditLog } = require('../models/index');

// ── Rate Limiters ─────────────────────────────────────────────────────────────
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 10,
  message: { success: false, message: 'Too many login attempts. Try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Extract token from header ─────────────────────────────────────────────────
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
};

// ── Customer auth middleware ──────────────────────────────────────────────────
const requireCustomer = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return sendError(res, 'Authentication required', 401);

    const decoded = verifyAccessToken(token);
    if (decoded.userType !== 'customer') {
      return sendError(res, 'Access denied: customer token required', 403);
    }

    const user = await User.findById(decoded.id);
    if (!user) return sendError(res, 'User not found', 401);
    if (!user.isActive) return sendError(res, 'Account is blocked', 403);

    req.user = user;
    req.userType = 'customer';
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return sendError(res, 'Token expired', 401);
    if (err.name === 'JsonWebTokenError') return sendError(res, 'Invalid token', 401);
    next(err);
  }
};

// ── Partner auth middleware ───────────────────────────────────────────────────
const requirePartner = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return sendError(res, 'Authentication required', 401);

    const decoded = verifyAccessToken(token);
    if (decoded.userType !== 'partner') {
      return sendError(res, 'Access denied: partner token required', 403);
    }

    const partner = await Partner.findById(decoded.id);
    if (!partner) return sendError(res, 'Partner not found', 401);
    if (partner.approvalStatus !== 'approved') {
      return sendError(res, 'Account pending approval', 403);
    }
    if (!partner.isActive) return sendError(res, 'Account is blocked', 403);

    req.partner = partner;
    req.userType = 'partner';
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return sendError(res, 'Token expired', 401);
    if (err.name === 'JsonWebTokenError') return sendError(res, 'Invalid token', 401);
    next(err);
  }
};

// ── Admin auth middleware ─────────────────────────────────────────────────────
const requireAdmin = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return sendError(res, 'Authentication required', 401);

    const decoded = verifyAccessToken(token);
    if (decoded.userType !== 'admin') {
      return sendError(res, 'Access denied: admin token required', 403);
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) return sendError(res, 'Admin not found', 401);
    if (!admin.isActive) return sendError(res, 'Account is deactivated', 403);
    if (admin.isLocked()) return sendError(res, 'Account is temporarily locked', 423);

    req.admin = admin;
    req.userType = 'admin';
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return sendError(res, 'Token expired', 401);
    if (err.name === 'JsonWebTokenError') return sendError(res, 'Invalid token', 401);
    next(err);
  }
};

// ── Require specific role ─────────────────────────────────────────────────────
const requireRole = (...roles) => (req, res, next) => {
  if (!req.admin) return sendError(res, 'Authentication required', 401);
  if (!roles.includes(req.admin.role)) {
    return sendError(res, 'Access denied: insufficient role', 403);
  }
  next();
};

// ── Require specific permission ───────────────────────────────────────────────
const requirePermission = (permission) => (req, res, next) => {
  if (!req.admin) return sendError(res, 'Authentication required', 401);
  // Super admin always has all permissions
  if (req.admin.role === ROLES.SUPER_ADMIN) return next();
  if (!req.admin.permissions.includes(permission)) {
    return sendError(res, `Access denied: requires ${permission} permission`, 403);
  }
  next();
};

// ── City scope middleware (for city_manager) ──────────────────────────────────
const applyCityScope = (req, _res, next) => {
  if (req.admin && req.admin.role === ROLES.CITY_MANAGER && req.admin.assignedCities.length > 0) {
    req.cityFilter = { city: { $in: req.admin.assignedCities } };
  } else {
    req.cityFilter = {};
  }
  next();
};

// ── Audit log helper ──────────────────────────────────────────────────────────
const auditLog = (action, resource) => async (req, _res, next) => {
  try {
    if (req.admin) {
      await AuditLog.create({
        admin: req.admin._id,
        adminName: req.admin.name,
        action,
        resource,
        resourceId: req.params.id || null,
        details: req.body,
        ip: req.ip,
      });
    }
  } catch (err) {
    // Don't fail the request if audit logging fails
    console.error('Audit log error:', err.message);
  }
  next();
};

// ── File Upload (multer) ──────────────────────────────────────────────────────
const createUploader = (subDir, allowedTypes = /jpeg|jpg|png|pdf/) => {
  const uploadPath = path.join(__dirname, '..', '..', 'uploads', subDir);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadPath),
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  const fileFilter = (_req, file, cb) => {
    if (allowedTypes.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Allowed: ${allowedTypes}`), false);
    }
  };

  const maxSize = (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5) * 1024 * 1024;

  return multer({ storage, fileFilter, limits: { fileSize: maxSize } });
};

const uploadAvatar = createUploader('avatars', /jpeg|jpg|png|webp/);
const uploadDocument = createUploader('documents', /jpeg|jpg|png|pdf/);
const uploadProductImage = createUploader('products', /jpeg|jpg|png|webp/);
const uploadServiceImage = createUploader('services', /jpeg|jpg|png|webp/);

// ── 404 Handler ───────────────────────────────────────────────────────────────
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// ── Global Error Handler ──────────────────────────────────────────────────────
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation error', errors });
  }
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }
  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: `File too large. Max size: ${process.env.MAX_FILE_SIZE_MB || 5}MB`,
    });
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: err.message });
  }
  // CORS
  if (err.message && err.message.startsWith('CORS')) {
    return res.status(403).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  authRateLimiter,
  generalRateLimiter,
  requireCustomer,
  requirePartner,
  requireAdmin,
  requireRole,
  requirePermission,
  applyCityScope,
  auditLog,
  uploadAvatar,
  uploadDocument,
  uploadProductImage,
  uploadServiceImage,
  notFound,
  errorHandler,
};