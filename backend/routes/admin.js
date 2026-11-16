import express from 'express';
import { auth } from '../middleware/auth.js';
import SystemSetting from '../models/SystemSetting.js';
import { getActiveAIConfig, testAIProvider } from '../services/aiService.js';

const router = express.Router();

// Helper to mask sensitive API keys (e.g. sk-proj...XXXX)
const maskKey = (key = '') => {
  if (!key || key.length < 8) return '';
  const first = key.substring(0, 4);
  const last = key.substring(key.length - 4);
  return `${first}••••••••${last}`;
};

// GET /api/admin/ai-config - Retrieve active AI configuration with masked keys
router.get('/ai-config', auth, async (req, res) => {
  try {
    const config = await getActiveAIConfig();
    
    // Mask API keys for safe transmission
    const safeConfig = {
      activeProvider: config.activeProvider || 'gemini',
      temperature: config.temperature ?? 0.2,
      gemini: {
        model: config.gemini?.model || 'gemini-1.5-flash',
        apiKey: maskKey(config.gemini?.apiKey || process.env.GEMINI_API_KEY),
        isConfigured: !!(config.gemini?.apiKey || process.env.GEMINI_API_KEY)
      },
      openai: {
        model: config.openai?.model || 'gpt-4o-mini',
        apiKey: maskKey(config.openai?.apiKey || process.env.OPENAI_API_KEY),
        isConfigured: !!(config.openai?.apiKey || process.env.OPENAI_API_KEY)
      },
      openrouter: {
        model: config.openrouter?.model || 'meta-llama/llama-3.3-70b-instruct',
        apiKey: maskKey(config.openrouter?.apiKey || process.env.OPENROUTER_API_KEY),
        isConfigured: !!(config.openrouter?.apiKey || process.env.OPENROUTER_API_KEY)
      },
      updatedAt: config.updatedAt || new Date()
    };

    res.json({ success: true, config: safeConfig });
  } catch (err) {
    console.error('Error in GET /api/admin/ai-config:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/ai-config - Update AI Configuration (Active Provider, Models, Keys)
router.put('/ai-config', auth, async (req, res) => {
  try {
    const { activeProvider, gemini, openai, openrouter, temperature } = req.body;

    let setting = await SystemSetting.findOne({ key: 'ai_config' });
    if (!setting) {
      setting = new SystemSetting({ key: 'ai_config' });
    }

    if (activeProvider && ['gemini', 'openai', 'openrouter'].includes(activeProvider)) {
      setting.activeProvider = activeProvider;
    }

    if (temperature !== undefined) {
      setting.temperature = Math.max(0, Math.min(1, Number(temperature) || 0.2));
    }

    // Helper: update key only if a real new key was sent (not masked with ••••)
    const updateCredentials = (targetField, incoming) => {
      if (!incoming) return;
      if (incoming.model) {
        setting[targetField].model = incoming.model.trim();
      }
      if (incoming.apiKey !== undefined && incoming.apiKey !== null) {
        const rawKey = incoming.apiKey.trim();
        // If it's a real new key and not the masked placeholder
        if (rawKey && !rawKey.includes('••••')) {
          setting[targetField].apiKey = rawKey;
        } else if (rawKey === '') {
          // If explicitly cleared by admin
          setting[targetField].apiKey = '';
        }
      }
    };

    updateCredentials('gemini', gemini);
    updateCredentials('openai', openai);
    updateCredentials('openrouter', openrouter);

    setting.updatedBy = req.userId || null;
    setting.updatedAt = new Date();

    await setting.save();

    res.json({
      success: true,
      message: 'บันทึกการตั้งค่าระบบ AI สำเร็จเรียบร้อยแล้วค่ะ 🌸',
      activeProvider: setting.activeProvider
    });
  } catch (err) {
    console.error('Error in PUT /api/admin/ai-config:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/ai-config/test - Test connection to specified or active AI provider
router.post('/ai-config/test', auth, async (req, res) => {
  try {
    const { provider, apiKey, model } = req.body;
    const targetProvider = provider || 'gemini';

    // Retrieve stored key if not passed directly or if masked
    let effectiveKey = apiKey ? apiKey.trim() : '';
    let effectiveModel = model ? model.trim() : '';

    if (!effectiveKey || effectiveKey.includes('••••')) {
      const config = await getActiveAIConfig();
      if (targetProvider === 'openai') {
        effectiveKey = config.openai?.apiKey || process.env.OPENAI_API_KEY || '';
        effectiveModel = effectiveModel || config.openai?.model || 'gpt-4o-mini';
      } else if (targetProvider === 'openrouter') {
        effectiveKey = config.openrouter?.apiKey || process.env.OPENROUTER_API_KEY || '';
        effectiveModel = effectiveModel || config.openrouter?.model || 'meta-llama/llama-3.3-70b-instruct';
      } else {
        effectiveKey = config.gemini?.apiKey || process.env.GEMINI_API_KEY || '';
        effectiveModel = effectiveModel || config.gemini?.model || 'gemini-1.5-flash';
      }
    }

    if (!effectiveKey) {
      return res.status(400).json({
        success: false,
        provider: targetProvider,
        error: `ไม่พบ API Key สำหรับ ${targetProvider.toUpperCase()} กรุณาระบุ API Key ก่อนทดสอบค่ะ`
      });
    }

    const testResult = await testAIProvider({
      provider: targetProvider,
      apiKey: effectiveKey,
      model: effectiveModel
    });

    if (testResult.success) {
      return res.json({
        success: true,
        message: `เชื่อมต่อ ${targetProvider.toUpperCase()} (${testResult.model}) สำเร็จ!`,
        latencyMs: testResult.latencyMs,
        provider: targetProvider,
        model: testResult.model
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `การเชื่อมต่อ ${targetProvider.toUpperCase()} ขัดข้อง`,
        latencyMs: testResult.latencyMs,
        error: testResult.error
      });
    }
  } catch (err) {
    console.error('Error in POST /api/admin/ai-config/test:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
