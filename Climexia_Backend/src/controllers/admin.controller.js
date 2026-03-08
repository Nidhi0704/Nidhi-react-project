'use strict';
const User = require('../models/User');
const Partner = require('../models/Partner');
const { AMC, Order, Notification } = require('../models/index');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// ── USERS ─────────────────────────────────────────────────────────────────────

const listUsers = async (req, res) => {
  const { page = 1, limit = 20, search, isActive } = req.query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) filter.$or = [
    { firstName: new RegExp(search, 'i') },
    { phone: new RegExp(search, 'i') },
    { email: new RegExp(search, 'i') },
  ];
  const [data, total] = await Promise.all([
    User.find(filter).skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);
  return sendPaginated(res, { data, total, page, limit });
};

const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return sendError(res, 'User not found', 404);
  return sendSuccess(res, { user });
};

const blockUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: !( await User.findById(req.params.id))?.isActive },
    { new: true }
  );
  if (!user) return sendError(res, 'User not found', 404);
  return sendSuccess(res, { isActive: user.isActive }, `User ${user.isActive ? 'unblocked' : 'blocked'}`);
};

// ── PARTNERS ──────────────────────────────────────────────────────────────────

const listPartners = async (req, res) => {
  const { page = 1, limit = 20, approvalStatus, search, city } = req.query;
  const filter = { ...req.cityFilter };
  if (approvalStatus) filter.approvalStatus = approvalStatus;
  if (city) filter.cities = city;
  if (search) filter.$or = [
    { firstName: new RegExp(search, 'i') },
    { phone: new RegExp(search, 'i') },
  ];
  const [data, total] = await Promise.all([
    Partner.find(filter).skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 }),
    Partner.countDocuments(filter),
  ]);
  return sendPaginated(res, { data, total, page, limit });
};

const getPartner = async (req, res) => {
  const partner = await Partner.findById(req.params.id);
  if (!partner) return sendError(res, 'Partner not found', 404);
  return sendSuccess(res, { partner });
};

const approvePartner = async (req, res) => {
  const partner = await Partner.findByIdAndUpdate(
    req.params.id,
    {
      approvalStatus: 'approved',
      isActive: true,
      approvedAt: new Date(),
      approvedBy: req.admin._id,
    },
    { new: true }
  );
  if (!partner) return sendError(res, 'Partner not found', 404);

  await Notification.create({
    recipient: partner._id,
    recipientType: 'partner',
    title: 'Account Approved!',
    message: 'Your Climexia partner account has been approved. You can now log in and start accepting jobs.',
    type: 'approval',
  });

  return sendSuccess(res, { partner }, 'Partner approved');
};

const rejectPartner = async (req, res) => {
  const { reason } = req.body;
  const partner = await Partner.findByIdAndUpdate(
    req.params.id,
    {
      approvalStatus: 'rejected',
      isActive: false,
      rejectionReason: reason || 'Application did not meet requirements',
      rejectedAt: new Date(),
    },
    { new: true }
  );
  if (!partner) return sendError(res, 'Partner not found', 404);
  return sendSuccess(res, { partner }, 'Partner rejected');
};

const blockPartner = async (req, res) => {
  const partner = await Partner.findById(req.params.id);
  if (!partner) return sendError(res, 'Partner not found', 404);
  partner.isActive = !partner.isActive;
  await partner.save({ validateBeforeSave: false });
  return sendSuccess(res, { isActive: partner.isActive }, `Partner ${partner.isActive ? 'unblocked' : 'blocked'}`);
};

const updatePartnerKYC = async (req, res) => {
  const { documentId, status, rejectionReason } = req.body;
  const partner = await Partner.findById(req.params.id);
  if (!partner) return sendError(res, 'Partner not found', 404);

  const doc = partner.documents.id(documentId);
  if (!doc) return sendError(res, 'Document not found', 404);

  doc.status = status;
  doc.verifiedBy = req.admin._id;
  doc.verifiedAt = new Date();
  if (rejectionReason) doc.rejectionReason = rejectionReason;

  await partner.save();
  return sendSuccess(res, { documents: partner.documents }, 'KYC status updated');
};

// ── AMC ───────────────────────────────────────────────────────────────────────

const listAMC = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = { ...req.cityFilter };
  if (status) filter.status = status;

  const [data, total] = await Promise.all([
    AMC.find(filter).populate('customer', 'firstName lastName phone').skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 }),
    AMC.countDocuments(filter),
  ]);
  return sendPaginated(res, { data, total, page, limit });
};

const activateAMC = async (req, res) => {
  const amc = await AMC.findById(req.params.id);
  if (!amc) return sendError(res, 'AMC contract not found', 404);
  if (amc.status === 'active') return sendError(res, 'Contract already active', 400);

  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  amc.status = 'active';
  amc.startDate = startDate;
  amc.endDate = endDate;
  amc.activatedBy = req.admin._id;
  amc.activatedAt = startDate;
  await amc.save();

  return sendSuccess(res, { amc }, 'AMC activated');
};

const renewAMC = async (req, res) => {
  const oldAMC = await AMC.findById(req.params.id);
  if (!oldAMC) return sendError(res, 'AMC contract not found', 404);

  oldAMC.status = 'renewed';
  await oldAMC.save();

  const newStartDate = new Date();
  const newEndDate = new Date();
  newEndDate.setFullYear(newEndDate.getFullYear() + 1);

  const newAMC = await AMC.create({
    customer: oldAMC.customer,
    planName: oldAMC.planName,
    acCount: oldAMC.acCount,
    acType: oldAMC.acType,
    address: oldAMC.address,
    amount: oldAMC.amount,
    ppmTotal: oldAMC.ppmTotal,
    city: oldAMC.city,
    status: 'active',
    startDate: newStartDate,
    endDate: newEndDate,
    activatedBy: req.admin._id,
    activatedAt: newStartDate,
    renewedFrom: oldAMC._id,
  });

  return sendSuccess(res, { amc: newAMC }, 'AMC renewed');
};

// ── ORDERS ────────────────────────────────────────────────────────────────────

const listOrders = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = { ...req.cityFilter };
  if (status) filter.status = status;

  const [data, total] = await Promise.all([
    Order.find(filter).populate('customer', 'firstName lastName phone').skip((page - 1) * limit).limit(parseInt(limit)).sort({ createdAt: -1 }),
    Order.countDocuments(filter),
  ]);
  return sendPaginated(res, { data, total, page, limit });
};

const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!allowed.includes(status)) return sendError(res, 'Invalid status', 400);

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return sendError(res, 'Order not found', 404);
  return sendSuccess(res, { order }, 'Order status updated');
};

module.exports = {
  listUsers, getUser, blockUser,
  listPartners, getPartner, approvePartner, rejectPartner, blockPartner, updatePartnerKYC,
  listAMC, activateAMC, renewAMC,
  listOrders, updateOrderStatus,
};