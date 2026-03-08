'use strict';
const path = require('path');
const Partner = require('../models/Partner');
const { generateTokens, verifyRefreshToken, setRefreshCookie, clearRefreshCookie } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

// POST /api/partner/register
const register = async (req, res) => {
  const { firstName, lastName, phone, password, email, partnerType } = req.body;
  if (!firstName || !phone || !password) {
    return sendError(res, 'firstName, phone and password are required', 400);
  }

  const existing = await Partner.findOne({ phone });
  if (existing) return sendError(res, 'Phone number already registered', 400);

  const partner = await Partner.create({
    firstName, lastName, phone, password, email,
    partnerType: partnerType || 'technician',
  });

  return sendSuccess(res, {
    partner: { _id: partner._id, firstName, phone, approvalStatus: partner.approvalStatus },
  }, 'Registration submitted. Awaiting admin approval.', 201);
};

// POST /api/partner/login
const login = async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return sendError(res, 'Phone and password are required', 400);

  const partner = await Partner.findOne({ phone }).select('+password');
  if (!partner) return sendError(res, 'Invalid credentials', 401);

  // ⚠️  FIX: Check approval status BEFORE password — clearer error message
  if (partner.approvalStatus === 'pending') {
    return sendError(res, 'Your account is pending admin approval. Please wait.', 403);
  }
  if (partner.approvalStatus === 'rejected') {
    return sendError(res, `Your application was rejected: ${partner.rejectionReason || 'Contact support.'}`, 403);
  }
  if (!partner.isActive) {
    return sendError(res, 'Account is blocked. Contact support.', 403);
  }

  const isMatch = await partner.comparePassword(password);
  if (!isMatch) return sendError(res, 'Invalid credentials', 401);

  partner.lastLogin = new Date();
  await partner.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = generateTokens({ id: partner._id, userType: 'partner' });
  setRefreshCookie(res, refreshToken);

  return sendSuccess(res, {
    accessToken,
    partner: {
      _id: partner._id,
      firstName: partner.firstName,
      lastName: partner.lastName,
      phone: partner.phone,
      partnerType: partner.partnerType,
      isOnline: partner.isOnline,
    },
  }, 'Login successful');
};

// POST /api/partner/logout
const logout = (_req, res) => {
  clearRefreshCookie(res);
  return sendSuccess(res, {}, 'Logged out');
};

// POST /api/partner/refresh
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

  if (decoded.userType !== 'partner') return sendError(res, 'Invalid token type', 401);

  const partner = await Partner.findById(decoded.id);
  if (!partner || !partner.isActive || partner.approvalStatus !== 'approved') {
    clearRefreshCookie(res);
    return sendError(res, 'Unauthorized', 401);
  }

  const { accessToken, refreshToken: newRefresh } = generateTokens({ id: partner._id, userType: 'partner' });
  setRefreshCookie(res, newRefresh);

  return sendSuccess(res, { accessToken }, 'Token refreshed');
};

// GET /api/partner/me
const getMe = async (req, res) => {
  const partner = await Partner.findById(req.partner._id);
  return sendSuccess(res, { partner });
};

// PUT /api/partner/toggle-online
const toggleOnline = async (req, res) => {
  const partner = await Partner.findById(req.partner._id);
  partner.isOnline = !partner.isOnline;
  await partner.save({ validateBeforeSave: false });
  return sendSuccess(res, { isOnline: partner.isOnline }, `You are now ${partner.isOnline ? 'online' : 'offline'}`);
};

// POST /api/partner/documents — upload KYC documents
const uploadDocuments = async (req, res) => {
  const partner = await Partner.findById(req.partner._id);
  const files = req.files || [];

  files.forEach((file) => {
    const docType = req.body.docType || 'other';
    partner.documents.push({
      type: docType,
      fileUrl: `/uploads/documents/${file.filename}`,
    });
  });
  await partner.save();
  return sendSuccess(res, { documents: partner.documents }, 'Documents uploaded');
};

module.exports = { register, login, logout, refresh, getMe, toggleOnline, uploadDocuments };