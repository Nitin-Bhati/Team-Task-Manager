const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  addMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(authorize('Admin'), createProject);

router.put('/:id/members', authorize('Admin'), addMember);

module.exports = router;
