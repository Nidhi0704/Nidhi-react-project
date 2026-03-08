'use strict';
const User = require('../models/User');
const { generateTokens, verifyRefreshToken, setRefreshCookie, clearRefreshCookie } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

// POST /api/auth/register
const register = async (req, res) => {
  const { firstName, lastName, phone, password, email, city } = req.body;
  if (!firstName || !phone || !password) {
    return sendError(res, 'firstName, phone and password are required', 400);
  }

  const existing = await User.findOne({ phone });
  if (existing) return sendError(res, 'Phone number already registered', 400);

  const user = await User.create({ firstName, lastName, phone, password, email, city });
  const { accessToken, refreshToken } = generateTokens({ id: user._id, userType: 'customer' });
  setRefreshCookie(res, refreshToken);

  return sendSuccess(
    res,
    { accessToken, user: { _id: user._id, firstName, lastName, phone, city } },
    'Registration successful',
    201
  );
};

// POST /api/auth/login
const login = async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return sendError(res, 'Phone and password are required', 400);

  const user = await User.findOne({ phone }).select('+password');
  if (!user) return sendError(res, 'Invalid phone number or password', 401);
  if (!user.isActive) return sendError(res, 'Account is blocked. Contact support.', 403);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return sendError(res, 'Invalid phone number or password', 401);

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const { accessToken, refreshToken } = generateTokens({ id: user._id, userType: 'customer' });
  setRefreshCookie(res, refreshToken);

  return sendSuccess(res, {
    accessToken,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
      city: user.city,
      walletBalance: user.walletBalance,
      loyaltyPoints: user.loyaltyPoints,
    },
  }, 'Login successful');
};

// POST /api/auth/logout
const logout = (_req, res) => {
  clearRefreshCookie(res);
  return sendSuccess(res, {}, 'Logged out successfully');
};

// POST /api/auth/refresh
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

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    clearRefreshCookie(res);
    return sendError(res, 'User not found or blocked', 401);
  }

  const { accessToken, refreshToken: newRefresh } = generateTokens({
    id: user._id,
    userType: 'customer',
  });
  setRefreshCookie(res, newRefresh);

  return sendSuccess(res, { accessToken }, 'Token refreshed');
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  return sendSuccess(res, { user });
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const allowed = ['firstName', 'lastName', 'email', 'city'];
  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  return sendSuccess(res, { user }, 'Profile updated');
};

// POST /api/auth/address
const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }
  user.addresses.push(req.body);
  await user.save();
  return sendSuccess(res, { addresses: user.addresses }, 'Address added', 201);
};

// PUT /api/auth/address/:id
const updateAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.id);
  if (!addr) return sendError(res, 'Address not found', 404);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }
  Object.assign(addr, req.body);
  await user.save();
  return sendSuccess(res, { addresses: user.addresses }, 'Address updated');
};

// DELETE /api/auth/address/:id
const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.id);
  await user.save();
  return sendSuccess(res, { addresses: user.addresses }, 'Address deleted');
};

module.exports = { register, login, logout, refresh, getMe, updateProfile, addAddress, updateAddress, deleteAddress };