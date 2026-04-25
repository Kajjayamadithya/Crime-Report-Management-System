const asyncHandler  = require('express-async-handler');
const path          = require('path');
const fs            = require('fs');
const FIR           = require('../models/FIR');
const FileUpload    = require('../models/FileUpload');
const Notification  = require('../models/Notification');
const { sendSMS }   = require('../utils/twilio');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    File a new FIR (citizen)
// @route   POST /api/fir
// @access  Private/Citizen
// ─────────────────────────────────────────────────────────────────────────────
const createFIR = asyncHandler(async (req, res) => {
  const {
    title, description, crimeCategory, severity,
    incidentDate, incidentTime, location,
    suspects, witnesses, isAnonymous, isUrgent,
  } = req.body;

  // Handle uploaded evidence files
  const evidenceFiles = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const fileType = FileUpload.resolveFileType(file.mimetype);

      const normalizedPath = file.path.replace(/\\/g, '/');

      const fileDoc = await FileUpload.create({
        filename:     file.filename,
        originalName: file.originalname,
        mimetype:     file.mimetype,
        size:         file.size,
        path:         normalizedPath,
        fileType,
        purpose:      'fir_evidence',
        uploadedBy:   req.user._id,
      });

      evidenceFiles.push({
        filename:     file.filename,
        originalName: file.originalname,
        mimetype:     file.mimetype,
        size:         file.size,
        path:         normalizedPath,
        uploadedBy:   req.user._id,
      });
    }
  }

  const fir = await FIR.create({
    complainant:  req.user._id,
    title,
    description,
    crimeCategory,
    severity:     severity     || 'medium',
    incidentDate: new Date(incidentDate),
    incidentTime: incidentTime || undefined,
    location:     typeof location === 'string' ? JSON.parse(location) : location,
    suspects:     suspects     ? (typeof suspects === 'string' ? JSON.parse(suspects) : suspects) : [],
    witnesses:    witnesses    ? (typeof witnesses === 'string' ? JSON.parse(witnesses) : witnesses) : [],
    evidence:     evidenceFiles,
    isAnonymous:  isAnonymous === 'true' || isAnonymous === true,
    isUrgent:     isUrgent    === 'true' || isUrgent    === true,
    statusHistory: [{
      status:    'submitted',
      changedBy: req.user._id,
      remarks:   'FIR submitted by complainant',
    }],
  });

  // Update FileUpload docs to reference the FIR
  if (evidenceFiles.length > 0) {
    await FileUpload.updateMany(
      { uploadedBy: req.user._id, relatedFIR: null },
      { $set: { relatedFIR: fir._id } }
    );
  }

  // Notify the complainant
  await Notification.create({
    recipient:  req.user._id,
    title:      'FIR Submitted Successfully',
    message:    `Your FIR (${fir.firNumber}) has been submitted and is under review.`,
    type:       'fir_submitted',
    relatedFIR: fir._id,
  });

  const populated = await FIR.findById(fir._id).populate('complainant', 'name email phone');

  res.status(201).json({
    success: true,
    message: `FIR filed successfully. FIR Number: ${fir.firNumber}`,
    data:    populated,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get FIRs — citizens see own; police/admin see all with filters
// @route   GET /api/fir
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAllFIRs = asyncHandler(async (req, res) => {
  const {
    status, crimeCategory, severity, assignedOfficer,
    search, startDate, endDate,
    page = 1, limit = 10, sort = '-createdAt',
  } = req.query;

  const filter = {};

  // Citizens can only see their own FIRs
  if (req.user.role === 'citizen') {
    filter.complainant = req.user._id;
  }

  // Police see their assigned FIRs + unassigned ones
  if (req.user.role === 'police') {
    filter.$or = [
      { assignedOfficer: req.user._id },
      { assignedOfficer: null },
    ];
  }

  if (status)            filter.status        = status;
  if (crimeCategory)     filter.crimeCategory = crimeCategory;
  if (severity)          filter.severity      = severity;
  if (assignedOfficer && req.user.role === 'admin') {
    filter.assignedOfficer = assignedOfficer;
  }

  if (startDate || endDate) {
    filter.incidentDate = {};
    if (startDate) filter.incidentDate.$gte = new Date(startDate);
    if (endDate)   filter.incidentDate.$lte = new Date(endDate);
  }

  if (search) {
    filter.$or = [
      { firNumber:   { $regex: search, $options: 'i' } },
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } },
    ];
  }

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await FIR.countDocuments(filter);

  // Police notes excluded from citizen view via projection
  const projection = req.user.role === 'citizen' ? { policeNotes: 0 } : {};

  const firs = await FIR.find(filter, projection)
    .populate('complainant',     'name email phone')
    .populate('assignedOfficer', 'name email badgeNumber designation')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-__v');

  res.status(200).json({
    success: true,
    data: {
      firs,
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
// @desc    Get single FIR by ID
// @route   GET /api/fir/:id
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getFIRById = asyncHandler(async (req, res) => {
  const projection = req.user.role === 'citizen' ? { policeNotes: 0 } : {};

  const fir = await FIR.findById(req.params.id, projection)
    .populate('complainant',               'name email phone address')
    .populate('assignedOfficer',           'name email phone badgeNumber designation policeStation')
    .populate('statusHistory.changedBy',   'name role')
    .populate('evidence.uploadedBy',       'name role')
    .select('-__v');

  if (!fir) {
    res.status(404);
    throw new Error('FIR not found');
  }

  // Citizens can only view their own FIRs
  if (
    req.user.role === 'citizen' &&
    fir.complainant._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Access denied — this FIR does not belong to you');
  }

  res.status(200).json({ success: true, data: fir });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update FIR status + assign officer (police/admin)
// @route   PATCH /api/fir/:id/status
// @access  Private/Police,Admin
// ─────────────────────────────────────────────────────────────────────────────
const updateFIRStatus = asyncHandler(async (req, res) => {
  const { status, remarks, assignedOfficer, policeNotes, severity } = req.body;

  const fir = await FIR.findById(req.params.id);
  if (!fir) {
    res.status(404);
    throw new Error('FIR not found');
  }

  const oldStatus = fir.status;

  // Authorization Check: Only Admin or the Assigned Officer can update status
  if (req.user.role === 'police' && fir.assignedOfficer) {
    if (fir.assignedOfficer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Unauthorized: You can only update cases assigned to you.');
    }
  }

  // Special Case: Police can update if they are claiming it right now
  if (req.user.role === 'police' && !fir.assignedOfficer && !assignedOfficer) {
      res.status(403);
      throw new Error('Unauthorized: You must claim this case before updating it.');
  }

  // Apply updates
  if (status)          fir.status = status;
  if (severity)        fir.severity = severity;
  if (policeNotes !== undefined) fir.policeNotes = policeNotes;

  // Logic for assigning officers
  if (assignedOfficer) {
    if (req.user.role === 'admin') {
      // Admins can assign to anyone
      fir.assignedOfficer = assignedOfficer;
    } else if (req.user.role === 'police' && !fir.assignedOfficer) {
      // Officers can self-assign (claim) only if currently unassigned
      if (assignedOfficer.toString() === req.user._id.toString()) {
        fir.assignedOfficer = req.user._id;
      } else {
        res.status(403);
        throw new Error('Police officers can only self-assign unassigned cases.');
      }
    }
  }

  // Auto-set resolution timestamps
  if (status === 'resolved') fir.resolvedAt = new Date();
  if (status === 'closed')   fir.closedAt   = new Date();

  // Track who made the change
  fir._updatedBy     = req.user._id;
  fir._statusRemarks = remarks || '';

  // Push to status history (handled in pre-save hook)
  if (status && status !== oldStatus) {
    fir.statusHistory.push({
      status,
      changedBy: req.user._id,
      remarks:   remarks || '',
    });
  }

  await fir.save();

  // 👉 NEW: Twilio SMS Notification on Case Resolution/Closure
  if (status === 'resolved' || status === 'closed') {
    // Populate complainant to get phone number
    const populatedFir = await fir.populate('complainant', 'phone firNumber');
    const complainantPhone = populatedFir.complainant?.phone;
    
    if (complainantPhone) {
      // Include a truncated version of the police notes (conclusion statement) in the SMS
      const conclusionSnippet = fir.policeNotes 
        ? `\nConclusion: ${fir.policeNotes.substring(0, 60)}${fir.policeNotes.length > 60 ? '...' : ''}` 
        : '';

      const smsMessage = `Your complaint (FIR ID: ${fir.firNumber}) has been successfully resolved.${conclusionSnippet}\nThank you for using CRMS.`;
      
      // Send SMS asynchronously (non-blocking)
      sendSMS(complainantPhone, smsMessage);
    }
  }

  // Notify complainant of status change
  if (status && status !== oldStatus) {
    const statusLabels = {
      under_review:  'Under Review',
      investigating: 'Under Investigation',
      resolved:      'Resolved',
      closed:        'Closed',
      rejected:      'Rejected',
    };
    await Notification.create({
      recipient:  fir.complainant,
      sender:     req.user._id,
      title:      `FIR Status Updated: ${statusLabels[status] || status}`,
      message:    `Your FIR (${fir.firNumber}) status has been updated to "${statusLabels[status] || status}". ${remarks ? `Remarks: ${remarks}` : ''}`,
      type:       status === 'resolved' ? 'fir_resolved' : status === 'rejected' ? 'fir_rejected' : 'status_update',
      relatedFIR: fir._id,
      priority:   ['resolved', 'rejected', 'closed'].includes(status) ? 'high' : 'normal',
    });
  }

  // Notify newly assigned officer
  if (assignedOfficer && req.user.role === 'admin') {
    await Notification.create({
      recipient:  assignedOfficer,
      sender:     req.user._id,
      title:      'FIR Assigned to You',
      message:    `FIR ${fir.firNumber} has been assigned to you for investigation.`,
      type:       'fir_assigned',
      relatedFIR: fir._id,
      priority:   'high',
    });
  }

  const updated = await FIR.findById(fir._id)
    .populate('complainant',     'name email phone')
    .populate('assignedOfficer', 'name email badgeNumber');

  res.status(200).json({
    success: true,
    message: 'FIR updated successfully',
    data:    updated,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Upload additional evidence to existing FIR
// @route   POST /api/fir/:id/evidence
// @access  Private (complainant + police + admin)
// ─────────────────────────────────────────────────────────────────────────────
const uploadEvidence = asyncHandler(async (req, res) => {
  const fir = await FIR.findById(req.params.id);
  if (!fir) {
    res.status(404);
    throw new Error('FIR not found');
  }

  // Citizen can only upload to their own FIR
  if (
    req.user.role === 'citizen' &&
    fir.complainant.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error('Access denied');
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No files uploaded');
  }

  const newEvidence = [];
  for (const file of req.files) {
    const fileType = FileUpload.resolveFileType(file.mimetype);

    await FileUpload.create({
      filename:     file.filename,
      originalName: file.originalname,
      mimetype:     file.mimetype,
      size:         file.size,
      path:         file.path,
      fileType,
      purpose:      'fir_evidence',
      uploadedBy:   req.user._id,
      relatedFIR:   fir._id,
    });

    newEvidence.push({
      filename:     file.filename,
      originalName: file.originalname,
      mimetype:     file.mimetype,
      size:         file.size,
      path:         file.path,
      uploadedBy:   req.user._id,
    });
  }

  fir.evidence.push(...newEvidence);
  await fir.save({ validateBeforeSave: false });

  // Notify assigned officer if citizen uploaded
  if (req.user.role === 'citizen' && fir.assignedOfficer) {
    await Notification.create({
      recipient:  fir.assignedOfficer,
      sender:     req.user._id,
      title:      'New Evidence Uploaded',
      message:    `Complainant has uploaded ${req.files.length} new file(s) to FIR ${fir.firNumber}.`,
      type:       'new_evidence',
      relatedFIR: fir._id,
    });
  }

  res.status(200).json({
    success: true,
    message: `${req.files.length} file(s) uploaded successfully`,
    data:    { evidence: fir.evidence },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete FIR (admin only)
// @route   DELETE /api/fir/:id
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const deleteFIR = asyncHandler(async (req, res) => {
  const fir = await FIR.findById(req.params.id);
  if (!fir) {
    res.status(404);
    throw new Error('FIR not found');
  }

  // Remove physical evidence files
  for (const file of fir.evidence) {
    const filePath = path.join(__dirname, '..', file.path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  await FIR.deleteOne({ _id: fir._id });
  await FileUpload.deleteMany({ relatedFIR: fir._id });

  res.status(200).json({
    success: true,
    message: `FIR ${fir.firNumber} deleted permanently`,
  });
});

module.exports = {
  createFIR,
  getAllFIRs,
  getFIRById,
  updateFIRStatus,
  uploadEvidence,
  deleteFIR,
};
