import React, { useContext, useState, useMemo } from 'react';
import { TaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';
import { 
  BarChart3, Award, Clock, Flame, Calendar, Sparkles, TrendingUp, 
  Flower2, Heart, CheckCircle2, Shield, Star, Zap, Trophy, Lock, 
  Unlock, ChevronRight, X, Swords, Crown, Target, Compass, Eye
} from 'lucide-react';
import WeeklyChart from './WeeklyChart';

const GardenStats = () => {
  const { stats, tasks, fetchStats, fetchTasks } = useContext(TaskContext);
  const { user } = useContext(AuthContext);
  const [statsCategory, setStatsCategory] = useState('plants');
  const [badgeCategory, setBadgeCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState(null);

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

  // Tier Visual Styles Definition
  const tierStyles = {
    bronze: {
      name: 'Bronze',
      label: 'ทองแดง 🥉',
      border: 'rgba(234, 88, 12, 0.35)',
      activeBorder: '#ea580c',
      bg: 'linear-gradient(145deg, #ffffff 0%, #fff7ed 100%)',
      emblemBg: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
      glow: '0 8px 20px rgba(234, 88, 12, 0.18)',
      textColor: '#9a3412',
      accent: '#ea580c',
      pillBg: 'rgba(234, 88, 12, 0.12)'
    },
    silver: {
      name: 'Silver',
      label: 'เงิน 🥈',
      border: 'rgba(148, 163, 184, 0.45)',
      activeBorder: '#64748b',
      bg: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
      emblemBg: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)',
      glow: '0 8px 20px rgba(100, 116, 139, 0.18)',
      textColor: '#334155',
      accent: '#475569',
      pillBg: 'rgba(100, 116, 139, 0.12)'
    },
    gold: {
      name: 'Gold',
      label: 'ทองคำ 🥇',
      border: 'rgba(245, 158, 11, 0.45)',
      activeBorder: '#f59e0b',
      bg: 'linear-gradient(145deg, #ffffff 0%, #fffbeb 100%)',
      emblemBg: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
      glow: '0 8px 24px rgba(245, 158, 11, 0.25)',
      textColor: '#92400e',
      accent: '#d97706',
      pillBg: 'rgba(245, 158, 11, 0.15)'
    },
    mythic: {
      name: 'Mythic',
      label: 'ตำนาน 💎',
      border: 'rgba(168, 85, 247, 0.5)',
      activeBorder: '#a855f7',
      bg: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 100%)',
      emblemBg: 'linear-gradient(135deg, #c084fc 0%, #6366f1 100%)',
      glow: '0 8px 28px rgba(168, 85, 247, 0.3)',
      textColor: '#6b21a8',
      accent: '#7c3aed',
      pillBg: 'rgba(168, 85, 247, 0.15)'
    }
  };

  // Comprehensive Gamified Achievements List (12 Badges)
  const allAchievements = [
    // --- 🪴 วิถีพฤกษา (Flora) ---
    {
      id: 'first_seed',
      title: 'ผู้หว่านเมล็ดพันธุ์แรก',
      category: 'flora',
      categoryLabel: '🪴 วิถีพฤกษา',
      tier: 'bronze',
      icon: '🌱',
      xp: 50,
      desc: 'เริ่มต้นก้าวแรกของการสร้างวินัย โฟกัสสะสมครบ 25 นาทีแรก',
      lore: 'ทุกต้นไม้ใหญ่ล้วนเริ่มต้นจากเมล็ดพันธุ์เม็ดเล็กๆ ที่ได้รับหยาดน้ำแห่งความตั้งใจ',
      target: 25,
      current: totalPomodoroTime,
      unit: 'นาที',
      unlocked: totalPomodoroTime >= 25
    },
    {
      id: 'sakura_warden',
      title: 'ผู้พิทักษ์กลีบซากุระ',
      category: 'flora',
      categoryLabel: '🪴 วิถีพฤกษา',
      tier: 'silver',
      icon: '🌸',
      xp: 100,
      desc: 'โฟกัสสะสมอย่างมีสมาธิแน่วแน่ครบ 50 นาที',
      lore: 'ซากุระจะผลิบานอย่างงดงามที่สุดแก่ผู้ที่มีหัวใจสงบและไม่ย่อท้อต่อกาลเวลา',
      target: 50,
      current: totalPomodoroTime,
      unit: 'นาที',
      unlocked: totalPomodoroTime >= 50
    },
    {
      id: 'deep_pine',
      title: 'พฤกษาหยั่งรากลึก',
      category: 'flora',
      categoryLabel: '🪴 วิถีพฤกษา',
      tier: 'gold',
      icon: '🌲',
      xp: 150,
      desc: 'ทุ่มเทสมาธิอย่างหนักแน่นดั่งต้นสนโบราณ โฟกัสสะสมครบ 150 นาที',
      lore: 'รากที่หยั่งลึกไม่กลัวพายุ สมาธิที่ฝึกฝนมาอย่างดีย่อมไม่หวั่นไหวต่อสิ่งรบกวน',
      target: 150,
      current: totalPomodoroTime,
      unit: 'นาที',
      unlocked: totalPomodoroTime >= 150
    },
    {
      id: 'eden_gardener',
      title: 'สรวงสวรรค์พฤกษา',
      category: 'flora',
      categoryLabel: '🪴 วิถีพฤกษา',
      tier: 'mythic',
      icon: '🏰',
      xp: 250,
      desc: 'สะสมการเบ่งบานของพืชพรรณและสัตว์เทพครบ 5 ครั้งขึ้นไป',
      lore: 'เมื่อจิตวิญญาณแห่งการเรียนรู้เบ่งบาน สวนแห่งนี้จึงกลายเป็นโอเอซิสแห่งปัญญาอันไร้ที่สิ้นสุด',
      target: 5,
      current: bloomedFlowers,
      unit: 'ครั้ง',
      unlocked: bloomedFlowers >= 5
    },

    // --- ⚔️ พันธสัญญาอสูร (Mythic Beasts) ---
    {
      id: 'beast_pact',
      title: 'ผู้ทำพันธสัญญาอสูร',
      category: 'beasts',
      categoryLabel: '⚔️ พันธสัญญาอสูร',
      tier: 'bronze',
      icon: '⚔️',
      xp: 50,
      desc: 'ทำพันธสัญญาและเริ่มก้าวแรกในการฝึกฝนร่วมกับสัตว์เทพผู้พิทักษ์',
      lore: 'สัตว์เทพในตำนานจะยอมรับเฉพาะผู้ที่มีจิตใจแน่วแน่และไม่ยอมจำนนต่ออุปสรรค',
      target: 1,
      current: hasGuardianFarmed ? 1 : 0,
      unit: 'ตน',
      unlocked: hasGuardianFarmed || totalPomodoroTime >= 25
    },
    {
      id: 'phoenix_ignition',
      title: 'เพลิงสุริยะฟีนิกซ์',
      category: 'beasts',
      categoryLabel: '⚔️ พันธสัญญาอสูร',
      tier: 'silver',
      icon: '🔥',
      xp: 100,
      desc: 'ปลุกพลังฟีนิกซ์สุริยะ หรือฝึกฝนสัตว์เทพธาตุไฟสำเร็จ',
      lore: 'จากเปลวประกายไฟเล็กๆ สู่ปีกเพลิงสุริยะที่เผาผลาญความผัดวันประกันพรุ่งจนสิ้น',
      target: 1,
      current: (companionHistory['phoenix'] || 0) > 0 ? 1 : (hasGuardianFarmed ? 1 : 0),
      unit: 'ตน',
      unlocked: (companionHistory['phoenix'] || 0) > 0 || hasGuardianFarmed
    },
    {
      id: 'dragon_lord',
      title: 'นายแห่งมังกรและฟีนิกซ์',
      category: 'beasts',
      categoryLabel: '⚔️ พันธสัญญาอสูร',
      tier: 'gold',
      icon: '🐉',
      xp: 150,
      desc: 'บ่มเพาะพลังสมาธิร่วมกับสัตว์เทพระดับสูง โฟกัสสะสมครบ 100 นาที',
      lore: 'มังกรดำแห่งรัตติกาลคอยคุ้มกันสมาธิของคุณจากเงามืดแห่งสิ่งรบกวนทั้งปวง',
      target: 100,
      current: totalPomodoroTime,
      unit: 'นาที',
      unlocked: totalPomodoroTime >= 100
    },
    {
      id: 'apex_sovereign',
      title: 'ราชันย์ห้าสัตว์เทพ',
      category: 'beasts',
      categoryLabel: '⚔️ พันธสัญญาอสูร',
      tier: 'mythic',
      icon: '🌌',
      xp: 250,
      desc: 'สะสมการปลุกพลังและฝึกฝนสัตว์เทพ/พืชพรรณรวมกว่า 10 ครั้ง',
      lore: 'ผู้รวบรวมพลังแห่งธาตุทั้งห้า จิตวิญญาณแห่งการโฟกัสได้บรรลุสู่ระดับไร้ผู้ต้านทาน',
      target: 10,
      current: bloomedFlowers,
      unit: 'ครั้ง',
      unlocked: bloomedFlowers >= 10
    },

    // --- ⏱️ วินัยสมาธิและภารกิจ (Mastery & Focus) ---
    {
      id: 'harvest_tasks',
      title: 'ผู้ส่งมอบผลผลิต',
      category: 'mastery',
      categoryLabel: '⏱️ วินัยสมาธิ',
      tier: 'bronze',
      icon: '🌾',
      xp: 50,
      desc: 'ทำภารกิจในรายการงานให้เสร็จสิ้นสมบูรณ์อย่างน้อย 3 งาน',
      lore: 'การลงมือทำอย่างสม่ำเสมอคือบันไดขั้นแรกสู่ความสำเร็จอันยิ่งใหญ่',
      target: 3,
      current: completedTasks,
      unit: 'งาน',
      unlocked: completedTasks >= 3
    },
    {
      id: 'deadline_slayer',
      title: 'ผู้พิชิตเส้นตาย',
      category: 'mastery',
      categoryLabel: '⏱️ วินัยสมาธิ',
      tier: 'silver',
      icon: '⚡',
      xp: 100,
      desc: 'เคลียร์ภารกิจสำเร็จสะสมครบ 8 งาน',
      lore: 'ไม่มีเดดไลน์ใดน่ากลัว เมื่อเราแบ่งภารกิจใหญ่เป็นก้าวเล็กๆ แล้วลงมือทำทันที',
      target: 8,
      current: completedTasks,
      unit: 'งาน',
      unlocked: completedTasks >= 8
    },
    {
      id: 'zen_monarch',
      title: 'ราชันย์แห่งสมาธิ',
      category: 'mastery',
      categoryLabel: '⏱️ วินัยสมาธิ',
      tier: 'gold',
      icon: '👑',
      xp: 150,
      desc: 'รักษาอัตราความสำเร็จภารกิจ (Success Rate) ได้สูงกว่า 80%',
      lore: 'จิตที่นิ่งสงบดั่งผิวน้ำ ไร้ความกระสับกระส่าย คืออาวุธที่ทรงพลังที่สุดในการทำงาน',
      target: 80,
      current: successRate,
      unit: '%',
      unlocked: successRate >= 80 && totalTasks > 0
    },
    {
      id: 'infinite_zen',
      title: 'สมาธิไร้ขอบเขต',
      category: 'mastery',
      categoryLabel: '⏱️ วินัยสมาธิ',
      tier: 'mythic',
      icon: '✨',
      xp: 300,
      desc: 'สะสมเวลาโฟกัสแห่งสติรวมทะลุ 250 นาที',
      lore: 'สมาธิมิใช่เพียงเครื่องมือ แต่ได้หลอมรวมเป็นวิถีชีวิตแห่งความสงบสุขและความสำเร็จ',
      target: 250,
      current: totalPomodoroTime,
      unit: 'นาที',
      unlocked: totalPomodoroTime >= 250
    }
  ];

  // Calculated Gamification Stats
  const earnedXP = allAchievements.reduce((sum, a) => sum + (a.unlocked ? a.xp : 0), 0);
  const maxXP = allAchievements.reduce((sum, a) => sum + a.xp, 0); // 1,700 XP
  const xpPercent = Math.min(100, Math.round((earnedXP / maxXP) * 100));
  const unlockedCount = allAchievements.filter(a => a.unlocked).length;

  // Rank Title Matrix
  const getRank = (xp) => {
    if (xp >= 1300) return { title: 'มหาจักรพรรดิแห่งโฟกัส 👑', sub: 'Focus Sovereign (Lv.5)', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)', border: '#c084fc' };
    if (xp >= 800) return { title: 'ปรมาจารย์แห่งสมาธิ 🌌', sub: 'Zen Grandmaster (Lv.4)', color: '#d97706', bg: 'rgba(217, 119, 6, 0.12)', border: '#fbbf24' };
    if (xp >= 400) return { title: 'จอมยุทธ์แห่งกาลเวลา ⚔️', sub: 'Chronos Adept (Lv.3)', color: '#0284c7', bg: 'rgba(2, 132, 199, 0.12)', border: '#38bdf8' };
    if (xp >= 150) return { title: 'ผู้พิทักษ์สวนสมาธิ 🌿', sub: 'Garden Warden (Lv.2)', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)', border: '#34d399' };
    return { title: 'ผู้เพาะปลูกมือใหม่ 🌱', sub: 'Novice Planter (Lv.1)', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)', border: '#86efac' };
  };

  const userRank = getRank(earnedXP);

  // Filtered achievements by active tab
  const filteredAchievements = allAchievements.filter(a => {
    if (badgeCategory === 'all') return true;
    return a.category === badgeCategory;
  });

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', textAlign: 'left' }}>
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
          <span>GARDEN ANALYTICS & MASTERY HALL 🏆</span>
        </div>
        <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: '0.2rem', color: '#1b4332', fontWeight: 800 }}>
          สถิติสวนความสำเร็จ (Garden Analytics) 📊🌸
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
          วิเคราะห์ภาพรวมการเติบโต ผลผลิตภารกิจ และทำเนียบเหรียญเกียรติยศระดับ Gamified
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
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>ยศชาวสวนสมาธิ</span>
            <span style={{ fontSize: '1.25rem' }}>🏅</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: userRank.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userRank.title}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '0.4rem', display: 'block' }}>
            ⭐ สะสม {earnedXP} / {maxXP} XP
          </span>
        </div>
      </div>

      {/* Weekly Garden Bloom Chart */}
      <div style={{ marginBottom: '1.75rem' }}>
        <WeeklyChart tasks={tasks} />
      </div>

      {/* Companion Species Breakdown Card (Full Width Sleek Design) */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: '22px', background: '#ffffff', border: '1px solid rgba(76, 175, 80, 0.2)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1b4332', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              {statsCategory === 'guardians' ? <Shield size={22} color="#0284c7" /> : <Flower2 size={22} color="#2e7d32" />}
              {statsCategory === 'guardians' ? 'จำแนกสัตว์เทพผู้พิทักษ์ (Guardian Beasts)' : 'จำแนกพันธุ์ไม้ในสวน (Botanical Flora)'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              บันทึกประวัติการเติบโตและการฝึกฝนสมาธิแยกตามสายพันธุ์
            </span>
          </div>

          {/* Toggle Category Pills */}
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '24px', gap: '3px', border: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={() => setStatsCategory('plants')}
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '5px 14px',
                borderRadius: '20px',
                border: 'none',
                background: statsCategory === 'plants' ? '#ffffff' : 'transparent',
                color: statsCategory === 'plants' ? '#1b4332' : 'var(--text-muted)',
                boxShadow: statsCategory === 'plants' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🪴 พืชพรรณพฤกษา
            </button>
            <button
              type="button"
              onClick={() => setStatsCategory('guardians')}
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '5px 14px',
                borderRadius: '20px',
                border: 'none',
                background: statsCategory === 'guardians' ? '#0284c7' : 'transparent',
                color: statsCategory === 'guardians' ? '#ffffff' : 'var(--text-muted)',
                boxShadow: statsCategory === 'guardians' ? '0 2px 6px rgba(2, 132, 199, 0.3)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ⚔️ สัตว์เทพผู้พิทักษ์
            </button>
          </div>
        </div>

        {/* 5 Companion Grid Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem' }}>
          {(statsCategory === 'guardians' ? guardianTypes : plantTypes).map((item, index) => (
            <div 
              key={index} 
              style={{ 
                padding: '1rem', 
                borderRadius: '16px', 
                background: item.bg,
                border: `1px solid ${item.color}33`,
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease',
              }}
            >
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1b4332', marginBottom: '0.4rem' }}>
                {item.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: item.color }}>
                  {item.count}
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {statsCategory === 'guardians' ? 'ตน' : 'ดอก'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          HERO ACHIEVEMENTS & GAMIFICATION HALL (ทำเนียบเหรียญเกียรติยศ)
         ========================================================================= */}
      <section style={{ marginBottom: '3rem' }}>
        
        {/* Achievements Mastery Header Card */}
        <div className="glass" style={{
          padding: '1.75rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #1b4332 0%, #0f291e 100%)',
          color: '#ffffff',
          boxShadow: '0 12px 36px rgba(27, 67, 50, 0.25)',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle decorative circles */}
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-60px', right: '120px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(76, 175, 80, 0.08)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
            
            {/* Left: Rank & Title */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.6rem' }}>
                <Trophy size={14} color="#fde047" />
                <span>HALL OF HONOR & ACHIEVEMENTS</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 0.3rem 0', color: '#ffffff', letterSpacing: '-0.3px' }}>
                ทำเนียบเหรียญเกียรติยศ 🏆✨
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#d1fae5', maxWidth: '520px', lineHeight: 1.5 }}>
                พิชิตเป้าหมายการโฟกัสและการเพาะปลูก เพื่อสะสมค่าประสบการณ์ (XP) เลื่อนขั้นสู่ยศสูงสุดแห่ง Focus Space
              </p>
            </div>

            {/* Right: Current Rank Badge */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${userRank.border}`,
              padding: '1rem 1.35rem',
              borderRadius: '20px',
              textAlign: 'right',
              backdropFilter: 'blur(8px)',
              minWidth: '200px'
            }}>
              <div style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                ยศปัจจุบันของคุณ
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fde047', marginTop: '0.2rem' }}>
                {userRank.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#e2e8f0', opacity: 0.9 }}>
                {userRank.sub}
              </div>
            </div>

          </div>

          {/* XP Progress Bar */}
          <div style={{ marginTop: '1.5rem', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Star size={16} color="#fde047" fill="#fde047" />
                คะแนนเกียรติยศสะสม: <span style={{ color: '#fde047' }}>{earnedXP}</span> / {maxXP} XP
              </span>
              <span style={{ color: '#a7f3d0' }}>
                ปลดล็อกแล้ว {unlockedCount} จาก 12 เหรียญ ({xpPercent}%)
              </span>
            </div>
            
            {/* Progress Track */}
            <div style={{ width: '100%', height: '12px', background: 'rgba(0, 0, 0, 0.35)', borderRadius: '10px', overflow: 'hidden', padding: '2px' }}>
              <div style={{
                width: `${xpPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #fde047 100%)',
                borderRadius: '8px',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 12px rgba(253, 224, 71, 0.6)'
              }} />
            </div>
          </div>

          {/* Tier Counts Pill Bar */}
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <div style={{ background: 'rgba(234, 88, 12, 0.25)', border: '1px solid rgba(234, 88, 12, 0.4)', padding: '4px 12px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 700 }}>
              🥉 ทองแดง: {allAchievements.filter(a => a.tier === 'bronze' && a.unlocked).length} / 3
            </div>
            <div style={{ background: 'rgba(148, 163, 184, 0.25)', border: '1px solid rgba(148, 163, 184, 0.4)', padding: '4px 12px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 700 }}>
              🥈 เงิน: {allAchievements.filter(a => a.tier === 'silver' && a.unlocked).length} / 3
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.25)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '4px 12px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 700 }}>
              🥇 ทองคำ: {allAchievements.filter(a => a.tier === 'gold' && a.unlocked).length} / 3
            </div>
            <div style={{ background: 'rgba(168, 85, 247, 0.25)', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '4px 12px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 700 }}>
              💎 ตำนาน: {allAchievements.filter(a => a.tier === 'mythic' && a.unlocked).length} / 3
            </div>
          </div>

        </div>

        {/* Filter Category Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'inline-flex', background: '#e2e8f0', padding: '3px', borderRadius: '24px', gap: '3px' }}>
            {[
              { id: 'all', label: '🌟 ทั้งหมด (12)' },
              { id: 'flora', label: '🪴 วิถีพฤกษา (4)' },
              { id: 'beasts', label: '⚔️ พันธสัญญาอสูร (4)' },
              { id: 'mastery', label: '⏱️ วินัยสมาธิ (4)' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBadgeCategory(tab.id)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: badgeCategory === tab.id ? '#ffffff' : 'transparent',
                  color: badgeCategory === tab.id ? '#1b4332' : '#64748b',
                  boxShadow: badgeCategory === tab.id ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            💡 คลิกที่เหรียญเพื่อดูเบื้องหลังและรายละเอียด
          </span>
        </div>

        {/* Badges Grid (Responsive 3/4 Column Grid) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredAchievements.map((badge) => {
            const style = tierStyles[badge.tier];
            const progressPercent = Math.min(100, Math.round(((badge.current || 0) / badge.target) * 100));

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                style={{
                  padding: '1.25rem',
                  borderRadius: '20px',
                  background: badge.unlocked ? style.bg : '#fafafa',
                  border: badge.unlocked ? `1.5px solid ${style.border}` : '1px dashed #cbd5e1',
                  boxShadow: badge.unlocked ? style.glow : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: badge.unlocked ? 1 : 0.82,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Top Row: 3D Emblem & Tier Pill */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    
                    {/* 3D Round Badge Emblem */}
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      background: badge.unlocked ? style.emblemBg : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.65rem',
                      boxShadow: badge.unlocked ? `0 4px 14px ${style.accent}55` : 'none',
                      border: '3px solid #ffffff',
                      position: 'relative'
                    }}>
                      {badge.unlocked ? badge.icon : '🔒'}
                      {badge.unlocked && (
                        <div style={{
                          position: 'absolute',
                          bottom: '-4px',
                          right: '-4px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#10b981',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #ffffff'
                        }}>
                          <CheckCircle2 size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Tier & XP Pill */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '3px 9px',
                        borderRadius: '12px',
                        background: badge.unlocked ? style.pillBg : 'rgba(100, 116, 139, 0.12)',
                        color: badge.unlocked ? style.textColor : '#64748b'
                      }}>
                        {style.label}
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        color: badge.unlocked ? '#059669' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <Star size={11} fill={badge.unlocked ? '#059669' : '#cbd5e1'} />
                        +{badge.xp} XP
                      </span>
                    </div>

                  </div>

                  {/* Title & Description */}
                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: badge.unlocked ? '#1b4332' : '#475569',
                    margin: '0 0 0.35rem 0'
                  }}>
                    {badge.title}
                  </h4>
                  <p style={{
                    fontSize: '0.78rem',
                    color: badge.unlocked ? '#4b5563' : '#64748b',
                    margin: '0 0 0.85rem 0',
                    lineHeight: 1.45
                  }}>
                    {badge.desc}
                  </p>
                </div>

                {/* Bottom Row: Dynamic Progress Bar / Unlocked Status */}
                <div>
                  {badge.unlocked ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#065f46',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={13} color="#059669" /> ปลดล็อกเกียรติยศแล้ว
                      </span>
                      <ChevronRight size={14} />
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                        <span>ความคืบหน้า</span>
                        <span>{badge.current || 0} / {badge.target} {badge.unit} ({progressPercent}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${progressPercent}%`,
                          height: '100%',
                          background: style.accent,
                          borderRadius: '6px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </section>

      {/* =========================================================================
          INTERACTIVE ACHIEVEMENT DETAIL MODAL
         ========================================================================= */}
      {selectedBadge && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999999,
          padding: '1rem'
        }}
        onClick={() => setSelectedBadge(null)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '28px',
              maxWidth: '460px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              position: 'relative',
              border: `2px solid ${tierStyles[selectedBadge.tier].activeBorder}`,
              animation: 'modalPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.06)',
                border: 'none',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={18} />
            </button>

            {/* Big 3D Badge Emblem */}
            <div style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: selectedBadge.unlocked ? tierStyles[selectedBadge.tier].emblemBg : '#94a3b8',
              margin: '0 auto 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.75rem',
              boxShadow: selectedBadge.unlocked ? tierStyles[selectedBadge.tier].glow : 'none',
              border: '4px solid #ffffff'
            }}>
              {selectedBadge.unlocked ? selectedBadge.icon : '🔒'}
            </div>

            {/* Tier & Category Tag */}
            <div style={{ display: 'inline-flex', gap: '6px', marginBottom: '0.6rem' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '16px',
                background: tierStyles[selectedBadge.tier].pillBg,
                color: tierStyles[selectedBadge.tier].textColor
              }}>
                ระดับ: {tierStyles[selectedBadge.tier].label}
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '16px',
                background: '#f1f5f9',
                color: '#475569'
              }}>
                {selectedBadge.categoryLabel}
              </span>
            </div>

            {/* Title */}
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1b4332', margin: '0.2rem 0 0.5rem 0' }}>
              {selectedBadge.title}
            </h3>

            {/* Requirement description */}
            <p style={{ fontSize: '0.88rem', color: '#4b5563', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
              {selectedBadge.desc}
            </p>

            {/* Lore Box */}
            <div style={{
              padding: '1rem',
              borderRadius: '16px',
              background: 'rgba(241, 245, 249, 0.7)',
              border: '1px solid #e2e8f0',
              fontStyle: 'italic',
              fontSize: '0.82rem',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '1.25rem'
            }}>
              "{selectedBadge.lore}"
            </div>

            {/* Progress / Status Block */}
            <div style={{
              padding: '0.85rem',
              borderRadius: '16px',
              background: selectedBadge.unlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: selectedBadge.unlocked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: selectedBadge.unlocked ? '#059669' : '#d97706' }}>
                {selectedBadge.unlocked ? '✅ ปลดล็อกสำเร็จแล้ว' : `⏳ ความคืบหน้า: ${selectedBadge.current || 0} / ${selectedBadge.target} ${selectedBadge.unit}`}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1b4332', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Star size={14} fill="#f59e0b" color="#f59e0b" /> +{selectedBadge.xp} XP
              </span>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(27, 67, 50, 0.25)'
              }}
            >
              รับทราบเกียรติยศ 🌸
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default GardenStats;
