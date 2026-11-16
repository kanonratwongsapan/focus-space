import { GoogleGenerativeAI } from '@google/generative-ai';
import SystemSetting from '../models/SystemSetting.js';

// Thailand Time (ICT, UTC+7) helper
const getBangkokDateStr = (date = new Date()) => {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(date);
  } catch {
    const bkk = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const y = bkk.getUTCFullYear();
    const m = String(bkk.getUTCMonth() + 1).padStart(2, '0');
    const d = String(bkk.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
};

/**
 * Loads current AI configuration from MongoDB, with fallback to environment variables
 */
export const getActiveAIConfig = async () => {
  try {
    let setting = await SystemSetting.findOne({ key: 'ai_config' });
    if (!setting) {
      setting = new SystemSetting({
        key: 'ai_config',
        activeProvider: 'gemini',
        gemini: {
          apiKey: process.env.GEMINI_API_KEY || '',
          model: 'gemini-1.5-flash'
        },
        openai: {
          apiKey: process.env.OPENAI_API_KEY || '',
          model: 'gpt-4o-mini'
        },
        openrouter: {
          apiKey: process.env.OPENROUTER_API_KEY || '',
          model: 'meta-llama/llama-3.3-70b-instruct'
        }
      });
      await setting.save();
    }
    return setting;
  } catch (err) {
    console.error('Error fetching SystemSetting from DB, falling back to process.env:', err.message);
    return {
      activeProvider: 'gemini',
      gemini: { apiKey: process.env.GEMINI_API_KEY || '', model: 'gemini-1.5-flash' },
      openai: { apiKey: process.env.OPENAI_API_KEY || '', model: 'gpt-4o-mini' },
      openrouter: { apiKey: process.env.OPENROUTER_API_KEY || '', model: 'meta-llama/llama-3.3-70b-instruct' },
      temperature: 0.2
    };
  }
};

/**
 * Common prompt builder
 */
const buildTaskAnalysisPrompt = (title, description, todayStr, todayDayName) => {
  return `You are an intelligent task management assistant. Analyze the following task and classify its priority into 'High', 'Medium', or 'Low' based on urgency, importance, deadlines, travel plans, complexity, and educational or business consequences.
Also, check if the task text (title or description) implies a specific deadline/date in Thai (like 'วันนี้', 'พรุ่งนี้', 'มะรืนนี้', 'อีก 3 วัน', 'วันศุกร์นี้') and translate it into a YYYY-MM-DD date string.
Today's reference date in Thailand is: ${todayStr} (${todayDayName}).

Respond ONLY with a JSON object in this exact format:
{
  "priority": "High" | "Medium" | "Low",
  "reason": "Detailed, professional, and clear explanation in Thai (around 1-3 sentences) analyzing exactly why this priority was assigned, referencing travel plans, academic significance, deadlines, work volume, or consequences if mentioned.",
  "deadline": "YYYY-MM-DD" or null (if no date is implied in the text)
}

Guidelines for priority classification:
- **High**: Urgent deadlines (today, tomorrow, next morning), exams, critical meetings, high-impact tasks (e.g. grading/submitting reports that affect students' graduation, business presentations, travel preparation, or task complexity requiring immediate action).
- **Medium**: Regular work, tasks with reasonable timelines, important but not immediate (e.g. "ออกกำลังกายเย็นนี้", "ซื้อของเข้าบ้านสัปดาห์นี้", "ทำสรุปรายงานส่งปลายสัปดาห์").
- **Low**: Non-urgent chores, leisure activities, games, movies.

Task Details:
Title: "${title}"
Description: "${description || 'None'}"`;
};

/**
 * Call Google Gemini API
 */
const callGemini = async (apiKey, modelName, prompt) => {
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('Gemini API Key is missing or invalid.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName || 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Gemini API Request Timeout (25000ms)')), 25000)
  );

  const result = await Promise.race([
    model.generateContent(prompt),
    timeoutPromise
  ]);

  const response = await result.response;
  return response.text();
};

/**
 * Call OpenAI API
 */
const callOpenAI = async (apiKey, modelName, prompt) => {
  if (!apiKey) {
    throw new Error('OpenAI API Key is missing or invalid.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelName || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an intelligent task management assistant for Thai university students. Always respond strictly in valid JSON format.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '{}';
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('OpenAI API Request Timeout (25000ms)');
    }
    throw err;
  }
};

/**
 * Call OpenRouter API
 */
