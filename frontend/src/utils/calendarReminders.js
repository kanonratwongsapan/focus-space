/**
 * Google Calendar API v3 Reminders Helper
 * 
 * Supports flexible reminder presets (5m, 10m, 15m, 30m, 1h, 2h, 1d, 2d, 3d, custom, default).
 * Always notifies via all channels (both Pop-up and Email) per user request.
 * Strictly conforms to Google Calendar API v3 (max 5 overrides, minutes 0 - 40320).
 */

export const REMINDER_PRESETS = [
  { value: '5', label: '5 นาทีก่อนกำหนด', minutes: 5 },
  { value: '10', label: '10 นาทีก่อนกำหนด', minutes: 10 },
  { value: '15', label: '15 นาทีก่อนกำหนด', minutes: 15 },
  { value: '30', label: '30 นาทีก่อนกำหนด', minutes: 30 },
  { value: '60', label: '1 ชั่วโมงก่อนกำหนด', minutes: 60 },
  { value: '120', label: '2 ชั่วโมงก่อนกำหนด', minutes: 120 },
  { value: '1440', label: '1 วันก่อนกำหนด (แนะนำ)', minutes: 1440 },
  { value: '2880', label: '2 วันก่อนกำหนด', minutes: 2880 },
  { value: '4320', label: '3 วันก่อนกำหนด', minutes: 4320 },
  { value: 'default', label: 'เตือนหลายระยะ (3 วัน, 1 วัน, วันส่งงาน)', minutes: 0 },
  { value: 'custom', label: 'กำหนดเวลาเอง (ระบุนาที)...', minutes: null }
];

/**
 * Get human-readable short label for badges on Task Cards
 */
export const getReminderShortLabel = (reminderTime = '1440', customMinutes = 30) => {
  if (reminderTime === 'default') return 'เตือน 3 ระยะ';
  if (reminderTime === 'custom') return 'เตือนก่อน ' + (customMinutes || 30) + ' นาที';
  const found = REMINDER_PRESETS.find(p => p.value === String(reminderTime));
  if (found) {
    if (found.minutes >= 1440) return 'เตือนก่อน ' + Math.round(found.minutes / 1440) + ' วัน';
    if (found.minutes >= 60) return 'เตือนก่อน ' + Math.round(found.minutes / 60) + ' ชม.';
    return 'เตือนก่อน ' + found.minutes + ' นาที';
  }
  return 'เตือนก่อน 1 วัน';
};

/**
 * Builds standard Google Calendar API v3 reminders object
 * Always creates overrides for BOTH 'popup' (device) and 'email' (Gmail)
 * @param {Object} task
 * @returns {Object} { useDefault: false, overrides: Array<{ method: string, minutes: number }> }
 */
export const buildGoogleCalendarReminders = (task = {}) => {
  const reminderTime = String(task.reminderTime || '1440');
  const customReminderMinutes = Number(task.customReminderMinutes) || 30;

  // Multi-tier 3-stage default (5 overrides max)
  if (reminderTime === 'default') {
    return {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 3 * 24 * 60 }, // 3 days before
        { method: 'popup', minutes: 1 * 24 * 60 }, // 1 day before
        { method: 'email', minutes: 1 * 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 9 * 60 },      // morning of deadline (09:00)
        { method: 'email', minutes: 9 * 60 }       // morning of deadline (09:00)
      ]
    };
  }

  // Calculate minutes
  let minutes = 1440;
  if (reminderTime === 'custom') {
    minutes = Math.max(1, Math.min(40320, customReminderMinutes));
  } else {
    const parsed = parseInt(reminderTime, 10);
    minutes = !isNaN(parsed) && parsed >= 0 ? Math.min(40320, parsed) : 1440;
  }

  // Always notify via all channels: device pop-up and email
  return {
    useDefault: false,
    overrides: [
      { method: 'popup', minutes },
      { method: 'email', minutes }
    ]
  };
};

/**
 * Accurately extracts YYYY-MM-DD in Thailand Timezone (Asia/Bangkok, UTC+7)
 * Prevents 1-day early shift caused by UTC conversion on midnight local deadlines.
 * @param {string|Date} deadlineInput
 * @returns {string} YYYY-MM-DD
 */
export const getBangkokCalendarDate = (deadlineInput) => {
  if (!deadlineInput) return '';
  if (typeof deadlineInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(deadlineInput.trim())) {
    return deadlineInput.trim();
  }
  const d = new Date(deadlineInput);
  if (isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(d);
  } catch {
    const bkk = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    const y = bkk.getUTCFullYear();
    const m = String(bkk.getUTCMonth() + 1).padStart(2, '0');
    const day = String(bkk.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
};

/**
 * Calculates exclusive end-date (startDate + 1 day) for Google Calendar all-day events
 * @param {string} dateStr YYYY-MM-DD
 * @returns {string} YYYY-MM-DD
 */
export const getBangkokCalendarNextDay = (dateStr) => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-').map(Number);
    if (parts.length !== 3) return '';
    const [y, m, d] = parts;
    const nextDate = new Date(Date.UTC(y, m - 1, d + 1));
    const ny = nextDate.getUTCFullYear();
    const nm = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
    const nd = String(nextDate.getUTCDate()).padStart(2, '0');
    return `${ny}-${nm}-${nd}`;
  } catch {
    return dateStr;
  }
};

