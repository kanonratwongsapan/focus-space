import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  aiPriority: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'None'],
    default: 'None'
  },
  aiReason: {
    type: String,
    default: ''
  },
  isConfirmed: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  deadline: {
    type: Date
  },
  pomodoroCycles: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  targetTime: {
    type: Number,
    default: 0 // in minutes
  },
  progress: {
    type: Number,
    default: 0, // 0 - 100%
    min: 0,
    max: 100
  },
  googleEventId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
