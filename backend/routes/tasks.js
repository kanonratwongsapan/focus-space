import express from 'express';
import Task from '../models/Task.js';
import { auth } from '../middleware/auth.js';
import { analyzeTaskPriority } from '../controllers/aiController.js';

const router = express.Router();

// Analyze task priority without saving (for user confirmation UI)
router.post('/analyze', auth, analyzeTaskPriority);

const extractRelativeDeadline = (title, description) => {
  const combinedText = `${title} ${description || ''}`.toLowerCase();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  if (combinedText.includes('วันนี้')) {
    return new Date(todayStr);
  } else if (combinedText.includes('พรุ่งนี้')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return new Date(tomorrow.toISOString().split('T')[0]);
  } else if (combinedText.includes('มะรืนนี้')) {
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    return new Date(dayAfter.toISOString().split('T')[0]);
  } else {
    // Match "อีก X วัน"
    const matchDays = combinedText.match(/อีก\s*(\d+)\s*วัน/);
    if (matchDays && matchDays[1]) {
      const daysToAdd = parseInt(matchDays[1], 10);
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysToAdd);
      return new Date(targetDate.toISOString().split('T')[0]);
    }
  }
  return null;
};

// Helper: Gradual Multi-Tier Step-by-Step Priority Escalation
const getGradualEscalatedPriority = (currentPriority, deadline, isCompleted) => {
  if (!deadline || isCompleted) return { priority: currentPriority, reason: null };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(deadline);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Tier 1: Due today or overdue (diffDays <= 0) -> Escalate to High
  if (diffDays <= 0) {
    if (currentPriority !== 'High') {
      return {
        priority: 'High',
        reason: `⚡ ยกระดับเป็นความสำคัญสูงให้อัตโนมัติ (กำหนดส่งวันนี้!)`
      };
    }
  }
  // Tier 2: Remaining 1 to 3 days (1 <= diffDays <= 3) -> Escalate Low to Medium
  else if (diffDays <= 3) {
    if (currentPriority === 'Low') {
      return {
        priority: 'Medium',
        reason: `⚡ ยกระดับเป็นความสำคัญปานกลางให้อัตโนมัติ (เหลือเวลาอีก ${diffDays} วัน)`
      };
    }
  }

  return { priority: currentPriority, reason: null };
};

// Create a new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority, aiPriority, aiReason, isConfirmed, deadline, targetTime, progress, googleEventId } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const finalDeadline = deadline ? new Date(deadline) : extractRelativeDeadline(title, description);

    let initProgress = progress !== undefined ? Math.min(100, Math.max(0, Number(progress))) : 0;
    let initCompleted = initProgress >= 100;
    let inputPriority = priority || 'Medium';

    // Step-by-Step Gradual Auto-Escalation check on creation
    const escalation = getGradualEscalatedPriority(inputPriority, finalDeadline, initCompleted);
    let finalPriority = escalation.priority;
    let finalAiReason = aiReason || (escalation.reason || '');

    const newTask = new Task({
      user: req.userId,
      title,
      description,
      priority: finalPriority,
      aiPriority: aiPriority || 'None',
      aiReason: finalAiReason,
      isConfirmed: isConfirmed || false,
      completed: initCompleted,
      deadline: finalDeadline,
      targetTime: Number(targetTime) || 0,
      progress: initProgress,
      googleEventId: googleEventId || ''
    });

    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all tasks for the logged in user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });
    
    // Step-by-step gradual auto-escalation check for all pending tasks
    for (let task of tasks) {
      if (!task.completed && task.deadline) {
        const escalation = getGradualEscalatedPriority(task.priority, task.deadline, task.completed);
        if (escalation.priority !== task.priority) {
          task.priority = escalation.priority;
          if (escalation.reason) {
            task.aiReason = escalation.reason;
          }
          await task.save();
        }
      }
    }

    // Sort logic in JavaScript to handle custom enum ordering
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    
    tasks.sort((a, b) => {
      // Completed last
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // Higher priority first
      const weightA = priorityWeight[a.priority] || 2;
      const weightB = priorityWeight[b.priority] || 2;
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      // Newest first
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a task (edit content, toggle completion, update pomodoro stats, target time & progress)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, priority, isConfirmed, completed, deadline, targetTime, progress, pomodoroCycles, timeSpent, googleEventId } = req.body;
    
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or unauthorized.' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (isConfirmed !== undefined) task.isConfirmed = isConfirmed;
    if (deadline !== undefined) task.deadline = deadline;
    if (targetTime !== undefined) task.targetTime = Number(targetTime);
    if (googleEventId !== undefined) task.googleEventId = googleEventId;
    
    if (progress !== undefined) {
      const progNum = Math.min(100, Math.max(0, Number(progress)));
      task.progress = progNum;
      if (progNum === 100) {
        task.completed = true;
        task.completedAt = new Date();
      } else if (progNum < 100 && completed === undefined) {
        task.completed = false;
        task.completedAt = null;
      }
    }

    if (completed !== undefined) {
      task.completed = completed;
      task.completedAt = completed ? new Date() : null;
      if (completed) task.progress = 100;
    }
    
    // Increment Pomodoro stats and auto-update progress if targetTime is set
    if (pomodoroCycles !== undefined) task.pomodoroCycles = pomodoroCycles;
    if (timeSpent !== undefined) {
      task.timeSpent = timeSpent;
      if (task.targetTime > 0 && progress === undefined) {
        const calculatedProgress = Math.min(100, Math.round((timeSpent / 60 / task.targetTime) * 100));
        task.progress = calculatedProgress;
        if (calculatedProgress === 100) {
          task.completed = true;
          task.completedAt = new Date();
        }
      }
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await Task.deleteOne({ _id: req.params.id, user: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Task not found or unauthorized.' });
    }
    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get task statistics for Dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId });
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Calculate total Pomodoro time spent (in minutes)
    const totalTimeSpent = tasks.reduce((sum, t) => sum + t.timeSpent, 0);
    const totalPomodoroTime = Math.round(totalTimeSpent / 60); // convert to minutes
    
    // Priority breakdown
    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach(t => {
      if (!t.completed && priorityCounts[t.priority] !== undefined) {
        priorityCounts[t.priority]++;
      }
    });

    res.json({
      total,
      completed,
      pending,
      successRate,
      totalPomodoroTime,
      priorityCounts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
