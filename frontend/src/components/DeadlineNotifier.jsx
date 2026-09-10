import React, { useEffect, useState, useContext } from 'react';
import { TaskContext } from '../context/TaskContext';
import { Bell, Flame, Clock, Play, X, ShieldAlert } from 'lucide-react';

const DeadlineNotifier = ({ setCurrentTab }) => {
  const { tasks } = useContext(TaskContext);
  const [activeAlertTask, setActiveAlertTask] = useState(null);
  const [dismissedTaskIds, setDismissedTaskIds] = useState([]);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === 'granted') {
        new Notification('เปิดการแจ้งเตือนเดดไลน์สำเร็จ! 🔔', {
          body: 'Focus Space จะคอยแจ้งเตือนคุณล่วงหน้าเมื่อถึงกำหนดส่งงานสำคัญค่ะ',
          icon: 'https://cdn-icons-png.flaticon.com/512/3239/3239347.png'
        });
      }
    } catch (err) {
      console.error('Failed to request notification permission:', err);
    }
  };

  // Check tasks for upcoming deadlines
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const checkDeadlines = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const urgentTask = tasks.find(task => {
        if (task.completed || !task.deadline) return false;
        if (dismissedTaskIds.includes(task._id)) return false;

        const targetDate = new Date(task.deadline);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Trigger for tasks due today or overdue
        return diffDays <= 1;
      });

      if (urgentTask && (!activeAlertTask || activeAlertTask._id !== urgentTask._id)) {
        setActiveAlertTask(urgentTask);

        // Also trigger native browser notification if granted
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          const lastNotifiedKey = `notified_task_${urgentTask._id}`;
          const todayStr = new Date().toISOString().split('T')[0];
          if (localStorage.getItem(lastNotifiedKey) !== todayStr) {
            new Notification(`🔥 แจ้งเตือนเดดไลน์สำคัญ: ${urgentTask.title}`, {
              body: `งานนี้ถึงกำหนดส่งเร็วๆ นี้! อย่าลืมสลับไปโฟกัสทำงานนะคะ`,
              icon: 'https://cdn-icons-png.flaticon.com/512/3239/3239347.png'
            });
            localStorage.setItem(lastNotifiedKey, todayStr);
          }
        }
      }
    };

    checkDeadlines();
    const interval = setInterval(checkDeadlines, 30000); // scan every 30 seconds
    return () => clearInterval(interval);
  }, [tasks, dismissedTaskIds, activeAlertTask]);

  const handleDismiss = () => {
    if (activeAlertTask) {
      setDismissedTaskIds(prev => [...prev, activeAlertTask._id]);
      setActiveAlertTask(null);
    }
  };

  const handleStartFocus = () => {
    if (setCurrentTab) {
      setCurrentTab('pomodoro');
    }
    handleDismiss();
  };

  return (
    <>
      {/* Toast Alert Banner (Bottom-Right Floating Glass Banner) */}
      {activeAlertTask && (
        <div 
          className="glass animate-slide-up"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            maxWidth: '380px',
            width: 'calc(100% - 48px)',
            padding: '1.25rem',
            borderRadius: '20px',
            background: 'var(--bg-card)',
            border: '2px solid var(--priority-high)',
            boxShadow: '0 12px 35px rgba(244, 63, 94, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(244, 63, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--priority-high)'
              }}>
                <Flame size={20} className="animate-pulse" />
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--priority-high)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ⚠️ แจ้งเตือนเดดไลน์ด่วน!
                </span>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {activeAlertTask.title}
                </h4>
              </div>
            </div>

            <button 
              onClick={handleDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px'
              }}
              title="ปิดแจ้งเตือน"
            >
              <X size={18} />
            </button>
          </div>

          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            งานนี้ถึงกำหนดส่งเร็วๆ นี้! คุณมีสมาธิพร้อมสำหรับการโฟกัสหรือยังคะ?
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button 
              onClick={handleStartFocus}
              className="btn btn-primary"
              style={{
                flex: 1,
                fontSize: '0.8rem',
                padding: '0.55rem 1rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                boxShadow: '0 4px 15px rgba(244, 63, 94, 0.4)'
              }}
            >
              <Play size={14} fill="currentColor" /> โฟกัสงานนี้ทันที
            </button>

            {notifPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                style={{
                  padding: '0.55rem 0.85rem',
                  fontSize: '0.8rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="เปิดการแจ้งเตือนบนเบราว์เซอร์"
              >
                <Bell size={14} /> แจ้งเตือน
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DeadlineNotifier;
