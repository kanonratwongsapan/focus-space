import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null,
  },
  duration: {
    type: Number,
    required: true,
    default: 25, // default pomodoro duration in minutes
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FocusSession = mongoose.model('FocusSession', focusSessionSchema);
export default FocusSession;
