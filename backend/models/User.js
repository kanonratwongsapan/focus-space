import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profileImage: {
    type: String,
    default: '' // Can store base64 string or url
  },
  googleClientId: {
    type: String,
    default: ''
  },
  isSetupCompleted: {
    type: Boolean,
    default: false
  },
  resetCode: {
    type: String,
    default: ''
  },
  resetCodeExpires: {
    type: Date,
    default: null
  },
  activeFocusSession: {
    targetEndTime: { type: Number, default: null },
    workDuration: { type: Number, default: 25 },
    breakDuration: { type: Number, default: 5 },
    isBreak: { type: Boolean, default: false },
    selectedTaskId: { type: String, default: '' },
    selectedFlower: { type: String, default: 'sunflower' }
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
