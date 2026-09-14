import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PomodoroContext } from '../context/PomodoroContext';
import { LayoutDashboard, CheckSquare, Timer, LogOut, User as UserIcon, Sparkles, BookOpen, BarChart3, ShieldCheck, Calendar as CalendarIcon, MoreHorizontal, X } from 'lucide-react';

const AVATARS = {
  astronaut: (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', borderRadius: '50%' }}>
      <circle cx="50" cy="50" r="45" fill="#1b4332" />
      <circle cx="50" cy="45" r="25" fill="#f3f4f6" />
      <rect x="35" y="45" width="30" height="20" rx="10" fill="#2e7d32" />
      <rect x="38" y="48" width="24" height="14" rx="7" fill="#4caf50" />
      <rect x="42" y="52" width="16" height="8" rx="4" fill="#81c784" />
      <path d="M25,80 Q50,70 75,80 L70,90 L30,90 Z" fill="#e5e7eb" />
    </svg>
  ),
  rocket: (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', borderRadius: '50%' }}>
      <circle cx="50" cy="50" r="45" fill="#064e3b" />
      <path d="M50,15 Q65,45 60,65 Q50,60 40,65 Q35,45 50,15 Z" fill="#f3f4f6" />
      <path d="M50,15 Q55,45 50,65 L40,65 Q35,45 50,15 Z" fill="#d1d5db" />
      <circle cx="50" cy="40" r="6" fill="#3b82f6" />
      <path d="M40,65 L50,85 L60,65 Z" fill="#f97316" />
      <path d="M45,65 L50,75 L55,65 Z" fill="#eab308" />
    </svg>
  ),
  alien: (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', borderRadius: '50%' }}>
      <circle cx="50" cy="50" r="45" fill="#2e7d32" />
      <ellipse cx="50" cy="45" rx="22" ry="18" fill="#10b981" />
      <circle cx="40" cy="42" r="5" fill="#000" />
      <circle cx="60" cy="42" r="5" fill="#000" />
      <ellipse cx="50" cy="55" rx="8" ry="3" fill="#065f46" />
      <circle cx="50" cy="20" r="3" fill="#10b981" />
      <line x1="50" y1="20" x2="50" y2="28" stroke="#10b981" strokeWidth="3" />
    </svg>
  )
};

