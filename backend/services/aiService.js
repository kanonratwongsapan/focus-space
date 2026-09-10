import dotenv from 'dotenv';
dotenv.config();

// Fallback rule-based analysis when Gemini API is not available
function analyzeTaskRuleBased(title, description = '') {
  const combinedText = `${title} ${description}`.toLowerCase();
  
  // Keywords for High priority
  const highKeywords = [
    'ด่วน', 'urgent', 'สำคัญมาก', 'critical', 'deadline', 'tomorrow', 'พรุ่งนี้', 
    'สอบ', 'exam', 'test', 'ส่ง', 'submit', 'present', 'พรีเซนต์', 'สัมภาษณ์', 'interview'
  ];

  // Keywords for Medium priority
  const mediumKeywords = [
    'งาน', 'project', 'homework', 'บ้าน', 'meeting', 'ประชุม', 'นัด', 'review', 
    'ศึกษา', 'เตรียม', 'ฝึก', 'practice', 'บิล', 'จ่าย', 'pay', 'ซื้อ', 'buy'
  ];

  // Check High keywords
  for (const keyword of highKeywords) {
    if (combinedText.includes(keyword)) {
      return {
        priority: 'High',
        reasoning: `วิเคราะห์จากคำคีย์เวิร์ดสำคัญ "${keyword}" ซึ่งแสดงถึงความเร่งด่วนหรือกำหนดส่งงานชัดเจน (Rule-based Fallback)`
      };
    }
  }

  // Check Medium keywords
  for (const keyword of mediumKeywords) {
    if (combinedText.includes(keyword)) {
      return {
        priority: 'Medium',
        reasoning: `วิเคราะห์จากคำคีย์เวิร์ด "${keyword}" ซึ่งเกี่ยวข้องกับการทำงาน การประชุม หรือหน้าที่ทั่วไป (Rule-based Fallback)`
      };
    }
  }

  // Default Low
  return {
    priority: 'Low',
    reasoning: 'วิเคราะห์ว่าเป็นงานทั่วไปที่ยืดหยุ่นได้ ไม่มีคำบ่งบอกความเร่งด่วนเป็นพิเศษ (Rule-based Fallback)'
  };
}

export async function analyzeTask(title, description = '') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.log('GEMINI_API_KEY not set. Using rule-based fallback analyzer.');
    return analyzeTaskRuleBased(title, description);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `Analyze the following task and suggest its priority level ('High', 'Medium', or 'Low') and a brief reasoning in Thai.
Task Title: "${title}"
Task Description: "${description}"

Respond in JSON matching this exact structure:
{
  "priority": "High" | "Medium" | "Low",
  "reasoning": "A concise explanation in Thai"
}`;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            priority: { 
              type: "STRING", 
              enum: ["High", "Medium", "Low"] 
            },
            reasoning: { 
              type: "STRING" 
            }
          },
          required: ["priority", "reasoning"]
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const result = JSON.parse(responseText.trim());
    return {
      priority: result.priority || 'Medium',
      reasoning: result.reasoning || 'วิเคราะห์ความสำคัญเรียบร้อยแล้ว'
    };

  } catch (error) {
    console.error('Error in Gemini API analysis, falling back to Rule-based:', error.message);
    return analyzeTaskRuleBased(title, description);
  }
}
