const asyncHandler = require('express-async-handler');
const FIR          = require('../models/FIR');
const User         = require('../models/User');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAdminStats = asyncHandler(async (req, res) => {
  const [
    totalFIRs,
    totalUsers,
    totalOfficers,
    totalCitizens,
    submittedFIRs,
    underReviewFIRs,
    investigatingFIRs,
    resolvedFIRs,
    closedFIRs,
    rejectedFIRs,
    urgentFIRs,
  ] = await Promise.all([
    FIR.countDocuments(),
    User.countDocuments({ role: { $ne: 'admin' }, isActive: true }),
    User.countDocuments({ role: 'police', isActive: true }),
    User.countDocuments({ role: 'citizen', isActive: true }),
    FIR.countDocuments({ status: 'submitted' }),
    FIR.countDocuments({ status: 'under_review' }),
    FIR.countDocuments({ status: 'investigating' }),
    FIR.countDocuments({ status: 'resolved' }),
    FIR.countDocuments({ status: 'closed' }),
    FIR.countDocuments({ status: 'rejected' }),
    FIR.countDocuments({ isUrgent: true, status: { $nin: ['resolved', 'closed', 'rejected'] } }),
  ]);

  // FIRs by category
  const firsByCategory = await FIR.aggregate([
    { $group: { _id: '$crimeCategory', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // FIRs per month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const firsByMonthRaw = await FIR.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year:  { $year:  '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const firsByMonth = firsByMonthRaw.map(item => ({
    name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
    count: item.count
  }));

  // FIRs by severity
  const firsBySeverity = await FIR.aggregate([
    { $group: { _id: '$severity', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Roles distribution for analytics
  const rolesDistribution = [
    { name: 'Citizens', value: totalCitizens },
    { name: 'Police', value: totalOfficers }
  ];

  // Recent FIRs (Increased limit for full stream access)
  const recentFIRs = await FIR.find()
    .populate('complainant',     'name email')
    .populate('assignedOfficer', 'name badgeNumber')
    .sort({ createdAt: -1 })
    .limit(100)
    .select('firNumber title status crimeCategory severity isUrgent createdAt');

  // Top 5 officers by assigned FIRs
  const topOfficers = await FIR.aggregate([
    { $match: { assignedOfficer: { $ne: null } } },
    { $group: { _id: '$assignedOfficer', assignedCount: { $sum: 1 } } },
    { $sort: { assignedCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from:         'users',
        localField:   '_id',
        foreignField: '_id',
        as:           'officer',
      },
    },
    { $unwind: '$officer' },
    {
      $project: {
        name:          '$officer.name',
        badgeNumber:   '$officer.badgeNumber',
        designation:   '$officer.designation',
        assignedCount: 1,
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalFIRs,
        totalUsers,
        totalOfficers,
        totalCitizens,
        urgentFIRs,
      },
      firStatus: {
        submitted:    submittedFIRs,
        under_review: underReviewFIRs,
        investigating: investigatingFIRs,
        resolved:     resolvedFIRs,
        closed:       closedFIRs,
        rejected:     rejectedFIRs,
      },
      charts: {
        firsByCategory,
        firsByMonth,
        firsBySeverity,
        rolesDistribution,
      },
      recentFIRs,
      topOfficers,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Police dashboard stats
// @route   GET /api/dashboard/police
// @access  Private/Police
// ─────────────────────────────────────────────────────────────────────────────
const getPoliceStats = asyncHandler(async (req, res) => {
  const officerId = req.user._id;

  const [
    myAssigned,
    myInvestigating,
    myResolved,
    myPending,
    totalUnassigned,
  ] = await Promise.all([
    FIR.countDocuments({ assignedOfficer: officerId }),
    FIR.countDocuments({ assignedOfficer: officerId, status: 'investigating' }),
    FIR.countDocuments({ assignedOfficer: officerId, status: 'resolved' }),
    FIR.countDocuments({ assignedOfficer: officerId, status: { $in: ['submitted', 'under_review'] } }),
    FIR.countDocuments({ assignedOfficer: null, status: 'submitted' }),
  ]);

  // My recent FIRs
  const myRecentFIRs = await FIR.find({ assignedOfficer: officerId })
    .populate('complainant', 'name phone')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('firNumber title status crimeCategory severity isUrgent incidentDate createdAt');

  // Unassigned FIRs (Central Dispatch Pool)
  const unassignedFIRs = await FIR.find({
    assignedOfficer: null,
    status:          { $nin: ['resolved', 'closed', 'rejected'] },
  })
    .populate('complainant', 'name phone')
    .sort({ createdAt: -1 })
    .limit(100)
    .select('firNumber title crimeCategory severity isUrgent createdAt');

  res.status(200).json({
    success: true,
    data: {
      overview: {
        myAssigned,
        myInvestigating,
        myResolved,
        myPending,
        totalUnassigned,
      },
      myRecentFIRs,
      unassignedFIRs,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Citizen dashboard stats
// @route   GET /api/dashboard/citizen
// @access  Private/Citizen
// ─────────────────────────────────────────────────────────────────────────────
const getCitizenStats = asyncHandler(async (req, res) => {
  const citizenId = req.user._id;

  const [
    totalFiled,
    pending,
    investigating,
    resolved,
    rejected,
  ] = await Promise.all([
    FIR.countDocuments({ complainant: citizenId }),
    FIR.countDocuments({ complainant: citizenId, status: { $in: ['submitted', 'under_review'] } }),
    FIR.countDocuments({ complainant: citizenId, status: 'investigating' }),
    FIR.countDocuments({ complainant: citizenId, status: { $in: ['resolved', 'closed'] } }),
    FIR.countDocuments({ complainant: citizenId, status: 'rejected' }),
  ]);

  const recentFIRs = await FIR.find({ complainant: citizenId }, { policeNotes: 0 })
    .populate('assignedOfficer', 'name phone designation')
    .sort({ createdAt: -1 })
    .limit(5)
    .select('firNumber title status crimeCategory severity isUrgent incidentDate createdAt');

  res.status(200).json({
    success: true,
    data: {
      overview: { totalFiled, pending, investigating, resolved, rejected },
      recentFIRs,
    },
  });
});

module.exports = { getAdminStats, getPoliceStats, getCitizenStats };
