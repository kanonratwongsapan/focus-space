import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../apiConfig';
import { Sparkles, Calendar, Timer, BrainCircuit, Heart, ShieldCheck, CheckCircle2, Award, Zap, Star } from 'lucide-react';

const FLOWERS_SHOWCASE = [
  { day: 'จันทร์', name: 'ทานตะวัน', emoji: '🌻', color: '#eab308' },
  { day: 'อังคาร', name: 'ซากุระ', emoji: '🌸', color: '#ec4899' },
  { day: 'พุธ (เก่งสุด)', name: 'ทานตะวันราชา', emoji: '👑 🌻', color: '#eab308', special: true },
  { day: 'พฤหัสบดี', name: 'ทิวลิป', emoji: '🌷', color: '#f43f5e' },
  { day: 'ศุกร์', name: 'เดซี่', emoji: '🌼', color: '#f59e0b' },
  { day: 'เสาร์', name: 'กุหลาบ', emoji: '🌹', color: '#e11d48' },
  { day: 'อาทิตย์', name: 'ต้นกล้า', emoji: '🌱', color: '#10b981' }
];

const Login = () => {
  const { loginWithGoogleOAuth, error, setError } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');

  // Interactive Live Garden Simulator States
  const [interactiveCount, setInteractiveCount] = useState(18);
  const [activeFlowerIndex, setActiveFlowerIndex] = useState(2);
  const [clickEffect, setClickEffect] = useState(false);

  useEffect(() => {
    setError(null);

    // Fetch global Google Client ID from backend with dynamic hostname
    fetch(`${API_URL}/auth/config`)
      .then(res => res.json())
      .then(data => {
        setConfigLoading(false);
        if (data.googleClientId) {
          setGoogleClientId(data.googleClientId);
        } else {
          setConfigError(true);
        }
      })
      .catch(err => {
        console.error('Failed to load Google Config:', err);
        setConfigLoading(false);
        setConfigError(true);
      });
  }, []);

  const ensureGoogleLoaded = (callback) => {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
      callback();
      return;
    }

    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      document.body.appendChild(script);
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        clearInterval(interval);
        callback();
      } else if (attempts > 30) {
        clearInterval(interval);
        setLoading(false);
        alert('การเชื่อมต่อกับระบบ Google API ล่าช้า กรุณาตรวจสอบสัญญาณอินเทอร์เน็ตแล้วกดลองใหม่อีกครั้งค่ะ');
      }
    }, 100);
  };

  const handleGoogleOAuthLogin = () => {
    setLoading(true);

    ensureGoogleLoaded(() => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId || '210886144254-9n7riasmgaikot2rql7i5riofs44gioi.apps.googleusercontent.com',
          scope: 'email profile https://www.googleapis.com/auth/calendar.events',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              console.error(tokenResponse);
              setLoading(false);
              return;
            }
            
            const result = await loginWithGoogleOAuth(tokenResponse.access_token);
            setLoading(false);
            if (result.success) {
              setError(null);
            }
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        console.error('OAuth initialization failed:', err);
        setLoading(false);
      }
    });
  };

  const handleFlowerClick = (index) => {
    setActiveFlowerIndex(index);
    setInteractiveCount(prev => prev + 1);
    setClickEffect(true);
    setTimeout(() => setClickEffect(false), 500);
  };

  return (
    <div className="botanical-portal-bg">
      <style>{`
        .botanical-portal-bg {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 10% 20%, rgba(220, 252, 231, 0.8) 0%, rgba(253, 242, 248, 0.8) 50%, rgba(236, 253, 245, 0.9) 100%);
          padding: 2.5rem 1.5rem;
          color: #1e293b;
          overflow-x: hidden;
        }
        .botanical-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 2.5rem;
          width: 100%;
          max-width: 1100px;
          align-items: center;
          z-index: 10;
        }
        .floating-particle {
          position: absolute;
          pointer-events: none;
          animation: float 6s infinite ease-in-out;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(8deg); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(76, 175, 80, 0.4); box-shadow: 0 20px 50px rgba(76, 175, 80, 0.2), 0 0 35px rgba(244, 114, 182, 0.15); }
          50% { border-color: rgba(244, 114, 182, 0.45); box-shadow: 0 25px 60px rgba(76, 175, 80, 0.3), 0 0 45px rgba(76, 175, 80, 0.25); }
        }
        .glass-card-bright {
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 2px solid rgba(76, 175, 80, 0.35);
          border-radius: 28px;
          padding: 2.5rem 2.25rem;
          animation: borderGlow 5s infinite ease-in-out;
        }
        .feature-card-item {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(76, 175, 80, 0.25);
          border-radius: 18px;
          padding: 0.9rem 1.1rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .feature-card-item:hover {
          background: #ffffff;
          transform: translateY(-3px);
          border-color: #4caf50;
          box-shadow: 0 10px 24px rgba(76, 175, 80, 0.18);
        }
        .flower-plot-btn {
          text-align: center;
          padding: 0.5rem 0.25rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
          border: 1.5px solid transparent;
        }
        .flower-plot-btn:hover {
          background: rgba(76, 175, 80, 0.15);
          transform: scale(1.1);
        }
        .flower-plot-btn.active {
          background: rgba(76, 175, 80, 0.2);
          border-color: #4caf50;
          transform: scale(1.12);
        }
        .btn-google-login {
          width: 100%;
          padding: 1rem 1.5rem;
          border-radius: 20px;
          background: #ffffff;
          color: #1f2937;
          border: 2px solid rgba(76, 175, 80, 0.4);
          font-weight: 800;
          font-size: 1.08rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          box-shadow: 0 10px 28px rgba(76, 175, 80, 0.22);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-google-login:hover {
          transform: translateY(-4px) scale(1.01);
          border-color: #4caf50;
          box-shadow: 0 14px 35px rgba(76, 175, 80, 0.32);
          background: #f8fafc;
        }
      `}</style>

      {/* Floating Botanical Leaf & Blossom Particles */}
      <div className="floating-particle" style={{ top: '6%', left: '8%', fontSize: '1.8rem', animationDelay: '0s' }}>🍃</div>
      <div className="floating-particle" style={{ top: '12%', left: '88%', fontSize: '2rem', animationDelay: '1.2s' }}>🌸</div>
      <div className="floating-particle" style={{ top: '78%', left: '6%', fontSize: '1.8rem', animationDelay: '0.8s' }}>🌱</div>
      <div className="floating-particle" style={{ top: '82%', left: '92%', fontSize: '2rem', animationDelay: '2.5s' }}>🌻</div>
      <div className="floating-particle" style={{ top: '48%', left: '46%', fontSize: '1.5rem', animationDelay: '1.8s' }}>🐝</div>
      <div className="floating-particle" style={{ top: '35%', left: '82%', fontSize: '1.5rem', animationDelay: '3.2s' }}>🦋</div>
      <div className="floating-particle" style={{ top: '65%', left: '15%', fontSize: '1.4rem', animationDelay: '2.1s' }}>✨</div>

      {/* Main Botanical Layout Grid */}
      <div className="botanical-grid">
        
        {/* LEFT COLUMN: Rich Botanical Showcase & Feature Cards */}
        <div style={{ textAlign: 'left' }}>
          
          {/* Top Trust Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(244, 114, 182, 0.12) 100%)',
            border: '1.5px solid rgba(76, 175, 80, 0.35)',
            color: '#2e7d32',
            padding: '6px 16px',
            borderRadius: '24px',
            fontSize: '0.8rem',
            fontWeight: 800,
            marginBottom: '1rem',
            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.1)'
          }}>
            <Sparkles size={16} color="#4caf50" />
            <span>FOCUS SPACE • สวนสมาธิ มทร.อีสาน (RMUTI) 🌸🍃</span>
          </div>

          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            lineHeight: 1.3,
            color: '#1b4332',
            marginBottom: '0.75rem',
            letterSpacing: '-0.5px'
          }}>
            เนรมิตเวลาโฟกัสของคุณ <br />
            ให้กลายเป็นสวนดอกไม้เบ่งบาน 🌸🍃✨
          </h1>

          <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            เปลี่ยนทุกๆ 25 นาทีการโฟกัสและการทำภารกิจให้กลายเป็นดอกไม้เติบโตในสวนความสำเร็จ ซิงค์เดดไลน์อัตโนมัติกับ Google Calendar ในคลิกเดียวค่ะ
          </p>

          {/* Mini Interactive Garden Showcase Box */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(232, 245, 233, 0.9) 100%)',
            border: '1.5px solid rgba(76, 175, 80, 0.35)',
            borderRadius: '24px',
            padding: '1.25rem 1.35rem',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 30px rgba(76, 175, 80, 0.12)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🏡 สวนความสำเร็จสัปดาห์นี้ของคุณ
              </span>
              <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 800, background: 'rgba(76, 175, 80, 0.18)', padding: '3px 10px', borderRadius: '12px' }}>
                สะสมแล้ว {interactiveCount} ต้น 🐝
              </span>
            </div>

            <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
              👇 <em>ลองคลิกดอกไม้แต่ละวันเพื่อดูดอกไม้เบ่งบานล่วงหน้าได้เลยค่ะ!</em>
            </p>

            {/* Interactive Garden Blooming Plot Rows */}
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '0.75rem 0.25rem', background: 'rgba(255,255,255,0.75)', borderRadius: '16px', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
              {FLOWERS_SHOWCASE.map((item, idx) => (
                <div 
                  key={idx}
                  className={`flower-plot-btn ${activeFlowerIndex === idx ? 'active' : ''}`}
                  onClick={() => handleFlowerClick(idx)}
                  title={`กดเพื่อรดน้ำ ${item.name}`}
                >
                  <div style={{ fontSize: '1.5rem', transform: activeFlowerIndex === idx ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.2s ease' }}>
                    {item.emoji}
                  </div>
                  <span style={{ fontSize: '0.64rem', fontWeight: 800, color: activeFlowerIndex === idx ? '#2e7d32' : '#64748b', display: 'block', marginTop: '2px' }}>
                    {item.day}
                  </span>
                </div>
              ))}
            </div>

            {clickEffect && (
              <div style={{ fontSize: '0.78rem', color: '#2e7d32', fontWeight: 800, textAlign: 'center', marginTop: '0.5rem', animation: 'fadeIn 0.3s ease' }}>
                ✨ {FLOWERS_SHOWCASE[activeFlowerIndex].name} เบ่งบานแล้ว! +1 ความสำเร็จ 🌸
              </div>
            )}
          </div>

          {/* Feature Highlights Bento Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
            <div className="feature-card-item">
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(76, 175, 80, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32', flexShrink: 0 }}>
                <Timer size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>ปลูกต้นไม้ Pomodoro</h4>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>ฟูมฟักดอกไม้ขณะโฟกัส</span>
              </div>
            </div>

            <div className="feature-card-item">
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(244, 114, 182, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#db2777', flexShrink: 0 }}>
                <Calendar size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Google Calendar</h4>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>ซิงค์เดดไลน์อัตโนมัติ</span>
              </div>
            </div>

            <div className="feature-card-item">
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea', flexShrink: 0 }}>
                <BrainCircuit size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Gemini AI Priority</h4>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>คัดสรรงานด่วนอัจฉริยะ</span>
              </div>
            </div>

            <div className="feature-card-item">
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>
                <Award size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>Garden Statistics</h4>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>ติดตามพัฒนาการสะสม</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Exclusive Google Sign-In Portal */}
        <div className="glass-card-bright" style={{ textAlign: 'center' }}>
          
          {/* Glowing Animated Logo Icon */}
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 12px 30px rgba(76, 175, 80, 0.35)',
            fontSize: '2.25rem'
          }}>
            🌸
          </div>

          <h2 style={{
            margin: '0 0 0.4rem 0',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#1b4332'
          }}>
            เข้าสู่ระบบ Focus Space 🔑
          </h2>
          
          <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
            เข้าสู่ระบบด้วยบัญชีสถาบัน (@rmuti.ac.th) เพื่อซิงค์ปฏิทินและเข้าสู่สวนสมาธิของคุณค่ะ 🌸
          </p>

          {/* Error Alert Box */}
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              color: '#e11d48',
              padding: '0.85rem 1.15rem',
              borderRadius: '16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              border: '1.5px solid rgba(244, 63, 94, 0.3)',
              textAlign: 'left'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Exclusive Google Sign-In Button */}
          <div style={{ marginBottom: '1.75rem' }}>
            <button
              type="button"
              className="btn-google-login"
              onClick={handleGoogleOAuthLogin}
              disabled={loading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google 🌐'}</span>
            </button>
          </div>

          {/* Feature Benefit Card */}
          <div style={{
            background: 'rgba(76, 175, 80, 0.08)',
            border: '1.5px solid rgba(76, 175, 80, 0.25)',
            borderRadius: '20px',
            padding: '1.15rem 1.25rem',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2e7d32', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} />
              <span>ความปลอดภัย & การซิงค์อัตโนมัติ</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
              <li>ซิงค์บัญชี Google Calendar ในคลิกเดียว</li>
              <li>ไม่ต้องจำรหัสผ่านใหม่ ปลอดภัย 100%</li>
              <li>ระบบจะสร้างโปรไฟล์และสวนสมาธิให้อัตโนมัติ</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
