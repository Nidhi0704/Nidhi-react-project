const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/catalog.controller');
const { adminAuth, authorize, auditLog } = require('../middleware/index');
const { PERMISSIONS: P } = require('../config/roles');

router.get ('/',    ctrl.getServices);
router.get ('/:id', ctrl.getService);
router.post  ('/',      adminAuth, authorize(P.SERVICES_CREATE), auditLog('service.create'), ctrl.createService);
router.put   ('/:id',   adminAuth, authorize(P.SERVICES_EDIT),   auditLog('service.update'), ctrl.updateService);
router.delete('/:id',   adminAuth, authorize(P.SERVICES_DELETE), auditLog('service.delete'), ctrl.deleteService);

module.exports = router;