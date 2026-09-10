import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { PomodoroContext } from './context/PomodoroContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import PomodoroTimer from './components/PomodoroTimer';
import GardenStats from './components/GardenStats';
import GardenJournal from './components/GardenJournal';
import GardenCalendar from './components/GardenCalendar';
import Login from './components/Login';
import ProfileModal from './components/ProfileModal';
import ProfileSettings from './components/ProfileSettings';
import DeadlineNotifier from './components/DeadlineNotifier';
import NotificationBell from './components/NotificationBell';
import { Menu, X, User as UserIcon, Compass, Sparkles, Coffee, Play } from 'lucide-react';

function MainAppContent() {
  const { user, setUser, token, logout, loading } = useContext(AuthContext);
  const { sessionSummary, setSessionSummary, breakSummary, setBreakSummary, breakDuration } = useContext(PomodoroContext);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-deep)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid var(--border-glass)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not Logged In View
  if (!token) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--bg-deep)'
      }}>
        <Login />
      </div>
    );
  }

  // Onboarding Setup View if new Google Sign-in user
  if (user && !user.isSetupCompleted) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--bg-deep)'
      }}>
        <OnboardingModal user={user} token={token} setUser={setUser} />
      </div>
    );
  }

  // Logged In View
  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* Main View Area */}
      <main className="main-content">
        {/* Global Top Header Bar */}
        <header className="top-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-glass)',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div className="header-left" style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Focus Space / {currentTab === 'dashboard' ? 'แผงควบคุมหลัก' : currentTab === 'tasks' ? 'รายการภารกิจ' : currentTab === 'pomodoro' ? 'จับเวลาโฟกัส' : currentTab === 'stats' ? 'สถิติสวนความสำเร็จ' : 'สมุดบันทึกในสวน'}
            </span>
          </div>

          <div className="header-right" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            marginLeft: 'auto'
          }}>
            {/* Search Box next to profile */}
            {(currentTab === 'dashboard' || currentTab === 'tasks') && (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--text-muted)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px' }}>
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className="search-box-input"
                  placeholder="ค้นหาภารกิจ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '0.65rem 2rem 0.65rem 2.5rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-glass)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    width: '240px',
                    outline: 'none',
                    transition: 'var(--transition-smooth)'
                  }}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'var(--transition-smooth)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Notification Bell Dropdown Button */}
            {user && <NotificationBell setCurrentTab={setCurrentTab} />}

            {/* Profile badge wrapper with dropdown menu */}
            {user && (
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    padding: '5px 10px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-glass)'
                  }}
                >
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'rgba(76, 175, 80, 0.18)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2e7d32',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    {user.profileImage ? (
                      user.profileImage.startsWith('data:') ? (
                        <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1.1rem' }}>
                          {user.profileImage === 'sunflower' ? '🌻' : user.profileImage === 'sprout' ? '🌱' : user.profileImage === 'daisy' ? '🌼' : '🌸'}
                        </span>
                      )
                    ) : (
                      <span style={{ fontSize: '1.1rem' }}>🌸</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1b4332' }}>{user.username}</span>
                </div>

                {/* Facebook-style Dropdown Menu */}
                {profileDropdownOpen && (
                  <>
                    {/* Transparent overlay backdrop to close dropdown when clicking outside */}
                    <div 
                      onClick={() => setProfileDropdownOpen(false)}
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
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '240px',
                      background: '#ffffff',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(76, 175, 80, 0.25)',
                      borderRadius: '16px',
                      boxShadow: '0 10px 30px rgba(76, 175, 80, 0.15)',
                      padding: '0.75rem',
                      zIndex: 999,
                      textAlign: 'left'
                    }}>
                      {/* User Info Header in Dropdown */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.25rem 0.75rem 0.25rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          background: 'rgba(76, 175, 80, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2e7d32',
                          border: '1px solid rgba(76, 175, 80, 0.3)'
                        }}>
                          {user.profileImage ? (
                            user.profileImage.startsWith('data:') ? (
                              <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '1.25rem' }}>
                                {user.profileImage === 'sunflower' ? '🌻' : user.profileImage === 'sprout' ? '🌱' : user.profileImage === 'daisy' ? '🌼' : '🌸'}
                              </span>
                            )
                          ) : (
                            <span style={{ fontSize: '1.25rem' }}>🌸</span>
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.username}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div style={{ height: '1px', background: 'var(--border-glass)', margin: '0.5rem 0' }} />

                      {/* Dropdown Options */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {/* Edit Profile Option */}
                        <div 
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setCurrentTab('profile');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            color: 'var(--text-muted)',
                            transition: 'var(--transition-smooth)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--text-main)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <UserIcon size={16} />
                          <span>แก้ไขข้อมูลโปรไฟล์</span>
                        </div>

                        {/* Logout Option */}
                        <div 
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            color: 'var(--priority-high)',
                            transition: 'var(--transition-smooth)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          <span>ออกจากระบบ</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {currentTab === 'dashboard' && <Dashboard searchQuery={searchQuery} setCurrentTab={setCurrentTab} />}
        {currentTab === 'tasks' && <TaskList searchQuery={searchQuery} setSearchQuery={setSearchQuery} setCurrentTab={setCurrentTab} />}
        {currentTab === 'calendar' && <GardenCalendar setCurrentTab={setCurrentTab} />}
        {currentTab === 'pomodoro' && <PomodoroTimer />}
        {currentTab === 'stats' && <GardenStats />}
        {currentTab === 'journal' && <GardenJournal />}
        {currentTab === 'profile' && <ProfileSettings />}
      </main>

      {/* Profile Editing Modal Dialog */}
      {profileOpen && (
        <ProfileModal onClose={() => setProfileOpen(false)} />
      )}

      {/* Global Real-time Deadline Alert Notifier */}
      <DeadlineNotifier setCurrentTab={setCurrentTab} />

      {/* Global Work Session Completion Overlay Modal */}
      {sessionSummary && (
        <div className="modal-overlay" style={{
          zIndex: 2000,
          background: 'rgba(27, 67, 50, 0.45)',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="modal-content glass" style={{
            maxWidth: '440px',
            textAlign: 'center',
            padding: '2.25rem 2rem',
            borderRadius: '24px',
            background: '#ffffff',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08), 0 0 30px rgba(76, 175, 80, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginBottom: '0.85rem'
            }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.85rem',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                boxShadow: '0 4px 16px rgba(245, 158, 11, 0.2)'
              }}>
                <Coffee size={32} />
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(76, 175, 80, 0.15)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                color: '#2e7d32',
                padding: '4px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 800
              }}>
                <span>FOCUS COMPLETED 🌸</span>
              </div>
            </div>

            <h2 style={{ color: '#1b4332', marginBottom: '0.75rem', fontWeight: 800, fontSize: '1.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <span>☕ ครบเวลาโฟกัสแล้ว! ได้เวลาพักผ่อน</span>
            </h2>
            <p style={{ marginBottom: '1.75rem', lineHeight: 1.6, fontSize: '0.92rem', color: '#475569' }}>
              คุณโฟกัสงาน {sessionSummary.taskTitle ? <strong style={{ color: '#2e7d32', background: 'rgba(76, 175, 80, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>"{sessionSummary.taskTitle}"</strong> : ''} จนครบกำหนด <strong>{sessionSummary.durationMins} นาที</strong> เรียบร้อยแล้วค่ะ! <br/>
              ได้เวลาพักผ่อนผ่อนคลาย <strong>{breakDuration} นาที</strong> ก่อนเริ่มรอบถัดไป ☕✨
            </p>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={() => setSessionSummary(null)} 
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                borderRadius: '16px',
                fontSize: '1rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                border: 'none',
                color: '#ffffff',
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                cursor: 'pointer'
              }}
            >
              เริ่มพักผ่อน ☕
            </button>
          </div>
        </div>
      )}

      {/* Global Break Completion Overlay Modal */}
      {breakSummary && (
        <div className="modal-overlay" style={{
          zIndex: 2000,
          background: 'rgba(27, 67, 50, 0.45)',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="modal-content glass" style={{
            maxWidth: '440px',
            textAlign: 'center',
            padding: '2.25rem 2rem',
            borderRadius: '24px',
            background: '#ffffff',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.08), 0 0 30px rgba(76, 175, 80, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginBottom: '0.85rem'
            }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'rgba(76, 175, 80, 0.15)',
                color: '#2e7d32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.85rem',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                boxShadow: '0 4px 16px rgba(76, 175, 80, 0.2)'
              }}>
                <Play size={32} style={{ marginLeft: '4px' }} />
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(76, 175, 80, 0.15)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                color: '#2e7d32',
                padding: '4px 14px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 800
              }}>
                <span>BREAK TIME ENDED 🌱</span>
              </div>
            </div>

            <h2 style={{ color: '#1b4332', marginBottom: '0.75rem', fontWeight: 800, fontSize: '1.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <span>⚡ หมดเวลาพักเบรกแล้ว!</span>
            </h2>
            <p style={{ marginBottom: '1.75rem', lineHeight: 1.6, fontSize: '0.92rem', color: '#475569' }}>
              ได้เวลาเริ่มรอบจับเวลาถัดไปเพื่อดำเนินภารกิจและฟูมฟักสวนสมาธิของคุณต่อแล้วค่ะ! 🌸🌱
            </p>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={() => setBreakSummary(false)} 
              style={{
                width: '100%',
                padding: '0.85rem 1.5rem',
                borderRadius: '16px',
                fontSize: '1rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                border: 'none',
                color: '#ffffff',
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)',
                cursor: 'pointer'
              }}
            >
              กลับมาดูแลสวนต่อ! 🌸🌱
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <MainAppContent />
  );
}

export default App;

// Onboarding component for first-time Google sign-ins
function OnboardingModal({ user, token, setUser }) {
  const [name, setName] = useState(user?.username || '');
  const [avatar, setAvatar] = useState('sakura');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const avatars = [
    { id: 'sakura', emoji: '🌸', label: 'ดอกซากุระ' },
    { id: 'sunflower', emoji: '🌻', label: 'ดอกทานตะวัน' },
    { id: 'sprout', emoji: '🌱', label: 'ต้นกล้าน้อย' },
    { id: 'daisy', emoji: '🌼', label: 'ดอกเดซี่' }
  ];

  const handleStart = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: name, profileImage: avatar })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save setup');
      }

      setUser({
        ...user,
        username: data.username,
        profileImage: data.profileImage,
        isSetupCompleted: true
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #eef7f2 0%, #fdf2f8 50%, #f4f9f4 100%)',
      padding: '1.5rem',
      color: '#1b4332'
    }}>
      <style>{`
        .onboard-card {
          background: #ffffff;
          border: 1px solid rgba(76, 175, 80, 0.3);
          border-radius: 28px;
          padding: 3rem 2.5rem;
          width: 100%;
          max-width: 480px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(76, 175, 80, 0.15);
        }
        .avatar-option-btn {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: rgba(76, 175, 80, 0.08);
          border: 2px solid rgba(76, 175, 80, 0.2);
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .avatar-option-btn:hover {
          border-color: #4caf50;
          background: rgba(76, 175, 80, 0.15);
        }
        .avatar-option-btn.selected {
          border-color: #4caf50;
          background: rgba(76, 175, 80, 0.2);
          box-shadow: 0 0 15px rgba(76, 175, 80, 0.3);
        }
      `}</style>

      <div className="onboard-card">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          background: 'rgba(76, 175, 80, 0.15)',
          color: '#2e7d32',
          marginBottom: '1.25rem'
        }}>
          <Sparkles size={28} />
        </div>

        <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.5rem', color: '#1b4332' }}>ยินดีต้อนรับสู่สวนสมาธิ Focus Space! 🌸🍃</h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '2.25rem' }}>
          กรุณาตั้งชื่อเรียกและเลือกอวาตาร์พฤกษาประจำตัว เพื่อเริ่มต้นฟูมฟักดอกไม้และสร้างสวนความสำเร็จค่ะ
        </p>

        <form onSubmit={handleStart} style={{ textAlign: 'left' }}>
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.08)',
              color: 'var(--priority-high)',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 500,
              marginBottom: '1.25rem',
              border: '1px solid rgba(244, 63, 94, 0.15)'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Form input: Name */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">ชื่อเรียกกัปตัน (Captain Name)</label>
            <input
              type="text"
              className="form-input"
              placeholder="กรอกชื่อของคุณ..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={3}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                fontSize: '0.95rem',
                borderRadius: '12px'
              }}
            />
          </div>

          {/* Selector: Avatar */}
          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.75rem' }}>เลือกอวตารเริ่มต้น</label>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {avatars.map(av => (
                <div key={av.id} style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    className={`avatar-option-btn ${avatar === av.id ? 'selected' : ''}`}
                    onClick={() => setAvatar(av.id)}
                    title={av.label}
                  >
                    {av.emoji}
                  </button>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                    {av.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Button: Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || !name.trim()}
            style={{
              width: '100%',
              padding: '0.9rem',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {saving ? (
              <>
                <Compass size={18} className="animate-spin" />
                <span>กำลังนำทางยาน...</span>
              </>
            ) : (
              <>
                <span>เริ่มต้นปฏิบัติภารกิจ</span>
                <span>🚀</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
