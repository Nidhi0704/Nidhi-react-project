'use strict';
const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Generate access + refresh token pair
 */
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
  return { accessToken, refreshToken };
};

/**
 * Verify an access token — throws on failure
 */
const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);

/**
 * Verify a refresh token — throws on failure
 */
const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

/**
 * Set refresh token as an httpOnly cookie
 */
const setRefreshCookie = (res, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('clx_refresh', refreshToken, {
    httpOnly: true,
    secure: isProduction,        // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax', // lax allows cross-origin in dev
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    path: '/',
  });
};

/**
 * Clear refresh token cookie
 */
const clearRefreshCookie = (res) => {
  res.clearCookie('clx_refresh', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
};