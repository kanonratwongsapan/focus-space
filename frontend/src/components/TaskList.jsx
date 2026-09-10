import React, { useState, useContext, useEffect } from 'react';
import { TaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';
import TaskDetailModal from './TaskDetailModal';
import CustomModal from './CustomModal';
import { 
  Calendar, Trash2, Check, BrainCircuit, Loader2, Sparkles, Plus, Award, 
  Edit2, Search, X, Clock, Tag, Flame, CheckCircle2, ListFilter, LayoutGrid, 
  Rows, Layers, Zap, Filter
} from 'lucide-react';

const ThaiDateInput = ({ value, onChange }) => {
  const toDisplayFormat = (val) => {
    if (!val) return '';
    const dateOnly = val.split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  };

  const [textVal, setTextVal] = useState(toDisplayFormat(value));
  const hiddenDateRef = React.useRef(null);

  useEffect(() => {
    setTextVal(toDisplayFormat(value));
  }, [value]);

  const handleTextChange = (e) => {
    const raw = e.target.value;
    setTextVal(raw);
    
    if (!raw.trim()) {
      onChange('');
      return;
    }

    const parts = raw.split('/');
    if (parts.length === 3) {
      let [d, m, y] = parts.map(p => p.trim());
      if (d.length <= 2 && m.length <= 2 && y.length === 4) {
        const dayStr = d.padStart(2, '0');
        const monthStr = m.padStart(2, '0');
        let yearNum = parseInt(y, 10);
        if (yearNum > 2500) yearNum -= 543;
        const iso = `${yearNum}-${monthStr}-${dayStr}`;
        if (!isNaN(new Date(iso).getTime())) {
          onChange(iso);
        }
      }
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
      <input
        type="text"
        className="form-input"
        placeholder="วัน/เดือน/ปี (เช่น 12/10/2026)"
        value={textVal}
        onChange={handleTextChange}
        style={{ paddingRight: '2.5rem', width: '100%', height: '46px' }}
      />
      <button
        type="button"
        onClick={() => {
          if (hiddenDateRef.current) {
            if (typeof hiddenDateRef.current.showPicker === 'function') {
              hiddenDateRef.current.showPicker();
            } else {
              hiddenDateRef.current.click();
            }
          }
        }}
        style={{
          position: 'absolute',
          right: '10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#475569',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px',
          zIndex: 2
        }}
        title="เลือกวันที่จากปฏิทิน"
      >
        <Calendar size={18} />
      </button>
      <input
        ref={hiddenDateRef}
        type="date"
        value={value ? value.split('T')[0] : ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val);
          setTextVal(toDisplayFormat(val));
        }}
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '24px',
          height: '24px',
          opacity: 0,
          cursor: 'pointer',
          zIndex: 1
        }}
      />
    </div>
  );
};

