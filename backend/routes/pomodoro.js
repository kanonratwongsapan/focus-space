import express from 'express';
import FocusSession from '../models/FocusSession.js';
import Task from '../models/Task.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Record completed Pomodoro session
router.post('/session', async (req, res) => {
  try {
    const { taskId, duration } = req.body;
    
    // Create focus session
    const session = new FocusSession({
      userId: req.userId,
      taskId: taskId || null,
      duration: duration || 25,
    });

    await session.save();

    // If session is tied to a specific task, increment its count
    if (taskId) {
      const task = await Task.findOne({ _id: taskId, userId: req.userId });
      if (task) {
        task.pomodoroSessionsCount = (task.pomodoroSessionsCount || 0) + 1;
        await task.save();
      }
    }

    res.status(201).json({
      message: 'Focus session recorded successfully',
      session,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
