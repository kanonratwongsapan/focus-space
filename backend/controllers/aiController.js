import { analyzeTaskWithMultiProvider, fallbackRuleBasedAnalysis as fallbackServiceAnalysis } from '../services/aiService.js';

export const analyzeTaskPriority = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required for analysis.' });
    }

    const result = await analyzeTaskWithMultiProvider(title, description);
    return res.json(result);
  } catch (err) {
    console.error('AI Analysis Controller Error:', err.message);
    const todayStr = new Date().toISOString().split('T')[0];
    return fallbackRuleBasedAnalysis(req.body.title, req.body.description, todayStr, res, '');
  }
};

// Fallback Rule-Based Priority Analyzer (Thai Language support)
const fallbackRuleBasedAnalysis = (title, description, todayStr, res, prefix = '') => {
  const combinedText = `${title} ${description || ''}`.toLowerCase();
  
  let priority = 'Medium';
  let reason = '';

  // High priority keywords
  const highKeywords = ['ด่วน', 'สอบ', 'ส่งงาน', 'ส่งโปรเจกต์', 'สัมภาษณ์', 'วันนี้', 'พรุ่งนี้', 'สำคัญมาก', 'วิกฤต', 'ประชุมสำคัญ', 'เดดไลน์', 'deadline', 'urgent', 'must', 'ห้ามเลท', 'สัมมนา', 'ราชการ', 'สำเร็จการศึกษา', 'ส่งคะแนน', 'ทะเบียนกลาง', 'ตรวจงาน', 'ประเมิน', 'ส่งโปรเจค', 'โปรเจค', 'วิทยานิพนธ์', 'สหกิจศึกษา', 'ที่ปรึกษา', 'เล่มรายงาน', 'excel', 'ตารางคะแนน'];
  // Low priority keywords
  const lowKeywords = ['ว่าง', 'เรื่อยๆ', 'เมื่อไหร่ก็ได้', 'ดูซีรีส์', 'ดูหนัง', 'เล่นเกม', 'พักผ่อน', 'งานอดิเรก', 'ซักผ้า', 'กวาดบ้าน', 'จัดห้อง', 'ถูบ้าน', 'นอน'];

  const matchedHigh = highKeywords.filter(keyword => combinedText.includes(keyword));
  const matchedLow = lowKeywords.filter(keyword => combinedText.includes(keyword));

  if (matchedHigh.length > 0) {
    priority = 'High';
    
    // Customize rule-based reason based on matched critical concepts
    let details = [];
    if (combinedText.includes('ห้ามเลท') || combinedText.includes('เดดไลน์') || combinedText.includes('กำหนดส่ง')) {
      details.push('มีกำหนดเวลาจำกัด/ห้ามส่งช้า');
    }
    if (combinedText.includes('สำเร็จการศึกษา') || combinedText.includes('ทะเบียนกลาง') || combinedText.includes('คะแนน')) {
      details.push('มีผลกระทบต่อนักศึกษา/การลงทะเบียนเรียน');
    }
    if (combinedText.includes('ราชการ') || combinedText.includes('ต่างจังหวัด') || combinedText.includes('เดินทาง')) {
      details.push('เกี่ยวข้องกับการเดินทางราชการ/ข้อจำกัดด้านเวลา');
    }
    if (combinedText.includes('เล่มรายงาน') || combinedText.includes('ตรวจงาน') || combinedText.includes('อ่าน')) {
      details.push('มีภาระงานปริมาณมากที่ต้องใช้เวลาเตรียมตัว');
    }

    if (details.length > 0) {
      reason = `[วิเคราะห์ความสำคัญสูง] เนื่องจากพบข้อบ่งชี้สำคัญ: ${details.join(', ')} (ตรวจพบคำสำคัญ: ${matchedHigh.slice(0, 4).join(', ')})`;
    } else {
      reason = `[วิเคราะห์ความสำคัญสูง] เนื่องจากตรวจพบคำสำคัญเร่งด่วน: ${matchedHigh.slice(0, 3).join(', ')}`;
    }
  } else if (matchedLow.length > 0) {
    priority = 'Low';
    reason = `[วิเคราะห์ความสำคัญต่ำ] ดูเหมือนเป็นงานบ้านทั่วไป กิจกรรมผ่อนคลาย หรือไม่มีกำหนดส่งชัดเจน (คำสำคัญ: ${matchedLow.join(', ')})`;
  } else {
    reason = 'วิเคราะห์เป็นความสำคัญระดับปานกลาง เนื่องจากเป็นงานทั่วไปในชีวิตประจำวันและไม่มีคีย์เวิร์ดบ่งชี้ถึงผลกระทบร้ายแรงหรือความเร่งด่วนในทันที';
  }

  // Parse relative/explicit Thai deadline from text (e.g. "20-30 กันยายน 2569", "พรุ่งนี้", "อีก 3 วัน")
  let deadline = parseThaiDateFromText(combinedText);

  res.json({ priority, reason, deadline, isFallback: true });
};

const parseThaiDateFromText = (text) => {
  if (!text) return null;
  const lower = text.toLowerCase();
  const today = new Date();
  const currentYear = today.getFullYear();

  if (lower.includes('วันนี้')) {
    return today.toISOString().split('T')[0];
  }
  if (lower.includes('พรุ่งนี้')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  if (lower.includes('มะรืนนี้')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }

  const thaiMonths = {
    'มกราคม': 0, 'ม.ค.': 0, 'มค': 0,
    'กุมภาพันธ์': 1, 'ก.พ.': 1, 'กพ': 1,
    'มีนาคม': 2, 'มี.ค.': 2, 'มีค': 2,
    'เมษายน': 3, 'เม.ย.': 3, 'เมย': 3,
    'พฤษภาคม': 4, 'พ.ค.': 4, 'พค': 4,
    'มิถุนายน': 5, 'มิ.ย.': 5, 'มิย': 5,
    'กรกฎาคม': 6, 'ก.ค.': 6, 'กค': 6,
    'สิงหาคม': 7, 'ส.ค.': 7, 'สค': 7,
    'กันยายน': 8, 'ก.ย.': 8, 'กย': 8,
    'ตุลาคม': 9, 'ต.ค.': 9, 'ตค': 9,
    'พฤศจิกายน': 10, 'พ.ย.': 10, 'พย': 10,
    'ธันวาคม': 11, 'ธ.ค.': 11, 'ธค': 11
  };

  for (const [monthName, monthIndex] of Object.entries(thaiMonths)) {
    if (lower.includes(monthName)) {
      const dayMatch = lower.match(new RegExp(`(\\d{1,2})(?:\\s*-\\s*\\d{1,2})?\\s*${monthName.replace('.', '\\.')}(?:\\s*(\\d{4}))?`));
      if (dayMatch) {
        const day = parseInt(dayMatch[1], 10);
        let year = currentYear;
        if (dayMatch[2]) {
          const parsedYear = parseInt(dayMatch[2], 10);
          year = parsedYear > 2500 ? parsedYear - 543 : parsedYear;
        } else if (monthIndex < today.getMonth()) {
          year = currentYear + 1;
        }
        const dateObj = new Date(year, monthIndex, day);
        return dateObj.toISOString().split('T')[0];
      }
    }
  }

  const matchDays = lower.match(/อีก\s*(\d+)\s*วัน/);
  if (matchDays && matchDays[1]) {
    const daysToAdd = parseInt(matchDays[1], 10);
    const d = new Date(today);
    d.setDate(d.getDate() + daysToAdd);
    return d.toISOString().split('T')[0];
  }

  return null;
};
