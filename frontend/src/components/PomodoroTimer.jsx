import React, { useContext, useState } from 'react';
import { TaskContext } from '../context/TaskContext';
import { PomodoroContext } from '../context/PomodoroContext';
import { Play, Pause, RotateCcw, AlertCircle, Bell, BellOff, Check, Target, Settings, Sparkles } from 'lucide-react';
import Scratchpad from './Scratchpad';

const PomodoroTimer = () => {
  const taskCtx = useContext(TaskContext) || {};
  const tasks = taskCtx.tasks || [];
  const updateTask = taskCtx.updateTask || (async () => {});

  const pomodoroCtx = useContext(PomodoroContext) || {};
  const {
    minutes = 25,
    seconds = 0,
    isActive = false,
    isBreak = false,
    selectedTaskId = '',
    setSelectedTaskId = () => {},
    workDuration = 25,
    setWorkDuration = () => {},
    breakDuration = 5,
    setBreakDuration = () => {},
    toggleTimer = () => {},
    resetTimer = () => {},
    notifyPermission = 'default',
    requestNotificationPermission = () => {},
    sessionSummary = null,
    setSessionSummary = () => {},
    breakSummary = false,
    setBreakSummary = () => {}
  } = pomodoroCtx;

  // Botanical Plant Growth State
  const [selectedFlower, setSelectedFlower] = useState('sunflower');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [taskCompletionSummary, setTaskCompletionSummary] = useState(null);

  const getFlowerEmoji = (flowerId) => {
    switch (flowerId) {
      case 'daisy': return '🌼 ดอกเดซี่';
      case 'tulip': return '🌷 ดอกทิวลิป';
      case 'sakura': return '🌸 ดอกซากุระ';
      case 'pine': return '🌲 ต้นสน';
      default: return '🌻 ดอกทานตะวัน';
    }
  };

  const getPlantStageEmoji = (mins, secs, totalMins, flowerId) => {
    const m = typeof mins === 'number' && !isNaN(mins) ? mins : 25;
    const s = typeof secs === 'number' && !isNaN(secs) ? secs : 0;
    const t = typeof totalMins === 'number' && !isNaN(totalMins) && totalMins > 0 ? totalMins : 25;
    const totalSecs = t * 60;
    const currentSecs = m * 60 + s;
    const ratio = 1 - (currentSecs / (totalSecs || 1500));

    if (ratio <= 0.05) return '🌱'; // Seedling
    if (ratio <= 0.35) return '🌿'; // Sprouting Leaf
    if (ratio <= 0.75) return '🌷'; // Budding
    
    switch (flowerId) {
      case 'daisy': return '🌼';
      case 'tulip': return '🌷';
      case 'sakura': return '🌸';
      case 'pine': return '🌲';
      default: return '🌻';
    }
  };

  const getPlantStageText = (mins, secs, totalMins) => {
    const m = typeof mins === 'number' && !isNaN(mins) ? mins : 25;
    const s = typeof secs === 'number' && !isNaN(secs) ? secs : 0;
    const t = typeof totalMins === 'number' && !isNaN(totalMins) && totalMins > 0 ? totalMins : 25;
    const totalSecs = t * 60;
    const currentSecs = m * 60 + s;
    const ratio = 1 - (currentSecs / (totalSecs || 1500));

    if (ratio <= 0.05) return '🌱 เริ่มหว่านเมล็ดพันธุ์';
    if (ratio <= 0.35) return '🌿 ต้นกล้าเริ่มแตกใบ';
    if (ratio <= 0.75) return '🌷 ตาดอกเริ่มก่อตัว';
    return '🌸 ดอกไม้เบ่งบานสมบูรณ์!';
  };

  const formatTime = (mins, secs) => {
    const m = typeof mins === 'number' && !isNaN(mins) ? mins : 25;
    const s = typeof secs === 'number' && !isNaN(secs) ? secs : 0;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectTask = (taskId) => {
    if (isActive) return;
    if (typeof setSelectedTaskId === 'function') {
      setSelectedTaskId(prevId => prevId === taskId ? '' : taskId);
    }
  };

  const pendingTasks = (tasks || []).filter(t => t && !t.completed);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
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
          <span>BOTANICAL GARDEN TIMER 🌸</span>
        </div>

        <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: '0.2rem', color: '#1b4332', fontWeight: 800 }}>
          นาฬิกาปลูกดอกไม้ Pomodoro 🍅🌱
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
          เลือกพันธุ์ไม้แล้วเริ่มโฟกัส 25 นาที เพื่อฟูมฟักให้ดอกไม้ของคุณเบ่งบานสมบูรณ์ค่ะ
        </p>
      </header>

      {/* Task Completion Celebration overlay modal */}
      {taskCompletionSummary && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div className="glass" style={{ maxWidth: '420px', textAlign: 'center', padding: '2rem', background: '#ffffff', borderRadius: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(76, 175, 80, 0.15)',
              color: '#2e7d32',
              marginBottom: '1rem'
            }}>
              <Check size={26} />
            </div>
            <h2 style={{ color: '#1b4332', marginBottom: '1rem', fontWeight: 800 }}>🎉 ภารกิจเสร็จสิ้น!</h2>
            <p style={{ marginBottom: '1.5rem', lineHeight: 1.6, fontSize: '0.9rem', color: '#475569' }}>
              ทำเครื่องหมายงาน **"{taskCompletionSummary.title}"** ว่าเสร็จสิ้นแล้ว! <br/>
              ใช้เวลาโฟกัสไปทั้งสิ้น <strong>{taskCompletionSummary.minutes} นาที</strong> 🌸
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => setTaskCompletionSummary(null)} 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)', color: 'white', fontWeight: 700 }}
            >
              ยอดเยี่ยมมาก!
            </button>
          </div>
        </div>
      )}

      {/* Two Columns Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Left: Pomodoro Timer Card */}
        <div className="glass pomodoro-container" style={{ padding: '1.75rem 1.5rem', textAlign: 'center' }}>
          
          {/* Settings Section */}
          <div className="timer-settings-card" style={{ width: '100%', textAlign: 'left', marginBottom: '1rem' }}>
            <h4 className="timer-settings-title" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1b4332', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
              <Settings size={16} color="#2e7d32" /> ตั้งค่าเวลาทำงานและเวลาพัก (นาที)
            </h4>
            <div className="timer-settings-inputs" style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="setting-input-wrapper" style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>เวลาทำงาน</span>
                <input 
                  type="number" 
                  min="1" 
                  max="180" 
                  className="form-input timer-setting-input" 
                  value={workDuration} 
                  disabled={isActive}
                  onChange={(e) => typeof setWorkDuration === 'function' && setWorkDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '10px', border: '1px solid var(--border-glass)', background: '#ffffff', color: '#1b4332' }}
                />
              </div>
              <div className="setting-input-wrapper" style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>เวลาพักผ่อน</span>
                <input 
                  type="number" 
                  min="1" 
                  max="60" 
                  className="form-input timer-setting-input" 
                  value={breakDuration} 
                  disabled={isActive}
                  onChange={(e) => typeof setBreakDuration === 'function' && setBreakDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '10px', border: '1px solid var(--border-glass)', background: '#ffffff', color: '#1b4332' }}
                />
              </div>
            </div>
          </div>

          {/* Botanical Plant Species Selector */}
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', width: '100%', marginBottom: '2px' }}>
              🪴 เลือกพันธุ์ไม้ที่ต้องการปลูก:
            </span>
            {[
              { id: 'daisy', name: 'เดซี่ 🌼' },
              { id: 'tulip', name: 'ทิวลิป 🌷' },
              { id: 'sunflower', name: 'ทานตะวัน 🌻' },
              { id: 'sakura', name: 'ซากุระ 🌸' },
              { id: 'pine', name: 'ต้นสน 🌲' }
            ].map(flower => (
              <button
                key={flower.id}
                type="button"
                onClick={() => setSelectedFlower(flower.id)}
                disabled={isActive}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: selectedFlower === flower.id ? '1px solid #4caf50' : '1px solid var(--border-glass)',
                  background: selectedFlower === flower.id ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                  color: selectedFlower === flower.id ? '#2e7d32' : 'var(--text-muted)',
                  cursor: isActive ? 'not-allowed' : 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {flower.name}
              </button>
            ))}
          </div>

          {/* Status label with Plant Growing Indicator */}
          <h2 style={{ marginBottom: '0.75rem', fontSize: '1.15rem', color: isBreak ? '#10b981' : '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {isBreak ? '☕ ช่วงพักผ่อนรดน้ำสวน' : `🎯 กำลังโฟกัสปลูก: ${getFlowerEmoji(selectedFlower)}`}
          </h2>
 
          {/* Botanical Interactive Plant Pot Ring */}
          <div 
            className="timer-circle" 
            style={{ 
              borderColor: isBreak ? '#10b981' : '#2e7d32', 
              width: '180px', 
              height: '180px', 
              margin: '0 auto 1rem auto',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ffffff 0%, #eef7f2 100%)',
              border: '4px solid #4caf50',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(76, 175, 80, 0.25)'
            }}
          >
            {/* Animated Growing Plant Stage Emoji */}
            <div style={{ fontSize: '2rem', animation: isActive ? 'pulse 2s infinite' : 'none', marginBottom: '2px' }}>
              {isBreak ? '☕' : getPlantStageEmoji(minutes, seconds, workDuration, selectedFlower)}
            </div>

            <span className="timer-display" style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1b4332' }}>
              {formatTime(minutes, seconds)}
            </span>

            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginTop: '2px' }}>
              {isBreak ? 'ผ่อนคลายในสวน 🌿' : getPlantStageText(minutes, seconds, workDuration)}
            </span>
          </div>
 
          {/* Timer Controls */}
          <div className="timer-controls" style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={toggleTimer}
              style={{ 
                background: isActive ? '#d97706' : 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                width: '130px',
                padding: '0.7rem 1rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}
            >
              {isActive ? <Pause size={18} /> : <Play size={18} />}
              {isActive ? 'หยุดชั่วคราว' : 'เริ่มโฟกัส'}
            </button>
            
            <button 
              type="button"
              className="btn btn-secondary" 
              onClick={resetTimer}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid var(--border-glass)',
                borderRadius: '14px',
                padding: '0.7rem 1rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <RotateCcw size={18} />
              รีเซ็ต
            </button>
          </div>

          {selectedTaskId && (
            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#2e7d32', textAlign: 'center', justifyContent: 'center', fontWeight: 600 }}>
              <AlertCircle size={14} />
              <span>งานเชื่อมโยง: "{(tasks || []).find(t => t._id === selectedTaskId)?.title || 'ไม่พบชื่อภารกิจ'}"</span>
            </div>
          )}
        </div>
 
        {/* Right: Tasks Selection Box */}
        <div className="glass" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1b4332', fontSize: '1.05rem' }}>
            <Target size={20} color="#2e7d32" />
            เลือกงานเพื่อเริ่มโฟกัส
          </h3>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: 1.5 }}>
            {isActive 
              ? '🔒 ระบบกำลังนับเวลาโฟกัสอยู่ ไม่สามารถเปลี่ยนหรือทำเครื่องหมายงานเสร็จได้' 
              : '👇 กดเลือกงานด้านล่างเพื่อผูกเวลา หรือคลิกกล่องสี่เหลี่ยมเพื่อทำเครื่องหมายเสร็จสิ้นได้เลยค่ะ'}
          </p>

          {/* Priority filter dropdown */}
          <div style={{ marginBottom: '1rem' }}>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="filter-select"
              style={{ width: '100%', padding: '0.65rem 0.75rem', fontSize: '0.85rem', borderRadius: '12px', background: '#ffffff', border: '1px solid var(--border-glass)', color: '#1b4332' }}
            >
              <option value="all">ความสำคัญ: ทั้งหมด</option>
              <option value="High">ความสำคัญ: สูง / งานด่วน 🔴</option>
              <option value="Medium">ความสำคัญ: กลาง 🟡</option>
              <option value="Low">ความสำคัญ: ต่ำ 🔵</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', overflowY: 'auto', maxHeight: '340px', paddingRight: '4px' }}>
            {pendingTasks.filter(t => priorityFilter === 'all' || t.priority === priorityFilter).length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', border: '1px dashed var(--border-glass)', borderRadius: '14px' }}>
                ไม่มีงานรอดำเนินการที่ตรงกับตัวกรองนี้ค่ะ 🌸
              </div>
            ) : (
              pendingTasks
                .filter(t => priorityFilter === 'all' || t.priority === priorityFilter)
                .map(task => {
                  const isSelected = selectedTaskId === task._id;
                  return (
                    <div
                      key={task._id}
                      onClick={() => handleSelectTask(task._id)}
                      style={{
                        padding: '0.75rem 0.9rem',
                        borderRadius: '14px',
                        border: isSelected ? '2px solid #4caf50' : '1px solid var(--border-glass)',
                        background: isSelected ? 'rgba(76, 175, 80, 0.12)' : '#ffffff',
                        boxShadow: isSelected ? '0 4px 14px rgba(76, 175, 80, 0.15)' : 'none',
                        cursor: isActive ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'var(--transition-smooth)',
                        opacity: isActive && !isSelected ? 0.5 : 1
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                        <div 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (isActive) return;
                            if (typeof updateTask === 'function') {
                              await updateTask(task._id, { completed: true });
                            }
                            if (selectedTaskId === task._id && typeof setSelectedTaskId === 'function') {
                              setSelectedTaskId('');
                            }
                            setTaskCompletionSummary({
                              title: task.title,
                              minutes: Math.max(1, Math.round((task.timeSpent || 0) / 60)),
                              cycles: task.pomodoroCycles || 1
                            });
                          }}
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '6px',
                            border: '2px solid rgba(76, 175, 80, 0.4)',
                            cursor: isActive ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', overflow: 'hidden', textAlign: 'left' }}>
                          <span style={{ 
                            fontWeight: isSelected ? 700 : 600, 
                            color: isSelected ? '#1b4332' : '#334155',
                            fontSize: '0.88rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {task.title}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ระดับความสำคัญ: {task.priority === 'High' ? 'สูง' : task.priority === 'Medium' ? 'กลาง' : 'ต่ำ'}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '10px',
                          background: '#2e7d32',
                          color: '#ffffff',
                          flexShrink: 0,
                          marginLeft: '0.5rem'
                        }}>
                          🎯 ผูกเวลานี้
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '10px',
                          background: task.priority === 'High' ? 'rgba(244, 63, 94, 0.12)' : task.priority === 'Medium' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                          color: task.priority === 'High' ? '#e11d48' : task.priority === 'Medium' ? '#d97706' : '#2563eb',
                          flexShrink: 0,
                          marginLeft: '0.5rem'
                        }}>
                          {task.priority === 'High' ? '🔴 สูง' : task.priority === 'Medium' ? '🟡 กลาง' : '🔵 ต่ำ'}
                        </span>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>

      {/* Quick Scratchpad Notes Widget for Pomodoro Sessions */}
      <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
        <Scratchpad compact={true} />
      </div>
    </div>
  );
};

export default PomodoroTimer;
