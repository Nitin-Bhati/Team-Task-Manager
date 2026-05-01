const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Create task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  const { title, description, status, assignedTo, projectId, dueDate } = req.body;

  if (!title || !assignedTo || !projectId || !dueDate) {
    return res.status(400).json({ message: 'Please add all required fields' });
  }

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // Validate assigned user is part of project.members
  if (!project.members.map(m => m.toString()).includes(assignedTo.toString())) {
    return res.status(400).json({ message: 'Assigned user is not a member of this project' });
  }

  const task = await Task.create({
    title,
    description,
    status: status || 'To Do',
    assignedTo,
    projectId,
    dueDate,
  });

  res.status(201).json(task);
};

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  const { projectId, status } = req.query;
  const filter = {};

  if (projectId) filter.projectId = projectId;
  if (status) filter.status = status;

  // Members only see their tasks, Admins see all tasks in filter context
  if (req.user.role !== 'Admin') {
    filter.assignedTo = req.user._id;
  }

  const tasks = await Task.find(filter)
    .populate('assignedTo', 'name email')
    .populate('projectId', 'name');

  res.status(200).json(tasks);
};

// @desc    Update task status
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Only Admin or Assigned Member can update
  if (req.user.role !== 'Admin' && task.assignedTo.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to update this task' });
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedTask);
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/stats
// @access  Private
const getStats = async (req, res) => {
  const filter = {};
  if (req.user.role !== 'Admin') {
    filter.assignedTo = req.user._id;
  }

  const tasks = await Task.find(filter);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'Done').length,
    inProgress: tasks.filter((t) => t.status === 'In Progress').length,
    todo: tasks.filter((t) => t.status === 'To Do').length,
    overdue: tasks.filter((t) => t.status !== 'Done' && new Date(t.dueDate) < new Date()).length,
  };

  res.status(200).json(stats);
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Only Admin can delete
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Not authorized to delete tasks' });
  }

  await task.deleteOne();

  res.status(200).json({ message: 'Task removed' });
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  getStats,
  deleteTask,
};
