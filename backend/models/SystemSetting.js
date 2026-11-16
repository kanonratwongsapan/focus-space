import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'ai_config'
  },
  activeProvider: {
    type: String,
    enum: ['gemini', 'openai', 'openrouter'],
    default: 'gemini'
  },
  gemini: {
    apiKey: { type: String, default: '' },
    model: { type: String, default: 'gemini-1.5-flash' }
  },
  openai: {
    apiKey: { type: String, default: '' },
    model: { type: String, default: 'gpt-4o-mini' }
  },
  openrouter: {
    apiKey: { type: String, default: '' },
    model: { type: String, default: 'meta-llama/llama-3.3-70b-instruct' }
  },
  temperature: {
    type: Number,
    default: 0.2,
    min: 0,
    max: 1
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
export default SystemSetting;
