import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { X, Upload, Check } from 'lucide-react';

const AVATARS = [
  { id: 'sakura', label: 'ดอกซากุระ 🌸', emoji: '🌸' },
  { id: 'sunflower', label: 'ดอกทานตะวัน 🌻', emoji: '🌻' },
  { id: 'sprout', label: 'ต้นกล้าน้อย 🌱', emoji: '🌱' },
  { id: 'daisy', label: 'ดอกเดซี่ 🌼', emoji: '🌼' }
];

const ProfileModal = ({ onClose }) => {
  const { user, token, logout } = useContext(AuthContext);
  const API_URL = `http://${window.location.hostname}:5000/api`;

  const [username, setUsername] = useState(user?.username || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [googleClientId, setGoogleClientId] = useState(user?.googleClientId || '');
  const [selectedAvatarId, setSelectedAvatarId] = useState(
    AVATARS.some(a => a.id === user?.profileImage) ? user?.profileImage : ''
  );
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleAvatarSelect = (avatarId) => {
    setSelectedAvatarId(avatarId);
    setProfileImage(avatarId);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError('ขนาดรูปภาพต้องไม่เกิน 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      setSelectedAvatarId(''); // deselect SVG avatar
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, profileImage, googleClientId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 800);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1.25rem'
    }}>
      <div 
        className="glass animate-scale-up"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '24px',
          maxWidth: '480px',
          width: '100%',
          padding: '2rem 2.25rem',
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25), 0 0 30px var(--primary-glow)',
          color: 'var(--text-main)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '10px',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-main)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border-glass)';
          }}
        >
          <X size={18} />
        </button>

        <h2 style={{ 
          marginBottom: '1.75rem', 
          fontFamily: 'var(--font-accent)', 
          fontWeight: 800, 
          letterSpacing: '0.3px',
          background: 'var(--title-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'left',
          fontSize: '1.35rem'
        }}>
          🌸 แก้ไขโปรไฟล์นักปลูกพฤกษา
        </h2>

        <form onSubmit={handleSave}>
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              color: 'var(--priority-high)',
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              fontWeight: 600
            }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--accent-teal)',
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Check size={18} /> อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้วค่ะ!
            </div>
          )}

          {/* Current Avatar View */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              position: 'relative',
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              padding: '4px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
              boxShadow: '0 0 20px var(--primary-glow)',
              marginBottom: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'var(--bg-input)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {profileImage ? (
                  AVATARS.some(a => a.id === profileImage) ? (
                    <span style={{ fontSize: '2.2rem' }}>
                      {AVATARS.find(a => a.id === profileImage)?.emoji || '🌸'}
                    </span>
                  ) : profileImage.startsWith('data:') ? (
                    <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2.2rem' }}>🌸</span>
                  )
                ) : (
                  <span style={{ fontSize: '2.2rem' }}>🌸</span>
                )}
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>พรีวิวรูปโปรไฟล์สวนดอกไม้ของคุณ</span>
          </div>

          {/* Avatar Selector Options */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ marginBottom: '0.6rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', textAlign: 'left' }}>
              เลือกอวตารดอกไม้พาสเทล:
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {AVATARS.map((avatar) => (
                <div
                  key={avatar.id}
                  onClick={() => handleAvatarSelect(avatar.id)}
                  title={avatar.label}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: selectedAvatarId === avatar.id ? '2.5px solid #4caf50' : '2px solid var(--border-glass)',
                    background: selectedAvatarId === avatar.id ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.6)',
                    boxShadow: selectedAvatarId === avatar.id ? '0 0 14px rgba(76, 175, 80, 0.3)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAvatarId !== avatar.id) e.currentTarget.style.borderColor = '#4caf50';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAvatarId !== avatar.id) e.currentTarget.style.borderColor = 'var(--border-glass)';
                  }}
                >
                  {avatar.emoji}
                </div>
              ))}

              {/* Upload image button */}
              <label style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                border: '2px dashed var(--border-glass)',
                background: 'var(--bg-input)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-glass)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              title="อัปโหลดรูปภาพจากอุปกรณ์"
              >
                <Upload size={18} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.4rem', display: 'block' }}>
              ชื่อผู้ใช้งานประจำบัญชี (Username)
            </label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                borderRadius: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-main)',
                outline: 'none',
                fontWeight: 600
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem', textAlign: 'left' }}>
            <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.4rem', display: 'block' }}>
              Google Client ID (สำหรับบริการ Google Calendar)
            </label>
            <input
              type="text"
              className="form-input"
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              placeholder="กรอก Google Client ID ของคุณ..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.88rem',
                borderRadius: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-main)',
                outline: 'none'
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
              *หากระบบหลังบ้านมีคีย์หลักอยู่แล้ว สามารถปล่อยว่างไว้ได้เลยค่ะ
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              style={{
                padding: '0.7rem 1.4rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 700,
                background: 'var(--bg-input)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !username.trim()}
              style={{
                padding: '0.7rem 1.6rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
                boxShadow: '0 4px 15px var(--primary-glow)',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {loading ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .avatar-svg {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default ProfileModal;
