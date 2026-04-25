const express  = require('express');
const router   = express.Router();

const {
  createFIR,
  getAllFIRs,
  getFIRById,
  updateFIRStatus,
  uploadEvidence,
  deleteFIR,
} = require('../controllers/firController');

const { protect }    = require('../middleware/authMiddleware');
const { authorise }  = require('../middleware/roleMiddleware');
const { validateFIR } = require('../middleware/validationMiddleware');
const upload         = require('../utils/uploadConfig');

// Helper to parse stringified JSON from FormData before validation
const parseNestedJSON = (req, res, next) => {
  if (req.body.location && typeof req.body.location === 'string') {
    try {
      req.body.location = JSON.parse(req.body.location);
    } catch (error) {
      console.error('Failed to parse location JSON');
    }
  }
  next();
};

router.use(protect);

// ── Core CRUD ─────────────────────────────────────────────────────────────────
router.route('/')
  .get(getAllFIRs)                                          // all roles
  .post(upload.array('evidence', 5), parseNestedJSON, validateFIR, createFIR); // citizen

// ── Single FIR ────────────────────────────────────────────────────────────────
router.route('/:id')
  .get(getFIRById)                                         // all roles
  .delete(authorise('admin'), deleteFIR);                  // admin only

// ── Status update (police + admin) ───────────────────────────────────────────
router.patch('/:id/status', authorise('admin', 'police'), updateFIRStatus);

// ── Evidence upload to existing FIR ──────────────────────────────────────────
router.post('/:id/evidence', upload.array('files', 5), uploadEvidence);

module.exports = router;
