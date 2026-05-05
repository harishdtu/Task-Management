const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { projectValidation, validate } = require('../middleware/validate');

// All routes require authentication
router.use(protect);

// Helper: check membership
const getMemberRole = (project, userId) => {
  const member = project.members.find(m => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

// @route   GET /api/projects
// @desc    Get all projects where user is a member
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    // Get task counts for each project
    const projectIds = projects.map(p => p._id);
    const taskCounts = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$project', total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } } } }
    ]);

    const countMap = {};
    taskCounts.forEach(tc => { countMap[tc._id.toString()] = tc; });

    const projectsWithCounts = projects.map(p => {
      const counts = countMap[p._id.toString()] || { total: 0, done: 0 };
      return { ...p.toJSON(), taskCount: counts.total, completedCount: counts.done };
    });

    res.json({ projects: projectsWithCounts });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const project = await Project.create({
      name,
      description,
      color,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    res.status(201).json({ project });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get a single project with tasks
// @access  Private (members only)
router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const role = getMemberRole(project, req.user._id);
    if (!role && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ project, userRole: role });
  } catch (err) {
    next(err);
  }
});

// @route   PATCH /api/projects/:id
// @desc    Update project details
// @access  Private (project admin only)
router.patch('/:id', projectValidation, validate, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    const role = getMemberRole(project, req.user._id);
    if (role !== 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only project admins can update this project.' });
    }

    const { name, description, color, status, dueDate } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;
    if (status) project.status = status;
    if (dueDate !== undefined) project.dueDate = dueDate;

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('members.user', 'name email avatar');

    res.json({ message: 'Project updated!', project });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project and all its tasks
// @access  Private (project owner or system admin)
router.delete('/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the project owner can delete this project.' });
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project and all tasks deleted.' });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add a member to project
// @access  Private (project admin)
router.post('/:id/members', async (req, res) => {
  try {
    const { email, role } = req.body;

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: { $regex: new RegExp(`^${cleanEmail}$`, 'i') }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const alreadyMember = project.members.some(
      m => m.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: 'Already a member' });
    }

    project.members.push({
      user: user._id,
      role: role || 'member'
    });

    await project.save();

    res.json({ message: 'Member added' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove a member from project
// @access  Private (project admin)
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    const me = project.members.find(
      m => m.user.toString() === req.user._id.toString()
    );
    if (!me || me.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    project.members = project.members.filter(
      m => m.user.toString() !== req.params.userId
    );

    await project.save();

    res.json({ message: 'Member removed' });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
console.log('Project:', Project);
module.exports = router;