const express      = require('express');
const router       = express.Router();
const ctrl         = require('../controllers/partnerAuth.controller');
const { partnerAuth, uploadDocuments } = require('../middleware/index');
const rateLimit    = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

router.post('/register',          authLimiter, ctrl.register);
router.post('/login',             authLimiter, ctrl.login);
router.post('/logout',                         ctrl.logout);
router.post('/refresh',                        ctrl.refreshToken);
router.get ('/me',                partnerAuth, ctrl.getMe);
router.put ('/profile',           partnerAuth, ctrl.updateProfile);
router.put ('/toggle-online',     partnerAuth, ctrl.toggleOnline);
router.post('/upload-document',   partnerAuth, uploadDocuments.single('file'), ctrl.uploadDocument);

module.exports = router;