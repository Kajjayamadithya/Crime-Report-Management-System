const asyncHandler  = require('express-async-handler');
const Notification  = require('../models/Notification');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getNotifications = asyncHandler(async (req, res) => {
  const { isRead, type, page = 1, limit = 20 } = req.query;

  const filter = { recipient: req.user._id };
  if (isRead !== undefined) filter.isRead = isRead === 'true';
  if (type)                 filter.type   = type;

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Notification.countDocuments(filter);
  const unread = await Notification.unreadCount(req.user._id);

  const notifications = await Notification.find(filter)
    .populate('sender',     'name role avatar')
    .populate('relatedFIR', 'firNumber title status')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-__v');

  res.status(200).json({
    success: true,
    data: {
      notifications,
      unreadCount: unread,
      pagination: {
        total,
        page:       parseInt(page),
        limit:      parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id:       req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data:    notification,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.markAllRead(req.user._id);

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} notification(s) marked as read`,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id:       req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  await Notification.deleteOne({ _id: notification._id });

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get unread count only (for navbar bell)
// @route   GET /api/notifications/unread-count
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.unreadCount(req.user._id);
  res.status(200).json({ success: true, data: { count } });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};
