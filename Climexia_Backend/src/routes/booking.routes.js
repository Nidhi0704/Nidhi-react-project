const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/booking.controller');
const { adminAuth, customerAuth, partnerAuth, authorize, cityScope, auditLog } = require('../middleware/index');
const { PERMISSIONS: P } = require('../config/roles');

// Customer
router.post('/',              customerAuth, auditLog('booking.create'), ctrl.createBooking);
router.get ('/my',            customerAuth, ctrl.myBookings);
router.get ('/:id',           customerAuth, ctrl.getBooking);
router.put ('/:id/cancel',    customerAuth, auditLog('booking.cancel'), ctrl.cancelBooking);
router.post('/:id/review',    customerAuth, ctrl.reviewBooking);

// Partner
router.get ('/partner/jobs',  partnerAuth, ctrl.partnerJobs);
router.put ('/:id/accept',    partnerAuth, ctrl.acceptJob);
router.put ('/:id/complete',  partnerAuth, ctrl.completeJob);

// Admin
router.get ('/admin/all',         adminAuth, authorize(P.BOOKINGS_VIEW), cityScope('address.city'), ctrl.adminListBookings);
router.put ('/admin/:id/assign',  adminAuth, authorize(P.BOOKINGS_ASSIGN), auditLog('booking.assign'), ctrl.assignPartner);
router.put ('/admin/:id/status',  adminAuth, authorize(P.BOOKINGS_EDIT),   auditLog('booking.status_update'), ctrl.updateBookingStatus);

module.exports = router;