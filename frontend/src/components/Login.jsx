import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../apiConfig';
import { Sparkles, Calendar, Timer, BrainCircuit, ShieldCheck, CheckCircle2, Award, ArrowRight, Lock, Check } from 'lucide-react';

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
    setTimeout(() => setClickEffect(false), 800);
  };

  return (
    <div className="login-page-wrapper">
      <style>{`
        .login-page-wrapper {
          position: relative;
          width: 100vw;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fbfdfc;
          padding: 2.5rem 1.5rem;
          color: #1e293b;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        /* Subtle Ambient Glowing Orbs */
        .ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }
        .orb-1 {
          top: -5%;
          left: -5%;
          width: 550px;
          height: 550px;
          background: radial-gradient(circle, rgba(187, 247, 208, 0.45) 0%, transparent 70%);
        }
        .orb-2 {
          top: -5%;
          right: -5%;
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, rgba(254, 205, 211, 0.4) 0%, transparent 70%);
        }
        .orb-3 {
          bottom: -5%;
          left: 10%;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(254, 240, 138, 0.3) 0%, transparent 70%);
        }
        .orb-4 {
          bottom: -5%;
          right: 5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(199, 210, 254, 0.35) 0%, transparent 70%);
        }

        /* Delicate Dot Grid Background */
        .bg-dots {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(76, 175, 80, 0.08) 1.2px, transparent 1.2px);
          background-size: 26px 26px;
          pointer-events: none;
          z-index: 2;
        }

        /* Responsive Layout Container */
        .login-main-container {
          position: relative;
          z-index: 10;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 3rem;
          width: 100%;
          max-width: 1160px;
          align-items: center;
        }

        @media (max-width: 960px) {
          .login-main-container {
            grid-template-columns: 1fr;
            gap: 2.25rem;
            max-width: 520px;
          }
        }

        /* Floating Botanical Badges */
        .floating-leaf {
          position: absolute;
          pointer-events: none;
          z-index: 3;
          animation: floatSlow 7s infinite ease-in-out;
          opacity: 0.65;
          filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.04));
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(6deg); }
        }

        /* Left Hero Showcase */
        .hero-title {
          font-size: 2.35rem;
          font-weight: 800;
          line-height: 1.28;
          color: #1b4332;
          margin: 0 0 0.85rem 0;
          letter-spacing: -0.5px;
        }
        .hero-title .gradient-text {
          background: linear-gradient(135deg, #1b4332 0%, #2e7d32 50%, #15803d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Interactive Garden Preview Card */
        .interactive-garden-card {
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(76, 175, 80, 0.28);
          border-radius: 24px;
          padding: 1.25rem 1.4rem;
          box-shadow: 0 12px 32px rgba(46, 125, 50, 0.08);
          margin-bottom: 1.25rem;
          transition: all 0.3s ease;
        }
        .interactive-garden-card:hover {
          border-color: rgba(76, 175, 80, 0.45);
          box-shadow: 0 16px 40px rgba(46, 125, 50, 0.12);
        }

        .flower-item-pill {
          flex: 1;
          text-align: center;
          padding: 0.6rem 0.2rem;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1.5px solid transparent;
          background: transparent;
        }
        .flower-item-pill:hover {
          background: rgba(76, 175, 80, 0.1);
          transform: translateY(-3px);
        }
        .flower-item-pill.active {
          background: rgba(76, 175, 80, 0.16);
          border-color: #4caf50;
          box-shadow: 0 4px 14px rgba(76, 175, 80, 0.18);
          transform: translateY(-3px) scale(1.04);
        }

        /* 4 Bento Feature Items */
        .bento-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }
        .bento-card {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(76, 175, 80, 0.2);
          border-radius: 18px;
          padding: 0.85rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: all 0.25s ease;
        }
        .bento-card:hover {
          background: #ffffff;
          border-color: rgba(76, 175, 80, 0.45);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(46, 125, 50, 0.1);
        }

        /* Right Side: Premium Glass Login Card */
        .login-glass-card {
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          border-radius: 30px;
          padding: 2.5rem 2.25rem;
          box-shadow: 
            0 20px 45px -10px rgba(46, 125, 50, 0.12),
            0 0 0 1px rgba(76, 175, 80, 0.14),
            0 8px 20px rgba(0, 0, 0, 0.02);
          text-align: center;
        }

        /* Official Google Sign-In Button */
        .btn-google-official {
          width: 100%;
          padding: 0.95rem 1.4rem;
          border-radius: 16px;
          background: #ffffff;
          color: #1f2937;
          border: 1px solid rgba(0, 0, 0, 0.12);
          font-weight: 700;
          font-size: 1.02rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-google-official:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(66, 133, 244, 0.2);
          border-color: rgba(66, 133, 244, 0.45);
          background: #fafbfc;
        }
        .btn-google-official:active:not(:disabled) {
          transform: translateY(0px);
        }
        .btn-google-official:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Trust Feature Item */
        .trust-feature-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          text-align: left;
        }
        .trust-icon-pill {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
      `}</style>

      {/* Ambient Radial Gradient Orbs */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />
      <div className="ambient-orb orb-3" />
      <div className="ambient-orb orb-4" />

      {/* Subtle Dot Grid Background */}
      <div className="bg-dots" />

      {/* Floating Botanical Atmospheric Accents */}
      <div className="floating-leaf" style={{ top: '8%', left: '6%', fontSize: '1.6rem', animationDelay: '0s' }}>🍃</div>
      <div className="floating-leaf" style={{ top: '14%', right: '8%', fontSize: '1.8rem', animationDelay: '1.5s' }}>🌸</div>
      <div className="floating-leaf" style={{ bottom: '10%', left: '8%', fontSize: '1.7rem', animationDelay: '0.8s' }}>🌱</div>
      <div className="floating-leaf" style={{ bottom: '12%', right: '6%', fontSize: '1.9rem', animationDelay: '2.2s' }}>🌻</div>
      <div className="floating-leaf" style={{ top: '48%', left: '3%', fontSize: '1.3rem', animationDelay: '3.1s' }}>✨</div>

      {/* Main 2-Column Responsive Layout */}
      <div className="login-main-container">
        
        {/* ============================================== */}
        {/* LEFT COLUMN: Hero Presentation & Features      */}
        {/* ============================================== */}
        <div style={{ textAlign: 'left' }}>
          
          {/* Institution Trust Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.14) 0%, rgba(244, 114, 182, 0.12) 100%)',
            border: '1px solid rgba(76, 175, 80, 0.32)',
            color: '#2e7d32',
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 800,
            marginBottom: '0.9rem',
            boxShadow: '0 2px 10px rgba(76, 175, 80, 0.08)'
          }}>
            <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span>FOCUS SPACE • สวนสมาธิ มทร.อีสาน (RMUTI) 🌸🍃</span>
          </div>

          {/* Hero Headline */}
          <h1 className="hero-title">
            เนรมิตเวลาโฟกัสของคุณ <br />
            <span className="gradient-text">ให้กลายเป็นสวนดอกไม้เบ่งบาน</span> 🌸✨
          </h1>

          {/* Subtitle Description */}
          <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
            เปลี่ยนทุก 25 นาทีของการตั้งใจทำงานให้กลายเป็นดอกไม้และสัตว์เทพผู้พิทักษ์ พร้อมระบบผู้ช่วย AI ช่วยวิเคราะห์งานด่วน และซิงค์เดดไลน์กับ Google Calendar ในคลิกเดียวค่ะ
          </p>

          {/* Mini Interactive Garden Showcase Card */}
          <div className="interactive-garden-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1b4332', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🏡 ตัวอย่างผลผลิตในสวนประจำสัปดาห์
              </span>
              <span style={{ 
                fontSize: '0.74rem', 
                color: '#15803d', 
                fontWeight: 800, 
                background: 'rgba(76, 175, 80, 0.16)', 
                border: '1px solid rgba(76, 175, 80, 0.25)',
                padding: '3px 10px', 
                borderRadius: '12px' 
              }}>
                สะสมแล้ว {interactiveCount} ต้น 🐝
              </span>
            </div>

            <p style={{ fontSize: '0.73rem', color: '#64748b', margin: '0 0 0.65rem 0' }}>
              👇 <em>ลองคลิกดอกไม้ของแต่ละวันเพื่อดูดอกไม้เติบโตล่วงหน้าได้เลยค่ะ!</em>
            </p>

            {/* 7 Days Flower Grid */}
            <div style={{ 
              display: 'flex', 
              gap: '4px',
              padding: '0.5rem 0.35rem', 
              background: 'rgba(255, 255, 255, 0.85)', 
              borderRadius: '16px', 
              border: '1px solid rgba(76, 175, 80, 0.18)' 
            }}>
              {FLOWERS_SHOWCASE.map((item, idx) => (
                <div 
                  key={idx}
                  className={`flower-item-pill ${activeFlowerIndex === idx ? 'active' : ''}`}
                  onClick={() => handleFlowerClick(idx)}
                  title={`กดเพื่อรดน้ำ ${item.name}`}
                >
                  <div style={{ 
                    fontSize: '1.4rem', 
                    transform: activeFlowerIndex === idx ? 'scale(1.15)' : 'scale(1)', 
                    transition: 'transform 0.2s ease' 
                  }}>
                    {item.emoji}
                  </div>
                  <span style={{ 
                    fontSize: '0.62rem', 
                    fontWeight: 800, 
                    color: activeFlowerIndex === idx ? '#2e7d32' : '#64748b', 
                    display: 'block', 
                    marginTop: '2px',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.day}
                  </span>
                </div>
              ))}
            </div>

            {/* Click Toast */}
            {clickEffect && (
              <div style={{ 
                fontSize: '0.76rem', 
                color: '#15803d', 
                fontWeight: 800, 
                textAlign: 'center', 
                marginTop: '0.45rem', 
                animation: 'fadeIn 0.25s ease' 
              }}>
                ✨ {FLOWERS_SHOWCASE[activeFlowerIndex].name} เบ่งบานแล้ว! +1 ความสำเร็จ 🌸🌱
              </div>
            )}
          </div>

          {/* 4 Bento Feature Highlights Grid */}
          <div className="bento-grid">
            <div className="bento-card">
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(76, 175, 80, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32', flexShrink: 0 }}>
                <Timer size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#1b4332' }}>ปลูกต้นไม้ Pomodoro</h4>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>โฟกัสเต็มจอ ไร้สิ่งรบกวน</span>
              </div>
            </div>

            <div className="bento-card">
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(244, 114, 182, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#db2777', flexShrink: 0 }}>
                <Calendar size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#1b4332' }}>Google Calendar</h4>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>ซิงค์เดดไลน์อัตโนมัติ</span>
              </div>
            </div>

            <div className="bento-card">
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea', flexShrink: 0 }}>
                <BrainCircuit size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#1b4332' }}>Gemini AI Priority</h4>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>คัดสรรงานด่วนอัจฉริยะ</span>
              </div>
            </div>

            <div className="bento-card">
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(14, 165, 233, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>
                <Award size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: '#1b4332' }}>สหายเทพ & สถิติ</h4>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>ปลดล็อกสัตว์เทพและเกียรติยศ</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================== */}
        {/* RIGHT COLUMN: Premium Glass Login Card         */}
        {/* ============================================== */}
        <div className="login-glass-card">
          
          {/* Glowing Dual-Ring Brand Logo */}
          <div style={{
            position: 'relative',
            width: '68px',
            height: '68px',
            margin: '0 auto 1.15rem auto'
          }}>
            {/* Outer Soft Ring */}
            <div style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '24px',
              background: 'rgba(76, 175, 80, 0.2)',
              filter: 'blur(4px)'
            }} />
            {/* Inner Gradient Squircle */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: '0 8px 24px rgba(46, 125, 50, 0.3)'
            }}>
              🌸
            </div>
          </div>

          {/* Login Card Titles */}
          <h2 style={{
            margin: '0 0 0.35rem 0',
            fontSize: '1.65rem',
            fontWeight: 800,
            color: '#1b4332'
          }}>
            เข้าสู่ระบบ Focus Space
          </h2>
          
          <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1.5rem 0' }}>
            เข้าสู่ระบบด้วยบัญชีสถาบัน (@rmuti.ac.th) เพื่อซิงค์ปฏิทินและเข้าสู่สวนสมาธิของคุณค่ะ 🌸
          </p>

          {/* Error Alert Box */}
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              color: '#e11d48',
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              fontSize: '0.82rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              textAlign: 'left'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Authentic Google Sign-In Button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              className="btn-google-official"
              onClick={handleGoogleOAuthLogin}
              disabled={loading}
            >
              {loading ? (
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid rgba(76, 175, 80, 0.3)',
                  borderTopColor: '#2e7d32',
                  animation: 'spin 0.8s linear infinite'
                }} />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>{loading ? 'กำลังเชื่อมต่อระบบ Google...' : 'เข้าสู่ระบบด้วย Google'}</span>
            </button>
          </div>

          {/* Polished Trust & Features Container */}
          <div style={{
            background: 'rgba(76, 175, 80, 0.06)',
            border: '1px solid rgba(76, 175, 80, 0.22)',
            borderRadius: '20px',
            padding: '1.15rem 1.15rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div className="trust-feature-row">
              <div className="trust-icon-pill" style={{ background: 'rgba(76, 175, 80, 0.16)', color: '#2e7d32' }}>
                <Check size={16} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1b4332' }}>
                  ซิงค์ Google Calendar อัตโนมัติ
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  ดึงเดดไลน์จากชั้นเรียนมาจัดตารางสมาธิให้อัตโนมัติ
                </div>
              </div>
            </div>

            <div className="trust-feature-row">
              <div className="trust-icon-pill" style={{ background: 'rgba(14, 165, 233, 0.16)', color: '#0284c7' }}>
                <ShieldCheck size={16} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1b4332' }}>
                  ปลอดภัย 100% ผ่าน Google OAuth
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  ไม่ต้องจำรหัสผ่านใหม่ เข้าใช้งานด้วยอีเมลสถาบันได้อย่างปลอดภัย
                </div>
              </div>
            </div>

            <div className="trust-feature-row">
              <div className="trust-icon-pill" style={{ background: 'rgba(244, 114, 182, 0.16)', color: '#db2777' }}>
                <Sparkles size={16} strokeWidth={2.5} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1b4332' }}>
                  เริ่มต้นสวนสมาธิได้ทันที
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  ระบบจะสร้างโปรไฟล์และสวนสมาธิส่วนตัวให้อัตโนมัติในคลิกเดียว
                </div>
              </div>
            </div>
          </div>

          {/* Institutional Subtext Footer */}
          <div style={{
            marginTop: '1.25rem',
            fontSize: '0.72rem',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            <span>🍃 สวนสมาธิเพื่อการเรียนรู้ มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน</span>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
