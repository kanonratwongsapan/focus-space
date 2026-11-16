import express from 'express';
import FocusSession from '../models/FocusSession.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Get currently active focus session (Cross-device Cloud Sync)
router.get('/active-session', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('activeFocusSession');
    if (!user || !user.activeFocusSession || !user.activeFocusSession.targetEndTime) {
      return res.json({ activeFocusSession: null });
    }

    // Auto-clear if already expired
    if (user.activeFocusSession.targetEndTime <= Date.now()) {
      user.activeFocusSession = {
        targetEndTime: null,
        workDuration: 25,
        breakDuration: 5,
        isBreak: false,
        selectedTaskId: '',
        selectedFlower: 'sunflower'
      };
      await user.save();
      return res.json({ activeFocusSession: null });
    }

    res.json({ activeFocusSession: user.activeFocusSession });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sync active focus session to cloud
router.post('/active-session', async (req, res) => {
  try {
    const { targetEndTime, workDuration, breakDuration, isBreak, selectedTaskId, selectedFlower } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.activeFocusSession = {
      targetEndTime: targetEndTime || null,
      workDuration: workDuration || 25,
      breakDuration: breakDuration || 5,
      isBreak: !!isBreak,
      selectedTaskId: selectedTaskId || '',
      selectedFlower: selectedFlower || 'sunflower'
    };

    await user.save();
    res.json({ message: 'Active focus session synced', activeFocusSession: user.activeFocusSession });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear active focus session (Completed, Reset, or Logout)
router.delete('/active-session', async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user) {
      user.activeFocusSession = {
        targetEndTime: null,
        workDuration: 25,
        breakDuration: 5,
        isBreak: false,
        selectedTaskId: '',
        selectedFlower: 'sunflower'
      };
      await user.save();
    }
    res.json({ message: 'Active focus session cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Record completed Pomodoro session
router.post('/session', async (req, res) => {
  try {
    const { taskId, duration, companionType } = req.body;
    const companion = companionType || 'sunflower';
    
    // Create focus session
    const session = new FocusSession({
      userId: req.userId,
      taskId: taskId || null,
      duration: duration || 25,
      companionType: companion,
    });

    await session.save();

    // Increment companion history on User document
    const validCompanions = ['sunflower', 'sakura', 'tulip', 'daisy', 'pine', 'phoenix', 'dragon', 'tiger', 'wolf', 'gryphon'];
    let updatedHistory = null;
    if (validCompanions.includes(companion)) {
      const user = await User.findByIdAndUpdate(
        req.userId,
        { $inc: { [`companionHistory.${companion}`]: 1 } },
        { new: true }
      ).select('companionHistory');
      if (user) {
        updatedHistory = user.companionHistory;
      }
    }

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
      companionHistory: updatedHistory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sync / merge companion history from local storage to cloud
router.post('/companion-history/sync', async (req, res) => {
  try {
    const { localHistory } = req.body;
    if (!localHistory || typeof localHistory !== 'object') {
      return res.status(400).json({ message: 'Invalid history data' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.companionHistory) {
      user.companionHistory = {};
    }

    const validCompanions = ['sunflower', 'sakura', 'tulip', 'daisy', 'pine', 'phoenix', 'dragon', 'tiger', 'wolf', 'gryphon'];
    let changed = false;

    for (const key of validCompanions) {
      const localVal = Number(localHistory[key]) || 0;
      const currentVal = Number(user.companionHistory[key]) || 0;
      if (localVal > currentVal) {
        user.companionHistory[key] = localVal;
        changed = true;
      }
    }

    if (changed) {
      user.markModified('companionHistory');
      await user.save();
    }

    res.json({ companionHistory: user.companionHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
