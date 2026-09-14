import React, { useState } from 'react';
import { API_URL } from '../apiConfig';
import { X, KeyRound, Mail, ShieldCheck, Lock, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const ForgotPasswordModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP Code, 3: New Password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [issuedCode, setIssuedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Step 1: Request Security OTP Code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('กรุณากรอกอีเมลที่ใช้ลงทะเบียนนะคะ');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/request-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });
      
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error('ระบบเซิร์ฟเวอร์ยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้งนะคะ');
      }

      if (!res.ok) {
        throw new Error(data.message || 'ไม่พบบัญชีผู้ใช้งานที่ใช้อีเมลนี้ในระบบค่ะ');
      }

      setIssuedCode(data.verificationCode);
      if (data.verificationCode) {
        setCode(data.verificationCode); // Pre-fill for easy testing
      }
      setMessage(`รหัสยืนยันความปลอดภัย OTP คือ: [ ${data.verificationCode} ]`);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP Code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!code.trim()) {
      setError('กรุณากรอกรหัสยืนยันความปลอดภัย 6 หลักค่ะ');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-reset-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() })
      });
      
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error('ระบบเซิร์ฟเวอร์ตอบกลับไม่ถูกต้องค่ะ');
      }

      if (!res.ok) {
        throw new Error(data.message || 'รหัสยืนยันความปลอดภัยไม่ถูกต้องค่ะ');
      }

      setMessage('ยืนยันตัวตนสำเร็จเรียบร้อยแล้วค่ะ! กรุณาตั้งรหัสผ่านใหม่');
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!newPassword || newPassword.length < 6) {
      setError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษรค่ะ');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน กรุณาตรวจสอบอีกครั้งนะคะ');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          newPassword
        })
      });
      
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่านค่ะ');
      }

      if (!res.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่านค่ะ');
      }

      if (onSuccess) {
        onSuccess('เปลี่ยนรหัสผ่านใหม่สำเร็จแล้วค่ะ! สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที 🎉');
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(8, 5, 20, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem'
      }}
    >
      <div 
        className="modal-content glass"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          width: '90%',
          padding: '2rem',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(138, 92, 245, 0.2)',
          color: 'var(--text-main)',
          textAlign: 'left',
          margin: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <KeyRound size={20} color="var(--primary)" />
            รีเซ็ตรหัสผ่าน (2-Step Verification) 🔑
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-muted)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '4px', borderRadius: '4px', background: step >= 1 ? 'var(--primary)' : 'rgba(255,255,255,0.1)', transition: 'var(--transition-smooth)' }} />
          <div style={{ flex: 1, height: '4px', borderRadius: '4px', background: step >= 2 ? 'var(--primary)' : 'rgba(255,255,255,0.1)', transition: 'var(--transition-smooth)' }} />
          <div style={{ flex: 1, height: '4px', borderRadius: '4px', background: step >= 3 ? 'var(--accent-teal)' : 'rgba(255,255,255,0.1)', transition: 'var(--transition-smooth)' }} />
        </div>

        {/* Alert Error Box */}
        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--priority-high)',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontSize: '0.82rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Alert Security Notice Box */}
        {message && (
          <div style={{
            background: 'rgba(138, 92, 245, 0.12)',
            border: '1px solid rgba(138, 92, 245, 0.3)',
            color: 'var(--accent-purple)',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700
          }}>
            <ShieldCheck size={18} style={{ flexShrink: 0 }} />
            <span>{message}</span>
          </div>
        )}

        {/* STEP 1: Enter Registered Email */}
        {step === 1 && (
          <form onSubmit={handleRequestCode}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
              กรุณากรอกอีเมลที่เคยใช้สมัครบัญชีระบบ Focus Space เพื่อขอรับรหัสยืนยันความปลอดภัย OTP 6 หลักนะคะ
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                อีเมลลงทะเบียน (Email)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={18} /> กำลังตรวจสอบ...</>
              ) : (
                <>ส่งคำขอรหัสยืนยัน OTP <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Enter Verification OTP Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
              กรอกรหัสยืนยันความปลอดภัย 6 หลักที่คุณได้รับลงในช่องด้านล่างเพื่อยืนยันตัวตนค่ะ
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                รหัสยืนยันความปลอดภัย (6-digit OTP Code)
              </label>
              <input
                type="text"
                maxLength={6}
                required
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-main)',
                  fontSize: '1.3rem',
                  letterSpacing: '6px',
                  textAlign: 'center',
                  fontWeight: 800
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep(1)}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                ย้อนกลับ
              </button>
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'ยืนยันรหัส OTP'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Set New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
              ยืนยันตัวตนสำเร็จ! กรุณากำหนดรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษรค่ะ)
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                รหัสผ่านใหม่ (New Password)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                ยืนยันรหัสผ่านใหม่ (Confirm Password)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem'
                  }}
                />
                <CheckCircle2 size={16} color="var(--accent-teal)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || newPassword !== confirmPassword}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
            >
              {loading ? (
                <><Loader2 className="animate-spin" size={18} /> กำลังบันทึก...</>
              ) : (
                'บันทึกรหัสผ่านใหม่ 🎉'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
