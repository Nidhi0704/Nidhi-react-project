const express    = require('express');
const router     = express.Router();
const { adminAuth, authorize } = require('../middleware/index');
const { PERMISSIONS: P } = require('../config/roles');
const { AuditLog } = require('../models/index');
const { sendPaginated, parsePagination } = require('../utils/response');

router.get('/', adminAuth, authorize(P.AUDIT_VIEW), async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.action)  filter.action  = new RegExp(req.query.action, 'i');
  if (req.query.actorId) filter.actorId = req.query.actorId;
  const [data, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    AuditLog.countDocuments(filter),
  ]);
  sendPaginated(res, { data, total, page, limit });
});

module.exports = router;