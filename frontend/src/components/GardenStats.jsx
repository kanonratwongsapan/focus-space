import React, { useContext, useState, useMemo } from 'react';
import { TaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';
import { BarChart3, Award, Clock, Flame, Calendar, Sparkles, TrendingUp, Flower2, Heart, CheckCircle2, Shield } from 'lucide-react';
import WeeklyChart from './WeeklyChart';

const GardenStats = () => {
  const { stats, tasks, fetchStats, fetchTasks } = useContext(TaskContext);
  const { user } = useContext(AuthContext);
  const [statsCategory, setStatsCategory] = useState('plants');

  React.useEffect(() => {
    if (fetchStats) fetchStats();
    if (fetchTasks) fetchTasks();
  }, []);

  // Live stats calculation with automatic fallback from tasks array
  const totalTasks = stats?.total > 0 ? stats.total : (tasks?.length || 0);
  const completedTasks = (stats?.completed !== undefined && stats?.completed !== null && stats.total > 0) 
    ? stats.completed 
    : (tasks?.filter(t => t.completed)?.length || 0);
  const pendingTasks = (stats?.pending !== undefined && stats?.pending !== null && stats.total > 0) 
    ? stats.pending 
    : (tasks?.filter(t => !t.completed)?.length || 0);
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalPomodoroTime = stats?.totalPomodoroTime > 0 
    ? stats.totalPomodoroTime 
    : (tasks?.reduce((acc, t) => acc + Math.round((t.timeSpent || 0) / 60), 0) || 0);

  // Calculate total bloomed flowers / trained guardians
  const taskFlowers = completedTasks || 0;
  const pomodoroFlowers = Math.floor((totalPomodoroTime || 0) / 25);
  const bloomedFlowers = Math.max(taskFlowers, taskFlowers + pomodoroFlowers);

  // Read actual companion focus history from localStorage
  const companionHistory = useMemo(() => {
    try {
      const saved = localStorage.getItem('focus_companion_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, []);

  // Plant distribution breakdown stats
  const sunflowerCount = companionHistory['sunflower'] !== undefined 
    ? companionHistory['sunflower'] 
    : (bloomedFlowers > 0 ? Math.max(1, Math.ceil(bloomedFlowers * 0.4)) : 0);
  const sakuraCount = companionHistory['sakura'] !== undefined 
    ? companionHistory['sakura'] 
    : (bloomedFlowers > 0 ? Math.floor(bloomedFlowers * 0.3) : 0);
  const tulipCount = companionHistory['tulip'] !== undefined 
    ? companionHistory['tulip'] 
    : (bloomedFlowers > 0 ? Math.floor(bloomedFlowers * 0.15) : 0);
  const daisyCount = companionHistory['daisy'] !== undefined 
    ? companionHistory['daisy'] 
    : (bloomedFlowers > 0 ? Math.floor(bloomedFlowers * 0.1) : 0);
  const pineCount = companionHistory['pine'] !== undefined 
    ? companionHistory['pine'] 
    : Math.max(0, bloomedFlowers - sunflowerCount - sakuraCount - tulipCount - daisyCount);

  const plantTypes = [
    { name: 'ดอกทานตะวัน 🌻', count: sunflowerCount, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
    { name: 'ดอกซากุระ 🌸', count: sakuraCount, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.12)' },
    { name: 'ดอกทิวลิป 🌷', count: tulipCount, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
    { name: 'ดอกเดซี่ 🌼', count: daisyCount, color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)' },
    { name: 'ต้นสนพฤกษา 🌲', count: pineCount, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' }
  ];

  // Guardian Beasts distribution breakdown stats
  const guardianTypes = [
    { name: 'ฟีนิกซ์สุริยะ 🔥', count: companionHistory['phoenix'] || (bloomedFlowers > 0 ? Math.max(1, Math.floor(bloomedFlowers * 0.3)) : 0), color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)' },
    { name: 'มังกรดำรัตติกาล 🐉', count: companionHistory['dragon'] || (bloomedFlowers > 0 ? Math.max(1, Math.floor(bloomedFlowers * 0.35)) : 0), color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)' },
    { name: 'พยัคฆ์ขาวเขี้ยวเงิน 🐯', count: companionHistory['tiger'] || (bloomedFlowers > 0 ? Math.floor(bloomedFlowers * 0.15) : 0), color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' },
    { name: 'หมาป่าอัลฟ่าสีเงิน 🐺', count: companionHistory['wolf'] || (bloomedFlowers > 0 ? Math.floor(bloomedFlowers * 0.12) : 0), color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)' },
    { name: 'กริฟฟอนสายฟ้า 🦅', count: companionHistory['gryphon'] || (bloomedFlowers > 0 ? Math.floor(bloomedFlowers * 0.08) : 0), color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)' }
  ];

  const hasGuardianFarmed = ['phoenix', 'dragon', 'tiger', 'wolf', 'gryphon'].some(id => (companionHistory[id] || 0) > 0);

  const badges = [
    { title: 'นักปลูกมือใหม่ 🌱', desc: 'เริ่มสร้างสวนสมาธิแรก', unlocked: true },
    { title: 'ผู้พิทักษ์ซากุระ 🌸', desc: 'โฟกัสสะสมครบ 50 นาที', unlocked: totalPomodoroTime >= 50 },
    { title: 'ผู้ทำพันธสัญญาอสูร ⚔️', desc: 'โฟกัสร่วมกับสัตว์เทพสำเร็จ', unlocked: hasGuardianFarmed || totalPomodoroTime >= 25 },
    { title: 'นายแห่งมังกรและฟีนิกซ์ 🐉', desc: 'โฟกัสสะสมครบ 100 นาที', unlocked: totalPomodoroTime >= 100 },
    { title: 'ผู้ส่งมอบผลผลิต 🏆', desc: 'ทำภารกิจเสร็จสิ้น 5 งาน', unlocked: completedTasks >= 5 },
    { title: 'ราชันย์แห่งสมาธิ 👑', desc: 'อัตราความสำเร็จสูงกว่า 80%', unlocked: successRate >= 80 }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
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
          <span>GARDEN ANALYTICS & ACHIEVEMENTS 🌸</span>
        </div>
        <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: '0.2rem', color: '#1b4332', fontWeight: 800 }}>
          สถิติสวนความสำเร็จ (Garden Analytics) 📊🌸
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
          วิเคราะห์ภาพรวมการเจริญเติบโตของสวนสมาธิ ผลผลิตภารกิจ และเหรียญเกียรติยศของคุณ
        </p>
      </header>

      {/* Top Summary Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="glass" style={{ padding: '1.35rem', borderRadius: '20px', background: '#ffffff', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>พืชพรรณ & สัตว์เทพสำเร็จ</span>
            <span style={{ fontSize: '1.2rem' }}>🌸⚔️</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1b4332' }}>{bloomedFlowers} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>ตน / ดอก</span></div>
          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '0.4rem', display: 'block' }}>
            🌱 จากการโฟกัสสะสม {totalPomodoroTime} นาที
          </span>
        </div>

        <div className="glass" style={{ padding: '1.35rem', borderRadius: '20px', background: '#ffffff', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>ผลผลิตภารกิจที่เก็บเกี่ยว</span>
            <span style={{ fontSize: '1.25rem' }}>🌾</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1b4332' }}>{completedTasks} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ {totalTasks} งาน</span></div>
          <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700, marginTop: '0.4rem', display: 'block' }}>
            ✅ คิดเป็น {successRate}% ความสำเร็จ
          </span>
        </div>

        <div className="glass" style={{ padding: '1.35rem', borderRadius: '20px', background: '#ffffff', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>ระดับความมุ่งมั่น</span>
            <span style={{ fontSize: '1.25rem' }}>🔥</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1b4332' }}>{completedTasks > 0 ? 'ชาวสวนดีเด่น' : 'เริ่มเพาะปลูก'}</div>
          <span style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 700, marginTop: '0.4rem', display: 'block' }}>
            ⭐ สมาธิต่อเนื่องสม่ำเสมอ
          </span>
        </div>
      </div>

      {/* Weekly Garden Bloom Chart */}
      <div style={{ marginBottom: '1.75rem' }}>
        <WeeklyChart tasks={tasks} />
      </div>

      {/* Plant Distribution & Achievements Two Column */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left: Companion Species Breakdown (Dual Categories) */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: '#ffffff', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1b4332', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              {statsCategory === 'guardians' ? <Shield size={20} color="#0284c7" /> : <Flower2 size={20} color="#2e7d32" />}
              {statsCategory === 'guardians' ? 'จำแนกสัตว์เทพผู้พิทักษ์' : 'จำแนกพันธุ์ไม้ในสวน'}
            </h3>

            {/* Toggle Category Pills */}
            <div style={{ display: 'inline-flex', background: 'rgba(0, 0, 0, 0.05)', padding: '2px', borderRadius: '20px', gap: '2px' }}>
              <button
                type="button"
                onClick={() => setStatsCategory('plants')}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '16px',
                  border: 'none',
                  background: statsCategory === 'plants' ? '#ffffff' : 'transparent',
                  color: statsCategory === 'plants' ? '#1b4332' : 'var(--text-muted)',
                  boxShadow: statsCategory === 'plants' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer'
                }}
              >
                🪴 พืชพรรณ
              </button>
              <button
                type="button"
                onClick={() => setStatsCategory('guardians')}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '16px',
                  border: 'none',
                  background: statsCategory === 'guardians' ? '#ffffff' : 'transparent',
                  color: statsCategory === 'guardians' ? '#0369a1' : 'var(--text-muted)',
                  boxShadow: statsCategory === 'guardians' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer'
                }}
              >
                ⚔️ สัตว์เทพ
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(statsCategory === 'guardians' ? guardianTypes : plantTypes).map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 0.85rem', borderRadius: '12px', background: item.bg }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1b4332' }}>{item.name}</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: item.color }}>{item.count} {statsCategory === 'guardians' ? 'ตน' : 'ดอก'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Garden Achievements & Badges */}
        <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: '#ffffff', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1b4332', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="#2e7d32" />
            เหรียญเกียรติยศชาวสวน (Achievements)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {badges.map((badge, index) => (
              <div key={index} style={{
                padding: '0.85rem',
                borderRadius: '14px',
                border: badge.unlocked ? '1px solid rgba(76, 175, 80, 0.3)' : '1px dashed #cbd5e1',
                background: badge.unlocked ? 'rgba(76, 175, 80, 0.08)' : 'rgba(241, 245, 249, 0.5)',
                opacity: badge.unlocked ? 1 : 0.65,
                textAlign: 'left'
              }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: badge.unlocked ? '#1b4332' : '#64748b', marginBottom: '0.2rem' }}>
                  {badge.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {badge.desc}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: badge.unlocked ? '#059669' : '#94a3b8', marginTop: '0.4rem' }}>
                  {badge.unlocked ? 'ปลดล็อกแล้ว ✅' : '🔒 ยังไม่ปลดล็อก'}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default GardenStats;
