import React, { useState, useEffect, useContext } from 'react';
import { TaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';
import { PomodoroContext } from '../context/PomodoroContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Sparkles, Clock, CheckCircle2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

const ThaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const DaysOfWeek = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

const GardenCalendar = ({ setCurrentTab }) => {
  const { tasks, updateTask, fetchTasks, addTask } = useContext(TaskContext);
  const { user } = useContext(AuthContext);
  const { setSelectedTaskId } = useContext(PomodoroContext) || {};

  const [currentDate, setCurrentDate] = useState(new Date());
  const [googleEvents, setGoogleEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [quickCreateDate, setQuickCreateDate] = useState(null);
  const [quickTitle, setQuickTitle] = useState('');
  const [viewingDayDetail, setViewingDayDetail] = useState(null); // YYYY-MM-DD

  const gToken = localStorage.getItem('g_token') || sessionStorage.getItem('g_token');

  // Fetch Google Calendar Events if connected
  const fetchGoogleEvents = async () => {
    if (!gToken) return;
    setLoadingEvents(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).toISOString();
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(firstDay)}&timeMax=${encodeURIComponent(lastDay)}&singleEvents=true&orderBy=startTime`, {
        headers: {
          'Authorization': `Bearer ${gToken}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setGoogleEvents(data.items || []);
      } else if (res.status === 401) {
        localStorage.removeItem('g_token');
        sessionStorage.removeItem('g_token');
      }
    } catch (err) {
      console.error('Error fetching Google Calendar events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchGoogleEvents();
  }, [currentDate, gToken]);

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToday = () => {
    setCurrentDate(new Date());
  };

  // Google OAuth Auth Trigger
  const handleGoogleAuth = () => {
    const activeClientId = user?.googleClientId || '210886144254-9n7riasmgaikot2rql7i5riofs44gioi.apps.googleusercontent.com';

    if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (tokenResponse) => {
          if (tokenResponse.access_token) {
            localStorage.setItem('g_token', tokenResponse.access_token);
            sessionStorage.setItem('g_token', tokenResponse.access_token);
            fetchGoogleEvents();
          }
        }
      });
      client.requestAccessToken({ prompt: 'consent' });
    }
  };

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0-6
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    calendarDays.push({
      dateNumber: d,
      monthType: 'prev',
      fullDateStr: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }

  // Current month days
  const todayObj = new Date();
  const isCurrentMonth = todayObj.getFullYear() === year && todayObj.getMonth() === month;

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = isCurrentMonth && todayObj.getDate() === d;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push({
      dateNumber: d,
      monthType: 'current',
      isToday,
      fullDateStr: dateStr
    });
  }

  // Following month leading days to round to 35 or 42 cells
  const remainingCells = (35 - (calendarDays.length % 35)) % 35;
  const extraCells = calendarDays.length > 35 ? (42 - calendarDays.length) : (35 - calendarDays.length);
  for (let d = 1; d <= extraCells; d++) {
    calendarDays.push({
      dateNumber: d,
      monthType: 'next',
      fullDateStr: `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    });
  }

  // Helper to match tasks for a date string YYYY-MM-DD
  const getTasksForDate = (dateStr) => {
    if (!tasks) return [];
    return tasks.filter(t => {
      if (!t.deadline) return false;
      const taskDate = new Date(t.deadline).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  // Helper to match Google Calendar events for a date string YYYY-MM-DD
  const getGoogleEventsForDate = (dateStr) => {
    if (!googleEvents) return [];
    return googleEvents.filter(e => {
      const startStr = e.start?.date || e.start?.dateTime?.split('T')[0];
      return startStr === dateStr;
    });
  };

  // Handle Quick Task Add from Calendar
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim() || !quickCreateDate) return;

    if (addTask) {
      await addTask({
        title: quickTitle,
        description: 'สร้างจากหน้าปฏิทินพฤกษา',
        deadline: quickCreateDate,
        priority: 'Medium'
      });
      setQuickTitle('');
      setQuickCreateDate(null);
      if (fetchTasks) fetchTasks();
    }
  };

  const formatThaiFullDateStr = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const monthIdx = parseInt(m, 10) - 1;
    const thaiYear = parseInt(y, 10) + 543;
    return `${parseInt(d, 10)} ${ThaiMonths[monthIdx] || ''} ${thaiYear}`;
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', textAlign: 'left' }}>
      {/* Header Bar */}
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(76, 175, 80, 0.12)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            color: '#2e7d32',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 700,
            marginBottom: '0.5rem'
          }}>
            <Sparkles size={14} color="#4caf50" />
            <span>BOTANICAL GARDEN CALENDAR • ตารางเดดไลน์และปฏิทิน GOOGLE 📅</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: '0.2rem', color: '#1b4332', fontWeight: 800 }}>
            ปฏิทินพฤกษา (Garden Calendar) 📅🌸
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            ตารางวางแผนภารกิจ ซิงค์กำหนดส่ง และ ดึงกิจกรรมจาก Google Calendar มาโชว์ในที่เดียวค่ะ
          </p>
        </div>

        {/* Google Calendar Connect/Sync Button */}
        <div>
          {gToken ? (
            <button
              type="button"
              onClick={fetchGoogleEvents}
              disabled={loadingEvents}
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#2e7d32',
                background: 'rgba(76, 175, 80, 0.12)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                padding: '7px 16px',
                borderRadius: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={loadingEvents ? 'animate-spin' : ''} />
              <span>{loadingEvents ? 'กำลังซิงค์...' : '🟢 ซิงค์ Google Calendar แล้ว'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGoogleAuth}
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#4285f4',
                background: 'rgba(66, 133, 244, 0.1)',
                border: '1px solid rgba(66, 133, 244, 0.25)',
                padding: '7px 16px',
                borderRadius: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <CalendarIcon size={14} color="#4285f4" />
              <span>📅 ดึงข้อมูล Google Calendar</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Calendar Card */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: '24px', background: '#ffffff', border: '1px solid rgba(76, 175, 80, 0.25)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)' }}>
        
        {/* Month Navigation & Filters Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={prevMonth}
              style={{ padding: '6px 12px', borderRadius: '12px', background: 'rgba(241, 245, 249, 0.8)', border: '1px solid var(--border-glass)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '0.82rem', color: '#1b4332' }}
            >
              <ChevronLeft size={16} /> เดือนก่อนหน้า
            </button>

            <button
              type="button"
              onClick={goToday}
              style={{ padding: '6px 14px', borderRadius: '12px', background: 'rgba(76, 175, 80, 0.15)', border: '1px solid rgba(76, 175, 80, 0.3)', cursor: 'pointer', fontWeight: 800, fontSize: '0.82rem', color: '#2e7d32' }}
            >
              วันนี้
            </button>

            <button
              type="button"
              onClick={nextMonth}
              style={{ padding: '6px 12px', borderRadius: '12px', background: 'rgba(241, 245, 249, 0.8)', border: '1px solid var(--border-glass)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, fontSize: '0.82rem', color: '#1b4332' }}
            >
              เดือนถัดไป <ChevronRight size={16} />
            </button>
          </div>

          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#1b4332' }}>
            {ThaiMonths[month]} {year + 543} ({currentDate.toLocaleString('en-US', { month: 'long' })} {year})
          </h2>

          {/* Priority Legend */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.72rem', fontWeight: 700 }}>
            <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(244, 63, 94, 0.12)', color: '#e11d48' }}>🔴 สูง</span>
            <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>🟡 กลาง</span>
            <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(76, 175, 80, 0.12)', color: '#2e7d32' }}>🟢 ต่ำ</span>
            <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(66, 133, 244, 0.12)', color: '#2563eb' }}>📅 Google Event</span>
          </div>
        </div>

        {/* 7 Days Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px', marginBottom: '6px', textAlign: 'center' }}>
          {DaysOfWeek.map((dayName, idx) => (
            <div key={idx} style={{
              padding: '8px 0',
              fontWeight: 800,
              fontSize: '0.82rem',
              color: idx === 0 ? '#e11d48' : idx === 6 ? '#2563eb' : '#1b4332',
              background: 'rgba(241, 245, 249, 0.5)',
              borderRadius: '10px',
              minWidth: 0
            }}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Month Grid Cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '6px' }}>
          {calendarDays.map((cell, idx) => {
            const dateTasks = getTasksForDate(cell.fullDateStr);
            const dateGEvent = getGoogleEventsForDate(cell.fullDateStr);
            const totalCount = dateTasks.length + dateGEvent.length;

            return (
              <div
                key={idx}
                onClick={() => {
                  setViewingDayDetail(cell.fullDateStr);
                }}
                style={{
                  minHeight: '105px',
                  borderRadius: '14px',
                  padding: '6px',
                  minWidth: 0,
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  background: cell.isToday 
                    ? 'rgba(76, 175, 80, 0.08)' 
                    : cell.monthType === 'current' 
                    ? '#ffffff' 
                    : 'rgba(248, 250, 252, 0.4)',
                  border: cell.isToday 
                    ? '2px solid #4caf50' 
                    : cell.monthType === 'current' 
                    ? '1px solid rgba(76, 175, 80, 0.2)' 
                    : '1px solid rgba(226, 232, 240, 0.6)',
                  opacity: cell.monthType === 'current' ? 1 : 0.45,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (cell.monthType === 'current') {
                    e.currentTarget.style.borderColor = '#4caf50';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (cell.monthType === 'current') {
                    e.currentTarget.style.borderColor = cell.isToday ? '#4caf50' : 'rgba(76, 175, 80, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {/* Cell Header: Date Number */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: cell.isToday ? 900 : 700,
                    color: cell.isToday ? '#2e7d32' : '#1b4332',
                    background: cell.isToday ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {cell.dateNumber}
                  </span>

                  {totalCount > 0 && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2e7d32', background: 'rgba(76, 175, 80, 0.15)', padding: '1px 6px', borderRadius: '8px' }}>
                      {totalCount}
                    </span>
                  )}
                </div>

                {/* Cell Badges Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
                  {/* Local Focus Space Tasks */}
                  {dateTasks.slice(0, 2).map(t => {
                    const isHigh = t.priority === 'High';
                    const isMedium = t.priority === 'Medium';
                    const badgeBg = t.completed 
                      ? 'rgba(76, 175, 80, 0.15)' 
                      : isHigh 
                      ? 'rgba(244, 63, 94, 0.15)' 
                      : isMedium 
                      ? 'rgba(245, 158, 11, 0.15)' 
                      : 'rgba(76, 175, 80, 0.12)';
                    const badgeColor = t.completed 
                      ? '#2e7d32' 
                      : isHigh 
                      ? '#e11d48' 
                      : isMedium 
                      ? '#d97706' 
                      : '#2e7d32';

                    return (
                      <div
                        key={t._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayEvents({ type: 'task', item: t });
                        }}
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '2px 5px',
                          borderRadius: '6px',
                          background: badgeBg,
                          color: badgeColor,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '100%',
                          boxSizing: 'border-box',
                          display: 'block',
                          textDecoration: t.completed ? 'line-through' : 'none'
                        }}
                        title={t.title}
                      >
                        {t.completed ? '✅ ' : isHigh ? '🔴 ' : isMedium ? '🟡 ' : '🟢 '}{t.title}
                      </div>
                    );
                  })}

                  {/* Google Calendar Events */}
                  {dateGEvent.slice(0, 2 - Math.min(2, dateTasks.length)).map(g => (
                    <div
                      key={g.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDayEvents({ type: 'google', item: g });
                      }}
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '2px 5px',
                        borderRadius: '6px',
                        background: 'rgba(66, 133, 244, 0.15)',
                        color: '#2563eb',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        width: '100%',
                        boxSizing: 'border-box',
                        display: 'block'
                      }}
                      title={g.summary}
                    >
                      📅 {g.summary}
                    </div>
                  ))}

                  {totalCount > 2 && (
                    <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700 }}>
                      +{totalCount - 2} รายการ...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Add Task Modal Overlay when clicking a date */}
      {quickCreateDate && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', borderRadius: '24px' }}>
            <h3 style={{ margin: 0, marginBottom: '0.5rem', color: '#1b4332', fontWeight: 800 }}>
              🌱 เพิ่มภารกิจใหม่ลงในปฏิทิน
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              กำหนดส่งวันที่: <strong>{quickCreateDate}</strong>
            </p>

            <form onSubmit={handleQuickAdd}>
              <div className="form-group">
                <label className="form-label">ชื่องาน / ภารกิจ *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="เช่น อ่านหนังสือบทที่ 3, ส่งการบ้านคณิตศาสตร์"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setQuickCreateDate(null)}
                  style={{ flex: 1, background: 'rgba(241, 245, 249, 0.8)' }}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', border: 'none' }}
                >
                  + เพิ่มภารกิจ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Preview Modal for Calendar Item */}
      {selectedDayEvents && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', borderRadius: '24px', textAlign: 'left' }}>
            {selectedDayEvents.type === 'task' ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: 'rgba(76, 175, 80, 0.15)', color: '#2e7d32' }}>
                    ภารกิจใน FOCUS SPACE
                  </span>
                  <button onClick={() => setSelectedDayEvents(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}>✕</button>
                </div>
                <h3 style={{ margin: 0, color: '#1b4332', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {selectedDayEvents.item.title}
                </h3>
                {selectedDayEvents.item.description && (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {selectedDayEvents.item.description}
                  </p>
                )}
                <div style={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: 700, marginBottom: '1.5rem' }}>
                  📅 กำหนดส่ง: {selectedDayEvents.item.deadline ? new Date(selectedDayEvents.item.deadline).toLocaleDateString('th-TH') : 'ไม่มี'}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1, background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', border: 'none' }}
                    onClick={async () => {
                      await updateTask(selectedDayEvents.item._id, { completed: !selectedDayEvents.item.completed });
                      setSelectedDayEvents(null);
                      if (fetchTasks) fetchTasks();
                    }}
                  >
                    {selectedDayEvents.item.completed ? '↩️ เปลี่ยนเป็นยังไม่เสร็จ' : '✅ ทำเครื่องหมายว่าเสร็จแล้ว'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: 'rgba(66, 133, 244, 0.15)', color: '#2563eb' }}>
                    📅 GOOGLE CALENDAR EVENT
                  </span>
                  <button onClick={() => setSelectedDayEvents(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}>✕</button>
                </div>
                <h3 style={{ margin: 0, color: '#1b4332', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {selectedDayEvents.item.summary}
                </h3>
                {selectedDayEvents.item.description && (
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {selectedDayEvents.item.description}
                  </p>
                )}
                <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, marginBottom: '1.5rem' }}>
                  🕒 เวลา: {selectedDayEvents.item.start?.dateTime ? new Date(selectedDayEvents.item.start.dateTime).toLocaleString('th-TH') : 'ทั้งวัน'}
                </div>
                <button
                  type="button"
                  className="btn"
                  style={{ width: '100%', background: 'rgba(241, 245, 249, 0.8)' }}
                  onClick={() => setSelectedDayEvents(null)}
                >
                  ปิด
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* Day Tasks Detail Popup Modal */}
      {viewingDayDetail && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', width: '90%', borderRadius: '24px', textAlign: 'left', padding: '1.75rem' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(76, 175, 80, 0.2)', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', background: 'rgba(76, 175, 80, 0.15)', color: '#2e7d32', display: 'inline-block', marginBottom: '4px' }}>
                  📅 ตารางภารกิจประจำวัน
                </span>
                <h3 style={{ margin: 0, color: '#1b4332', fontWeight: 800, fontSize: '1.25rem' }}>
                  วันที่ {formatThaiFullDateStr(viewingDayDetail)}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setViewingDayDetail(null)} 
                style={{ background: 'rgba(241, 245, 249, 0.8)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* List of Tasks & Events for the Selected Date */}
            {(() => {
              const dayTasks = getTasksForDate(viewingDayDetail);
              const dayGEvents = getGoogleEventsForDate(viewingDayDetail);
              const totalEvents = dayTasks.length + dayGEvents.length;

              if (totalEvents === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', background: 'rgba(76, 175, 80, 0.04)', borderRadius: '18px', border: '1px dashed rgba(76, 175, 80, 0.3)', marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌱</div>
                    <h4 style={{ margin: 0, color: '#1b4332', fontWeight: 800, fontSize: '1rem', marginBottom: '0.35rem' }}>
                      วันนี้เป็นวันสบายๆ ยังไม่มีภารกิจ
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                      คุณสามารถกดปุ่มสีเขียวด้านล่างเพื่อเพิ่มภารกิจใหม่ของวันนี้ได้เลยค่ะ 🌸
                    </p>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '380px', overflowY: 'auto', padding: '6px 6px 6px 2px', marginBottom: '1.25rem' }}>
                  {/* Focus Space Tasks */}
                  {dayTasks.map(t => {
                    const isHigh = t.priority === 'High';
                    const isMedium = t.priority === 'Medium';
                    const badgeBg = isHigh ? 'rgba(244, 63, 94, 0.15)' : isMedium ? 'rgba(245, 158, 11, 0.15)' : 'rgba(76, 175, 80, 0.12)';
                    const badgeColor = isHigh ? '#e11d48' : isMedium ? '#d97706' : '#2e7d32';

                    return (
                      <div 
                        key={t._id}
                        style={{
                          padding: '1rem',
                          borderRadius: '16px',
                          background: t.completed ? 'rgba(241, 245, 249, 0.7)' : '#ffffff',
                          border: '1px solid rgba(76, 175, 80, 0.25)',
                          borderLeft: `5px solid ${badgeColor}`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: badgeBg, color: badgeColor }}>
                            {isHigh ? '🔴 ความสำคัญสูง' : isMedium ? '🟡 ความสำคัญปานกลาง' : '🟢 ความสำคัญทั่วไป'}
                          </span>
                          {t.completed && (
                            <button
                              type="button"
                              onClick={async () => {
                                await updateTask(t._id, { completed: false });
                                if (fetchTasks) fetchTasks();
                              }}
                              style={{ 
                                fontSize: '0.72rem', 
                                fontWeight: 800, 
                                color: '#2e7d32', 
                                background: 'rgba(76, 175, 80, 0.15)', 
                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                padding: '2px 8px', 
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                              title="กดเพื่อเปลี่ยนสถานะเป็นยังไม่เสร็จ"
                            >
                              ✅ ทำเสร็จแล้ว
                            </button>
                          )}
                        </div>

                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: t.completed ? '#94a3b8' : '#1b4332', textDecoration: t.completed ? 'line-through' : 'none' }}>
                          {t.title}
                        </h4>

                        {t.description && (
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                            {t.description}
                          </p>
                        )}

                        {t.aiReason && !t.completed && (
                          <span style={{ fontSize: '0.74rem', color: 'var(--accent-purple)', fontWeight: 600 }}>
                            ✨ AI: {t.aiReason}
                          </span>
                        )}

                        {!t.completed && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(226, 232, 240, 0.6)' }}>
                            <button
                              type="button"
                              onClick={async () => {
                                await updateTask(t._id, { completed: true });
                                if (fetchTasks) fetchTasks();
                              }}
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '5px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                background: 'rgba(76, 175, 80, 0.15)',
                                color: '#2e7d32'
                              }}
                            >
                              ✅ ติ๊กทำเสร็จ
                            </button>

                            {setCurrentTab && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (setSelectedTaskId) setSelectedTaskId(t._id);
                                  setViewingDayDetail(null);
                                  setCurrentTab('pomodoro');
                                }}
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '5px 12px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: 'rgba(245, 158, 11, 0.15)',
                                  color: '#d97706'
                                }}
                              >
                                ⏱️ ไปหน้าจับเวลา Pomodoro
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Google Calendar Events */}
                  {dayGEvents.map(g => {
                    const cleanTitle = (g.summary || '').replace(/^\[Focus Space\]\s*/i, '');
                    const matchedTask = tasks.find(t => 
                      (t.googleEventId && t.googleEventId === g.id) ||
                      (t.title && t.title.trim().toLowerCase() === cleanTitle.trim().toLowerCase())
                    );

                    let priority = matchedTask ? matchedTask.priority : 'Medium';
                    if (!matchedTask) {
                      const eventDate = viewingDayDetail ? new Date(viewingDayDetail) : new Date();
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      eventDate.setHours(0, 0, 0, 0);
                      const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
                      priority = diffDays <= 2 ? 'High' : diffDays <= 5 ? 'Medium' : 'Low';
                    }

                    const isHigh = priority === 'High';
                    const isMedium = priority === 'Medium';
                    const badgeBg = isHigh ? 'rgba(244, 63, 94, 0.15)' : isMedium ? 'rgba(245, 158, 11, 0.15)' : 'rgba(76, 175, 80, 0.12)';
                    const badgeColor = isHigh ? '#e11d48' : isMedium ? '#d97706' : '#2e7d32';
                    const isCompleted = matchedTask ? matchedTask.completed : false;

                    return (
                      <div
                        key={g.id}
                        style={{
                          padding: '1rem',
                          borderRadius: '16px',
                          background: isCompleted ? 'rgba(241, 245, 249, 0.7)' : '#ffffff',
                          border: '1px solid rgba(66, 133, 244, 0.3)',
                          borderLeft: `5px solid ${badgeColor}`,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: badgeColor, background: badgeBg, padding: '2px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>📅 GOOGLE CALENDAR</span>
                            <span>•</span>
                            <span>{isHigh ? '🔴 ความสำคัญสูง' : isMedium ? '🟡 ความสำคัญปานกลาง' : '🟢 ความสำคัญทั่วไป'}</span>
                          </span>
                          {isCompleted && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (matchedTask) {
                                  await updateTask(matchedTask._id, { completed: false });
                                  if (fetchTasks) fetchTasks();
                                }
                              }}
                              style={{ 
                                fontSize: '0.72rem', 
                                fontWeight: 800, 
                                color: '#2e7d32', 
                                background: 'rgba(76, 175, 80, 0.15)', 
                                border: '1px solid rgba(76, 175, 80, 0.3)',
                                padding: '2px 8px', 
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              ✅ ทำเสร็จแล้ว
                            </button>
                          )}
                        </div>

                        <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: isCompleted ? '#94a3b8' : '#1e293b', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                          {cleanTitle}
                        </h4>

                        {g.description && (
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.4 }}>
                            {g.description}
                          </p>
                        )}

                        {!isCompleted && (
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(226, 232, 240, 0.6)' }}>
                            <button
                              type="button"
                              onClick={async () => {
                                if (matchedTask) {
                                  await updateTask(matchedTask._id, { completed: true });
                                } else {
                                  await addTask({
                                    title: cleanTitle,
                                    description: g.description || '',
                                    deadline: viewingDayDetail,
                                    priority: priority,
                                    completed: true,
                                    googleEventId: g.id
                                  });
                                }
                                if (fetchTasks) fetchTasks();
                              }}
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '5px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                background: 'rgba(76, 175, 80, 0.15)',
                                color: '#2e7d32'
                              }}
                            >
                              ✅ ติ๊กทำเสร็จ
                            </button>

                            {setCurrentTab && (
                              <button
                                type="button"
                                onClick={async () => {
                                  let targetId = matchedTask ? matchedTask._id : null;
                                  if (!targetId) {
                                    const created = await addTask({
                                      title: cleanTitle,
                                      description: g.description || '',
                                      deadline: viewingDayDetail,
                                      priority: priority,
                                      googleEventId: g.id
                                    });
                                    if (created && created._id) targetId = created._id;
                                  }
                                  if (targetId && setSelectedTaskId) {
                                    setSelectedTaskId(targetId);
                                  }
                                  setViewingDayDetail(null);
                                  setCurrentTab('pomodoro');
                                }}
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '5px 12px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  background: 'rgba(245, 158, 11, 0.15)',
                                  color: '#d97706'
                                }}
                              >
                                ⏱️ ไปหน้าจับเวลา Pomodoro
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const targetDate = viewingDayDetail;
                  setViewingDayDetail(null);
                  setQuickCreateDate(targetDate);
                }}
                style={{ flex: 1, background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', border: 'none', borderRadius: '14px', padding: '0.75rem' }}
              >
                + เพิ่มภารกิจใหม่ของวันนี้
              </button>

              <button
                type="button"
                className="btn"
                onClick={() => setViewingDayDetail(null)}
                style={{ background: 'rgba(241, 245, 249, 0.8)', borderRadius: '14px', padding: '0.75rem 1.25rem' }}
              >
                ปิด
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default GardenCalendar;
