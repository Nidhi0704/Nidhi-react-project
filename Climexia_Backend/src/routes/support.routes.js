const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/support.controller');
const { adminAuth, customerAuth, authorize } = require('../middleware/index');
const { PERMISSIONS: P } = require('../config/roles');

// Customer
router.post('/tickets',                  customerAuth, ctrl.createTicket);
router.get ('/tickets/my',               customerAuth, ctrl.myTickets);
router.get ('/tickets/:id',              customerAuth, ctrl.getTicket);
router.post('/tickets/:id/reply',        customerAuth, ctrl.replyTicket);

// Admin
router.get ('/admin/tickets',                 adminAuth, authorize(P.SUPPORT_VIEW),   ctrl.adminListTickets);
router.get ('/admin/tickets/:id',             adminAuth, authorize(P.SUPPORT_VIEW),   ctrl.getTicket);
router.post('/admin/tickets/:id/reply',       adminAuth, authorize(P.SUPPORT_REPLY),  ctrl.replyTicket);
router.put ('/admin/tickets/:id/assign',      adminAuth, authorize(P.SUPPORT_ASSIGN), ctrl.assignTicket);
router.put ('/admin/tickets/:id/close',       adminAuth, authorize(P.SUPPORT_CLOSE),  ctrl.closeTicket);

module.exports = router;