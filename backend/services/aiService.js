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
 * Common prompt builder - 3-D Prioritization Matrix (Impact, Urgency, Effort)
 */
const buildTaskAnalysisPrompt = (title, description, todayStr, todayDayName) => {
  return `You are an intelligent task management assistant adhering to the Global 3-D Prioritization Matrix (Impact, Urgency, Effort).
The user may provide task details in Thai, English, or a mix of both (Bilingual support).
Analyze the following university student's task and evaluate:
1. "impact": 'High' | 'Medium' | 'Low' (educational, career, or personal consequences/importance)
2. "urgency": 'High' | 'Medium' | 'Low' (time sensitivity, deadline proximity)
3. "priority": 'High' | 'Medium' | 'Low' (overall priority derived from impact and urgency)
4. "estimatedMinutes": estimated integer minutes required to finish this task (e.g., quick chore/email: 15-30, homework/reading: 45-60, comprehensive report/slides/exam prep: 90-180)
5. "deadline": YYYY-MM-DD or null (if relative date in Thai like 'วันนี้', 'พรุ่งนี้', 'มะรืนนี้', 'อีก X วัน' or English like 'today', 'tonight', 'tomorrow', 'day after tomorrow', 'in X days', 'next Monday/Friday' is mentioned)
6. "reason": Professional, clear explanation in Thai (1-3 sentences) summarizing the 3-D evaluation (Impact, Urgency, and Workload).

Today's reference date in Thailand is: ${todayStr} (${todayDayName}).

Respond ONLY with a JSON object in this exact format:
{
  "priority": "High" | "Medium" | "Low",
  "impact": "High" | "Medium" | "Low",
  "urgency": "High" | "Medium" | "Low",
  "estimatedMinutes": 60,
  "reason": "คำอธิบายวิเคราะห์ 3 มิติในภาษาไทย (1-3 ประโยค)",
  "deadline": "YYYY-MM-DD" or null
}

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
    'เดินทาง', 'เครื่องบิน', 'สัมมนา', 'โปรเจกต์', 'ปริญญานิพนธ์',
    'exam', 'test', 'quiz', 'final', 'midterm', 'urgent', 'deadline',
    'presentation', 'submit', 'assignment', 'homework', 'project',
    'interview', 'thesis', 'defense', 'tomorrow', 'tonight', 'today',
    'critical', 'important', 'due'
  ];
  
  const lowKeywords = [
    'พักผ่อน', 'ดูหนัง', 'เล่นเกม', 'ช้อปปิ้ง', 'ทำความสะอาด', 'ซักผ้า', 
    'เดินเล่น', 'ชิล', 'ผ่อนคลาย', 'การ์ตูน', 'ฟังเพลง', 'ยืดเส้น', 'กวาดห้อง',
    'relax', 'movie', 'game', 'play', 'shopping', 'cleaning', 'laundry',
    'chill', 'sleep', 'rest', 'walk'
  ];

  let impact = 'Medium';
  let urgency = 'Medium';
  let estimatedMinutes = 45;

  if (highKeywords.some(keyword => combinedText.includes(keyword))) {
    priority = 'High';
    impact = 'High';
    urgency = 'High';
    estimatedMinutes = 90;
    reason = 'วิเคราะห์จากระบบอัตโนมัติ: มีคำสำคัญที่แสดงถึงผลกระทบสูงและความเร่งด่วนต่องาน/การศึกษา (High Impact & Urgency Detected)';
  } else if (lowKeywords.some(keyword => combinedText.includes(keyword))) {
    priority = 'Low';
    impact = 'Low';
    urgency = 'Low';
    estimatedMinutes = 25;
    reason = 'วิเคราะห์จากระบบอัตโนมัติ: เป็นกิจกรรมผ่อนคลายหรืองานเบาทั่วไป (Low Impact Routine Activity)';
  } else {
    priority = 'Medium';
    impact = 'Medium';
    urgency = 'Medium';
    estimatedMinutes = 45;
    reason = 'วิเคราะห์จากระบบอัตโนมัติ: กิจกรรมทั่วไปที่มีความสำคัญและภาระงานปานกลาง (Medium Workload)';
  }

  // Bilingual Thai & English Date Extraction
  let deadline = null;
  const today = new Date();

  if (combinedText.includes('วันนี้') || combinedText.includes('today') || combinedText.includes('tonight')) {
    deadline = todayStr;
  } else if (combinedText.includes('พรุ่งนี้') || combinedText.includes('tomorrow')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    deadline = getBangkokDateStr(d);
  } else if (combinedText.includes('มะรืนนี้') || combinedText.includes('day after tomorrow')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    deadline = getBangkokDateStr(d);
  } else {
    // Match "อีก X วัน" or "in X days"
    const matchThaiDays = combinedText.match(/อีก\s*(\d+)\s*วัน/);
    const matchEngDays = combinedText.match(/in\s*(\d+)\s*days?/);
    const daysToAdd = matchThaiDays ? parseInt(matchThaiDays[1], 10) : (matchEngDays ? parseInt(matchEngDays[1], 10) : null);
    if (daysToAdd !== null) {
      const d = new Date(today);
      d.setDate(d.getDate() + daysToAdd);
      deadline = getBangkokDateStr(d);
    }
  }

  return {
    priority,
    impact,
    urgency,
    estimatedMinutes,
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
      impact: parsed.impact || parsed.priority || 'Medium',
      urgency: parsed.urgency || parsed.priority || 'Medium',
      estimatedMinutes: Number(parsed.estimatedMinutes) || 60,
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
