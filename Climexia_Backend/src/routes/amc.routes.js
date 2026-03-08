const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/admin.controller');
const { adminAuth, customerAuth, authorize, cityScope, auditLog } = require('../middleware/index');
const { PERMISSIONS: P } = require('../config/roles');

// Customer
router.post('/',    customerAuth, ctrl.createAMC);
router.get ('/my',  customerAuth, ctrl.myAMCs);
router.get ('/:id', customerAuth, ctrl.getAMC);

// Admin
router.get ('/admin/all',              adminAuth, authorize(P.AMC_VIEW),  cityScope('siteInfo.city'), ctrl.adminListAMC);
router.put ('/admin/:id/activate',     adminAuth, authorize(P.AMC_EDIT),  auditLog('amc.activate'),   ctrl.activateAMC);
router.put ('/admin/:id/renew',        adminAuth, authorize(P.AMC_RENEW), auditLog('amc.renew'),      ctrl.renewAMC);

module.exports = router;