const express      = require('express');
const router       = express.Router();
const ctrl         = require('../controllers/customerAuth.controller');
const { customerAuth } = require('../middleware/index');
const rateLimit    = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

router.post('/register',           authLimiter, ctrl.register);
router.post('/login',              authLimiter, ctrl.login);
router.post('/logout',                          ctrl.logout);
router.post('/refresh',                         ctrl.refreshToken);
router.post('/send-otp',                        ctrl.sendOtp);
router.post('/verify-otp',                      ctrl.verifyOtp);
router.get ('/me',                 customerAuth, ctrl.getMe);
router.put ('/profile',            customerAuth, ctrl.updateProfile);
router.post('/address',            customerAuth, ctrl.addAddress);
router.put ('/address/:addrId',    customerAuth, ctrl.updateAddress);
router.delete('/address/:addrId',  customerAuth, ctrl.deleteAddress);

module.exports = router;