const express = require('express');
const router = express.Router();

const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

router.use(protect);

/* ---------------- GET TASKS ---------------- */
// Supports: /tasks OR /tasks?project=ID
router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.project) {
      filter.project = req.query.project;
    } else {
      filter.assignee = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignee', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tasks });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ---------------- DASHBOARD ---------------- */
router.get('/dashboard/summary', async (req, res) => {
  try {

    // ✅ Get user's projects
    const projects = await Project.find({
      'members.user': req.user._id
    }).select('_id');

    const projectIds = projects.map(p => p._id);

    const projectMatch = { project: { $in: projectIds } };
    const myMatch = { assignee: req.user._id };

    const [
      projectCount,
      totalTasks,
      myTasks,
      completedTasks,
      overdueTasks,
      byStatus,
      byPriority,
      recentTasks
    ] = await Promise.all([

      Project.countDocuments({
        'members.user': req.user._id
      }),

      Task.countDocuments(projectMatch),

      Task.countDocuments(myMatch),

      Task.countDocuments({
        ...projectMatch,
        status: 'done'
      }),

      Task.countDocuments({
        ...projectMatch,
        dueDate: { $lt: new Date() },
        status: { $ne: 'done' }
      }),

      Task.aggregate([
        { $match: projectMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),

      Task.aggregate([
        { $match: projectMatch },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),

      Task.find(projectMatch)
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('project', 'name')

    ]);

    res.json({
      stats: {
        projects: projectCount,
        myTasks,
        allTasks: totalTasks,
        completedTasks,
        overdueTasks
      },
      byStatus,
      byPriority,
      recentTasks
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
/* ---------------- CREATE TASK ---------------- */
router.post('/', async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({ task });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ---------------- UPDATE TASK ---------------- */
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // 🔴 CRITICAL FIX: member can be undefined
    const member = task.project?.members?.find(
      m => m.user.toString() === req.user._id.toString()
    );

    const isAdmin = member?.role === 'admin';
    const isAssignee = task.assignee?.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    // ✅ Restrict fields for non-admin
    if (!isAdmin) {
      const allowed = ['status'];
      Object.keys(req.body).forEach(key => {
        if (!allowed.includes(key)) {
          delete req.body[key];
        }
      });
    }

    Object.assign(task, req.body);
    await task.save();

    res.json({ task });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ---------------- DELETE TASK ---------------- */
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only project owner/admin can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can delete tasks' });
    }

    await task.deleteOne();

    res.json({ message: 'Deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;