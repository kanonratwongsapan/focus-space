import React, { useState, useContext, useEffect } from 'react';
import { TaskContext } from '../context/TaskContext';
import { Bell, Flame, Clock, Play, X, Check, Trash2, ShieldAlert, Sparkles, Calendar } from 'lucide-react';

const NotificationBell = ({ setCurrentTab }) => {
  const { tasks } = useContext(TaskContext);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') {
      alert('เบราว์เซอร์ของคุณยังไม่รองรับระบบ Browser Notification แต่คุณยังรับแจ้งเตือนผ่านปุ่มกระดิ่งบนเว็บได้ตามปกติค่ะ');
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        new Notification('เปิดการแจ้งเตือนสำเร็จ! 🔔', {
          body: 'ระบบจะคอยแจ้งเตือนเดดไลน์งานสำคัญให้คุณอัตโนมัติค่ะ',
          icon: 'https://cdn-icons-png.flaticon.com/512/3239/3239347.png'
        });
      } else if (res === 'denied') {
        alert('เบราว์เซอร์ถูกตั้งค่าบล็อกการแจ้งเตือน (Denied) 🔒\n\nวิธีเปิดใช้งาน:\n1. คลิกไอคอนรูปแม่กุญแจ 🔒 ที่แถบแอดเดรสบาร์ด้านบน\n2. สลับสวิตช์ "การแจ้งเตือน (Notifications)" ให้เป็น "อนุญาต (Allow)"\n3. รีเฟรชหน้าเว็บแล้วกดปุ่มเปิดใช้งานใหม่อีกครั้งค่ะ');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate urgent tasks (High priority, due today/tomorrow, or overdue)
  const getUrgentTasks = () => {
    if (!tasks) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter(t => {
      if (t.completed) return false;
      if (dismissedIds.includes(t._id)) return false;

      // Include if High priority (including auto-escalated High priority tasks)
      if (t.priority === 'High') return true;

      // Or if task has a deadline due within 2 days or overdue
      if (t.deadline) {
        const target = new Date(t.deadline);
        target.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 2;
      }

      return false;
    });
  };

  const urgentTasks = getUrgentTasks();
  const unreadCount = urgentTasks.length;

  const getUrgencyBadge = (task) => {
    if (!task.deadline) {
      return { text: '🔴 ความสำคัญสูงเร่งด่วน', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(task.deadline);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `⚠️ ช้ากว่ากำหนด ${Math.abs(diffDays)} วัน`, color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)' };
    } else if (diffDays === 0) {
      return { text: '🔥 กำหนดส่งวันนี้! (ความสำคัญสูง)', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.2)' };
    } else if (diffDays === 1) {
      return { text: '⚡ กำหนดส่งพรุ่งนี้', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.18)' };
    } else {
      return { text: task.priority === 'High' ? '🔴 ความสำคัญสูง' : `📅 เหลืออีก ${diffDays} วัน`, color: task.priority === 'High' ? '#f43f5e' : 'var(--accent-teal)', bg: task.priority === 'High' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)' };
    }
  };

  const handleDismiss = (id, e) => {
    e.stopPropagation();
    setDismissedIds(prev => [...prev, id]);
  };

  const handleClearAll = () => {
    setDismissedIds(urgentTasks.map(t => t._id));
  };

  const handleFocusTask = (task) => {
    if (setCurrentTab) {
      setCurrentTab('pomodoro');
    }
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Topbar Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: isOpen ? 'rgba(138, 92, 245, 0.2)' : 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-glass)',
          color: unreadCount > 0 ? 'var(--primary)' : 'var(--text-muted)',
          borderRadius: '12px',
          padding: '8px 10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition-smooth)'
        }}
        title="ศูนย์การแจ้งเตือน"
      >
        <Bell size={18} className={unreadCount > 0 ? 'animate-bounce' : ''} />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              color: 'white',
              fontSize: '0.68rem',
              fontWeight: 800,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(244, 63, 94, 0.5)',
              border: '2px solid var(--bg-deep)'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Modal */}
      {isOpen && (
        <>
          {/* Overlay to close when clicking outside */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 998,
              background: 'transparent'
            }}
          />

          <div
            className="glass animate-slide-up"
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: '350px',
              maxWidth: '90vw',
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-glass)',
              borderRadius: '20px',
              padding: '1.25rem',
              boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
              zIndex: 999,
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} color="var(--primary)" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ศูนย์การแจ้งเตือน
                </h4>
                {unreadCount > 0 && (
                  <span style={{ fontSize: '0.72rem', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--priority-high)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    {unreadCount} ใหม่
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleClearAll}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="ล้างการแจ้งเตือนทั้งหมด"
                >
                  <Trash2 size={13} /> ล้างทั้งหมด
                </button>
              )}
            </div>

            {/* Browser Notification Status Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.85rem',
              borderRadius: '12px',
              background: permission === 'granted' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              border: `1px solid ${permission === 'granted' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
              fontSize: '0.75rem'
            }}>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                {permission === 'granted' ? '🟢 เปิดแจ้งเตือนเบราว์เซอร์แล้ว' : '🔴 ยังไม่ได้เปิดแจ้งเตือนเบราว์เซอร์'}
              </span>

              {permission !== 'granted' && (
                <button
                  onClick={requestPermission}
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  เปิดใช้งาน
                </button>
              )}
            </div>

            {/* Notification Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
              {urgentTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Sparkles size={24} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0 }}>ไม่มีการแจ้งเตือนงานด่วนในขณะนี้!</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>คุณบริหารจัดการภารกิจได้เยี่ยมมากค่ะ 🎉</p>
                </div>
              ) : (
                urgentTasks.map(task => {
                  const badge = getUrgencyBadge(task);
                  return (
                    <div
                      key={task._id}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-glass)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: badge.bg, color: badge.color }}>
                          {badge.text}
                        </span>

                        <button
                          onClick={(e) => handleDismiss(task._id, e)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                          title="ซ่อนรายการนี้"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <h5 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {task.title}
                      </h5>

                      <button
                        onClick={() => handleFocusTask(task)}
                        className="btn btn-primary"
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.4rem 0.75rem',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.3rem',
                          alignSelf: 'flex-start',
                          marginTop: '0.2rem'
                        }}
                      >
                        <Play size={12} fill="currentColor" /> สลับไปจับเวลาโฟกัส
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
