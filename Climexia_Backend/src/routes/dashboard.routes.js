const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/dashboard.controller');
const { adminAuth, authorize, cityScope } = require('../middleware/index');
const { PERMISSIONS: P } = require('../config/roles');

router.get('/',                  adminAuth, authorize(P.DASHBOARD_VIEW),      cityScope(), ctrl.getDashboard);
router.get('/recent',            adminAuth, authorize(P.DASHBOARD_VIEW),      ctrl.getRecentActivity);
router.get('/stats/bookings',    adminAuth, authorize(P.DASHBOARD_ANALYTICS), ctrl.bookingStats);

module.exports = router;