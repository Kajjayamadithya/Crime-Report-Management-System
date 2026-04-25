const express   = require('express');
const router    = express.Router();

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getOfficers,
} = require('../controllers/userController');

const { protect }           = require('../middleware/authMiddleware');
const { authorise }         = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(protect);

// Officers list — admin & police can query
router.get('/officers', authorise('admin', 'police'), getOfficers);

// Admin-only CRUD
router.route('/')
  .get(authorise('admin'),              getAllUsers)
  .post(authorise('admin'),             createUser);

router.route('/:id')
  .get(authorise('admin'),              getUserById)
  .put(authorise('admin'),              updateUser)
  .delete(authorise('admin'),           deleteUser);

module.exports = router;
