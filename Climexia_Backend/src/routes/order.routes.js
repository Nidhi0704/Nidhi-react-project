const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/admin.controller');
const { adminAuth, customerAuth, authorize, auditLog } = require('../middleware/index');
const { PERMISSIONS: P } = require('../config/roles');

// Customer
router.post('/',    customerAuth, ctrl.createOrder);
router.get ('/my',  customerAuth, ctrl.myOrders);

// Admin
router.get ('/admin/all',              adminAuth, authorize(P.ORDERS_VIEW),    ctrl.adminListOrders);
router.put ('/admin/:id/status',       adminAuth, authorize(P.ORDERS_FULFILL), auditLog('order.status'), ctrl.updateOrderStatus);

module.exports = router;