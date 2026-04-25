const mongoose = require('mongoose');

const fileUploadSchema = new mongoose.Schema(
  {
    // ── File Metadata ──────────────────────────────────────────────────────
    filename: {
      type: String,
      required: [true, 'Filename is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true,
    },
    mimetype: {
      type: String,
      required: [true, 'File MIME type is required'],
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
      min: [1, 'File size must be greater than 0'],
    },
    path: {
      type: String,
      required: [true, 'File path is required'],
    },
    url: {
      type: String, // Public-accessible URL (e.g. /uploads/<filename>)
    },

    // ── Classification ─────────────────────────────────────────────────────
    fileType: {
      type: String,
      enum: ['image', 'document', 'video', 'other'],
      required: true,
    },
    purpose: {
      type: String,
      enum: ['fir_evidence', 'profile_avatar', 'case_document', 'other'],
      default: 'fir_evidence',
    },

    // ── Ownership & Reference ──────────────────────────────────────────────
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader user reference is required'],
    },
    relatedFIR: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FIR',
      default: null,
    },

    // ── Security / Integrity ───────────────────────────────────────────────
    checksum: {
      type: String, // MD5 or SHA256 hash for integrity verification
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: false, // private by default — served via authenticated route
    },
    isSensitive: {
      type: Boolean,
      default: false, // restricts access to police/admin only
    },

    // ── Lifecycle ─────────────────────────────────────────────────────────
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
fileUploadSchema.index({ uploadedBy: 1 });
fileUploadSchema.index({ relatedFIR: 1 });
fileUploadSchema.index({ isDeleted: 1 });

// ── Virtual: human-readable file size ────────────────────────────────────────
fileUploadSchema.virtual('sizeFormatted').get(function () {
  const bytes = this.size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
});

// ── Static: determine fileType from mimetype ──────────────────────────────────
fileUploadSchema.statics.resolveFileType = function (mimetype) {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (
    mimetype === 'application/pdf' ||
    mimetype.includes('word') ||
    mimetype.includes('document')
  )
    return 'document';
  return 'other';
};

// ── Soft-delete helper ────────────────────────────────────────────────────────
fileUploadSchema.methods.softDelete = async function (userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

// ── Pre-save: auto-set public URL ─────────────────────────────────────────────
fileUploadSchema.pre('save', function (next) {
  if (this.isNew && !this.url) {
    this.url = `/uploads/${this.filename}`;
  }
  next();
});

module.exports = mongoose.model('FileUpload', fileUploadSchema);
