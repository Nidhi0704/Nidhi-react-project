const express       = require('express');
const router        = express.Router();
const ctrl          = require('../controllers/adminAuth.controller');
const { adminAuth, authorize, superAdminOnly, auditLog } = require('../middleware/index');
const { PERMISSIONS: P } = require('../config/roles');
const rateLimit     = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

// Auth
router.post('/login',                authLimiter,                        ctrl.login);
router.post('/logout',               adminAuth,                          ctrl.logout);
router.post('/refresh',                                                   ctrl.refreshToken);
router.get ('/me',                   adminAuth,                          ctrl.getMe);
router.put ('/change-password',      adminAuth,                          ctrl.changePassword);
router.post('/forgot-password',                                           ctrl.forgotPassword);
router.post('/reset-password/:token',                                     ctrl.resetPassword);

// Staff Management
router.get ('/staff',                      adminAuth, authorize(P.ADMINS_VIEW),        ctrl.listAdmins);
router.post('/staff',                      adminAuth, superAdminOnly, auditLog('admin.create'), ctrl.createAdmin);
router.get ('/staff/roles-list',           adminAuth, superAdminOnly,                  ctrl.getRolesList);
router.get ('/staff/permissions-list',     adminAuth, superAdminOnly,                  ctrl.getAllPermissions);
router.get ('/staff/:id',                  adminAuth, authorize(P.ADMINS_VIEW),        ctrl.getAdmin);
router.put ('/staff/:id',                  adminAuth, superAdminOnly, auditLog('admin.update'), ctrl.updateAdmin);
router.put ('/staff/:id/permissions',      adminAuth, superAdminOnly, auditLog('admin.permissions_updated'), ctrl.setPermissions);
router.delete('/staff/:id',               adminAuth, superAdminOnly, auditLog('admin.delete'), ctrl.deleteAdmin);

module.exports = router;