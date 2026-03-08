'use strict';
const crypto = require('crypto');
const Admin = require('../models/Admin');
const { generateTokens, verifyRefreshToken, setRefreshCookie, clearRefreshCookie } = require('../utils/jwt');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { ROLES, ADMIN_ROLES, ROLE_DEFAULT_PERMISSIONS } = require('../config/roles');
const { sendPasswordResetEmail } = require('../utils/mailer');

// POST /api/admin/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return sendError(res, 'Email and password are required', 400);

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
  if (!admin) return sendError(res, 'Invalid credentials', 401);
  if (!admin.isActive) return sendError(res, 'Account is deactivated', 403);
  if (admin.isLocked()) {
    return sendError(res, 'Account is temporarily locked. Try again in 15 minutes.', 423);
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    await admin.incLoginAttempts();
    return sendError(res, 'Invalid credentials', 401);
  }

  // Reset login attempts on success
  await admin.updateOne({ $set: { loginAttempts: 0, lastLogin: new Date() }, $unset: { lockUntil: 1 } });

  const { accessToken, refreshToken } = generateTokens({ id: admin._id, userType: 'admin', role: admin.role });
  setRefreshCookie(res, refreshToken);

  return sendSuccess(res, {
    accessToken,
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
    },
  }, 'Login successful');
};

// POST /api/admin/auth/logout
const logout = (_req, res) => {
  clearRefreshCookie(res);
  return sendSuccess(res, {}, 'Logged out');
};

// POST /api/admin/auth/refresh
const refresh = async (req, res) => {
  const token = req.cookies?.clx_refresh;
  if (!token) return sendError(res, 'Refresh token not found', 401);

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    clearRefreshCookie(res);
    return sendError(res, 'Invalid or expired refresh token', 401);
  }

  if (decoded.userType !== 'admin') return sendError(res, 'Invalid token type', 401);

  const admin = await Admin.findById(decoded.id);
  if (!admin || !admin.isActive) {
    clearRefreshCookie(res);
    return sendError(res, 'Unauthorized', 401);
  }

  const { accessToken, refreshToken: newRefresh } = generateTokens({
    id: admin._id, userType: 'admin', role: admin.role,
  });
  setRefreshCookie(res, newRefresh);
  return sendSuccess(res, { accessToken }, 'Token refreshed');
};

// GET /api/admin/auth/me
const getMe = async (req, res) => {
  const admin = await Admin.findById(req.admin._id).populate('assignedCities', 'name state');
  return sendSuccess(res, { admin });
};

// PUT /api/admin/auth/change-password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return sendError(res, 'Both passwords required', 400);
  if (newPassword.length < 8) return sendError(res, 'Password must be at least 8 characters', 400);

  const admin = await Admin.findById(req.admin._id).select('+password');
  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) return sendError(res, 'Current password is incorrect', 400);

  admin.password = newPassword;
  await admin.save();
  return sendSuccess(res, {}, 'Password changed successfully');
};

// POST /api/admin/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email: email?.toLowerCase() });
  // Always respond OK to avoid email enumeration
  if (!admin) return sendSuccess(res, {}, 'If that email exists, a reset link has been sent');

  const token = crypto.randomBytes(32).toString('hex');
  admin.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  admin.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await admin.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.ADMIN_PANEL_URL}/reset-password/${token}`;
  await sendPasswordResetEmail(admin.email, resetUrl);

  return sendSuccess(res, {}, 'If that email exists, a reset link has been sent');
};

// POST /api/admin/auth/reset-password/:token
const resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const admin = await Admin.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!admin) return sendError(res, 'Token is invalid or has expired', 400);

  admin.password = req.body.password;
  admin.resetPasswordToken = undefined;
  admin.resetPasswordExpires = undefined;
  admin.loginAttempts = 0;
  admin.lockUntil = undefined;
  await admin.save();

  return sendSuccess(res, {}, 'Password reset successful. You can now log in.');
};

// ── Staff Management (Super Admin only) ──────────────────────────────────────

// GET /api/admin/auth/staff
const listStaff = async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { name: new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ];

  const [staff, total] = await Promise.all([
    Admin.find(filter)
      .populate('assignedCities', 'name')
      .select('-loginAttempts -lockUntil')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Admin.countDocuments(filter),
  ]);

  return sendPaginated(res, { data: staff, total, page, limit });
};

// POST /api/admin/auth/staff
const createStaff = async (req, res) => {
  const { name, email, phone, password, role, assignedCities } = req.body;
  if (!name || !email || !password || !role) {
    return sendError(res, 'name, email, password and role are required', 400);
  }
  if (role === ROLES.SUPER_ADMIN) {
    return sendError(res, 'Cannot create another Super Admin via API', 403);
  }
  if (!ADMIN_ROLES.includes(role)) {
    return sendError(res, `Invalid role. Valid roles: ${ADMIN_ROLES.join(', ')}`, 400);
  }

  const staff = await Admin.create({
    name, email, phone, password, role,
    permissions: ROLE_DEFAULT_PERMISSIONS[role] || [],
    assignedCities: assignedCities || [],
    createdBy: req.admin._id,
  });

  return sendSuccess(res, {
    staff: { _id: staff._id, name: staff.name, email: staff.email, role: staff.role },
  }, 'Staff account created', 201);
};

// GET /api/admin/auth/staff/:id
const getStaff = async (req, res) => {
  const staff = await Admin.findById(req.params.id).populate('assignedCities', 'name state');
  if (!staff) return sendError(res, 'Staff not found', 404);
  return sendSuccess(res, { staff });
};

// PUT /api/admin/auth/staff/:id
const updateStaff = async (req, res) => {
  const allowed = ['name', 'phone', 'isActive', 'assignedCities'];
  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const staff = await Admin.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!staff) return sendError(res, 'Staff not found', 404);
  return sendSuccess(res, { staff }, 'Staff updated');
};

// DELETE /api/admin/auth/staff/:id
const deleteStaff = async (req, res) => {
  const staff = await Admin.findById(req.params.id);
  if (!staff) return sendError(res, 'Staff not found', 404);
  if (staff.role === ROLES.SUPER_ADMIN) return sendError(res, 'Cannot delete Super Admin', 403);
  await staff.deleteOne();
  return sendSuccess(res, {}, 'Staff account deleted');
};

// PUT /api/admin/auth/staff/:id/permissions
const updatePermissions = async (req, res) => {
  const { permissions } = req.body;
  if (!Array.isArray(permissions)) return sendError(res, 'permissions must be an array', 400);

  const staff = await Admin.findByIdAndUpdate(
    req.params.id,
    { permissions },
    { new: true }
  );
  if (!staff) return sendError(res, 'Staff not found', 404);
  return sendSuccess(res, { permissions: staff.permissions }, 'Permissions updated');
};

module.exports = {
  login, logout, refresh, getMe, changePassword,
  forgotPassword, resetPassword,
  listStaff, createStaff, getStaff, updateStaff, deleteStaff, updatePermissions,
};