const Sidebar = ({ currentTab, setCurrentTab, isOpen, setIsOpen, onOpenProfile }) => {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const pomodoroCtx = useContext(PomodoroContext) || {};
  const minutes = pomodoroCtx.minutes ?? 25;
  const seconds = pomodoroCtx.seconds ?? 0;
  const isActive = pomodoroCtx.isActive ?? false;

  const formatTimerIndicator = () => {
    const m = minutes !== undefined && minutes !== null ? minutes : 25;
    const s = seconds !== undefined && seconds !== null ? seconds : 0;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderProfileAvatar = () => {
    if (user?.profileImage) {
      if (AVATARS[user.profileImage]) {
        return AVATARS[user.profileImage];
      }
      if (user.profileImage.startsWith('data:')) {
        return <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />;
      }
    }
    return <UserIcon size={20} color="#2e7d32" />;
  };

  return (
    <>
      <aside className={`sidebar sidebar-desktop glass ${isOpen ? 'open' : ''}`}>
        <style>{`
          .sidebar-itlab-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            justify-content: space-between;
            padding: 0.25rem 0.25rem;
          }
          .sidebar-brand-box {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.4rem 0.4rem 0.75rem 0.4rem;
            border-bottom: 1px solid var(--border-glass);
            margin-bottom: 0.75rem;
          }
          .sidebar-brand-icon {
            width: 36px;
            height: 36px;
            border-radius: 12px;
            background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            font-size: 1.15rem;
            flex-shrink: 0;
          }
          .nav-category-title {
            font-size: 0.68rem;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 1rem 0 0.4rem 0.5rem;
            display: flex;
            align-items: center;
            gap: 0.35rem;
          }
          .nav-item-pill {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 0.65rem;
            border-radius: 12px;
            font-size: 0.82rem;
            font-weight: 600;
            color: var(--text-main);
            cursor: pointer;
            transition: var(--transition-smooth);
            margin-bottom: 0.25rem;
            border: 1px solid transparent;
            white-space: nowrap;
          }
          .nav-item-pill:hover {
            background: rgba(76, 175, 80, 0.1);
            color: #2e7d32;
          }
          .nav-item-pill.active {
            background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
            color: #ffffff;
            font-weight: 700;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.35);
          }
        `}</style>

        <div className="sidebar-itlab-container">
          <div>
            {/* Top Brand Logo */}
            <div className="sidebar-brand-box">
              <div className="sidebar-brand-icon">
                🌸
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1b4332', fontFamily: 'var(--font-accent)' }}>
                  Focus Space
                </h3>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2e7d32', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Botanical Garden 🍃
                </span>
              </div>
            </div>

            {/* Category 1: Main Navigation */}
            <div className="nav-category-title">
              <span>เมนูหลัก</span>
            </div>

            <nav>
              <div
                className={`nav-item-pill ${currentTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab('dashboard');
                  setIsOpen(false);
                }}
              >
                <LayoutDashboard size={18} />
                <span style={{ flex: 1 }}>หน้าหลัก (Dashboard)</span>
              </div>

              <div
                className={`nav-item-pill ${currentTab === 'tasks' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab('tasks');
                  setIsOpen(false);
                }}
              >
                <CheckSquare size={18} />
                <span style={{ flex: 1 }}>รายการงาน (Tasks)</span>
              </div>

              <div
                className={`nav-item-pill ${currentTab === 'pomodoro' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab('pomodoro');
                  setIsOpen(false);
                }}
              >
                <Timer size={18} />
                <span style={{ flex: 1 }}>จับเวลา (Pomodoro)</span>
                {isActive && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#ff6b81',
                    background: 'rgba(255, 107, 129, 0.15)',
                    padding: '2px 8px',
                    borderRadius: '8px'
                  }}>
                    {formatTimerIndicator()}
                  </span>
                )}
              </div>
            </nav>

            {/* Category 2: Focus Tools */}
            <div className="nav-category-title">
              <span>เครื่องมือสมาธิ</span>
            </div>

            <nav>
              <div
                className={`nav-item-pill ${currentTab === 'calendar' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab('calendar');
                  setIsOpen(false);
                }}
              >
                <CalendarIcon size={18} color="#2e7d32" />
                <span>ปฏิทินพฤกษา</span>
              </div>

              <div
                className={`nav-item-pill ${currentTab === 'stats' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab('stats');
                  setIsOpen(false);
                }}
              >
                <BarChart3 size={18} color="#2e7d32" />
                <span>สถิติสวนความสำเร็จ</span>
              </div>

              <div
                className={`nav-item-pill ${currentTab === 'journal' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab('journal');
                  setIsOpen(false);
                }}
              >
                <BookOpen size={18} color="#2e7d32" />
                <span>สมุดบันทึกในสวน</span>
              </div>

              <div
                className={`nav-item-pill ${currentTab === 'profile' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentTab('profile');
                  setIsOpen(false);
                }}
              >
                <UserIcon size={18} color="#2e7d32" />
                <span>ตั้งค่าโปรไฟล์</span>
              </div>
            </nav>
          </div>
        </div>
      </aside>

      {/* Option 1: Spacious 4-Item Mobile Bottom Bar + More Sheet */}
      <nav className="mobile-nav-bar">
        <button 
          className={`mobile-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
          title="หน้าหลัก"
        >
          <LayoutDashboard size={20} />
          <span>หน้าหลัก</span>
        </button>

        <button 
          className={`mobile-nav-item ${currentTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setCurrentTab('tasks')}
          title="รายการงาน"
        >
          <CheckSquare size={20} />
          <span>รายการงาน</span>
        </button>

        <button 
          className={`mobile-nav-item ${currentTab === 'pomodoro' ? 'active' : ''}`}
          onClick={() => setCurrentTab('pomodoro')}
          title="นาฬิกาสมาธิ"
        >
          <Timer size={20} />
          <span>จับเวลา</span>
        </button>

        <button 
          className={`mobile-nav-item ${['calendar', 'stats', 'journal', 'profile'].includes(currentTab) ? 'active' : ''}`}
          onClick={() => setIsMobileMoreOpen(true)}
          title="เพิ่มเติม"
        >
          <MoreHorizontal size={20} />
          <span>เพิ่มเติม</span>
        </button>
      </nav>

      {/* Botanical Glass Mobile Bottom Sheet Modal */}
      {isMobileMoreOpen && (
        <div 
          onClick={() => setIsMobileMoreOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(27, 67, 50, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '500px',
              background: '#ffffff',
              borderRadius: '28px 28px 0 0',
              padding: '1.25rem 1.25rem 2.25rem 1.25rem',
              boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}
          >
            {/* Top Handle bar */}
            <div style={{ width: '42px', height: '5px', borderRadius: '3px', background: '#cbd5e1', margin: '0 auto 1rem auto' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', padding: '0 0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#4caf50" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1b4332' }}>🌸 เมนูพฤกษาเพิ่มเติม</h3>
              </div>
              <button 
                onClick={() => setIsMobileMoreOpen(false)}
                style={{ background: 'rgba(0, 0, 0, 0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* 4 Bottom Sheet Grid Items */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div 
                onClick={() => { setCurrentTab('calendar'); setIsMobileMoreOpen(false); }}
                style={{
                  padding: '1rem',
                  borderRadius: '18px',
                  background: currentTab === 'calendar' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(248, 250, 252, 0.8)',
                  border: currentTab === 'calendar' ? '2px solid #4caf50' : '1px solid rgba(76, 175, 80, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(76, 175, 80, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                  <CalendarIcon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1b4332' }}>ปฏิทินพฤกษา</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ดูและซิงค์เดดไลน์</div>
                </div>
              </div>

              <div 
                onClick={() => { setCurrentTab('stats'); setIsMobileMoreOpen(false); }}
                style={{
                  padding: '1rem',
                  borderRadius: '18px',
                  background: currentTab === 'stats' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(248, 250, 252, 0.8)',
                  border: currentTab === 'stats' ? '2px solid #4caf50' : '1px solid rgba(76, 175, 80, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(76, 175, 80, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                  <BarChart3 size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1b4332' }}>สถิติสวน</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ดูผลผลิตพฤกษา</div>
                </div>
              </div>

              <div 
                onClick={() => { setCurrentTab('journal'); setIsMobileMoreOpen(false); }}
                style={{
                  padding: '1rem',
                  borderRadius: '18px',
                  background: currentTab === 'journal' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(248, 250, 252, 0.8)',
                  border: currentTab === 'journal' ? '2px solid #4caf50' : '1px solid rgba(76, 175, 80, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(76, 175, 80, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1b4332' }}>สมุดบันทึก</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>บันทึกไดอารี่ในสวน</div>
                </div>
              </div>

              <div 
                onClick={() => { setCurrentTab('profile'); setIsMobileMoreOpen(false); }}
                style={{
                  padding: '1rem',
                  borderRadius: '18px',
                  background: currentTab === 'profile' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(248, 250, 252, 0.8)',
                  border: currentTab === 'profile' ? '2px solid #4caf50' : '1px solid rgba(76, 175, 80, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(76, 175, 80, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                  <UserIcon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1b4332' }}>โปรไฟล์</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ตั้งค่าบัญชีอวาตาร์</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
