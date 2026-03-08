const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/catalog.controller');
const { adminAuth, authorize, auditLog } = require('../middleware/index');
const { PERMISSIONS: P } = require('../config/roles');

// Public
router.get ('/',     ctrl.getProducts);
router.get ('/:id',  ctrl.getProduct);

// Admin Protected
router.post  ('/',            adminAuth, authorize(P.PRODUCTS_CREATE),  auditLog('product.create'),  ctrl.createProduct);
router.put   ('/:id',         adminAuth, authorize(P.PRODUCTS_EDIT),    auditLog('product.update'),  ctrl.updateProduct);
router.put   ('/:id/publish', adminAuth, authorize(P.PRODUCTS_PUBLISH), auditLog('product.publish'), ctrl.publishProduct);
router.delete('/:id',         adminAuth, authorize(P.PRODUCTS_DELETE),  auditLog('product.delete'),  ctrl.deleteProduct);

module.exports = router;