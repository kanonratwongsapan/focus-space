import React, { useContext, useEffect, useState } from 'react';
import { TaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';
import { Award, Clock, ListTodo, Flame, CheckCircle, BarChart3, Check, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import WeeklyChart from './WeeklyChart';
import Scratchpad from './Scratchpad';

const Dashboard = ({ searchQuery, setCurrentTab }) => {
  const { stats, fetchStats, tasks, fetchTasks, updateTask } = useContext(TaskContext);
  const { user } = useContext(AuthContext);

  const [dragOverPending, setDragOverPending] = useState(false);
  const [dragOverCompleted, setDragOverCompleted] = useState(false);
  const [spotlightIdx, setSpotlightIdx] = useState(0);

  useEffect(() => {
    fetchStats();
    if (fetchTasks) {
      fetchTasks();
    }
  }, []);

  // Today's Focus Spotlight Task selection with Carousel List
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingTasksList = tasks?.filter(t => !t.completed) || [];
  const urgentTasksList = pendingTasksList.filter(t => 
    (t.deadline && t.deadline.split('T')[0] === todayStr) || t.priority === 'High'
  );
  const activeFocusList = urgentTasksList.length > 0 ? urgentTasksList : pendingTasksList;
  const safeIdx = Math.min(spotlightIdx, Math.max(0, activeFocusList.length - 1));
  const focusTask = activeFocusList[safeIdx];

  // Live stats calculation with automatic fallback from tasks array
  const totalTasks = stats?.total > 0 ? stats.total : (tasks?.length || 0);
  const completedTasks = (stats?.completed !== undefined && stats?.completed !== null && stats.total > 0) 
    ? stats.completed 
    : (tasks?.filter(t => t.completed)?.length || 0);
  const pendingTasks = (stats?.pending !== undefined && stats?.pending !== null && stats.total > 0) 
    ? stats.pending 
    : (tasks?.filter(t => !t.completed)?.length || 0);
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const highCount = (stats?.priorityCounts?.High !== undefined && stats.total > 0)
    ? stats.priorityCounts.High
    : (tasks?.filter(t => !t.completed && t.priority === 'High')?.length || 0);
  const mediumCount = (stats?.priorityCounts?.Medium !== undefined && stats.total > 0)
    ? stats.priorityCounts.Medium
    : (tasks?.filter(t => !t.completed && t.priority === 'Medium')?.length || 0);
  const lowCount = (stats?.priorityCounts?.Low !== undefined && stats.total > 0)
    ? stats.priorityCounts.Low
    : (tasks?.filter(t => !t.completed && t.priority === 'Low')?.length || 0);

  const totalPomodoroTime = stats?.totalPomodoroTime > 0 
    ? stats.totalPomodoroTime 
    : (tasks?.reduce((acc, t) => acc + Math.round((t.timeSpent || 0) / 60), 0) || 0);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (successRate / 100) * circumference;

  // Calculate percentages for priority chart
  const getPriorityPercentage = (count) => {
    if (!totalTasks) return 0;
    return Math.round((count / totalTasks) * 100);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
      <header style={{ marginBottom: '1.25rem' }}>
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
          <span>BOTANICAL GARDEN DASHBOARD 🌸</span>
        </div>
        <h1 className="page-title dashboard-page-title" style={{ marginBottom: '0.2rem', fontSize: '1.75rem', color: '#1b4332', fontWeight: 800 }}>
          ยินดีต้อนรับสู่สวนแห่งโฟกัส, {user?.username || 'ผู้ใช้งาน'}! 🌸🍃
        </h1>
        <p className="dashboard-page-subtitle" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
          นี่คือสรุปพัฒนาการ การเพาะปลูกภารกิจ และผลผลิตสมาธิของคุณในวันนี้ค่ะ
        </p>
      </header>

      {/* Grid: Stat Summary Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '1.25rem', gap: '1rem' }}>
        {/* Total Tasks Card */}
        <div className="dashboard-card glass dashboard-card-glow" style={{ padding: '1.15rem 1.35rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span className="stat-title" style={{ fontSize: '0.8rem', letterSpacing: '0.3px' }}>งานทั้งหมด</span>
            <div style={{ padding: '7px', borderRadius: '10px', background: 'rgba(138, 92, 245, 0.12)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ListTodo size={18} />
            </div>
          </div>
          <span className="stat-value" style={{ fontSize: '1.85rem' }}>{totalTasks} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>รายการ</span></span>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.6rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.4rem' }}>
            <span>⏳ ค้าง: <strong>{pendingTasks}</strong></span>
            <span>✅ เสร็จ: <strong>{completedTasks}</strong></span>
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="dashboard-card glass dashboard-card-glow" style={{ padding: '1.15rem 1.35rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span className="stat-title" style={{ fontSize: '0.8rem', letterSpacing: '0.3px' }}>อัตราความสำเร็จ</span>
            <div style={{ padding: '7px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={18} />
            </div>
          </div>
          <span className="stat-value" style={{ fontSize: '1.85rem' }}>{successRate}%</span>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '0.85rem', overflow: 'hidden' }}>
            <div style={{ width: `${successRate}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent-teal) 100%)', borderRadius: '3px', transition: 'width 0.6s ease-out' }}></div>
          </div>
        </div>

        {/* Pomodoro Timer Card */}
        <div className="dashboard-card glass dashboard-card-glow" style={{ padding: '1.15rem 1.35rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span className="stat-title" style={{ fontSize: '0.8rem', letterSpacing: '0.3px' }}>เวลาโฟกัสสะสม</span>
            <div style={{ padding: '7px', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.12)', color: 'var(--priority-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
          </div>
          <span className="stat-value" style={{ fontSize: '1.85rem' }}>{totalPomodoroTime} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>นาที</span></span>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.6rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>🍅 โฟกัสสำเร็จ: <strong>{Math.round(totalPomodoroTime / 25)} รอบ</strong></span>
          </div>
        </div>
      </div>

      {/* TODAY'S FOCUS SPOTLIGHT CAROUSEL WIDGET */}
      <div 
        className="glass"
        style={{
          marginBottom: '1.5rem',
          padding: '1.35rem 1.6rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(220, 252, 231, 0.75) 100%)',
          border: '1.5px solid rgba(76, 175, 80, 0.35)',
          boxShadow: '0 10px 30px rgba(76, 175, 80, 0.12), 0 0 15px rgba(255, 255, 255, 0.5) inset',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Top Leaf Accents */}
        <div style={{ position: 'absolute', right: '-15px', top: '-15px', fontSize: '4.5rem', opacity: 0.12, pointerEvents: 'none', userSelect: 'none' }}>
          🌿
        </div>

        {/* Top Bar Header & Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 3px 10px rgba(244, 63, 94, 0.3)'
            }}>
              <Flame size={14} color="white" /> ภารกิจต้องโฟกัสเร่งด่วนประจำวัน (Today's Focus)
            </span>

            {activeFocusList.length > 1 && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#2e7d32',
                background: 'rgba(76, 175, 80, 0.18)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                padding: '3px 10px',
                borderRadius: '12px'
              }}>
                🎯 งานที่ {safeIdx + 1} จากทั้งหมด {activeFocusList.length} งาน
              </span>
            )}
          </div>

          {/* Carousel Navigation Buttons */}
          {activeFocusList.length > 1 && (
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setSpotlightIdx((prev) => (prev - 1 + activeFocusList.length) % activeFocusList.length)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  background: 'rgba(255, 255, 255, 0.85)',
                  color: '#1b4332',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#4caf50';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                  e.currentTarget.style.color = '#1b4332';
                }}
                title="งานก่อนหน้า"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Dots indicator */}
              <div style={{ display: 'flex', gap: '4px', padding: '0 4px' }}>
                {activeFocusList.map((_, idx) => (
                  <span
                    key={idx}
                    onClick={() => setSpotlightIdx(idx)}
                    style={{
                      width: idx === safeIdx ? '16px' : '7px',
                      height: '7px',
                      borderRadius: '4px',
                      background: idx === safeIdx ? '#2e7d32' : 'rgba(76, 175, 80, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSpotlightIdx((prev) => (prev + 1) % activeFocusList.length)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                  background: 'rgba(255, 255, 255, 0.85)',
                  color: '#1b4332',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#4caf50';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
                  e.currentTarget.style.color = '#1b4332';
                }}
                title="งานถัดไป"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Task Content Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            {focusTask ? (
              <>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    background: focusTask.priority === 'High' ? 'rgba(244, 63, 94, 0.15)' : focusTask.priority === 'Medium' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: focusTask.priority === 'High' ? '#e11d48' : focusTask.priority === 'Medium' ? '#d97706' : '#2563eb'
                  }}>
                    {focusTask.priority === 'High' ? '🔴 ความสำคัญสูง' : focusTask.priority === 'Medium' ? '🟡 ความสำคัญกลาง' : '🟢 ความสำคัญต่ำ'}
                  </span>

                  {focusTask.deadline && (
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#2e7d32', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Calendar size={12} color="#4caf50" /> {new Date(focusTask.deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>

                <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#1b4332', letterSpacing: '0.2px' }}>
                  {focusTask.title}
                </h3>

                {focusTask.description && (
                  <p style={{ margin: '0 0 0.65rem 0', fontSize: '0.84rem', color: '#475569', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                    {focusTask.description}
                  </p>
                )}

                {/* Botanical Progress Bar */}
                <div style={{ width: '100%', maxWidth: '420px', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#2e7d32', fontWeight: 700, marginBottom: '3px' }}>
                    <span>🌱 ความก้าวหน้า: {focusTask.progress || 0}%</span>
                    {focusTask.targetTime > 0 && (
                      <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                        ⏱️ ใช้ไป {Math.round((focusTask.timeSpent || 0) / 60)} / {focusTask.targetTime} นาที
                      </span>
                    )}
                  </div>
                  <div style={{ width: '100%', height: '7px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${focusTask.progress || 0}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #81c784 0%, #2e7d32 100%)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              </>
            ) : (
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#2e7d32', fontWeight: 700 }}>
                🌸 แปลงเพาะปลูกในสวนเป็นระเบียบเรียบร้อยแล้ว ไม่มีภารกิจค้างส่งในขณะนี้!
              </p>
            )}
          </div>

          {focusTask && (
            <button
              onClick={() => {
                if (setCurrentTab) setCurrentTab('pomodoro');
              }}
              style={{
                background: 'linear-gradient(135deg, #4caf50 0%, #1b4332 100%)',
                color: 'white',
                border: 'none',
                padding: '0.85rem 1.6rem',
                borderRadius: '16px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                boxShadow: '0 8px 22px rgba(76, 175, 80, 0.35)',
                transition: 'var(--transition-smooth)',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Clock size={18} /> 🍅 เริ่มจับเวลาโฟกัสงานนี้
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout Detail: Priorities vs Circular Gauge */}
      <div className="dashboard-grid-detail">
        {/* Left: Detailed Priority breakdown */}
        <div className="dashboard-card glass" style={{ padding: '1.35rem 1.5rem', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 700 }}>
            <BarChart3 size={18} color="var(--primary)" />
            สถิติตามลำดับความสำคัญของงาน (Priority)
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
            แผนภูมิแสดงการจำแนกความสำคัญของงานค้างในระบบ เพื่อช่วยให้จัดลำดับการทำงานได้เหมาะสมค่ะ
          </p>

          <div className="priority-bar-container">
            {/* High Priority Bar */}
            <div className="priority-bar-item">
              <div className="priority-bar-label">
                <span style={{ color: 'var(--priority-high)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  🔴 ความสำคัญสูง (High)
                </span>
                <span style={{ color: 'var(--text-main)' }}>
                  <strong>{highCount}</strong> งาน ({getPriorityPercentage(highCount)}%)
                </span>
              </div>
              <div className="priority-bar-bg">
                <div 
                  className="priority-bar-fill" 
                  style={{ 
                    width: `${getPriorityPercentage(highCount)}%`, 
                    background: 'var(--priority-high)' 
                  }}
                />
              </div>
            </div>

            {/* Medium Priority Bar */}
            <div className="priority-bar-item">
              <div className="priority-bar-label">
                <span style={{ color: 'var(--priority-medium)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  🟡 ความสำคัญปานกลาง (Medium)
                </span>
                <span style={{ color: 'var(--text-main)' }}>
                  <strong>{mediumCount}</strong> งาน ({getPriorityPercentage(mediumCount)}%)
                </span>
              </div>
              <div className="priority-bar-bg">
                <div 
                  className="priority-bar-fill" 
                  style={{ 
                    width: `${getPriorityPercentage(mediumCount)}%`, 
                    background: 'var(--priority-medium)' 
                  }}
                />
              </div>
            </div>

            {/* Low Priority Bar */}
            <div className="priority-bar-item">
              <div className="priority-bar-label">
                <span style={{ color: 'var(--priority-low)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  🔵 ความสำคัญต่ำ/ทั่วไป (Low)
                </span>
                <span style={{ color: 'var(--text-main)' }}>
                  <strong>{lowCount}</strong> งาน ({getPriorityPercentage(lowCount)}%)
                </span>
              </div>
              <div className="priority-bar-bg">
                <div 
                  className="priority-bar-fill" 
                  style={{ 
                    width: `${getPriorityPercentage(lowCount)}%`, 
                    background: 'var(--priority-low)' 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Circular Progress Gauge */}
        <div className="dashboard-card glass" style={{ padding: '1.35rem 1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '0.35rem', width: '100%', fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} color="var(--accent-teal)" />
            ความคืบหน้ารวม
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', width: '100%', marginBottom: '1.25rem' }}>
            อัตราความสำเร็จของงานทั้งหมดในระบบ Focus Space
          </p>
          
          <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ transform: 'rotate(-90deg)', width: '160px', height: '160px' }}>
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="url(#progressGradient)"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--accent-teal)" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '1.85rem', fontWeight: 700, fontFamily: 'var(--font-accent)', color: 'var(--text-main)' }}>
                {successRate}%
              </span>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>เสร็จสิ้น</p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Weekly Productivity Analytics Chart */}
      <WeeklyChart tasks={tasks} />

      {/* Quick Scratchpad Note Widget */}
      <div style={{ marginBottom: '2.5rem' }}>
        <Scratchpad />
      </div>

      {/* Drag & Drop Botanical Task Board Section */}
      <div style={{ marginTop: '2.5rem', textAlign: 'left' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: '#1b4332', fontWeight: 800 }}>
            <ListTodo size={22} color="#2e7d32" />
            แปลงงานปลูกในสวน (Botanical Garden Task Board) 🌸🌱
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            คุณสามารถลากการ์ดงาน (Drag & Drop) เพื่อสลับแปลงระหว่าง "🌱 แปลงกำลังเพาะปลูก" และ "🌸 เก็บเกี่ยวสำเร็จแล้ว" ได้โดยตรงเลยค่ะ
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          
          {/* Column Left: Pending Tasks */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOverPending(true); }}
            onDragLeave={() => setDragOverPending(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setDragOverPending(false);
              const id = e.dataTransfer.getData('text/plain');
              if (id) {
                await updateTask(id, { completed: false });
                fetchStats();
              }
            }}
            style={{
              background: dragOverPending ? 'rgba(76, 175, 80, 0.12)' : 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              border: dragOverPending ? '2px dashed #4caf50' : '1px solid rgba(76, 175, 80, 0.25)',
              borderRadius: '20px',
              padding: '1.25rem',
              minHeight: '320px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.03)',
              transition: 'var(--transition-smooth)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(76, 175, 80, 0.15)' }}>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#1b4332', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>🌱 แปลงกำลังเพาะปลูก</span>
              </h4>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, background: 'rgba(76, 175, 80, 0.15)', color: '#2e7d32', padding: '3px 10px', borderRadius: '12px' }}>
                {tasks?.filter(t => !t.completed).filter(t => {
                  const query = (searchQuery || '').toLowerCase();
                  return t.title.toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query));
                }).length || 0} รายการ
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks && tasks.filter(t => !t.completed).filter(t => {
                const query = (searchQuery || '').toLowerCase();
                return t.title.toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query));
              }).length === 0 ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', border: '1px dashed rgba(76, 175, 80, 0.2)', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.4)' }}>
                  🌱 แปลงเพาะปลูกนี้ว่างอยู่ พร้อมรับงานใหม่ค่ะ!
                </div>
              ) : (
                tasks && tasks.filter(t => !t.completed).filter(t => {
                  const query = (searchQuery || '').toLowerCase();
                  return t.title.toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query));
                }).map(t => (
                  <div
                    key={t._id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', t._id);
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid rgba(76, 175, 80, 0.2)',
                      borderLeft: `5px solid ${t.priority === 'High' ? '#f43f5e' : t.priority === 'Medium' ? '#f59e0b' : '#3b82f6'}`,
                      borderRadius: '14px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'grab',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(76, 175, 80, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.04)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                      <div 
                        onClick={async () => {
                          await updateTask(t._id, { completed: true });
                          fetchStats();
                        }}
                        title="คลิกเพื่อทำเครื่องหมายว่าเสร็จสิ้นแล้ว"
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: '2px solid rgba(76, 175, 80, 0.4)',
                          background: '#ffffff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2e7d32'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(76, 175, 80, 0.4)'}
                      />
                      <div style={{ textAlign: 'left', minWidth: 0, paddingRight: '0.5rem' }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#1b4332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.title}
                        </p>
                        {t.deadline && (
                          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                            <Calendar size={11} color="#4caf50" /> {new Date(t.deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '10px',
                        background: 'rgba(76, 175, 80, 0.15)',
                        color: '#2e7d32'
                      }}>
                        🌱 {t.progress || 0}%
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '10px',
                        background: t.priority === 'High' ? 'rgba(244, 63, 94, 0.12)' : t.priority === 'Medium' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                        color: t.priority === 'High' ? '#e11d48' : t.priority === 'Medium' ? '#d97706' : '#2563eb'
                      }}>
                        {t.priority === 'High' ? '🔴 สูง' : t.priority === 'Medium' ? '🟡 กลาง' : '🔵 ต่ำ'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column Right: Completed Tasks */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOverCompleted(true); }}
            onDragLeave={() => setDragOverCompleted(false)}
            onDrop={async (e) => {
              e.preventDefault();
              setDragOverCompleted(false);
              const id = e.dataTransfer.getData('text/plain');
              if (id) {
                await updateTask(id, { completed: true });
                fetchStats();
              }
            }}
            style={{
              background: dragOverCompleted ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              border: dragOverCompleted ? '2px dashed #10b981' : '1px solid rgba(76, 175, 80, 0.25)',
              borderRadius: '20px',
              padding: '1.25rem',
              minHeight: '320px',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.03)',
              transition: 'var(--transition-smooth)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(76, 175, 80, 0.15)' }}>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#1b4332', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>🌸 เก็บเกี่ยวสำเร็จแล้ว</span>
              </h4>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, background: 'rgba(16, 185, 129, 0.15)', color: '#059669', padding: '3px 10px', borderRadius: '12px' }}>
                {tasks?.filter(t => t.completed).filter(t => {
                  const query = (searchQuery || '').toLowerCase();
                  return t.title.toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query));
                }).length || 0} รายการ
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks && tasks.filter(t => t.completed).filter(t => {
                const query = (searchQuery || '').toLowerCase();
                return t.title.toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query));
              }).length === 0 ? (
                <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', border: '1px dashed rgba(76, 175, 80, 0.2)', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.4)' }}>
                  🌸 ยังไม่มีผลผลิตที่เก็บเกี่ยวในแปลงนี้ค่ะ!
                </div>
              ) : (
                tasks && tasks.filter(t => t.completed).filter(t => {
                  const query = (searchQuery || '').toLowerCase();
                  return t.title.toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query));
                }).map(t => (
                  <div
                    key={t._id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', t._id);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.85)',
                      border: '1px solid rgba(76, 175, 80, 0.18)',
                      borderRadius: '14px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'grab',
                      opacity: 0.85,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                      transition: 'all 0.2s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.85';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                      <div 
                        onClick={async () => {
                          await updateTask(t._id, { completed: false });
                          fetchStats();
                        }}
                        title="คลิกเพื่อยกเลิกการทำเสร็จ"
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          border: '2px solid #10b981',
                          background: '#10b981',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Check size={12} color="white" />
                      </div>
                      <div style={{ textAlign: 'left', minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: '#64748b', textDecoration: 'line-through', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.title}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#059669', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                      🌸 สำเร็จ
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
