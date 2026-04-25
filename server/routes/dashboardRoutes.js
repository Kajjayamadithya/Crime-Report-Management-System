const express  = require('express');
const router   = express.Router();

const {
  getAdminStats,
  getPoliceStats,
  getCitizenStats,
} = require('../controllers/dashboardController');

const { protect }   = require('../middleware/authMiddleware');
const { authorise } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/admin',   authorise('admin'),           getAdminStats);
router.get('/police',  authorise('admin', 'police'), getPoliceStats);
router.get('/citizen', authorise('citizen'),         getCitizenStats);

module.exports = router;
