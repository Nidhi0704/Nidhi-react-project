'use strict';
const { Booking, Notification } = require('../models/index');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// POST /api/bookings (customer)
const createBooking = async (req, res) => {
  const { service, acType, issue, scheduledDate, scheduledTimeSlot, address, amount } = req.body;
  if (!service || !acType || !issue || !scheduledDate || !scheduledTimeSlot || !address || !amount) {
    return sendError(res, 'All booking fields are required', 400);
  }

  const booking = await Booking.create({
    customer: req.user._id,
    service,
    acType,
    issue,
    scheduledDate: new Date(scheduledDate),
    scheduledTimeSlot,
    address,
    amount,
    city: req.user.city,
  });

  await Notification.create({
    recipient: req.user._id,
    recipientType: 'user',
    title: 'Booking Confirmed',
    message: `Your booking ${booking.bookingId} has been confirmed.`,
    type: 'booking',
  });

  return sendSuccess(res, { booking }, 'Booking created successfully', 201);
};

// GET /api/bookings/my (customer)
const getMyBookings = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { customer: req.user._id };
  if (status) filter.status = status;

  const [data, total] = await Promise.all([
    Booking.find(filter)
      .populate('service', 'name serviceType basePrice')
      .populate('partner', 'firstName lastName phone averageRating')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Booking.countDocuments(filter),
  ]);
  return sendPaginated(res, { data, total, page, limit });
};

// GET /api/bookings/:id
const getBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('service', 'name description serviceType')
    .populate('partner', 'firstName lastName phone averageRating')
    .populate('customer', 'firstName lastName phone');

  if (!booking) return sendError(res, 'Booking not found', 404);

  // Access control: customer, assigned partner, or admin
  const isCustomer = req.user && booking.customer._id.toString() === req.user._id.toString();
  const isPartner = req.partner && booking.partner && booking.partner._id.toString() === req.partner._id.toString();
  const isAdmin = !!req.admin;

  if (!isCustomer && !isPartner && !isAdmin) {
    return sendError(res, 'Access denied', 403);
  }

  return sendSuccess(res, { booking });
};

// PUT /api/bookings/:id/cancel (customer)
const cancelBooking = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, customer: req.user._id });
  if (!booking) return sendError(res, 'Booking not found', 404);
  if (['completed', 'cancelled'].includes(booking.status)) {
    return sendError(res, `Cannot cancel a ${booking.status} booking`, 400);
  }

  booking.status = 'cancelled';
  booking.cancelledBy = 'customer';
  booking.cancellationReason = req.body.reason || 'Cancelled by customer';
  await booking.save();

  return sendSuccess(res, { booking }, 'Booking cancelled');
};

// POST /api/bookings/:id/review (customer)
const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) return sendError(res, 'Rating must be between 1 and 5', 400);

  const booking = await Booking.findOne({ _id: req.params.id, customer: req.user._id });
  if (!booking) return sendError(res, 'Booking not found', 404);
  if (booking.status !== 'completed') return sendError(res, 'Can only review completed bookings', 400);
  if (booking.review) return sendError(res, 'Review already submitted', 400);

  booking.review = { rating, comment };
  await booking.save();

  return sendSuccess(res, { review: booking.review }, 'Review submitted');
};

// GET /api/bookings/partner/jobs (partner)
const getPartnerJobs = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { partner: req.partner._id };
  if (status) filter.status = status;

  const [data, total] = await Promise.all([
    Booking.find(filter)
      .populate('service', 'name serviceType')
      .populate('customer', 'firstName lastName phone')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .sort({ scheduledDate: 1 }),
    Booking.countDocuments(filter),
  ]);
  return sendPaginated(res, { data, total, page, limit });
};

// PUT /api/bookings/:id/accept (partner)
const acceptJob = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, partner: req.partner._id, status: 'assigned' });
  if (!booking) return sendError(res, 'Booking not found or not assigned to you', 404);

  booking.status = 'in_progress';
  await booking.save();
  return sendSuccess(res, { booking }, 'Job accepted');
};

// PUT /api/bookings/:id/complete (partner)
const completeJob = async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, partner: req.partner._id, status: 'in_progress' });
  if (!booking) return sendError(res, 'Booking not found', 404);

  booking.status = 'completed';
  booking.serviceReport = req.body.serviceReport;
  booking.completedAt = new Date();
  await booking.save();

  await Notification.create({
    recipient: booking.customer,
    recipientType: 'user',
    title: 'Service Completed',
    message: `Your booking ${booking.bookingId} has been completed. Please rate your experience.`,
    type: 'booking',
  });

  return sendSuccess(res, { booking }, 'Job marked as completed');
};

// ── ADMIN BOOKING ROUTES ──────────────────────────────────────────────────────

// GET /api/bookings/admin/all
const adminListBookings = async (req, res) => {
  const { page = 1, limit = 20, status, city, search } = req.query;
  const filter = { ...req.cityFilter };
  if (status) filter.status = status;
  if (city) filter.city = city;
  if (search) filter.bookingId = new RegExp(search, 'i');

  const [data, total] = await Promise.all([
    Booking.find(filter)
      .populate('service', 'name')
      .populate('customer', 'firstName lastName phone')
      .populate('partner', 'firstName lastName phone')
      .skip((page - 1) * limit).limit(parseInt(limit))
      .sort({ createdAt: -1 }),
    Booking.countDocuments(filter),
  ]);
  return sendPaginated(res, { data, total, page, limit });
};

// PUT /api/bookings/admin/:id/assign
const assignBooking = async (req, res) => {
  const { partnerId } = req.body;
  if (!partnerId) return sendError(res, 'partnerId is required', 400);

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { partner: partnerId, status: 'assigned' },
    { new: true }
  ).populate('partner', 'firstName lastName');

  if (!booking) return sendError(res, 'Booking not found', 404);

  await Notification.create({
    recipient: partnerId,
    recipientType: 'partner',
    title: 'New Job Assigned',
    message: `You have been assigned booking ${booking.bookingId}`,
    type: 'booking',
  });

  return sendSuccess(res, { booking }, 'Partner assigned');
};

// PUT /api/bookings/admin/:id/status
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return sendError(res, 'Invalid status', 400);

  const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!booking) return sendError(res, 'Booking not found', 404);
  return sendSuccess(res, { booking }, 'Status updated');
};

module.exports = {
  createBooking, getMyBookings, getBooking, cancelBooking, addReview,
  getPartnerJobs, acceptJob, completeJob,
  adminListBookings, assignBooking, updateBookingStatus,
};