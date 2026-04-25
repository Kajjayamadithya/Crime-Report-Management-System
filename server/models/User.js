const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // ── Personal Info ──────────────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'],
    },
    address: {
      street: { type: String, trim: true },
      city:   { type: String, trim: true },
      state:  { type: String, trim: true },
      pincode: {
        type: String,
        match: [/^\d{6}$/, 'Pincode must be 6 digits'],
      },
    },

    // ── Role & Status ─────────────────────────────────────────────────────
    role: {
      type: String,
      enum: {
        values: ['citizen', 'police', 'admin'],
        message: 'Role must be citizen, police, or admin',
      },
      default: 'citizen',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // ── Profile ───────────────────────────────────────────────────────────
    avatar: {
      type: String, // file path for uploaded profile photo
      default: null,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    nationalId: {
      type: String, // Aadhaar / PAN (stored encrypted in production)
      trim: true,
    },

    // ── Police-specific fields ────────────────────────────────────────────
    badgeNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // unique but allows multiple nulls
    },
    policeStation: {
      name:    { type: String, trim: true },
      district: { type: String, trim: true },
      state:   { type: String, trim: true },
    },
    designation: {
      type: String,
      trim: true, // e.g., "Sub-Inspector", "Inspector"
    },

    // ── Security ─────────────────────────────────────────────────────────
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // ── Stats ─────────────────────────────────────────────────────────────
    lastLogin: { type: Date },
    totalFIRsFiled: { type: Number, default: 0 },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });

// ── Virtual: full address string ──────────────────────────────────────────────
userSchema.virtual('fullAddress').get(function () {
  const a = this.address;
  if (!a) return '';
  return [a.street, a.city, a.state, a.pincode].filter(Boolean).join(', ');
});

// ── Pre-save: hash password ───────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
  next();
});

// ── Instance method: compare password ────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: check if account is locked ───────────────────────────────
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// ── Remove sensitive fields from JSON output ──────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.loginAttempts;
  delete obj.lockUntil;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
