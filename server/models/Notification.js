const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // ── Recipient ──────────────────────────────────────────────────────────
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required'],
    },

    // ── Sender (system or a user) ──────────────────────────────────────────
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = system-generated
    },

    // ── Content ────────────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },

    // ── Classification ─────────────────────────────────────────────────────
    type: {
      type: String,
      required: true,
      enum: {
        values: [
          'fir_submitted',      // Citizen filed a new FIR
          'fir_assigned',       // Officer assigned to FIR
          'status_update',      // FIR status changed
          'fir_resolved',       // FIR marked as resolved
          'fir_rejected',       // FIR rejected with reason
          'new_evidence',       // Evidence uploaded to FIR
          'officer_comment',    // Police officer added a comment
          'account_activated',  // Admin activated account
          'account_suspended',  // Admin suspended account
          'system_alert',       // System-level alert
          'general',            // General notification
        ],
        message: 'Invalid notification type',
      },
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },

    // ── Reference (links notification to a FIR or other entity) ───────────
    relatedFIR: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FIR',
      default: null,
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── State ──────────────────────────────────────────────────────────────
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },

    // ── Delivery Channels ──────────────────────────────────────────────────
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms:   { type: Boolean, default: false },
    },
    deliveryStatus: {
      email: {
        sent:  { type: Boolean, default: false },
        sentAt: { type: Date },
        error:  { type: String },
      },
      sms: {
        sent:  { type: Boolean, default: false },
        sentAt: { type: Date },
        error:  { type: String },
      },
    },

    // ── Expiry ─────────────────────────────────────────────────────────────
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: { expires: 0 }, // MongoDB TTL index auto-deletes expired docs
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ relatedFIR: 1 });

// ── Virtual: time since sent ──────────────────────────────────────────────────
notificationSchema.virtual('timeAgo').get(function () {
  const diff = Date.now() - this.createdAt.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.floor(hours / 24)} day(s) ago`;
});

// ── Static: mark all as read for a user ──────────────────────────────────────
notificationSchema.statics.markAllRead = async function (userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

// ── Static: count unread for a user ──────────────────────────────────────────
notificationSchema.statics.unreadCount = async function (userId) {
  return this.countDocuments({ recipient: userId, isRead: false });
};

module.exports = mongoose.model('Notification', notificationSchema);