const TaskList = ({ searchQuery, setSearchQuery, setCurrentTab }) => {
  const { tasks, addTask, updateTask, deleteTask, analyzePriority, loading } = useContext(TaskContext);
  const { user } = useContext(AuthContext);
  
  // Custom Modal Alert/Confirm State
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  });

  const showAlert = (title, message, type = 'info') => {
    setModalState({ isOpen: true, title, message, type, onConfirm: null });
  };

  const showConfirm = (title, message, onConfirm, type = 'delete') => {
    setModalState({ isOpen: true, title, message, type, onConfirm });
  };

  // Modals Visibility
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDetailTask, setSelectedDetailTask] = useState(null);

  // Search, Filter & View State
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState('all');
  const [groupBy, setGroupBy] = useState('status'); // 'status' | 'priority' | 'none'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Google Calendar Auth & Token State
  const [gToken, setGToken] = useState(localStorage.getItem('g_token') || sessionStorage.getItem('g_token') || '');

  // Create Task Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [targetTime, setTargetTime] = useState('60'); // in minutes
  const [progress, setProgress] = useState(0); // 0 - 100%
  const [selectedPriority, setSelectedPriority] = useState('Medium');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null); // { priority, reason, deadline }

  // Edit Task Form States
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editTargetTime, setEditTargetTime] = useState('60');
  const [editProgress, setEditProgress] = useState(0);
  const [editPriority, setEditPriority] = useState('Medium');
  const [editAiLoading, setEditAiLoading] = useState(false);
  const [editAiSuggestion, setEditAiSuggestion] = useState(null);

  // Task Completion Summary State
  const [taskCompletionSummary, setTaskCompletionSummary] = useState(null); // { title, minutes, cycles }

  const formatThaiDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const dateOnly = dateStr.split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const thaiMonthsShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const monthIdx = parseInt(m, 10) - 1;
    const thaiYear = parseInt(y, 10) + 543;
    return `${d}/${m}/${y} (${parseInt(d, 10)} ${thaiMonthsShort[monthIdx] || ''} ${thaiYear})`;
  };

  // Check Google token from localStorage/sessionStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('g_token') || sessionStorage.getItem('g_token');
    if (token) setGToken(token);
  }, []);

  // Google Identity Services Auth Trigger
  const handleGoogleAuth = () => {
    const activeClientId = user?.googleClientId || '210886144254-9n7riasmgaikot2rql7i5riofs44gioi.apps.googleusercontent.com';

    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      showAlert('ระบบ Google OAuth', 'สคริปต์ยังโหลดไม่สมบูรณ์ กรุณารีเฟรชหน้าเว็บแล้วลองใหม่อีกครั้งค่ะ 🌸', 'warning');
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: 'https://www.googleapis.com/auth/calendar.events',
        callback: (tokenResponse) => {
          if (tokenResponse.access_token) {
            setGToken(tokenResponse.access_token);
            localStorage.setItem('g_token', tokenResponse.access_token);
            sessionStorage.setItem('g_token', tokenResponse.access_token);
            localStorage.setItem('g_token_expires_at', String(Date.now() + 3500 * 1000));
            showAlert('เชื่อมต่อสำเร็จ', 'เชื่อมต่อบัญชี Google Calendar สำเร็จเรียบร้อยแล้วค่ะ! 📅✨', 'success');
          } else if (tokenResponse.error) {
            console.error('OAuth Token Error:', tokenResponse.error);
            if (tokenResponse.error === 'popup_closed_by_user') {
              showAlert('ปิดป๊อบอัพ', 'คุณได้ปิดหน้าต่างเชื่อมต่อ Google ป๊อบอัพ หากต้องการซิงค์ปฏิทิน กรุณากดปุ่มเชื่อมต่อใหม่อีกครั้งค่ะ', 'warning');
            } else if (tokenResponse.error === 'access_denied') {
              showAlert('ปฏิเสธสิทธิ์', 'คุณได้ปฏิเสธสิทธิ์การเข้าถึงปฏิทิน กรุณาอนุญาตสิทธิ์ในหน้าต่าง Google เพื่อซิงค์ข้อมูลค่ะ', 'warning');
            }
          }
        },
        error_callback: (err) => {
          console.error('Google OAuth Error Callback:', err);
          showAlert('คำแนะนำการอนุญาตป๊อบอัพ', 'หากป๊อบอัพไม่แสดง กรุณาตรวจสอบว่าเบราว์เซอร์ไม่ได้บล็อก Pop-up (คลิกไอคอนแม่กุญแจ/ป๊อบอัพตรงแอดเดรสบาร์ด้านบน) แล้วลองใหม่อีกครั้งค่ะ 🌸', 'info');
        }
      });
      client.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.error('Google client init failed:', err);
      showAlert('ข้อผิดพลาด', 'เกิดข้อผิดพลาดในการเรียกใช้ Google OAuth: ' + (err.message || 'โปรดตรวจสอบการตั้งค่า เบราว์เซอร์อาจบล็อก Pop-up'), 'error');
    }
  };

  // Sync to Google Calendar REST API
  const syncToGoogleCalendar = async (task) => {
    if (!gToken) {
      handleGoogleAuth();
      return;
    }
    
    if (!task.deadline) {
      alert('งานนี้ไม่มีเดดไลน์ระบุไว้ ไม่สามารถบันทึกลงปฏิทินได้ค่ะ กรุณาแก้ไขงานเพื่อระบุเดดไลน์ก่อนค่ะ');
      return;
    }
    
    const eventData = {
      summary: `🎯 [Focus Space] ${task.title}`,
      description: task.description || 'สร้างจากระบบจัดการงานอัจฉริยะ Focus Space',
      start: {
        date: new Date(task.deadline).toISOString().split('T')[0]
      },
      end: {
        date: (() => {
          const d = new Date(task.deadline);
          d.setDate(d.getDate() + 1); // exclusive end date for all-day event
          return d.toISOString().split('T')[0];
        })()
      }
    };

    try {
      let response;
      if (task.googleEventId) {
        // Update existing calendar event
        response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${task.googleEventId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${gToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventData)
        });
      } else {
        // Create new calendar event
        response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${gToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventData)
        });
      }

      if (response.ok) {
        const data = await response.json();
        // Update database with Google Event ID
        await updateTask(task._id, { googleEventId: data.id });
        alert('ซิงค์ประวัติงานไปยัง Google Calendar ของคุณเรียบร้อยแล้วค่ะ! 📅');
      } else {
        const errData = await response.json();
        console.error('Google Calendar Error:', errData);
        if (response.status === 401) {
          sessionStorage.removeItem('g_token');
          localStorage.removeItem('g_token');
          setGToken('');
          alert('⚠️ สิทธิ์เชื่อมต่อ Google Calendar หมดอายุ (พฤติกรรมปกติของ Google ทุก 1 ชม.) ระบบกำลังขอสิทธิ์เชื่อมต่อใหม่ให้อัตโนมัติ...');
          handleGoogleAuth();
        } else {
          alert(`เกิดข้อผิดพลาดในการเชื่อมต่อปฏิทิน: ${errData.error?.message || 'ไม่ทราบสาเหตุ'}`);
        }
      }
    } catch (err) {
      console.error('Calendar Network Error:', err);
      alert('ไม่สามารถเชื่อมต่อ Google Calendar ได้ในขณะนี้');
    }
  };

  const handleAIAnalyze = async (isEditMode = false) => {
    const currentTitle = isEditMode ? editTitle : title;
    const currentDesc = isEditMode ? editDescription : description;

    if (!currentTitle.trim()) return;
    
    if (isEditMode) {
      setEditAiLoading(true);
      try {
        const result = await analyzePriority(currentTitle, currentDesc);
        setEditAiSuggestion(result);
        setEditPriority(result.priority);
        if (result.deadline) {
          setEditDeadline(result.deadline);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setEditAiLoading(false);
      }
    } else {
      setAiLoading(true);
      try {
        const result = await analyzePriority(currentTitle, currentDesc);
        setAiSuggestion(result);
        setSelectedPriority(result.priority);
        if (result.deadline) {
          setDeadline(result.deadline);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAiLoading(false);
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('กรุณากรอกชื่อส่งงาน (Task Title) ด้วยค่ะ 🌸');
      return;
    }
    if (!description.trim()) {
      alert('กรุณากรอกรายละเอียดงาน (Description) ด้วยค่ะ 🌸');
      return;
    }

    const taskData = {
      title,
      description,
      priority: selectedPriority,
      aiPriority: aiSuggestion ? aiSuggestion.priority : 'None',
      aiReason: aiSuggestion ? aiSuggestion.reason : '',
      isConfirmed: !!aiSuggestion,
      deadline: deadline ? new Date(deadline) : null,
      targetTime: Number(targetTime) || 0,
      progress: Number(progress) || 0
    };

    const res = await addTask(taskData);
    if (res.success) {
      setTitle('');
      setDescription('');
      setDeadline('');
      setTargetTime('60');
      setProgress(0);
      setAiSuggestion(null);
      setSelectedPriority('Medium');
      setIsCreateOpen(false);
    }
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditDeadline(task.deadline ? task.deadline.split('T')[0] : '');
    setEditTargetTime(task.targetTime || 60);
    setEditProgress(task.progress !== undefined ? task.progress : (task.completed ? 100 : 0));
    setEditPriority(task.priority);
    setEditAiSuggestion(task.aiPriority !== 'None' ? { priority: task.aiPriority, reason: task.aiReason } : null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      alert('กรุณากรอกชื่อส่งงาน (Task Title) ด้วยค่ะ 🌸');
      return;
    }
    if (!editDescription.trim()) {
      alert('กรุณากรอกรายละเอียดงาน (Description) ด้วยค่ะ 🌸');
      return;
    }

    const updatedData = {
      title: editTitle,
      description: editDescription,
      priority: editPriority,
      aiPriority: editAiSuggestion ? editAiSuggestion.priority : editingTask.aiPriority,
      aiReason: editAiSuggestion ? editAiSuggestion.reason : editingTask.aiReason,
      isConfirmed: !!editAiSuggestion || editingTask.isConfirmed,
      deadline: editDeadline ? new Date(editDeadline) : null,
      targetTime: Number(editTargetTime) || 0,
      progress: Number(editProgress)
    };

    const res = await updateTask(editingTask._id, updatedData);
    if (res.success) {
      setIsEditOpen(false);
      setEditingTask(null);
      setEditAiSuggestion(null);
    }
  };

  const handleToggleComplete = (task) => {
    const nextCompletedState = !task.completed;
    updateTask(task._id, { completed: nextCompletedState });

    if (nextCompletedState && (task.timeSpent > 0 || task.pomodoroCycles > 0)) {
      setTaskCompletionSummary({
        title: task.title,
        minutes: Math.max(1, Math.round(task.timeSpent / 60)),
        cycles: task.pomodoroCycles
      });
    }
  };

  const handleDelete = (id) => {
    showConfirm(
      'ยืนยันการลบภารกิจ',
      'คุณต้องการลบภารกิจเพาะปลูกนี้ใช่หรือไม่? ข้อมูลจะถูกลบออกจากสวนของคุณค่ะ 🌸',
      () => deleteTask(id),
      'delete'
    );
  };

  const extractTags = (task) => {
    const combinedText = `${task.title || ''} ${task.description || ''}`;
    const matches = combinedText.match(/#([\u0e00-\u0e7f\w_-]+)/g);
    if (!matches) return [];
    return [...new Set(matches.map(tag => tag.substring(1).trim()))].filter(Boolean);
  };

  // Get all unique tags across all tasks
  const allTags = [...new Set(tasks.flatMap(task => {
    const combinedText = `${task.title || ''} ${task.description || ''}`;
    const matches = combinedText.match(/#([\u0e00-\u0e7f\w_-]+)/g);
    return matches ? matches.map(tag => tag.substring(1).trim()) : [];
  }))].filter(Boolean);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDeadlineBadge = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateString);
    target.setHours(0, 0, 0, 0);
    
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formatted = target.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

    if (diffDays < 0) {
      return {
        text: `⚠️ ช้ากว่ากำหนด ${Math.abs(diffDays)} วัน (${formatted})`,
        color: 'var(--priority-high)',
        bg: 'rgba(244, 63, 94, 0.15)',
        border: 'rgba(244, 63, 94, 0.3)'
      };
    } else if (diffDays === 0) {
      return {
        text: `🔥 กำหนดส่งวันนี้! (${formatted})`,
        color: '#f43f5e',
        bg: 'rgba(244, 63, 94, 0.2)',
        border: 'rgba(244, 63, 94, 0.4)'
      };
    } else if (diffDays === 1) {
      return {
        text: `⚡ กำหนดส่งพรุ่งนี้ (${formatted})`,
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.18)',
        border: 'rgba(245, 158, 11, 0.35)'
      };
    } else if (diffDays <= 7) {
      return {
        text: `📅 เหลืออีก ${diffDays} วัน (${formatted})`,
        color: 'var(--accent-teal)',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.25)'
      };
    } else {
      return {
        text: `📅 ${target.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}`,
        color: 'var(--text-muted)',
        bg: 'rgba(255, 255, 255, 0.05)',
        border: 'var(--border-glass)'
      };
    }
  };

  // Filter Tasks Client-side
  const filteredTasks = tasks.filter(task => {
    const titleText = (task.title || '').toLowerCase();
    const descText = (task.description || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();
    
    const matchesSearch = titleText.includes(query) || descText.includes(query);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'completed' && task.completed) ||
                         (statusFilter === 'pending' && !task.completed);
                         
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    const taskTags = extractTags(task);
    const matchesTag = selectedTagFilter === 'all' || taskTags.includes(selectedTagFilter);
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTag;
  });

  const renderTaskCard = (task) => {
    const isHigh = task.priority === 'High';
    const isMedium = task.priority === 'Medium';
    const isLow = task.priority === 'Low';
    
    const priorityColor = isHigh 
      ? 'var(--priority-high)' 
      : isMedium 
      ? 'var(--priority-medium)' 
      : 'var(--priority-low)';
      
    const priorityBg = isHigh 
      ? 'var(--priority-high-bg)' 
      : isMedium 
      ? 'var(--priority-medium-bg)' 
      : 'var(--priority-low-bg)';

    const hoverGlow = isHigh 
      ? '0 8px 25px rgba(244, 63, 94, 0.25)' 
      : isMedium 
      ? '0 8px 25px rgba(245, 158, 11, 0.25)' 
      : '0 8px 25px rgba(16, 185, 129, 0.25)';

    const tags = extractTags(task);

    return (
      <div 
        key={task._id} 
        className="glass" 
        onClick={() => setSelectedDetailTask(task)}
        title="กดเพื่อดูรายละเอียดงานฉบับเต็ม"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.25rem',
          borderRadius: '16px',
          minHeight: '175px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderLeft: task.completed ? '1px solid var(--border-glass)' : `5px solid ${priorityColor}`,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
          transition: 'var(--transition-smooth)',
          opacity: task.completed ? 0.65 : 1,
          transform: 'translateY(0)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!task.completed) {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = hoverGlow;
            e.currentTarget.style.borderColor = priorityColor;
          }
        }}
        onMouseLeave={(e) => {
          if (!task.completed) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.borderColor = 'var(--border-glass)';
          }
        }}
      >
        {/* Top Row: Checkbox & Badges */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div 
            className={`checkbox-custom ${task.completed ? 'checked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleComplete(task);
            }}
            style={{ width: '20px', height: '20px', borderRadius: '6px', cursor: 'pointer' }}
            title={task.completed ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}
          >
            {task.completed && <Check size={14} color="white" />}
          </div>
          
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            {task.deadline && !task.completed && user?.googleClientId && (
              <span 
                style={{
                  padding: '2px 5px',
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  border: task.googleEventId ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: task.googleEventId ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  color: task.googleEventId ? 'var(--accent-teal)' : 'var(--text-muted)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default'
                }}
                title={task.googleEventId ? 'เชื่อมต่อกับ Google Calendar แล้ว' : 'ยังไม่ได้เชื่อมต่อกับ Google Calendar'}
              >
                📅
              </span>
            )}
            <span 
              className={`badge badge-${task.priority.toLowerCase()}`} 
              style={{ 
                fontSize: '0.7rem', 
                padding: '3px 10px', 
                borderRadius: '10px',
                fontWeight: 700,
                background: priorityBg,
                color: priorityColor,
                border: `1px solid ${priorityColor}`
              }}
            >
              {isHigh ? '🔴 สูง' : isMedium ? '🟡 กลาง' : '🟢 ต่ำ'}
            </span>
          </div>
        </div>

        {/* Middle Row: Content */}
        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem', overflow: 'hidden', textAlign: 'left' }}>
          <h4 
            className={`task-title ${task.completed ? 'completed' : ''}`}
            style={{
              margin: 0,
              fontSize: '0.98rem',
              fontWeight: 700,
              color: task.completed ? 'var(--text-muted)' : 'var(--text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '0.2px'
            }}
          >
            {task.title}
          </h4>
          
          {task.description && (
            <p style={{
              margin: 0,
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.45
            }}>
              {task.description}
            </p>
          )}

          {/* Botanical Progress Bar */}
          <div style={{ marginTop: '0.5rem', marginBottom: '0.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
              <span style={{ fontWeight: 600, color: task.completed ? '#4caf50' : 'var(--text-main)' }}>
                🌱 {task.completed ? '100% (เสร็จสมบูรณ์)' : `${task.progress || 0}% ความก้าวหน้า`}
              </span>
              {task.targetTime > 0 && (
                <span style={{ fontSize: '0.7rem' }}>
                  ⏱️ {Math.round((task.timeSpent || 0) / 60)}/{task.targetTime} นาที
                </span>
              )}
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${task.completed ? 100 : (task.progress || 0)}%`,
                height: '100%',
                background: task.completed ? '#4caf50' : 'linear-gradient(90deg, #81c784 0%, #388e3c 100%)',
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          {task.aiReason && !task.completed && (
            <span style={{
              fontSize: '0.72rem',
              color: 'var(--accent-purple)',
              marginTop: '0.25rem',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              display: 'block',
              maxWidth: '100%',
              lineHeight: 1.35
            }}>
              ✨ AI: {task.aiReason}
            </span>
          )}
        </div>

        {/* Bottom Row: Actions & Deadline */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderTop: '1px solid var(--border-glass)', 
          paddingTop: '0.6rem', 
          marginTop: 'auto' 
        }}>
          <div>
            {task.deadline ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                <Calendar size={13} color="var(--accent-teal)" />
                {formatThaiDateLabel(task.deadline)}
              </span>
            ) : (
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                ไม่มีเดดไลน์
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {!task.completed && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEdit(task);
                }}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px 7px',
                  borderRadius: '6px',
                  transition: 'var(--transition-smooth)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--primary)';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-glass)';
                }}
                title="แก้ไขงาน"
              >
                <Edit2 size={13} />
              </button>
            )}

            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(task._id);
              }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px 7px',
                borderRadius: '6px',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--priority-high)';
                e.currentTarget.style.borderColor = 'var(--priority-high)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-glass)';
              }}
              title="ลบงาน"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderTaskRow = (task) => {
    const isHigh = task.priority === 'High';
    const isMedium = task.priority === 'Medium';
    const priorityColor = isHigh ? 'var(--priority-high)' : isMedium ? 'var(--priority-medium)' : 'var(--priority-low)';
    const priorityBg = isHigh ? 'var(--priority-high-bg)' : isMedium ? 'var(--priority-medium-bg)' : 'var(--priority-low-bg)';
    const deadlineBadge = getDeadlineBadge(task.deadline);
    const tags = extractTags(task);

    return (
      <div 
        key={task._id} 
        className="glass"
        onClick={() => setSelectedDetailTask(task)}
        title="กดเพื่อดูรายละเอียดงานฉบับเต็ม"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderRadius: '14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderLeft: `5px solid ${task.completed ? 'var(--border-glass)' : priorityColor}`,
          transition: 'var(--transition-smooth)',
          gap: '1rem',
          opacity: task.completed ? 0.65 : 1,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          if (!task.completed) {
            e.currentTarget.style.transform = 'translateX(4px)';
            e.currentTarget.style.borderColor = priorityColor;
          }
        }}
        onMouseLeave={(e) => {
          if (!task.completed) {
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.borderColor = 'var(--border-glass)';
          }
        }}
      >
        {/* Left: Checkbox + Priority + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
          <div 
            className={`checkbox-custom ${task.completed ? 'checked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleToggleComplete(task);
            }}
            style={{ width: '20px', height: '20px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 }}
          >
            {task.completed && <Check size={13} color="white" />}
          </div>

          <span 
            className={`badge badge-${task.priority.toLowerCase()}`}
            style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '8px', background: priorityBg, color: priorityColor, border: `1px solid ${priorityColor}`, flexShrink: 0, fontWeight: 700 }}
          >
            {isHigh ? '🔴 สูง' : isMedium ? '🟡 กลาง' : '🟢 ต่ำ'}
          </span>

          <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
            <h4 
              className={`task-title ${task.completed ? 'completed' : ''}`}
              style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: task.completed ? 'var(--text-muted)' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {task.title}
            </h4>
            {task.description && (
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {task.description}
              </p>
            )}
          </div>

          {/* Mini Botanical Progress */}
          <div style={{ minWidth: '110px', maxWidth: '140px', marginRight: '0.5rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
              <span>🌱 {task.completed ? '100%' : `${task.progress || 0}%`}</span>
              {task.targetTime > 0 && <span>⏱️ {Math.round((task.timeSpent || 0) / 60)}/{task.targetTime}m</span>}
            </div>
            <div style={{ width: '100%', height: '5px', background: 'rgba(0,0,0,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${task.completed ? 100 : (task.progress || 0)}%`,
                height: '100%',
                background: task.completed ? '#4caf50' : 'linear-gradient(90deg, #81c784 0%, #388e3c 100%)',
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Right: Deadline + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          {task.deadline ? (
            <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '8px', background: 'rgba(76, 175, 80, 0.12)', color: '#2e7d32', border: '1px solid rgba(76, 175, 80, 0.25)', fontWeight: 600 }}>
              📅 {formatThaiDateLabel(task.deadline)}
            </span>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>ไม่มีเดดไลน์</span>
          )}

          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            {!task.completed && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEdit(task);
                }}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px', borderRadius: '6px' }}
                title="แก้ไขงาน"
              >
                <Edit2 size={13} />
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(task._id);
              }}
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-glass)', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px', borderRadius: '6px' }}
              title="ลบงาน"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <header className="task-page-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ textAlign: 'left' }}>
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
            <span>BOTANICAL GARDEN TASK LIST • แปลงปลูกภารกิจในสวน 🌸</span>
          </div>
          <h1 className="page-title task-page-title-text" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', color: '#1b4332', fontWeight: 800 }}>
            รายการภารกิจเพาะปลูก (Garden Tasks) 🌸🌱
            {gToken ? (
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 600, 
                color: '#2e7d32', 
                background: 'rgba(76, 175, 80, 0.15)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                padding: '3px 10px',
                borderRadius: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                verticalAlign: 'middle'
              }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#4caf50' }}></span>
                🟢 เชื่อมต่อ Google Calendar แล้ว
              </span>
            ) : (
              <button
                type="button"
                onClick={handleGoogleAuth}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#2e7d32',
                  background: 'rgba(76, 175, 80, 0.12)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
                title="กดเพื่อเชื่อมต่อบัญชี Google Calendar สำหรับซิงค์เดดไลน์งาน"
              >
                📅 กดเชื่อมต่อ Google Calendar
              </button>
            )}
          </h1>
          <p className="task-page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>จัดการและวางแผนภารกิจเพาะปลูก ค้นหา และซิงค์กำหนดส่งไปยัง Google Calendar</p>
        </div>
        
        <button className="btn btn-primary btn-create-task-main" onClick={() => setIsCreateOpen(true)} style={{ padding: '0.8rem 1.75rem', background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', border: 'none', borderRadius: '16px', boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)' }}>
          <Plus size={20} />
          + เพาะปลูกภารกิจใหม่
        </button>
      </header>


      {/* Task Completion Summary Overlay Modal */}
      {taskCompletionSummary && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center', borderRadius: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(76, 175, 80, 0.15)',
              color: '#2e7d32',
              marginBottom: '1rem'
            }}>
              <Award size={32} />
            </div>
            <h2 style={{ color: '#1b4332', marginBottom: '1rem', fontWeight: 800 }}>
              ยินดีด้วย! เก็บเกี่ยวผลผลิตสำเร็จแล้ว 🌸
            </h2>
            <p style={{ marginBottom: '1.5rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
              คุณได้ทำเครื่องหมายงาน **"{taskCompletionSummary.title}"** ว่าเสร็จสิ้นแล้ว! <br/>
              โดยคุณใช้เวลาโฟกัสทำงานชิ้นนี้ไปทั้งสิ้น <strong>{taskCompletionSummary.minutes} นาที</strong> (คิดเป็น {taskCompletionSummary.cycles} รอบ Pomodoro)
            </p>
            <button className="btn btn-primary" onClick={() => setTaskCompletionSummary(null)} style={{ width: '100%', background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', border: 'none', borderRadius: '14px' }}>
              เยี่ยมเลย! 🌱
            </button>
          </div>
        </div>
      )}

      {/* Top Pro Stat Highlights Bar - Interactive Click Filters */}
      <div className="pro-stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Card 1: All Tasks */}
        <div 
          className={`glass pro-stat-card ${statusFilter === 'all' && priorityFilter === 'all' && selectedTagFilter === 'all' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('all');
            setPriorityFilter('all');
            setSelectedTagFilter('all');
            setGroupBy('status');
          }}
          title="กดเพื่อแสดงแปลงงานทั้งหมด"
          style={{ 
            padding: '1.15rem 1.35rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            background: (statusFilter === 'all' && priorityFilter === 'all' && selectedTagFilter === 'all') ? 'rgba(76, 175, 80, 0.18)' : '#ffffff', 
            borderRadius: '20px',
            cursor: 'pointer',
            border: (statusFilter === 'all' && priorityFilter === 'all' && selectedTagFilter === 'all') ? '2px solid #4caf50' : '1px solid rgba(76, 175, 80, 0.25)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
            transition: 'var(--transition-smooth)'
          }}
        >
          <div className="pro-stat-icon" style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(76, 175, 80, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32', flexShrink: 0 }}>
            <Layers size={22} />
          </div>
          <div>
            <span className="pro-stat-title" style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>🌱 แปลงงานทั้งหมด 👆</span>
            <h3 className="pro-stat-value" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#1b4332' }}>{tasks.length}</h3>
          </div>
        </div>

        {/* Card 2: Pending Tasks */}
        <div 
          className={`glass pro-stat-card ${statusFilter === 'pending' && priorityFilter === 'all' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('pending');
            setPriorityFilter('all');
            setSelectedTagFilter('all');
            setGroupBy('none');
          }}
          title="กดเพื่อกรองแสดงเฉพาะแปลงกำลังเพาะปลูก"
          style={{ 
            padding: '1.15rem 1.35rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            background: (statusFilter === 'pending' && priorityFilter === 'all') ? 'rgba(245, 158, 11, 0.18)' : '#ffffff', 
            borderRadius: '20px',
            cursor: 'pointer',
            border: (statusFilter === 'pending' && priorityFilter === 'all') ? '2px solid #f59e0b' : '1px solid rgba(76, 175, 80, 0.25)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
            transition: 'var(--transition-smooth)'
          }}
        >
          <div className="pro-stat-icon" style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', flexShrink: 0 }}>
            <Clock size={22} />
          </div>
          <div>
            <span className="pro-stat-title" style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>⏳ กำลังเพาะปลูก 👆</span>
            <h3 className="pro-stat-value" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#d97706' }}>
              {tasks.filter(t => !t.completed).length}
            </h3>
          </div>
        </div>

        {/* Card 3: High Priority Urgent Tasks */}
        <div 
          className={`glass pro-stat-card ${priorityFilter === 'High' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('pending');
            setPriorityFilter('High');
            setSelectedTagFilter('all');
            setGroupBy('none');
          }}
          title="กดเพื่อกรองแสดงเฉพาะแปลงภารกิจความสำคัญสูง"
          style={{ 
            padding: '1.15rem 1.35rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            background: (priorityFilter === 'High') ? 'rgba(244, 63, 94, 0.18)' : '#ffffff', 
            borderRadius: '20px',
            cursor: 'pointer',
            border: (priorityFilter === 'High') ? '2px solid #e11d48' : '1px solid rgba(76, 175, 80, 0.25)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
            transition: 'var(--transition-smooth)'
          }}
        >
          <div className="pro-stat-icon" style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', flexShrink: 0 }}>
            <Flame size={22} />
          </div>
          <div>
            <span className="pro-stat-title" style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>🔴 ความสำคัญสูง 👆</span>
            <h3 className="pro-stat-value" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#e11d48' }}>
              {tasks.filter(t => !t.completed && t.priority === 'High').length}
            </h3>
          </div>
        </div>

        {/* Card 4: Completed Tasks */}
        <div 
          className={`glass pro-stat-card ${statusFilter === 'completed' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('completed');
            setPriorityFilter('all');
            setSelectedTagFilter('all');
            setGroupBy('none');
          }}
          title="กดเพื่อกรองแสดงเฉพาะผลผลิตที่เก็บเกี่ยวสำเร็จแล้ว"
          style={{ 
            padding: '1.15rem 1.35rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            background: (statusFilter === 'completed') ? 'rgba(76, 175, 80, 0.18)' : '#ffffff', 
            borderRadius: '20px',
            cursor: 'pointer',
            border: (statusFilter === 'completed') ? '2px solid #4caf50' : '1px solid rgba(76, 175, 80, 0.25)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
            transition: 'var(--transition-smooth)'
          }}
        >
          <div className="pro-stat-icon" style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(76, 175, 80, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32', flexShrink: 0 }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="pro-stat-title" style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>🌸 เก็บเกี่ยวสำเร็จ 👆</span>
            <h3 className="pro-stat-value" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#2e7d32' }}>
              {tasks.filter(t => t.completed).length}
            </h3>
          </div>
        </div>
      </div>



      {/* Task Listing Header & Filter Bar */}
      <div className="task-controls-wrapper" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Left: Clean Segmented Pill Control */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '14px',
          padding: '4px',
          gap: '3px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          overflowX: 'auto',
          maxWidth: '100%'
        }}>
          <button
            onClick={() => { setGroupBy('status'); setStatusFilter('all'); }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              background: groupBy === 'status' ? 'var(--primary)' : 'transparent',
              color: groupBy === 'status' ? 'white' : 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}
          >
            📌 แยกค้าง/เสร็จ
          </button>

          <button
            onClick={() => { setGroupBy('priority'); setStatusFilter('all'); }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              background: groupBy === 'priority' ? 'var(--primary)' : 'transparent',
              color: groupBy === 'priority' ? 'white' : 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}
          >
            🎯 แยกความสำคัญ
          </button>

          <button
            onClick={() => { setGroupBy('none'); setStatusFilter('all'); }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              background: groupBy === 'none' ? 'var(--primary)' : 'transparent',
              color: groupBy === 'none' ? 'white' : 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}
          >
            📋 ดูรวมทั้งหมด
          </button>
        </div>

        {/* Right: Grid/List View Toggle & Priority Filter */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Priority Filter Select */}
          <select 
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.8rem',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              outline: 'none',
              transition: 'var(--transition-smooth)',
              fontWeight: 600
            }}
          >
            <option value="all">ความสำคัญ: ทั้งหมด</option>
            <option value="High">🔴 สูง</option>
            <option value="Medium">🟡 กลาง</option>
            <option value="Low">🟢 ต่ำ</option>
          </select>

          {/* Grid vs List Toggle Buttons */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-glass)',
            borderRadius: '10px',
            padding: '3px',
            gap: '2px'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'grid' ? 'white' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '7px',
                padding: '5px 9px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                transition: 'var(--transition-smooth)'
              }}
              title="มุมมองการ์ด (Grid View)"
            >
              <LayoutGrid size={14} /> การ์ด
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '7px',
                padding: '5px 9px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                transition: 'var(--transition-smooth)'
              }}
              title="มุมมองรายการ (List View)"
            >
              <Rows size={14} /> รายการ
            </button>
          </div>
        </div>
      </div>
      
      {loading && tasks.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b', borderRadius: '24px', border: '1px solid rgba(76, 175, 80, 0.25)', background: '#ffffff' }}>
          {tasks.length === 0 
            ? '🌸 แปลงพฤกษาสวนของคุณยังว่างเปล่า! กดปุ่ม "+ เพาะปลูกภารกิจใหม่" เพื่อเริ่มสร้างภารกิจแรกกันเลยค่ะ 🌱' 
            : 'ไม่พบภารกิจเพาะปลูกที่ตรงตามตัวกรองค้นหาของคุณค่ะ 🔍'}
        </div>
      ) : (
        <div style={{ marginBottom: '2.5rem' }}>
          {(() => {
            const pendingTasks = filteredTasks.filter(t => !t.completed);
            const completedTasks = filteredTasks.filter(t => t.completed);
            const itemRenderer = viewMode === 'list' ? renderTaskRow : renderTaskCard;
            const containerStyle = viewMode === 'list' 
              ? { display: 'flex', flexDirection: 'column', gap: '0.75rem' }
              : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' };

            if (groupBy === 'status') {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  {/* Section 1: Pending Tasks */}
                  {(statusFilter === 'all' || statusFilter === 'pending') && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1b4332', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>🌱</span> แปลงกำลังเพาะปลูก (Pending Plantations)
                          <span style={{ fontSize: '0.8rem', background: 'rgba(76, 175, 80, 0.15)', color: '#2e7d32', padding: '2px 10px', borderRadius: '12px', fontWeight: 700 }}>
                            {pendingTasks.length} รายการ
                          </span>
                        </h3>
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(76, 175, 80, 0.25) 0%, transparent 100%)' }} />
                      </div>

                      {pendingTasks.length === 0 ? (
                        <div className="glass" style={{ padding: '2rem', textAlign: 'center', color: '#64748b', borderRadius: '16px', border: '1px dashed rgba(76, 175, 80, 0.25)' }}>
                          🎉 ไม่มีภารกิจค้างเพาะปลูกในขณะนี้!
                        </div>
                      ) : (
                        <div style={containerStyle}>
                          {pendingTasks.map(itemRenderer)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section 2: Completed Tasks */}
                  {(statusFilter === 'all' || statusFilter === 'completed') && completedTasks.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>🌸</span> ผลผลิตเก็บเกี่ยวสำเร็จแล้ว (Harvested Collection)
                          <span style={{ fontSize: '0.8rem', background: 'rgba(76, 175, 80, 0.15)', color: '#2e7d32', padding: '2px 10px', borderRadius: '12px', fontWeight: 700 }}>
                            {completedTasks.length} รายการ
                          </span>
                        </h3>
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(76, 175, 80, 0.3) 0%, transparent 100%)' }} />
                      </div>

                      <div style={containerStyle}>
                        {completedTasks.map(itemRenderer)}
                      </div>
                    </div>
                  )}
                </div>
              );
            } else if (groupBy === 'priority') {
              const highTasks = pendingTasks.filter(t => t.priority === 'High');
              const mediumTasks = pendingTasks.filter(t => t.priority === 'Medium');
              const lowTasks = pendingTasks.filter(t => t.priority === 'Low');

              const prioritySections = [
                { title: '🔴 งานความสำคัญสูง (High Priority)', tasks: highTasks, color: 'var(--priority-high)', bg: 'rgba(244, 63, 94, 0.12)' },
                { title: '🟡 งานความสำคัญกลาง (Medium Priority)', tasks: mediumTasks, color: 'var(--priority-medium)', bg: 'rgba(245, 158, 11, 0.12)' },
                { title: '🟢 งานความสำคัญต่ำ (Low Priority)', tasks: lowTasks, color: 'var(--priority-low)', bg: 'rgba(16, 185, 129, 0.12)' },
              ];

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  {prioritySections.map(sec => (
                    <div key={sec.title}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: sec.color, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {sec.title}
                          <span style={{ fontSize: '0.8rem', background: sec.bg, color: sec.color, padding: '2px 10px', borderRadius: '12px', fontWeight: 700 }}>
                            {sec.tasks.length} รายการ
                          </span>
                        </h3>
                        <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${sec.color}40 0%, transparent 100%)` }} />
                      </div>

                      {sec.tasks.length === 0 ? (
                        <div className="glass" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '14px', fontSize: '0.85rem' }}>
                          ไม่มีงานในระดับนี้
                        </div>
                      ) : (
                        <div style={containerStyle}>
                          {sec.tasks.map(itemRenderer)}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Completed Section */}
                  {completedTasks.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>✅</span> งานที่ทำเสร็จแล้ว
                          <span style={{ fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-teal)', padding: '2px 10px', borderRadius: '12px', fontWeight: 700 }}>
                            {completedTasks.length} รายการ
                          </span>
                        </h3>
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.3) 0%, transparent 100%)' }} />
                      </div>

                      <div style={containerStyle}>
                        {completedTasks.map(itemRenderer)}
                      </div>
                    </div>
                  )}
                </div>
              );
            } else {
              // GroupBy === 'none'
              return (
                <div style={containerStyle}>
                  {filteredTasks.map(itemRenderer)}
                </div>
              );
            }
          })()}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Plus size={20} color="var(--primary)" />
                สร้างงานชิ้นใหม่
              </h3>
              <button className="modal-close" onClick={() => setIsCreateOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label className="form-label">ชื่องาน (Task Title) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="เช่น ประชุมกลุ่มโครงงานพรุ่งนี้ หรือ ทำรายงานส่งอีกสามวัน"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">รายละเอียดงาน (Description) *</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="กรอกวัตถุประสงค์ หรือ สิ่งที่จำเป็นต้องส่ง..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">กำหนดส่ง (Deadline)</label>
                  <ThaiDateInput value={deadline} onChange={setDeadline} />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">ระดับความสำคัญ</label>
                  <div style={{ display: 'flex', gap: '0.5rem', height: '46px' }}>
                    {['Low', 'Medium', 'High'].map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setSelectedPriority(p)}
                        style={{
                          flex: 1,
                          borderRadius: '12px',
                          border: '1px solid',
                          borderColor: selectedPriority === p 
                            ? p === 'High' ? 'var(--priority-high)' : p === 'Medium' ? 'var(--priority-medium)' : 'var(--priority-low)'
                            : 'var(--border-glass)',
                          background: selectedPriority === p 
                            ? p === 'High' ? 'var(--priority-high-bg)' : p === 'Medium' ? 'var(--priority-medium-bg)' : 'var(--priority-low-bg)'
                            : 'rgba(255,255,255,0.02)',
                          color: selectedPriority === p
                            ? p === 'High' ? 'var(--priority-high)' : p === 'Medium' ? 'var(--priority-medium)' : 'var(--priority-low)'
                            : 'var(--text-muted)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          transition: 'var(--transition-smooth)'
                        }}
                      >
                        {p === 'High' ? 'สูง' : p === 'Medium' ? 'กลาง' : 'ต่ำ'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">⏱️ เวลาเป้าหมาย (นาที)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="เช่น 60 (1 ชม.) หรือ 120 (2 ชม.)"
                    value={targetTime}
                    onChange={(e) => setTargetTime(e.target.value)}
                    min="0"
                    style={{ height: '46px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">🌱 ความก้าวหน้าปัจจุบัน ({progress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    style={{ width: '100%', height: '46px', accentColor: '#4caf50' }}
                  />
                </div>
              </div>

              {/* AI Suggestion Area */}
              {aiSuggestion && (
                <div className="ai-suggest-banner" style={{ marginBottom: '1.5rem' }}>
                  <div className="ai-suggest-info">
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                      <Sparkles size={14} /> AI แนะนำระดับความสำคัญ: 
                      <span className={`badge badge-${aiSuggestion.priority.toLowerCase()}`}>
                        {aiSuggestion.priority === 'High' ? 'สูง' : aiSuggestion.priority === 'Medium' ? 'กลาง' : 'ต่ำ'}
                      </span>
                      {aiSuggestion.deadline && (
                        <span style={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: 700, marginLeft: '8px' }}>
                           📅 สกัดวันที่ (วัน/เดือน/ปี): {formatThaiDateLabel(aiSuggestion.deadline)}
                        </span>
                      )}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.3rem', lineHeight: 1.4 }}>
                      <strong>เหตุผล:</strong> {aiSuggestion.reason}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleAIAnalyze(false)}
                  disabled={aiLoading || !title.trim()}
                  style={{ color: 'var(--accent-purple)' }}
                >
                  {aiLoading ? (
                    <><Loader2 className="animate-spin" size={18} /> วิเคราะห์...</>
                  ) : (
                    <><BrainCircuit size={18} /> ให้ AI ช่วยคิดความสำคัญ</>
                  )}
                </button>

                <button type="submit" className="btn btn-primary">
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {isEditOpen && editingTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Edit2 size={20} color="var(--primary)" />
                แก้ไขข้อมูลงาน
              </h3>
              <button className="modal-close" onClick={() => { setIsEditOpen(false); setEditingTask(null); }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label className="form-label">ชื่องาน (Task Title) *</label>
                <input
                  type="text"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">รายละเอียดงาน (Description) *</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">กำหนดส่ง (Deadline)</label>
                  <ThaiDateInput value={editDeadline} onChange={setEditDeadline} />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">ระดับความสำคัญ</label>
                  <div style={{ display: 'flex', gap: '0.5rem', height: '46px' }}>
                    {['Low', 'Medium', 'High'].map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setEditPriority(p)}
                        style={{
                          flex: 1,
                          borderRadius: '12px',
                          border: '1px solid',
                          borderColor: editPriority === p 
                            ? p === 'High' ? 'var(--priority-high)' : p === 'Medium' ? 'var(--priority-medium)' : 'var(--priority-low)'
                            : 'var(--border-glass)',
                          background: editPriority === p 
                            ? p === 'High' ? 'var(--priority-high-bg)' : p === 'Medium' ? 'var(--priority-medium-bg)' : 'var(--priority-low-bg)'
                            : 'rgba(255,255,255,0.02)',
                          color: editPriority === p
                            ? p === 'High' ? 'var(--priority-high)' : p === 'Medium' ? 'var(--priority-medium)' : 'var(--priority-low)'
                            : 'var(--text-muted)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          transition: 'var(--transition-smooth)'
                        }}
                      >
                        {p === 'High' ? 'สูง' : p === 'Medium' ? 'กลาง' : 'ต่ำ'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">⏱️ เวลาเป้าหมาย (นาที)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="เช่น 60 (1 ชม.) หรือ 120 (2 ชม.)"
                    value={editTargetTime}
                    onChange={(e) => setEditTargetTime(e.target.value)}
                    min="0"
                    style={{ height: '46px' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">🌱 ความก้าวหน้าปัจจุบัน ({editProgress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editProgress}
                    onChange={(e) => setEditProgress(Number(e.target.value))}
                    style={{ width: '100%', height: '46px', accentColor: '#4caf50' }}
                  />
                </div>
              </div>

              {/* AI Suggestion Area for edit mode */}
              {editAiSuggestion && (
                <div className="ai-suggest-banner" style={{ marginBottom: '1.5rem' }}>
                  <div className="ai-suggest-info">
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                      <Sparkles size={14} /> AI แนะนำระดับความสำคัญ: 
                      <span className={`badge badge-${editAiSuggestion.priority.toLowerCase()}`}>
                        {editAiSuggestion.priority === 'High' ? 'สูง' : editAiSuggestion.priority === 'Medium' ? 'กลาง' : 'ต่ำ'}
                      </span>
                      {editAiSuggestion.deadline && (
                        <span style={{ fontSize: '0.8rem', color: '#2e7d32', fontWeight: 700, marginLeft: '8px' }}>
                           📅 สกัดวันที่ (วัน/เดือน/ปี): {formatThaiDateLabel(editAiSuggestion.deadline)}
                        </span>
                      )}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '0.3rem', lineHeight: 1.4 }}>
                      <strong>เหตุผล:</strong> {editAiSuggestion.reason}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleAIAnalyze(true)}
                  disabled={editAiLoading || !editTitle.trim()}
                  style={{ color: 'var(--accent-purple)' }}
                >
                  {editAiLoading ? (
                    <><Loader2 className="animate-spin" size={18} /> วิเคราะห์...</>
                  ) : (
                    <><BrainCircuit size={18} /> ให้ AI ช่วยวิเคราะห์ใหม่</>
                  )}
                </button>

                <button type="submit" className="btn btn-primary">
                  บันทึกงาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail View Modal Dialog */}
      {selectedDetailTask && (
        <TaskDetailModal 
          task={selectedDetailTask}
          onClose={() => setSelectedDetailTask(null)}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onToggleComplete={handleToggleComplete}
          onStartPomodoro={(t) => {
            if (setCurrentTab) setCurrentTab('pomodoro');
          }}
        />
      )}

      {/* Global Beautiful Custom Botanical Modal */}
      <CustomModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalState.onConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};

export default TaskList;
