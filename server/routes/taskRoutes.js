const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  getStats,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(authorize('Admin'), createTask);

router.get('/stats', getStats);

router
  .route('/:id')
  .put(updateTask)
  .delete(authorize('Admin'), deleteTask);

module.exports = router;
