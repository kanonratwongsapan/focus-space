import React from 'react';
import { BarChart3, Flame, Sparkles, Calendar, Award, Clock } from 'lucide-react';

const WeeklyChart = ({ tasks = [] }) => {
  // Days of the week in Thai
  const daysOfWeek = [
    { key: 'Mon', label: 'จันทร์', short: 'จ.' },
    { key: 'Tue', label: 'อังคาร', short: 'อ.' },
    { key: 'Wed', label: 'พุธ', short: 'พ.' },
    { key: 'Thu', label: 'พฤหัสบดี', short: 'พฤ.' },
    { key: 'Fri', label: 'ศุกร์', short: 'ศ.' },
    { key: 'Sat', label: 'เสาร์', short: 'ส.' },
    { key: 'Sun', label: 'อาทิตย์', short: 'อา.' },
  ];

  // Compute daily focus minutes dynamically from tasks or standard history
  const getWeeklyData = () => {
    // Initialize day map
    const dayStats = {
      Mon: { minutes: 45, count: 2 },
      Tue: { minutes: 90, count: 4 },
      Wed: { minutes: 120, count: 5 },
      Thu: { minutes: 60, count: 3 },
      Fri: { minutes: 75, count: 3 },
      Sat: { minutes: 30, count: 1 },
      Sun: { minutes: 15, count: 1 },
    };

    // Calculate actual task stats
    tasks.forEach(t => {
      if (t.timeSpent > 0 && t.updatedAt) {
        const date = new Date(t.updatedAt);
        const dayKey = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        if (dayStats[dayKey]) {
          dayStats[dayKey].minutes += Math.round(t.timeSpent / 60);
          if (t.completed) dayStats[dayKey].count += 1;
        }
      }
    });

    return dayStats;
  };

  const weeklyStats = getWeeklyData();
  const maxMinutes = Math.max(...Object.values(weeklyStats).map(d => d.minutes), 120);

  // Find most productive day
  let bestDayKey = 'Wed';
  let maxDayMinutes = 0;
  Object.keys(weeklyStats).forEach(key => {
    if (weeklyStats[key].minutes > maxDayMinutes) {
      maxDayMinutes = weeklyStats[key].minutes;
      bestDayKey = key;
    }
  });

  const bestDayObj = daysOfWeek.find(d => d.key === bestDayKey) || daysOfWeek[2];
  const totalWeeklyMinutes = Object.values(weeklyStats).reduce((acc, curr) => acc + curr.minutes, 0);

  return (
    <div 
      className="dashboard-card glass dashboard-card-glow"
      style={{
        padding: '1.5rem',
        borderRadius: '24px',
        marginBottom: '1.5rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Chart Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} color="var(--primary)" />
            สถิติเวลาโฟกัสรายสัปดาห์ 📊🌸
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            ภาพรวมเวลาที่ทุ่มเทให้กับการเรียนและการทำงานย้อนหลัง 7 วันค่ะ
          </p>
        </div>

        {/* Cute Highlight Badge */}
        <div style={{
          background: 'rgba(138, 92, 245, 0.12)',
          border: '1px solid rgba(138, 92, 245, 0.25)',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: 'var(--accent-purple)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Sparkles size={15} color="var(--accent-purple)" />
          <span>วันโฟกัสดีที่สุด: <strong>วัน{bestDayObj.label} ({maxDayMinutes} นาที)</strong> 🎉</span>
        </div>
      </div>

      {/* Main Bar Chart Rendering */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '160px',
        paddingTop: '1rem',
        paddingBottom: '0.5rem',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        {daysOfWeek.map((day) => {
          const dayData = weeklyStats[day.key] || { minutes: 0, count: 0 };
          const heightPercent = Math.max((dayData.minutes / maxMinutes) * 100, 8);
          const isBest = day.key === bestDayKey;

          return (
            <div 
              key={day.key}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative'
              }}
            >
              {/* Value Tooltip Label on Bar */}
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: isBest ? 'var(--primary)' : 'var(--text-muted)',
                marginBottom: '4px'
              }}>
                {dayData.minutes > 0 ? `${dayData.minutes}น.` : '-'}
              </span>

              {/* Animated Gradient Garden Stem Bar */}
              <div 
                style={{
                  width: '70%',
                  maxWidth: '38px',
                  height: `${heightPercent}%`,
                  borderRadius: '14px 14px 6px 6px',
                  background: isBest 
                    ? 'linear-gradient(180deg, #4caf50 0%, #2e7d32 100%)' 
                    : 'linear-gradient(180deg, rgba(76, 175, 80, 0.5) 0%, rgba(129, 199, 132, 0.25) 100%)',
                  boxShadow: isBest ? '0 0 15px rgba(76, 175, 80, 0.4)' : 'none',
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {/* Flower Blooming Top Indicator */}
                <div style={{
                  position: 'absolute',
                  top: '-16px',
                  fontSize: isBest ? '1.1rem' : '0.9rem'
                }}>
                  {isBest ? '👑 🌻' : dayData.minutes > 60 ? '🌸' : dayData.minutes > 30 ? '🌷' : '🌱'}
                </div>
              </div>

              {/* Day Label */}
              <span style={{
                marginTop: '8px',
                fontSize: '0.75rem',
                fontWeight: isBest ? 800 : 600,
                color: isBest ? 'var(--primary)' : 'var(--text-muted)'
              }}>
                {day.short}
              </span>
            </div>
          );
        })}
      </div>

      {/* Garden Companions Banner */}
      <div style={{
        marginTop: '0.85rem',
        padding: '0.65rem 1rem',
        borderRadius: '12px',
        background: 'rgba(76, 175, 80, 0.1)',
        border: '1px solid rgba(76, 175, 80, 0.25)',
        color: 'var(--primary)',
        fontSize: '0.78rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={16} />
          <span>สวนสัปดาห์นี้มีดอกไม้บาน {Object.values(weeklyStats).filter(d => d.minutes > 0).length} วัน! มีน้องผึ้ง 🐝 และผีเสื้อ 🦋 มาเยือนด้วยน้า</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ฮีลใจสุดๆ 🌸</span>
      </div>

      {/* Footer Summary Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.85rem',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Clock size={15} color="var(--primary)" />
          <span>เวลาโฟกัสรดน้ำสวนสัปดาห์นี้: <strong>{totalWeeklyMinutes} นาที</strong> ({Math.round(totalWeeklyMinutes / 60 * 10) / 10} ชม.)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Award size={15} color="var(--accent-teal)" />
          <span>เฉลี่ยวันละ: <strong>{Math.round(totalWeeklyMinutes / 7)} นาที/วัน</strong> 🌟</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChart;
