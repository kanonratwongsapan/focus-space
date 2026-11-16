import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { API_URL } from '../apiConfig';
import { 
  Sparkles, Cpu, Key, CheckCircle2, AlertCircle, Loader2, 
  Eye, EyeOff, Save, RefreshCw, Zap, ShieldCheck, Layers, Bot, ChevronRight
} from 'lucide-react';

const AI_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'ฟรี / แนะนำสำหรับสถานศึกษา',
    color: '#2e7d32',
    bg: 'rgba(46, 125, 50, 0.08)',
    border: 'rgba(46, 125, 50, 0.3)',
    icon: '🌸',
    description: 'ประมวลผลคำสั่งภาษาไทยได้รวดเร็ว รองรับข้อความยาว และโควตาฟรีครอบคลุมการใช้งานของนักศึกษา',
    models: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (เร็วและแม่นยำสูง - แนะนำ)' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (วิเคราะห์เชิงลึกขั้นสูง)' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (รุ่นทดลองความเร็วสูง)' }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    badge: 'มาตรฐานอุตสาหกรรม',
    color: '#10a37f',
    bg: 'rgba(16, 163, 127, 0.08)',
    border: 'rgba(16, 163, 127, 0.3)',
    icon: '🧠',
    description: 'โมเดลชั้นนำระดับโลก มีความเสถียรและความเข้าใจบริบทซับซ้อนสูงเยี่ยม',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (คุ้มค่า รวดเร็ว - แนะนำ)' },
      { id: 'gpt-4o', name: 'GPT-4o (โมเดลเรือธง ความสามารถสูงสุด)' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (โมเดลดั้งเดิม)' }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    badge: 'รวมโมเดลเปิดชั้นนำ (Open Source)',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.08)',
    border: 'rgba(99, 102, 241, 0.3)',
    icon: '🌐',
    description: 'เชื่อมต่อโมเดลชั้นนำระดับโลก เช่น Llama 3.3, Claude 3.5 Sonnet, Mistral และ DeepSeek ในที่เดียว',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B Instruct (โอเพนซอร์สอันดับ 1 - แนะนำ)' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (ฉลาดและเป็นธรรมชาติ)' },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat V3 (ประหยัดและแม่นยำ)' },
      { id: 'google/gemini-flash-1.5', name: 'Gemini 1.5 Flash via OpenRouter' }
    ]
  }
];

