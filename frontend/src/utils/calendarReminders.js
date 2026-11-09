/**
 * Google Calendar API v3 Reminders Helper
 * 
 * Supports flexible reminder presets (5m, 10m, 15m, 30m, 1h, 2h, 1d, 2d, 3d, custom, default)
 * and notification channels ('both', 'popup', 'email').
 * Strictly conforms to Google Calendar API v3 (max 5 overrides, minutes 0 - 40320).
 */

export const REMINDER_PRESETS = [
  { value: '5', label: '⚡ 5 นาทีก่อนกำหนด (5 นาที)', minutes: 5 },
  { value: '10', label: '⚡ 10 นาทีก่อนกำหนด (10 นาที)', minutes: 10 },
  { value: '15', label: '⚡ 15 นาทีก่อนกำหนด (15 นาที)', minutes: 15 },
  { value: '30', label: '⚡ 30 นาทีก่อนกำหนด (30 นาที)', minutes: 30 },
  { value: '60', label: '⏰ 1 ชั่วโมงก่อนกำหนด (60 นาที)', minutes: 60 },
  { value: '120', label: '⏰ 2 ชั่วโมงก่อนกำหนด (2 ชม.)', minutes: 120 },
  { value: '1440', label: '📅 1 วันก่อนกำหนด (24 ชม. - แนะนำ)', minutes: 1440 },
  { value: '2880', label: '📆 2 วันก่อนกำหนด (48 ชม.)', minutes: 2880 },
  { value: '4320', label: '📆 3 วันก่อนกำหนด (72 ชม.)', minutes: 4320 },
  { value: 'default', label: '🌟 เตือน 3 ระยะอัจฉริยะ (3 วัน + 1 วัน + เช้าวันส่งงาน)', minutes: 0 },
  { value: 'custom', label: '✏️ กำหนดเวลานาทีเอง (Custom)', minutes: null }
];

export const REMINDER_METHODS = [
  { value: 'both', label: '🔔 + 📧 ทั้งแจ้งเตือนหน้าจอ (Pop-up) และอีเมล (Email)' },
  { value: 'popup', label: '🔔 แจ้งเตือนหน้าจอ (Pop-up) เท่านั้น' },
  { value: 'email', label: '📧 ส่งอีเมลแจ้งเตือน (Email) เท่านั้น' }
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
 * @param {Object} task
 * @returns {Object} { useDefault: false, overrides: Array<{ method: string, minutes: number }> }
 */
export const buildGoogleCalendarReminders = (task = {}) => {
  const reminderTime = String(task.reminderTime || '1440');
  const customReminderMinutes = Number(task.customReminderMinutes) || 30;
  const reminderMethod = task.reminderMethod || 'both';

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

  const overrides = [];
  if (reminderMethod === 'both' || reminderMethod === 'popup') {
    overrides.push({ method: 'popup', minutes });
  }
  if (reminderMethod === 'both' || reminderMethod === 'email') {
    overrides.push({ method: 'email', minutes });
  }

  // Fallback safe: if empty, at least 1 popup override
  if (overrides.length === 0) {
    overrides.push({ method: 'popup', minutes });
  }

  return {
    useDefault: false,
    overrides: overrides.slice(0, 5) // Google API limit is 5
  };
};
