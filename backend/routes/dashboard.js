import express from 'express';
import Task from '../models/Task.js';
import FocusSession from '../models/FocusSession.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Get User Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Task Counts
    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({ user: userId, completed: true });
    const pendingTasks = await Task.countDocuments({ user: userId, completed: false });
    const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Priority counts for pending tasks
    const highPriority = await Task.countDocuments({ user: userId, completed: false, priority: 'High' });
    const mediumPriority = await Task.countDocuments({ user: userId, completed: false, priority: 'Medium' });
    const lowPriority = await Task.countDocuments({ user: userId, completed: false, priority: 'Low' });

    // 2. Focus Sessions & Total Pomodoro Time
    const focusSessions = await FocusSession.find({ userId });
    const sessionTime = focusSessions.reduce((acc, session) => acc + (session.duration || 25), 0);

    const allUserTasks = await Task.find({ user: userId });
    const taskTimeSpentMinutes = allUserTasks.reduce((acc, t) => acc + Math.round((t.timeSpent || 0) / 60), 0);

    const totalPomodoroTime = Math.max(sessionTime, taskTimeSpentMinutes);

    // 3. Top Focused Tasks
    const topFocusedTasks = await Task.find({ user: userId, pomodoroCycles: { $gt: 0 } })
      .select('title pomodoroCycles priority')
      .sort({ pomodoroCycles: -1 })
      .limit(5);

    // 4. Daily trends for the last 7 days
    const dailyTrends = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
      
      const dayLabel = date.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });

      // Count tasks completed on this day
      const completedCount = await Task.countDocuments({
        user: userId,
        completed: true,
        completedAt: { $gte: startOfDay, $lte: endOfDay }
      });

      // Count focus sessions on this day
      const daySessions = await FocusSession.find({
        userId,
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      const focusMinutes = daySessions.reduce((acc, s) => acc + (s.duration || 25), 0);

      dailyTrends.push({
        day: dayLabel,
        completedTasks: completedCount,
        focusMinutes: focusMinutes,
        sessionsCount: daySessions.length
      });
    }

    res.json({
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      successRate,
      totalPomodoroTime,
      priorityCounts: {
        High: highPriority,
        Medium: mediumPriority,
        Low: lowPriority
      },
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate: successRate,
        totalFocusTime: totalPomodoroTime,
        focusSessionsCount: focusSessions.length
      },
      topFocusedTasks,
      dailyTrends
    });

  } catch (error) {
    console.error('Error in /api/dashboard/stats:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