const AdminSettings = () => {
  const { token, user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeProvider, setActiveProvider] = useState('gemini');
  
  // Credentials state
  const [credentials, setCredentials] = useState({
    gemini: { apiKey: '', model: 'gemini-1.5-flash', isConfigured: false },
    openai: { apiKey: '', model: 'gpt-4o-mini', isConfigured: false },
    openrouter: { apiKey: '', model: 'meta-llama/llama-3.3-70b-instruct', isConfigured: false }
  });

  const [showKey, setShowKey] = useState({
    gemini: false,
    openai: false,
    openrouter: false
  });

  const [customModelInput, setCustomModelInput] = useState({
    gemini: false,
    openai: false,
    openrouter: false
  });

  // Test connection state
  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState({});

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch AI Config
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/ai-config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          setActiveProvider(data.config.activeProvider || 'gemini');
          setCredentials({
            gemini: {
              apiKey: data.config.gemini?.apiKey || '',
              model: data.config.gemini?.model || 'gemini-1.5-flash',
              isConfigured: !!data.config.gemini?.isConfigured
            },
            openai: {
              apiKey: data.config.openai?.apiKey || '',
              model: data.config.openai?.model || 'gpt-4o-mini',
              isConfigured: !!data.config.openai?.isConfigured
            },
            openrouter: {
              apiKey: data.config.openrouter?.apiKey || '',
              model: data.config.openrouter?.model || 'meta-llama/llama-3.3-70b-instruct',
              isConfigured: !!data.config.openrouter?.isConfigured
            }
          });
        }
      }
    } catch (err) {
      console.error('Failed to load AI config:', err);
      showToast('ไม่สามารถโหลดการตั้งค่าได้ กำลังใช้งานโหมดเริ่มต้น', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [token]);

  // Handle Save
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        activeProvider,
        gemini: {
          apiKey: credentials.gemini.apiKey,
          model: credentials.gemini.model
        },
        openai: {
          apiKey: credentials.openai.apiKey,
          model: credentials.openai.model
        },
        openrouter: {
          apiKey: credentials.openrouter.apiKey,
          model: credentials.openrouter.model
        }
      };

      const res = await fetch(`${API_URL}/admin/ai-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'บันทึกการตั้งค่าระบบ AI สำเร็จเรียบร้อยค่ะ 🌸');
        fetchConfig(); // Reload masked keys
      } else {
        showToast(data.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
      }
    } catch (err) {
      showToast('บันทึกไม่สำเร็จ: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handle Test Connection
  const handleTestConnection = async (providerId) => {
    setTestingProvider(providerId);
    setTestResult(prev => ({ ...prev, [providerId]: null }));

    try {
      const targetCred = credentials[providerId];
      const payload = {
        provider: providerId,
        apiKey: targetCred.apiKey,
        model: targetCred.model
      };

      const res = await fetch(`${API_URL}/admin/ai-config/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult(prev => ({
          ...prev,
          [providerId]: {
            success: true,
            latencyMs: data.latencyMs,
            message: `เชื่อมต่อสำเร็จ! ความเร็วตอบสนอง ${data.latencyMs} ms (${data.model})`
          }
        }));
      } else {
        setTestResult(prev => ({
          ...prev,
          [providerId]: {
            success: false,
            latencyMs: data.latencyMs,
            error: data.error || data.message || 'ไม่สามารถเชื่อมต่อกับผู้ให้บริการนี้ได้'
          }
        }));
      }
    } catch (err) {
      setTestResult(prev => ({
        ...prev,
        [providerId]: {
          success: false,
          error: 'เครือข่ายขัดข้อง: ' + err.message
        }
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
        color: '#2e7d32'
      }}>
        <Loader2 size={36} className="animate-spin" />
        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>กำลังโหลดการตั้งค่าสถาปัตยกรรม AI...</span>
      </div>
    );
  }

  return (
    <div className="admin-settings-container" style={{
      maxWidth: '1000px',
      margin: '0 auto',
      paddingBottom: '4rem',
      textAlign: 'left'
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 100000,
          background: toast.type === 'error' ? '#fee2e2' : '#dcfce7',
          color: toast.type === 'error' ? '#991b1b' : '#166534',
          border: `1px solid ${toast.type === 'error' ? '#f87171' : '#86efac'}`,
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 700,
          fontSize: '0.9rem',
          animation: 'fadeInSlide 0.3s ease'
        }}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(129, 199, 132, 0.08) 100%)',
        border: '1px solid rgba(76, 175, 80, 0.25)',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>⚙️</span>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#2e7d32',
              textTransform: 'uppercase',
              letterSpacing: '0.75px',
              background: 'rgba(76, 175, 80, 0.15)',
              padding: '3px 10px',
              borderRadius: '20px'
            }}>
              สถาปัตยกรรมระดับสถาบัน (Enterprise AI Architecture)
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1b4332', margin: '0 0 0.5rem 0' }}>
            ระบบเลือกโมเดลและสถาปัตยกรรม AI
          </h2>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#4a6b57', lineHeight: 1.6 }}>
            ศูนย์กลางการเลือกผู้ให้บริการปัญญาประดิษฐ์ (Multi-Provider Model Switcher) รองรับทั้ง Google Gemini, OpenAI และ OpenRouter 
            ช่วยให้นักศึกษาและอาจารย์สามารถเลือกหรือทดสอบโมเดลที่ต้องการได้อย่างอิสระตามคำแนะนำของอาจารย์ที่ปรึกษา
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '16px',
            padding: '0.85rem 1.75rem',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 20px rgba(46, 125, 50, 0.3)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}</span>
        </button>
      </div>

      {/* Section 1: Active Provider Selection */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Zap size={20} color="#2e7d32" />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1b4332' }}>
            1. เลือกผู้ให้บริการ AI หลักสำหรับวิเคราะห์ภารกิจ (Active Provider)
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {AI_PROVIDERS.map(p => {
            const isSelected = activeProvider === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setActiveProvider(p.id)}
                style={{
                  background: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.65)',
                  border: isSelected ? `2px solid ${p.color}` : '1px solid rgba(76, 175, 80, 0.2)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: isSelected ? `0 10px 30px ${p.color}25` : '0 4px 15px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.2s ease',
                  transform: isSelected ? 'translateY(-2px)' : 'none'
                }}
              >
                {/* Header of Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{p.icon}</span>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1b4332' }}>
                      {p.name}
                    </h4>
                  </div>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: isSelected ? `6px solid ${p.color}` : '2px solid #cbd5e1',
                    background: '#ffffff',
                    transition: 'all 0.2s ease'
                  }} />
                </div>

                <div style={{
                  display: 'inline-block',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: p.color,
                  background: p.bg,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  marginBottom: '0.75rem'
                }}>
                  {p.badge}
                </div>

                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
                  {p.description}
                </p>

                {isSelected && (
                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: p.color
                  }}>
                    <CheckCircle2 size={15} />
                    <span>กำลังใช้งานเป็นโมเดลหลักในระบบ</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Credentials & Model Configuration per Provider */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Key size={20} color="#2e7d32" />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1b4332' }}>
            2. กำหนดค่า API Key และเลือกโมเดล (Credentials & Models)
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {AI_PROVIDERS.map(p => {
            const cred = credentials[p.id];
            const isCurrentlyActive = activeProvider === p.id;
            const resState = testResult[p.id];
            const isTesting = testingProvider === p.id;

            return (
              <div
                key={p.id}
                style={{
                  background: '#ffffff',
                  border: isCurrentlyActive ? `1.5px solid ${p.color}50` : '1px solid rgba(76, 175, 80, 0.2)',
                  borderRadius: '20px',
                  padding: '1.75rem',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Header row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.3rem' }}>{p.icon}</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1b4332' }}>
                        {p.name} Configuration
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {cred.isConfigured ? '🟢 มีการกำหนดค่าในระบบแล้ว' : '⚪ ยังไม่พบ API Key (จะใช้ค่าสำรองในเครื่อง)'}
                      </span>
                    </div>
                  </div>

                  {isCurrentlyActive && (
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      background: p.color,
                      padding: '4px 12px',
                      borderRadius: '20px'
                    }}>
                      ⭐ ค่ายที่ถูกเลือกใช้งาน (ACTIVE)
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  {/* Model Selection */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      เลือกโมเดล (Model Name)
                    </label>
                    <select
                      value={cred.model}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCredentials(prev => ({
                          ...prev,
                          [p.id]: { ...prev[p.id], model: val }
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                        background: '#f8fafc',
                        fontSize: '0.9rem',
                        color: '#1e293b',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                    >
                      {p.models.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* API Key Input */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                        API Key ({p.name})
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowKey(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2e7d32',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {showKey[p.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span>{showKey[p.id] ? 'ซ่อนคีย์' : 'แสดงคีย์'}</span>
                      </button>
                    </div>

                    <input
                      type={showKey[p.id] ? 'text' : 'password'}
                      placeholder={cred.isConfigured ? '•••••••••••••••••••• (เว้นว่างไว้เพื่อคงคีย์เดิม)' : 'กรอก API Key ใหม่ที่นี่...'}
                      value={cred.apiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCredentials(prev => ({
                          ...prev,
                          [p.id]: { ...prev[p.id], apiKey: val }
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid rgba(76, 175, 80, 0.3)',
                        background: '#f8fafc',
                        fontSize: '0.9rem',
                        color: '#1e293b',
                        fontFamily: 'monospace',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Test Connection Button & Result */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1f5f9',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <button
                    onClick={() => handleTestConnection(p.id)}
                    disabled={isTesting}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(76, 175, 80, 0.1)',
                      color: '#2e7d32',
                      border: '1px solid rgba(76, 175, 80, 0.3)',
                      borderRadius: '12px',
                      padding: '0.65rem 1.25rem',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: isTesting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isTesting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    <span>{isTesting ? 'กำลังส่งสัญญาณทดสอบ...' : `ทดสอบการเชื่อมต่อ ${p.name}`}</span>
                  </button>

                  {/* Test Result Message Box */}
                  {resState && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      borderRadius: '10px',
                      background: resState.success ? '#dcfce7' : '#fee2e2',
                      color: resState.success ? '#166534' : '#991b1b',
                      border: `1px solid ${resState.success ? '#86efac' : '#fca5a5'}`
                    }}>
                      {resState.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      <span>{resState.success ? resState.message : resState.error}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 3: Automatic Resilience & Fallback Engine Info */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(76, 175, 80, 0.25)',
        borderRadius: '20px',
        padding: '1.75rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
          <ShieldCheck size={22} color="#2e7d32" />
          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#1b4332' }}>
            ระบบสำรองอัตโนมัติ (Zero-Downtime Thai NLP Fallback Engine)
          </h4>
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
          ระบบ Focus Space ติดตั้งโมเดลวิเคราะห์ภาษาไทยอัจฉริยะ (Offline Rule-Based Thai NLP) เป็นเกราะป้องกัน 
          ในกรณีที่อินเทอร์เน็ตหลุด โควตา API ของค่ายที่เลือกหมด หรือเซิร์ฟเวอร์ภายนอกขัดข้อง 
          ระบบจะสลับมาใช้ตัววิเคราะห์สำรองอัตโนมัติ 0ms ทันที ทำให้นักศึกษาสามารถสร้างงาน จัดระดับความเร่งด่วน 
          และคำนวณเดดไลน์ไทย ("วันนี้", "พรุ่งนี้", "มะรืนนี้") ได้อย่างราบรื่นโดยไม่มีวันเกิด Error ค่ะ
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;
