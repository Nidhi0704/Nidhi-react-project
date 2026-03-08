const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/admin.controller');
const { adminAuth, authorize, auditLog } = require('../middleware/index');
const { PERMISSIONS: P } = require('../config/roles');

router.get ('/',          adminAuth, authorize(P.USERS_VIEW),  ctrl.adminListUsers);
router.get ('/:id',       adminAuth, authorize(P.USERS_VIEW),  ctrl.adminGetUser);
router.put ('/:id/block', adminAuth, authorize(P.USERS_BLOCK), auditLog('user.block'), ctrl.blockUser);

module.exports = router;