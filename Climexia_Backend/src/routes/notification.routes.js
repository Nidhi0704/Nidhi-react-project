const express = require('express');
const router  = express.Router();
const { customerAuth } = require('../middleware/index');
const { Notification } = require('../models/index');
const { sendPaginated, parsePagination, sendSuccess } = require('../utils/response');

router.get('/', customerAuth, async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const [data, total] = await Promise.all([
    Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments({ recipient: req.user._id }),
  ]);
  sendPaginated(res, { data, total, page, limit });
});

router.put('/:id/read', customerAuth, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true, readAt: new Date() });
  sendSuccess(res, {}, 'Marked as read');
});

module.exports = router;