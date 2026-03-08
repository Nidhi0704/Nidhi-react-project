'use strict';
const { Ticket } = require('../models/index');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// POST /api/support/tickets
const createTicket = async (req, res) => {
  const { subject, category, message } = req.body;
  if (!subject || !message) return sendError(res, 'Subject and message are required', 400);

  const ticket = await Ticket.create({
    customer: req.user._id,
    subject,
    category: category || 'general',
    replies: [{ sender: 'customer', senderId: req.user._id, message }],
  });

  return sendSuccess(res, { ticket }, 'Ticket created', 201);
};

// GET /api/support/tickets/my
const getMyTickets = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const filter = { customer: req.user._id };
  if (status) filter.status = status;

  const [data, total] = await Promise.all([
    Ticket.find(filter).skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 }),
    Ticket.countDocuments(filter),
  ]);
  return sendPaginated(res, { data, total, page, limit });
};

// GET /api/support/tickets/:id
const getTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate('assignedTo', 'name email');
  if (!ticket) return sendError(res, 'Ticket not found', 404);

  // Access: customer who owns it, or admin
  const isOwner = req.user && ticket.customer.toString() === req.user._id.toString();
  if (!isOwner && !req.admin) return sendError(res, 'Access denied', 403);

  return sendSuccess(res, { ticket });
};

// POST /api/support/tickets/:id/reply
const replyToTicket = async (req, res) => {
  const { message } = req.body;
  if (!message) return sendError(res, 'Message is required', 400);

  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return sendError(res, 'Ticket not found', 404);

  const sender = req.admin ? 'admin' : 'customer';
  const senderId = req.admin ? req.admin._id : req.user._id;

  ticket.replies.push({ sender, senderId, message });
  if (sender === 'admin' && ticket.status === 'open') ticket.status = 'in_progress';
  await ticket.save();

  return sendSuccess(res, { ticket }, 'Reply added');
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────

const adminListTickets = async (req, res) => {
  const { page = 1, limit = 20, status, priority } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const [data, total] = await Promise.all([
    Ticket.find(filter)
      .populate('customer', 'firstName lastName phone')
      .populate('assignedTo', 'name')
      .skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 }),
    Ticket.countDocuments(filter),
  ]);
  return sendPaginated(res, { data, total, page, limit });
};

const assignTicket = async (req, res) => {
  const { agentId } = req.body;
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { assignedTo: agentId, status: 'in_progress' },
    { new: true }
  ).populate('assignedTo', 'name email');
  if (!ticket) return sendError(res, 'Ticket not found', 404);
  return sendSuccess(res, { ticket }, 'Ticket assigned');
};

const closeTicket = async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status: 'closed', closedAt: new Date() },
    { new: true }
  );
  if (!ticket) return sendError(res, 'Ticket not found', 404);
  return sendSuccess(res, { ticket }, 'Ticket closed');
};

module.exports = {
  createTicket, getMyTickets, getTicket, replyToTicket,
  adminListTickets, assignTicket, closeTicket,
};