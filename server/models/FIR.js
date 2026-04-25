const mongoose = require('mongoose');

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const locationSchema = new mongoose.Schema({
  address: {
    type: String,
    required: [true, 'Incident address is required'],
    trim: true,
  },
  city:     { type: String, trim: true },
  district: { type: String, trim: true },
  state:    { type: String, trim: true },
  pincode: {
    type: String,
    match: [/^\d{6}$/, 'Pincode must be 6 digits'],
  },
  // GeoJSON point for maps integration (Step 10)
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: undefined,
    },
  },
}, { _id: false });

const evidenceSchema = new mongoose.Schema({
  filename:     { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype:     { type: String, required: true },
  size:         { type: Number, required: true }, // bytes
  path:         { type: String, required: true },
  uploadedAt:   { type: Date, default: Date.now },
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['submitted', 'under_review', 'investigating', 'resolved', 'closed', 'rejected'],
  },
  changedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt:  { type: Date, default: Date.now },
  remarks:    { type: String, trim: true, maxlength: 500 },
}, { _id: true });

const witnessSchema = new mongoose.Schema({
  name:    { type: String, trim: true },
  phone:   { type: String, trim: true },
  address: { type: String, trim: true },
  statement: { type: String, trim: true, maxlength: 1000 },
}, { _id: true });

// ── Main FIR Schema ──────────────────────────────────────────────────────────

const firSchema = new mongoose.Schema(
  {
    // ── Identification ─────────────────────────────────────────────────────
    firNumber: {
      type: String,
      unique: true,
      // Auto-generated in pre-save hook
    },

    // ── Complainant (Citizen who filed) ───────────────────────────────────
    complainant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Complainant is required'],
    },

    // ── Assigned Officer ──────────────────────────────────────────────────
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ── FIR Details ───────────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'FIR title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'FIR description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    crimeCategory: {
      type: String,
      required: [true, 'Crime category is required'],
      enum: {
        values: [
          'theft',
          'assault',
          'robbery',
          'burglary',
          'fraud',
          'cybercrime',
          'domestic_violence',
          'missing_person',
          'accident',
          'vandalism',
          'drug_related',
          'sexual_harassment',
          'murder',
          'kidnapping',
          'other',
        ],
        message: 'Invalid crime category',
      },
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },

    // ── Incident Details ──────────────────────────────────────────────────
    incidentDate: {
      type: Date,
      required: [true, 'Incident date is required'],
      validate: {
        validator: function (v) {
          return v <= new Date();
        },
        message: 'Incident date cannot be in the future',
      },
    },
    incidentTime: {
      type: String, // HH:MM format
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)'],
    },
    location: {
      type: locationSchema,
      required: [true, 'Incident location is required'],
    },

    // ── Suspects ──────────────────────────────────────────────────────────
    suspects: [
      {
        name:        { type: String, trim: true },
        description: { type: String, trim: true, maxlength: 500 },
        age:         { type: Number, min: 0, max: 120 },
        gender:      { type: String, enum: ['male', 'female', 'unknown'] },
        knownToVictim: { type: Boolean, default: false },
      },
    ],

    // ── Witnesses ─────────────────────────────────────────────────────────
    witnesses: [witnessSchema],

    // ── Evidence Files ────────────────────────────────────────────────────
    evidence: [evidenceSchema],

    // ── Status Tracking ───────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'investigating', 'resolved', 'closed', 'rejected'],
      default: 'submitted',
    },
    statusHistory: [statusHistorySchema],

    // ── Police Notes (internal, not visible to citizen) ───────────────────
    policeNotes: {
      type: String,
      trim: true,
      maxlength: [3000, 'Police notes cannot exceed 3000 characters'],
      select: false, // filtered via projection; exposed only to police/admin
    },

    // ── Resolution ────────────────────────────────────────────────────────
    resolutionRemarks: { type: String, trim: true, maxlength: 1000 },
    resolvedAt:        { type: Date },
    closedAt:          { type: Date },

    // ── Flags ─────────────────────────────────────────────────────────────
    isAnonymous: { type: Boolean, default: false },
    isUrgent:    { type: Boolean, default: false },
    isSensitive: { type: Boolean, default: false }, // restricts visibility
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
firSchema.index({ complainant: 1 });
firSchema.index({ assignedOfficer: 1 });
firSchema.index({ status: 1 });
firSchema.index({ crimeCategory: 1 });
firSchema.index({ incidentDate: -1 });
firSchema.index({ 'location.coordinates': '2dsphere' }); // for geo queries

// ── Auto-generate FIR Number ──────────────────────────────────────────────────
firSchema.pre('save', async function (next) {
  if (this.isNew && !this.firNumber) {
    const year = new Date().getFullYear();
    
    // Find the latest FIR to get the highest number (more robust than countDocuments)
    const lastFir = await mongoose.model('FIR').findOne({}, { firNumber: 1 }, { sort: { createdAt: -1 } });
    
    let nextNum = 1;
    if (lastFir && lastFir.firNumber) {
      const parts = lastFir.firNumber.split('-');
      const lastSequence = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastSequence)) {
        nextNum = lastSequence + 1;
      }
    }
    
    this.firNumber = `FIR-${year}-${String(nextNum).padStart(6, '0')}`;
  }

  // Push status change to history when status field changes
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status:    this.status,
      changedBy: this._updatedBy || this.assignedOfficer || this.complainant,
      remarks:   this._statusRemarks || '',
    });
  }

  next();
});

// ── Virtual: days since filed ─────────────────────────────────────────────────
firSchema.virtual('daysSinceFiled').get(function () {
  const diff = Date.now() - this.createdAt.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// ── Virtual: evidence count ───────────────────────────────────────────────────
firSchema.virtual('evidenceCount').get(function () {
  return this.evidence ? this.evidence.length : 0;
});

module.exports = mongoose.model('FIR', firSchema);