const callOpenRouter = async (apiKey, modelName, prompt) => {
  if (!apiKey) {
    throw new Error('OpenRouter API Key is missing or invalid.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://focus-space-seven.vercel.app',
        'X-Title': 'Focus Space RMUTI'
      },
      body: JSON.stringify({
        model: modelName || 'meta-llama/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: 'You are an intelligent task management assistant. Output ONLY a valid JSON object matching the requested schema.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenRouter API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '{}';
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('OpenRouter API Request Timeout (25000ms)');
    }
    throw err;
  }
};

/**
 * Fallback Rule-Based Priority Analyzer (Offline Thai NLP)
 */
export const fallbackRuleBasedAnalysis = (title = '', description = '', todayStr) => {
  const combinedText = `${title} ${description || ''}`.toLowerCase();
  
  let priority = 'Medium';
  let reason = '';
  
  const highKeywords = [
    'ด่วน', 'สอบ', 'ส่งอาจารย์', 'พรีเซนต์', 'วิกฤต', 'สำคัญมาก', 
    'เดดไลน์', 'นัดสำคัญ', 'สัมภาษณ์', 'พรุ่งนี้', 'คืนนี้', 'ส่งงาน',
    'จบการศึกษา', 'อนุมัติ', 'คะแนน', 'ไฟนอล', 'มิดเทอม', 'พรีเซนเทชัน',
    'เดินทาง', 'เครื่องบิน', 'สัมมนา', 'โปรเจกต์', 'ปริญญานิพนธ์'
  ];
  
  const lowKeywords = [
    'พักผ่อน', 'ดูหนัง', 'เล่นเกม', 'ช้อปปิ้ง', 'ทำความสะอาด', 'ซักผ้า', 
    'เดินเล่น', 'ชิล', 'ผ่อนคลาย', 'การ์ตูน', 'ฟังเพลง', 'ยืดเส้น', 'กวาดห้อง'
  ];

  if (highKeywords.some(keyword => combinedText.includes(keyword))) {
    priority = 'High';
    reason = 'วิเคราะห์จากระบบอัตโนมัติ: มีคำสำคัญที่แสดงถึงความสำคัญระดับสูง เช่น กำหนดส่งงานหรือการศึกษา';
  } else if (lowKeywords.some(keyword => combinedText.includes(keyword))) {
    priority = 'Low';
    reason = 'วิเคราะห์จากระบบอัตโนมัติ: เป็นกิจกรรมผ่อนคลายหรืองานเบาทั่วไป';
  } else {
    priority = 'Medium';
    reason = 'วิเคราะห์จากระบบอัตโนมัติ: กิจกรรมทั่วไปที่มีความสำคัญปานกลาง';
  }

  // Thai Date Extraction
  let deadline = null;
  const today = new Date();
  const currentYear = today.getFullYear();

  if (combinedText.includes('วันนี้')) {
    deadline = todayStr;
  } else if (combinedText.includes('พรุ่งนี้')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    deadline = getBangkokDateStr(d);
  } else if (combinedText.includes('มะรืนนี้')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    deadline = getBangkokDateStr(d);
  }

  return {
    priority,
    reason,
    deadline,
    isAiSuccess: false,
    provider: 'rule-based-fallback'
  };
};

/**
 * Main AI Analysis Engine (Multi-Provider with Automatic Fallback)
 */
export const analyzeTaskWithMultiProvider = async (title, description) => {
  const todayStr = getBangkokDateStr();
  const today = new Date();
  const todayDayName = today.toLocaleDateString('th-TH', { weekday: 'long' });

  const config = await getActiveAIConfig();
  const activeProvider = config.activeProvider || 'gemini';

  const prompt = buildTaskAnalysisPrompt(title, description, todayStr, todayDayName);

  let rawOutput = '';
  let selectedModel = '';

  try {
    if (activeProvider === 'openai') {
      const apiKey = config.openai?.apiKey || process.env.OPENAI_API_KEY;
      selectedModel = config.openai?.model || 'gpt-4o-mini';
      rawOutput = await callOpenAI(apiKey, selectedModel, prompt);
    } else if (activeProvider === 'openrouter') {
      const apiKey = config.openrouter?.apiKey || process.env.OPENROUTER_API_KEY;
      selectedModel = config.openrouter?.model || 'meta-llama/llama-3.3-70b-instruct';
      rawOutput = await callOpenRouter(apiKey, selectedModel, prompt);
    } else {
      // Default: Google Gemini
      const apiKey = config.gemini?.apiKey || process.env.GEMINI_API_KEY;
      selectedModel = config.gemini?.model || 'gemini-1.5-flash';
      rawOutput = await callGemini(apiKey, selectedModel, prompt);
    }

    // Clean JSON response (strip markdown fences if present)
    let cleanedJson = rawOutput.trim();
    if (cleanedJson.startsWith('```json')) {
      cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedJson.startsWith('```')) {
      cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanedJson);
    return {
      priority: parsed.priority || 'Medium',
      reason: parsed.reason || `วิเคราะห์ด้วย ${activeProvider.toUpperCase()} (${selectedModel}) สำเร็จ`,
      deadline: parsed.deadline || null,
      isAiSuccess: true,
      provider: activeProvider,
      model: selectedModel
    };
  } catch (err) {
    console.warn(`MultiProvider AI Error (${activeProvider}): ${err.message}. Engaging fallback analyzer.`);
    const fallback = fallbackRuleBasedAnalysis(title, description, todayStr);
    fallback.fallbackNotice = `สลับใช้ตัววิเคราะห์อัตโนมัติเนื่องจาก: ${err.message}`;
    return fallback;
  }
};

/**
 * Test Connection Prober
 */
export const testAIProvider = async ({ provider, apiKey, model }) => {
  const startTime = Date.now();
  const testPrompt = 'ตอบกลับเป็น JSON สั้นๆ ดังนี้: {"status": "ok", "message": "Focus Space AI Connection Successful"}';

  try {
    let rawOutput = '';
    if (provider === 'openai') {
      rawOutput = await callOpenAI(apiKey, model || 'gpt-4o-mini', testPrompt);
    } else if (provider === 'openrouter') {
      rawOutput = await callOpenRouter(apiKey, model || 'meta-llama/llama-3.3-70b-instruct', testPrompt);
    } else {
      rawOutput = await callGemini(apiKey, model || 'gemini-1.5-flash', testPrompt);
    }

    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      latencyMs,
      provider,
      model: model || 'default',
      rawResponse: rawOutput.substring(0, 150)
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs,
      provider,
      model: model || 'default',
      error: err.message
    };
  }
};
