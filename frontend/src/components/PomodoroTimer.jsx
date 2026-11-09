import React, { useContext, useState, useEffect } from 'react';
import { TaskContext } from '../context/TaskContext';
import { PomodoroContext } from '../context/PomodoroContext';
import { 
  Play, Pause, RotateCcw, AlertCircle, Bell, BellOff, Check, Target, 
  Settings, Sparkles, Maximize2, Minimize2, X 
} from 'lucide-react';
import Scratchpad from './Scratchpad';
import BotanicalPlant, { PLANT_SPECIES, getStageFromRatio } from './BotanicalPlant';
import GuardianPet, { GUARDIAN_SPECIES } from './GuardianPet';

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

  // Botanical Plant & Mythical Guardian Growth State
  const [selectedFlower, setSelectedFlower] = useState(() => {
    return localStorage.getItem('focus_selectedFlower') || 'sunflower';
  });
  const [companionCategory, setCompanionCategory] = useState(() => {
    const saved = localStorage.getItem('focus_selectedFlower');
    if (saved && GUARDIAN_SPECIES.some(g => g.id === saved)) {
      return 'guardians';
    }
    return 'plants';
  });
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [taskCompletionSummary, setTaskCompletionSummary] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleSelectFlower = (id) => {
    if (isActive) return;
    setSelectedFlower(id);
    localStorage.setItem('focus_selectedFlower', id);
  };

  // Enter Full Screen Helper (Browser Fullscreen API + CSS Overlay Fallback)
  const enterFullScreen = () => {
    setIsFullScreen(true);
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullScreen(true))
        .catch(() => setIsFullScreen(true));
    }
  };

  // Exit Full Screen Helper
  const exitFullScreen = () => {
    setIsFullScreen(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen()
        .then(() => setIsFullScreen(false))
        .catch(() => setIsFullScreen(false));
    }
  };

  // Toggle Full Screen Helper (Manual button)
  const toggleFullScreen = () => {
    if (isFullScreen || document.fullscreenElement) {
      exitFullScreen();
    } else {
      enterFullScreen();
    }
  };

  // Start Focus / Toggle Timer with Auto Fullscreen
  const handleToggleTimer = () => {
    const willStart = !isActive;
    toggleTimer();
    if (willStart) {
      enterFullScreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Calculate Growth Stage (1 to 4)
  const totalMins = isBreak ? breakDuration : workDuration;
  const totalSecs = (totalMins > 0 ? totalMins : 25) * 60;
  const currentSecs = (typeof minutes === 'number' ? minutes : 25) * 60 + (typeof seconds === 'number' ? seconds : 0);
  const growthRatio = Math.max(0, Math.min(1, 1 - (currentSecs / (totalSecs || 1500))));
  const currentStage = getStageFromRatio(growthRatio);

  const isGuardian = GUARDIAN_SPECIES.some(g => g.id === selectedFlower);
  const currentCompanionData = isGuardian 
    ? (GUARDIAN_SPECIES.find(g => g.id === selectedFlower) || GUARDIAN_SPECIES[0])
    : (PLANT_SPECIES.find(p => p.id === selectedFlower) || PLANT_SPECIES[0]);
  const stageDescription = currentCompanionData.stageLabels[currentStage - 1];

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
  const linkedTask = (tasks || []).find(t => t && t._id === selectedTaskId);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* FULLSCREEN ZEN FOCUS MODE OVERLAY */}
      {isFullScreen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 999999,
          background: 'linear-gradient(135deg, #0d2818 0%, #1b4332 50%, #081c15 100%)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          {/* Close / Exit Fullscreen Button */}
          <button
            type="button"
            onClick={exitFullScreen}
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)'
            }}
          >
            <X size={16} />
            <span>ออกจากโหมดเต็มจอ (Esc)</span>
          </button>

          {/* Top Zen Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: isGuardian ? 'rgba(2, 132, 199, 0.25)' : 'rgba(76, 175, 80, 0.25)',
            border: isGuardian ? '1px solid rgba(2, 132, 199, 0.4)' : '1px solid rgba(76, 175, 80, 0.4)',
            color: isGuardian ? '#38bdf8' : '#81c784',
            padding: '6px 18px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 800,
            marginBottom: '1.5rem',
            letterSpacing: '0.5px'
          }}>
            <Sparkles size={16} color={isGuardian ? '#38bdf8' : '#81c784'} />
            <span>{isGuardian ? '⚔️ GUARDIAN FOCUS MODE • สหายผู้พิทักษ์แห่งสมาธิ' : '🌸 ZEN FOCUS MODE • โหมดโฟกัสเต็มหน้าจอไร้สิ่งรบกวน'}</span>
          </div>

          {/* Plant / Guardian Name Title */}
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e8f5e9', marginBottom: '1rem' }}>
            {isBreak ? '☕ ช่วงพักผ่อนรดน้ำสวน' : (isGuardian ? `กำลังฝึกฝน: ${currentCompanionData.emoji} ${currentCompanionData.name}` : `กำลังปลูก: ${currentCompanionData.emoji} ${currentCompanionData.name}`)}
          </h2>

          {/* Giant Botanical Plant or Guardian Beast Illustration */}
          <div style={{
            margin: '0 auto 1.5rem auto',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: isGuardian 
              ? 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)' 
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(27, 67, 50, 0.4) 100%)',
            border: isGuardian ? '3px solid rgba(56, 189, 248, 0.5)' : '3px solid rgba(129, 199, 132, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isGuardian ? '0 0 50px rgba(2, 132, 199, 0.35)' : '0 0 50px rgba(76, 175, 80, 0.35)',
            animation: isActive ? 'pulse 3s infinite ease-in-out' : 'none'
          }}>
            {isGuardian ? (
              <GuardianPet 
                guardianId={selectedFlower} 
                stage={currentStage} 
                size={140} 
                isActive={isActive} 
                isBreak={isBreak} 
              />
            ) : (
              <BotanicalPlant 
                flowerId={selectedFlower} 
                stage={currentStage} 
                size={140} 
                isActive={isActive} 
                isBreak={isBreak} 
              />
            )}
          </div>

          {/* Large Zen Timer Display */}
          <div style={{ fontSize: '4.5rem', fontWeight: 900, fontFamily: 'var(--font-accent)', letterSpacing: '2px', color: '#ffffff', textShadow: '0 0 30px rgba(129, 199, 132, 0.4)', marginBottom: '0.5rem' }}>
            {formatTime(minutes, seconds)}
          </div>

          {/* Stage Progression Badge */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '6px 18px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#c8e6c9',
            marginBottom: '2rem'
          }}>
            <span>{isBreak ? 'ผ่อนคลายและรดน้ำแปลงพฤกษา 🌿' : stageDescription}</span>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleToggleTimer}
              style={{
                background: isActive ? '#f59e0b' : 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '16px',
                padding: '0.9rem 2.2rem',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)'
              }}
            >
              {isActive ? <Pause size={20} /> : <Play size={20} />}
              <span>{isActive ? 'หยุดชั่วคราว' : 'เริ่มโฟกัส'}</span>
            </button>

            <button
              type="button"
              onClick={resetTimer}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '0.9rem 1.75rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RotateCcw size={18} />
              <span>รีเซ็ต</span>
            </button>
          </div>

          {/* Linked Task in Zen Mode */}
          {linkedTask && (
            <div style={{ marginTop: '1.5rem', color: '#a7f3d0', fontSize: '0.9rem', fontWeight: 600 }}>
              🎯 กำลังทำงาน: <strong>"{linkedTask.title}"</strong>
            </div>
          )}
        </div>
      )}

      {/* STANDARD VIEW HEADER */}
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
          เลือกพันธุ์ไม้แล้วเริ่มโฟกัส 25 นาที โดยแต่ละสายพันธุ์มีวงจรการเติบโตเฉพาะตัวตั้งแต่ต้นอ่อนค่ะ
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
          
          {/* Header Action: Fullscreen Focus Mode Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={toggleFullScreen}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#2e7d32',
                background: 'rgba(76, 175, 80, 0.12)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              title="เปิดโหมดโฟกัสเต็มหน้าจอเพื่อตัดสิ่งรบกวนรอบข้าง"
            >
              <Maximize2 size={13} />
              <span>🖥️ โหมดเต็มหน้าจอ (Full Screen)</span>
            </button>
          </div>

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

          {/* Botanical Plant & Guardian Beast Species Selector */}
          <div style={{ marginBottom: '1.1rem', textAlign: 'center' }}>
            {/* Category Tabs */}
            <div style={{ display: 'inline-flex', background: 'rgba(0, 0, 0, 0.04)', padding: '3px', borderRadius: '24px', gap: '4px', marginBottom: '0.65rem' }}>
              <button
                type="button"
                disabled={isActive}
                onClick={() => {
                  setCompanionCategory('plants');
                  if (isGuardian) handleSelectFlower('sunflower');
                }}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '5px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: companionCategory === 'plants' ? '#ffffff' : 'transparent',
                  color: companionCategory === 'plants' ? '#1b4332' : 'var(--text-muted)',
                  boxShadow: companionCategory === 'plants' ? '0 2px 6px rgba(0, 0, 0, 0.1)' : 'none',
                  cursor: isActive ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🪴 แปลงพฤกษา</span>
              </button>
              <button
                type="button"
                disabled={isActive}
                onClick={() => {
                  setCompanionCategory('guardians');
                  if (!isGuardian) handleSelectFlower('phoenix');
                }}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '5px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: companionCategory === 'guardians' ? '#ffffff' : 'transparent',
                  color: companionCategory === 'guardians' ? '#0369a1' : 'var(--text-muted)',
                  boxShadow: companionCategory === 'guardians' ? '0 2px 6px rgba(0, 0, 0, 0.1)' : 'none',
                  cursor: isActive ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>⚔️ สัตว์เทพผู้พิทักษ์</span>
              </button>
            </div>

            {/* Species Pills */}
            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {(companionCategory === 'guardians' ? GUARDIAN_SPECIES : PLANT_SPECIES).map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectFlower(item.id)}
                  disabled={isActive}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '5px 10px',
                    borderRadius: '12px',
                    border: selectedFlower === item.id 
                      ? (companionCategory === 'guardians' ? '2px solid #0284c7' : '2px solid #2e7d32') 
                      : '1px solid var(--border-glass)',
                    background: selectedFlower === item.id 
                      ? (companionCategory === 'guardians' ? 'rgba(2, 132, 199, 0.18)' : 'rgba(76, 175, 80, 0.2)') 
                      : 'rgba(255, 255, 255, 0.65)',
                    color: selectedFlower === item.id 
                      ? (companionCategory === 'guardians' ? '#0369a1' : '#1b4332') 
                      : 'var(--text-muted)',
                    cursor: isActive ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: selectedFlower === item.id ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{item.emoji}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status label with Growing / Training Indicator */}
          <div style={{ marginBottom: '0.9rem', fontSize: '0.92rem', fontWeight: 700, color: isBreak ? '#10b981' : (isGuardian ? '#0284c7' : '#1b4332'), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span>{isBreak ? '☕ ช่วงเวลาพักผ่อนรดน้ำสวน' : (isActive ? (isGuardian ? `⏳ กำลังฝึกฝน${currentCompanionData.name} ${currentCompanionData.emoji}` : `⏳ กำลังโฟกัสปลูก${currentCompanionData.name} ${currentCompanionData.emoji}`) : (isGuardian ? `⚔️ พร้อมเริ่มฝึก${currentCompanionData.name} ${currentCompanionData.emoji}` : `🌱 พร้อมเริ่มปลูก${currentCompanionData.name} ${currentCompanionData.emoji}`))}</span>
          </div>
 
          {/* Interactive Ring with SVG Illustration */}
          <div 
            className="timer-circle" 
            style={{ 
              width: '210px', 
              height: '210px', 
              margin: '0 auto 0.75rem auto',
              borderRadius: '50%',
              background: isGuardian ? 'radial-gradient(circle, #ffffff 30%, #f0f9ff 100%)' : 'radial-gradient(circle, #ffffff 30%, #f0fdf4 100%)',
              border: isBreak ? '4px solid #10b981' : (isGuardian ? '4px solid #0284c7' : '4px solid #4caf50'),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isGuardian ? '0 8px 32px rgba(2, 132, 199, 0.18)' : '0 8px 32px rgba(76, 175, 80, 0.18)',
              position: 'relative'
            }}
          >
            {/* Custom SVG Illustration */}
            <div style={{ marginTop: '-4px', marginBottom: '6px' }}>
              {isGuardian ? (
                <GuardianPet 
                  guardianId={selectedFlower} 
                  stage={currentStage} 
                  size={82} 
                  isActive={isActive} 
                  isBreak={isBreak} 
                />
              ) : (
                <BotanicalPlant 
                  flowerId={selectedFlower} 
                  stage={currentStage} 
                  size={82} 
                  isActive={isActive} 
                  isBreak={isBreak} 
                />
              )}
            </div>

            {/* Timer numbers */}
            <span className="timer-display" style={{ fontSize: '2.35rem', fontWeight: 800, color: isGuardian ? '#0f172a' : '#1b4332', lineHeight: 1, letterSpacing: '0.5px' }}>
              {formatTime(minutes, seconds)}
            </span>
          </div>

          {/* Specific Organic Stage Description Badge (Clean Pill Outside Circle) */}
          <div style={{ margin: '0.65rem auto 1.15rem auto', display: 'flex', justifyContent: 'center' }}>
            <span style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem', 
              fontWeight: 600, 
              color: isGuardian ? '#0369a1' : '#2e7d32', 
              padding: '5px 14px',
              background: isGuardian ? 'rgba(2, 132, 199, 0.1)' : 'rgba(76, 175, 80, 0.1)',
              border: isGuardian ? '1px solid rgba(2, 132, 199, 0.25)' : '1px solid rgba(76, 175, 80, 0.25)',
              borderRadius: '20px',
              boxShadow: isGuardian ? '0 2px 6px rgba(2, 132, 199, 0.05)' : '0 2px 6px rgba(46, 125, 50, 0.05)'
            }}>
              <Sparkles size={14} color={isGuardian ? '#0284c7' : '#4caf50'} />
              <span>{isBreak ? 'ผ่อนคลายและรดน้ำแปลงพฤกษา 🌿' : stageDescription}</span>
            </span>
          </div>
 
          {/* Timer Controls */}
          <div className="timer-controls" style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={handleToggleTimer}
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
