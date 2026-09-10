import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Sparkles, Upload, Check, ShieldCheck, Calendar, LogOut, Key, Mail, Edit3, Award, Flower2 } from 'lucide-react';
import CustomModal from './CustomModal';

const AVATARS = [
  { id: 'sakura', label: 'ดอกซากุระ 🌸', emoji: '🌸', desc: 'อ่อนหวาน สดใส มีสมาธิผ่อนคลาย' },
  { id: 'sunflower', label: 'ดอกทานตะวัน 🌻', emoji: '🌻', desc: 'มุ่งมั่น เจิดจ้า เต็มไปด้วยพลังงาน' },
  { id: 'sprout', label: 'ต้นกล้าน้อย 🌱', emoji: '🌱', desc: 'พร้อมเติบโต เติมเต็มการเรียนรู้ทุกวัน' },
  { id: 'daisy', label: 'ดอกเดซี่ 🌼', emoji: '🌼', desc: 'น่ารัก บริสุทธิ์ สบายตา สบายใจ' }
];

const ProfileSettings = () => {
  const { user, setUser, token, logout } = useContext(AuthContext);
  const API_URL = `http://${window.location.hostname}:5000/api`;

  const [username, setUsername] = useState(user?.username || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [selectedAvatarId, setSelectedAvatarId] = useState(
    AVATARS.some(a => a.id === user?.profileImage) ? user?.profileImage : ''
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '', type: 'info' });

  const gToken = localStorage.getItem('g_token') || sessionStorage.getItem('g_token');

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatarId(avatarId);
    setProfileImage(avatarId);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError('ขนาดรูปภาพต้องไม่เกิน 1MB ค่ะ');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      setSelectedAvatarId('');
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('กรุณากรอกชื่อผู้ใช้งานด้วยค่ะ 🌸');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, profileImage })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ไม่สามารถอัปเดตโปรไฟล์ได้');
      }

      if (setUser) {
        setUser(data);
      }

      setModalState({
        isOpen: true,
        title: 'อัปเดตโปรไฟล์สำเร็จ',
        message: 'บันทึกข้อมูลโปรไฟล์และอวาตาร์ประจำตัวของคุณเรียบร้อยแล้วค่ะ! 🌸✨',
        type: 'success'
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
      {/* Header Bar */}
      <header style={{ marginBottom: '1.5rem' }}>
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
          <span>USER PROFILE & PREFERENCES • ตั้งค่าโปรไฟล์และบัญชีผู้ใช้ 👤</span>
        </div>
        <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: '0.2rem', color: '#1b4332', fontWeight: 800 }}>
          ตั้งค่าโปรไฟล์ผู้ใช้งาน (Profile Settings) 👤🌸
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
          จัดการข้อมูลส่วนตัว อวาตาร์พฤกษาประจำตัว และ การตั้งค่าบัญชีใน Focus Space ค่ะ
        </p>
      </header>

      <form onSubmit={handleSaveProfile}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          {/* Column Left: Avatar Selection Card */}
          <div className="glass" style={{ padding: '1.75rem', borderRadius: '24px', background: '#ffffff', border: '1px solid rgba(76, 175, 80, 0.25)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1b4332', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Flower2 size={20} color="#2e7d32" />
              อวาตาร์ประจำตัวในสวน (Botanical Avatar)
            </h3>

            {/* Avatar Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'rgba(76, 175, 80, 0.15)',
                border: '3px solid #4caf50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(76, 175, 80, 0.25)',
                marginBottom: '1rem'
              }}>
                {profileImage ? (
                  profileImage.startsWith('data:') ? (
                    <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>
                      {profileImage === 'sunflower' ? '🌻' : profileImage === 'sprout' ? '🌱' : profileImage === 'daisy' ? '🌼' : '🌸'}
                    </span>
                  )
                ) : (
                  <span style={{ fontSize: '3rem' }}>🌸</span>
                )}
              </div>

              {/* Upload Custom Photo Option */}
              <label style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#2e7d32',
                background: 'rgba(76, 175, 80, 0.12)',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                padding: '6px 14px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Upload size={14} />
                <span>อัปโหลดรูปภาพส่วนตัว (.jpg, .png)</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Pre-made Botanical Avatars */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {AVATARS.map(avatar => (
                <div
                  key={avatar.id}
                  onClick={() => handleAvatarSelect(avatar.id)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '16px',
                    border: selectedAvatarId === avatar.id ? '2px solid #4caf50' : '1px solid rgba(76, 175, 80, 0.2)',
                    background: selectedAvatarId === avatar.id ? 'rgba(76, 175, 80, 0.12)' : 'rgba(248, 250, 252, 0.6)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{avatar.emoji}</span>
                    {selectedAvatarId === avatar.id && <Check size={16} color="#2e7d32" />}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1b4332' }}>
                    {avatar.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                    {avatar.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column Right: User Info & Account Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Account Info Form Card */}
            <div className="glass" style={{ padding: '1.75rem', borderRadius: '24px', background: '#ffffff', border: '1px solid rgba(76, 175, 80, 0.25)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1b4332', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} color="#2e7d32" />
                ข้อมูลบัญชีผู้ใช้ (Account Details)
              </h3>

              {error && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.1)', color: '#e11d48', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
                  ⚠️ {error}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 800, color: '#1b4332', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                  ชื่อผู้ใช้งาน (Username) *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="พิมพ์ชื่อผู้ใช้งานของคุณ"
                  required
                  style={{ width: '100%', height: '46px', padding: '0 1rem', borderRadius: '14px', border: '1px solid rgba(76, 175, 80, 0.3)', fontSize: '0.95rem' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontWeight: 800, color: '#1b4332', fontSize: '0.85rem', marginBottom: '0.35rem', display: 'block' }}>
                  อีเมลประจำบัญชี (Email Address)
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={user?.email || ''}
                  disabled
                  style={{ width: '100%', height: '46px', padding: '0 1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '0.95rem' }}
                />
              </div>

              {/* Status Integrations Badge */}
              <div style={{ padding: '1rem', borderRadius: '16px', background: 'rgba(76, 175, 80, 0.08)', border: '1px solid rgba(76, 175, 80, 0.2)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} color="#2e7d32" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1b4332' }}>สถานะ Google Calendar</span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, background: gToken ? 'rgba(76, 175, 80, 0.2)' : 'rgba(245, 158, 11, 0.15)', color: gToken ? '#2e7d32' : '#d97706', padding: '3px 10px', borderRadius: '12px' }}>
                  {gToken ? '🟢 เชื่อมต่อซิงค์แล้ว' : '🟡 ยังไม่ได้เชื่อมต่อ'}
                </span>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.3)'
                  }}
                >
                  {loading ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่าโปรไฟล์'}
                </button>

                <button
                  type="button"
                  onClick={logout}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '16px',
                    background: 'rgba(244, 63, 94, 0.1)',
                    color: '#e11d48',
                    border: '1px solid rgba(244, 63, 94, 0.2)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LogOut size={16} />
                  ออกจากระบบ
                </button>
              </div>

            </div>
          </div>

        </div>
      </form>

      {/* Global Success Notification Custom Modal */}
      <CustomModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </div>
  );
};

export default ProfileSettings;
