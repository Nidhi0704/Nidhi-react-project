const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/admin.controller');
const { adminAuth, authorize, cityScope, auditLog } = require('../middleware/index');
const { PERMISSIONS: P } = require('../config/roles');

router.get ('/',              adminAuth, authorize(P.PARTNERS_VIEW),    cityScope(), ctrl.adminListPartners);
router.get ('/:id',           adminAuth, authorize(P.PARTNERS_VIEW),    ctrl.adminGetPartner);
router.put ('/:id/approve',   adminAuth, authorize(P.PARTNERS_APPROVE), auditLog('partner.approve'), ctrl.approvePartner);
router.put ('/:id/reject',    adminAuth, authorize(P.PARTNERS_APPROVE), auditLog('partner.reject'),  ctrl.rejectPartner);
router.put ('/:id/block',     adminAuth, authorize(P.PARTNERS_BLOCK),   auditLog('partner.block'),   ctrl.blockPartner);
router.put ('/:id/kyc',       adminAuth, authorize(P.PARTNERS_KYC),     auditLog('partner.kyc'),     ctrl.verifyKyc);

module.exports = router;