import React, { useContext } from 'react';
import { 
  X, Calendar, Edit2, Trash2, Clock, Flame, CheckCircle2, 
  Tag, Timer, Sparkles, Check, AlertTriangle 
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const TaskDetailModal = ({ task, onClose, onEdit, onDelete, onToggleComplete, onStartPomodoro }) => {
  const { user } = useContext(AuthContext);

  if (!task) return null;

  const isHigh = task.priority === 'High';
  const isMedium = task.priority === 'Medium';
  const priorityColor = isHigh ? 'var(--priority-high)' : isMedium ? 'var(--priority-medium)' : 'var(--priority-low)';
  const priorityBg = isHigh ? 'var(--priority-high-bg)' : isMedium ? 'var(--priority-medium-bg)' : 'var(--priority-low-bg)';

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const extractTags = (t) => {
    const titleTags = (t.title.match(/#[\w\u0E00-\u0E7F]+/g) || []).map(tag => tag.substring(1));
    const descTags = ((t.description || '').match(/#[\w\u0E00-\u0E7F]+/g) || []).map(tag => tag.substring(1));
    return Array.from(new Set([...titleTags, ...descTags]));
  };

  const tags = extractTags(task);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div 
        className="modal-content glass" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '92%',
          padding: '1.75rem',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), 0 0 30px rgba(138, 92, 245, 0.15)',
          color: 'var(--text-main)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span 
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '3px 10px', 
                  borderRadius: '10px',
                  fontWeight: 700,
                  background: priorityBg,
                  color: priorityColor,
                  border: `1px solid ${priorityColor}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isHigh ? '🔴 ความสำคัญสูง' : isMedium ? '🟡 ความสำคัญกลาง' : '🟢 ความสำคัญต่ำ'}
              </span>

              <span 
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '3px 10px', 
                  borderRadius: '10px',
                  fontWeight: 700,
                  background: task.completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: task.completed ? 'var(--accent-teal)' : 'var(--priority-medium)',
                  border: task.completed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {task.completed ? '✅ เสร็จสมบูรณ์แล้ว' : '⏳ ค้างดำเนินการ'}
              </span>
            </div>
            
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3, textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.75 : 1 }}>
              {task.title}
            </h2>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-muted)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'var(--transition-smooth)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Task Description */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem', fontWeight: 700 }}>
            รายละเอียดงาน
          </h4>
          <div style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-glass)',
            borderRadius: '14px',
            padding: '1rem',
            fontSize: '0.92rem',
            lineHeight: 1.6,
            color: 'var(--text-main)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {task.description ? task.description : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>ไม่ได้ระบุรายละเอียดงาน</span>}
          </div>
        </div>

        {/* AI Priority Analysis Reason */}
        {task.aiReason && (
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.82rem', color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={16} /> ผลวิเคราะห์ความสำคัญจาก AI
            </h4>
            <div style={{
              background: 'rgba(138, 92, 245, 0.1)',
              border: '1px solid rgba(138, 92, 245, 0.25)',
              borderRadius: '14px',
              padding: '0.85rem 1rem',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              color: 'var(--accent-purple)',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{task.aiReason}</span>
            </div>
          </div>
        )}

        {/* Botanical Progress Bar Section */}
        <div style={{ marginBottom: '1.25rem', background: 'var(--bg-input)', border: '1px solid var(--border-glass)', padding: '0.85rem 1rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              🌱 ความก้าวหน้าภารกิจ: <span style={{ color: task.completed ? '#4caf50' : '#2e7d32' }}>{task.completed ? '100% (เสร็จสิ้นแล้ว)' : `${task.progress || 0}%`}</span>
            </span>
            {task.targetTime > 0 && (
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ⏱️ ใช้ไป {Math.round((task.timeSpent || 0) / 60)} จากเป้าหมาย {task.targetTime} นาที
              </span>
            )}
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${task.completed ? 100 : (task.progress || 0)}%`,
              height: '100%',
              background: task.completed ? '#4caf50' : 'linear-gradient(90deg, #81c784 0%, #388e3c 100%)',
              borderRadius: '4px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
          {/* Deadline Box */}
          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-glass)', padding: '0.75rem 1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={20} color="var(--accent-teal)" />
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>กำหนดส่ง (Deadline)</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {task.deadline ? formatDate(task.deadline) : 'ไม่ได้ระบุ'}
              </span>
            </div>
          </div>

          {/* Pomodoro Focus Time Box */}
          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-glass)', padding: '0.75rem 1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={20} color="var(--priority-high)" />
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>เวลาโฟกัสสะสม</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {task.timeSpent > 0 ? `${Math.max(1, Math.round(task.timeSpent / 60))} นาที (${task.pomodoroCycles || 0} รอบ)` : 'ยังไม่มีเวลาบันทึก'}
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.4rem', fontWeight: 700 }}>
              ป้ายแฮชแท็ก (#Hashtags)
            </h4>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {tags.map((tag, idx) => (
                <span 
                  key={idx}
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '8px',
                    background: 'rgba(138, 92, 245, 0.15)',
                    color: 'var(--accent-purple)',
                    border: '1px solid rgba(138, 92, 245, 0.3)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                onToggleComplete(task);
                onClose();
              }}
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            >
              <Check size={16} />
              {task.completed ? 'ทำเป็นงานค้าง' : 'ทำเสร็จแล้ว'}
            </button>

            {onStartPomodoro && !task.completed && (
              <button 
                className="btn btn-primary"
                onClick={() => {
                  onStartPomodoro(task);
                  onClose();
                }}
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
              >
                <Timer size={16} />
                เริ่มโฟกัสงานนี้
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!task.completed && (
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  onEdit(task);
                  onClose();
                }}
                style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
              >
                <Edit2 size={16} />
                แก้ไข
              </button>
            )}

            <button 
              className="btn btn-secondary"
              onClick={() => {
                onDelete(task._id);
                onClose();
              }}
              style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem', color: 'var(--priority-high)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            >
              <Trash2 size={16} />
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
