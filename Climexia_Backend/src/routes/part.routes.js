const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/catalog.controller');
const { adminAuth, authorize, auditLog } = require('../middleware/index');
const { PERMISSIONS: P } = require('../config/roles');

router.get ('/',    ctrl.getParts);
router.get ('/:id', ctrl.getPart);
router.post  ('/',      adminAuth, authorize(P.PARTS_CREATE), auditLog('part.create'), ctrl.createPart);
router.put   ('/:id',   adminAuth, authorize(P.PARTS_EDIT),   auditLog('part.update'), ctrl.updatePart);
router.delete('/:id',   adminAuth, authorize(P.PARTS_DELETE), auditLog('part.delete'), ctrl.deletePart);

module.exports = router;