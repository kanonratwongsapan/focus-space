import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    successRate: 0,
    totalPomodoroTime: 0,
    priorityCounts: { High: 0, Medium: 0, Low: 0 }
  });
  
  const { token, user } = useContext(AuthContext);
  const API_URL = `http://${window.location.hostname}:5000/api`;

  const notifyDueTasks = (loadedTasks) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    
    const lastNotified = localStorage.getItem('last_deadline_notification_date');
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastNotified === todayStr) return;

    const dueTodayTasks = loadedTasks.filter(t => {
      if (t.completed || !t.deadline) return false;
      const taskDateStr = t.deadline.split('T')[0];
      return taskDateStr === todayStr;
    });

    if (dueTodayTasks.length > 0) {
      const taskTitles = dueTodayTasks.map(t => t.title).join(', ');
      new Notification('คุณมีงานที่ครบกำหนดส่งวันนี้! 📅', {
        body: `งานที่ต้องส่งวันนี้: ${taskTitles}. อย่าลืมทำนะคะ!`,
        icon: 'https://cdn-icons-png.flaticon.com/512/3239/3239347.png'
      });
      localStorage.setItem('last_deadline_notification_date', todayStr);
    }
  };

  const autoSyncToGoogleCalendar = async (task, nextCompletedState = false) => {
    const gToken = localStorage.getItem('g_token') || sessionStorage.getItem('g_token');
    if (!user?.googleClientId || !gToken || !task.deadline) return;

    const eventData = {
      summary: `${nextCompletedState ? '✅ [เสร็จแล้ว] ' : '🎯 '}[Focus Space] ${task.title}`,
      description: task.description || 'สร้างจากระบบจัดการงานอัจฉริยะ Focus Space',
      start: {
        date: new Date(task.deadline).toISOString().split('T')[0]
      },
      end: {
        date: (() => {
          const d = new Date(task.deadline);
          d.setDate(d.getDate() + 1);
          return d.toISOString().split('T')[0];
        })()
      }
    };

    try {
      let response;
      if (task.googleEventId) {
        response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${task.googleEventId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${gToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventData)
        });
      } else {
        response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventData)
        });
      }

      if (response.status === 401) {
        console.warn('Google Access Token expired (401 Unauthorized). Clearing stale token...');
        localStorage.removeItem('g_token');
        sessionStorage.removeItem('g_token');
        localStorage.removeItem('g_token_expires_at');
        if (window.google?.accounts?.oauth2 && user?.googleClientId) {
          try {
            const client = window.google.accounts.oauth2.initTokenClient({
              client_id: user.googleClientId,
              scope: 'https://www.googleapis.com/auth/calendar.events',
              callback: (tokenResponse) => {
                if (tokenResponse.access_token) {
                  localStorage.setItem('g_token', tokenResponse.access_token);
                  sessionStorage.setItem('g_token', tokenResponse.access_token);
                  localStorage.setItem('g_token_expires_at', String(Date.now() + 3500 * 1000));
                }
              }
            });
            client.requestAccessToken({ prompt: '' });
          } catch (oauthErr) {
            console.error('Silent token refresh failed:', oauthErr);
          }
        }
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (!task.googleEventId) {
          await fetch(`${API_URL}/tasks/${task._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ googleEventId: data.id })
          });
          setTasks(prev => prev.map(t => t._id === task._id ? { ...t, googleEventId: data.id } : t));
        }
      }
    } catch (err) {
      console.error('Auto sync to Google Calendar failed:', err);
    }
  };

  const fetchTasks = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        notifyDueTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchStats();
    } else {
      setTasks([]);
      setStats({
        total: 0,
        completed: 0,
        pending: 0,
        successRate: 0,
        totalPomodoroTime: 0,
        priorityCounts: { High: 0, Medium: 0, Low: 0 }
      });
    }
  }, [token]);

  const addTask = async (taskData) => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => {
          const updated = [newTask, ...prev];
          const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return updated.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
          });
        });
        fetchStats();
        if (newTask.deadline) {
          autoSyncToGoogleCalendar(newTask, false);
        }
        return { success: true, task: newTask };
      }
      return { success: false };
    } catch (err) {
      console.error('Error adding task:', err);
      return { success: false, error: err.message };
    }
  };

  const updateTask = async (id, updateData) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => {
          const updated = prev.map(t => t._id === id ? updatedTask : t);
          const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return updated.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            return (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
          });
        });
        fetchStats();
        if (updatedTask.deadline) {
          autoSyncToGoogleCalendar(updatedTask, updatedTask.completed);
        }
        return { success: true, task: updatedTask };
      }
      return { success: false };
    } catch (err) {
      console.error('Error updating task:', err);
      return { success: false, error: err.message };
    }
  };

  const deleteTask = async (id) => {
    try {
      const taskToDelete = tasks.find(t => t._id === id);
      const gToken = localStorage.getItem('g_token') || sessionStorage.getItem('g_token');

      if (taskToDelete && taskToDelete.googleEventId && user?.googleClientId && gToken) {
        try {
          await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${taskToDelete.googleEventId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${gToken}`
            }
          });
        } catch (calErr) {
          console.error('Failed to delete Google Calendar event:', calErr);
        }
      }

      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setTasks(prev => prev.filter(t => t._id !== id));
        fetchStats();
        return { success: true };
      }
      return { success: false };
    } catch (err) {
      console.error('Error deleting task:', err);
      return { success: false, error: err.message };
    }
  };

  const analyzeTaskClientSideFallback = (title, description = '') => {
    const combinedText = `${title} ${description}`.toLowerCase();
    
    const highKeywords = ['ด่วน', 'สอบ', 'ส่งงาน', 'ส่งโปรเจกต์', 'สัมภาษณ์', 'วันนี้', 'พรุ่งนี้', 'สำคัญมาก', 'เดดไลน์', 'urgent', 'exam', 'submit', 'สำเร็จการศึกษา', 'โปรเจค', 'โปรเจกต์'];
    const lowKeywords = ['ว่าง', 'เรื่อยๆ', 'ดูซีรีส์', 'ดูหนัง', 'เล่นเกม', 'พักผ่อน', 'งานอดิเรก', 'จัดห้อง', 'นอน'];

    let priority = 'Medium';
    let reasoning = 'วิเคราะห์เป็นงานความสำคัญระดับปานกลาง';

    if (highKeywords.some(k => combinedText.includes(k))) {
      priority = 'High';
      reasoning = 'วิเคราะห์เป็นงานความสำคัญสูง เนื่องจากตรวจพบคำสำคัญเร่งด่วน การสอบ หรือกำหนดส่งที่สำคัญ';
    } else if (lowKeywords.some(k => combinedText.includes(k))) {
      priority = 'Low';
      reasoning = 'วิเคราะห์เป็นงานความสำคัญต่ำ เนื่องจากเป็นกิจกรรมผ่อนคลายหรืองานบ้านทั่วไป';
    }

    // Parse Thai Date
    let deadline = null;
    const today = new Date();
    const currentYear = today.getFullYear();

    if (combinedText.includes('วันนี้')) {
      deadline = today.toISOString().split('T')[0];
    } else if (combinedText.includes('พรุ่งนี้')) {
      const d = new Date(today);
      d.setDate(d.getDate() + 1);
      deadline = d.toISOString().split('T')[0];
    } else if (combinedText.includes('มะรืนนี้')) {
      const d = new Date(today);
      d.setDate(d.getDate() + 2);
      deadline = d.toISOString().split('T')[0];
    } else {
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
        if (combinedText.includes(monthName)) {
          const dayMatch = combinedText.match(new RegExp(`(\\d{1,2})(?:\\s*-\\s*\\d{1,2})?\\s*${monthName.replace('.', '\\.')}(?:\\s*(\\d{4}))?`));
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
            deadline = dateObj.toISOString().split('T')[0];
            break;
          }
        }
      }
    }

    return { 
      priority, 
      reason: reasoning, 
      deadline, 
      isOfflineFallback: false 
    };
  };

  const analyzePriority = async (title, description) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); 

    try {
      const response = await fetch(`${API_URL}/tasks/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.json();
      }
      console.warn('Backend returned non-ok status for AI analysis:', response.status);
      return analyzeTaskClientSideFallback(title, description);
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Network or AI service unavailable, using client-side fallback:', err.message);
      return analyzeTaskClientSideFallback(title, description);
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, stats, fetchTasks, fetchStats, addTask, createTask: addTask, updateTask, deleteTask, analyzePriority }}>
      {children}
    </TaskContext.Provider>
  );
};
