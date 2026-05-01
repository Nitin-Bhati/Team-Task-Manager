const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  const { name, description, members } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Please add a project name' });
  }

  let projectMembers = [req.user._id];

  if (members && Array.isArray(members)) {
    // Validate users exist (members can be emails or IDs)
    const users = await User.find({
      $or: [
        { _id: { $in: members.filter(m => m.match(/^[0-9a-fA-F]{24}$/)) } },
        { email: { $in: members } }
      ]
    });
    const memberIds = users.map(u => u._id);
    projectMembers = [...new Set([...projectMembers, ...memberIds.map(id => id.toString())])];
  }

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
    members: projectMembers,
  });

  res.status(201).json(project);
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  const projects = await Project.find({
    $or: [{ createdBy: req.user._id }, { members: req.user._id }],
  }).populate('members', 'name email');

  res.status(200).json(projects);
};

// @desc    Add member to project
// @route   PUT /api/projects/:id/members
// @access  Private/Admin
const addMember = async (req, res) => {
  const { email } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (project.members.includes(user._id)) {
    return res.status(400).json({ message: 'User already in project' });
  }

  project.members.push(user._id);
  await project.save();

  res.status(200).json(project);
};

module.exports = {
  createProject,
  getProjects,
  addMember,
};
