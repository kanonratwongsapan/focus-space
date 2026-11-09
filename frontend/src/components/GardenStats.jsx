import React, { useContext, useState, useMemo } from 'react';
import { TaskContext } from '../context/TaskContext';
import { AuthContext } from '../context/AuthContext';
import { 
  BarChart3, Award, Clock, Flame, Calendar, Sparkles, TrendingUp, 
  Flower2, Heart, CheckCircle2, Shield, Star, Trophy, ChevronRight, X
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
    { name: 'ดอกทานตะวัน 🌻', count: sunflowerCount, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
    { name: 'ดอกซากุระ 🌸', count: sakuraCount, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.08)' },
    { name: 'ดอกทิวลิป 🌷', count: tulipCount, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)' },
    { name: 'ดอกเดซี่ 🌼', count: daisyCount, color: '#eab308', bg: 'rgba(234, 179, 8, 0.08)' },
    { name: 'ต้นสนพฤกษา 🌲', count: pineCount, color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' }
  ];

  // Guardian Beasts distribution breakdown stats
  const guardianTypes = [
    { name: 'ฟีนิกซ์สุริยะ 🔥', count: companionHistory['phoenix'] || (bloomedFlowers > 0 ? Math.max(1, Math.floor(bloomedFlowers * 0.3)) : 0), color: '#ea580c', bg: 'rgba(234, 88, 12, 0.08)' },
    { name: 'มังกรดำรัตติกาล 🐉', count: companionHistory['dragon'] || (bloomedFlowers > 0 ? Math.max(1, Math.floor(bloomedFlowers * 0.35)) : 0), color: '#0284c7', bg: 'rgba(2, 132, 199, 0.08)' },
    { name: 'พยัคฆ์ขาวเขี้ยวเงิน 🐯', count: companionHistory['tiger'] || (bloomedFlowers > 0 ? Math.floor(bloomedFlowers * 0.15) : 0), color: '#0284c7', bg: 'rgba(2, 132, 199, 0.08)' },
    { name: 'หมาป่าอัลฟ่าสีเงิน 🐺', count: companionHistory['wolf'] || (bloomedFlowers > 0 ? Math.floor(bloomedFlowers * 0.12) : 0), color: '#475569', bg: 'rgba(71, 85, 105, 0.08)' },
    { name: 'กริฟฟอนสายฟ้า 🦅', count: companionHistory['gryphon'] || (bloomedFlowers > 0 ? Math.floor(bloomedFlowers * 0.08) : 0), color: '#d97706', bg: 'rgba(217, 119, 6, 0.08)' }
  ];

  const hasGuardianFarmed = ['phoenix', 'dragon', 'tiger', 'wolf', 'gryphon'].some(id => (companionHistory[id] || 0) > 0);

  // Soft Pastel Tier Styles (Harmony with botanical aesthetic)
  const tierStyles = {
    bronze: {
      label: 'ต้นกล้า 🥉',
      border: 'rgba(217, 119, 6, 0.25)',
      activeBorder: 'rgba(217, 119, 6, 0.4)',
      bg: '#ffffff',
      activeBg: 'rgba(254, 243, 199, 0.25)',
      emblemBg: 'rgba(245, 158, 11, 0.12)',
      textColor: '#b45309',
      accent: '#f59e0b',
      pillBg: 'rgba(245, 158, 11, 0.1)'
    },
    silver: {
      label: 'ผลิบาน 🥈',
      border: 'rgba(13, 148, 136, 0.25)',
      activeBorder: 'rgba(13, 148, 136, 0.4)',
      bg: '#ffffff',
      activeBg: 'rgba(204, 251, 241, 0.25)',
      emblemBg: 'rgba(13, 148, 136, 0.12)',
      textColor: '#0f766e',
      accent: '#14b8a6',
      pillBg: 'rgba(13, 148, 136, 0.1)'
    },
    gold: {
      label: 'ยืนต้น 🥇',
      border: 'rgba(76, 175, 80, 0.3)',
      activeBorder: 'rgba(76, 175, 80, 0.5)',
      bg: '#ffffff',
      activeBg: 'rgba(232, 245, 233, 0.35)',
      emblemBg: 'rgba(76, 175, 80, 0.15)',
      textColor: '#2e7d32',
      accent: '#4caf50',
      pillBg: 'rgba(76, 175, 80, 0.12)'
    },
    mythic: {
      label: 'พฤกษาตำนาน 💎',
      border: 'rgba(168, 85, 247, 0.25)',
      activeBorder: 'rgba(168, 85, 247, 0.45)',
      bg: '#ffffff',
      activeBg: 'rgba(243, 232, 255, 0.25)',
      emblemBg: 'rgba(168, 85, 247, 0.12)',
      textColor: '#7e22ce',
      accent: '#a855f7',
      pillBg: 'rgba(168, 85, 247, 0.1)'
    }
  };

  // 12 Botanical Achievements
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

  // Botanical Rank Titles
  const getRank = (xp) => {
    if (xp >= 1300) return { title: 'มหาพฤกษาจักรพรรดิ 👑', sub: 'Garden Sovereign (ขั้น 5)', icon: '👑', color: '#1b4332' };
    if (xp >= 800) return { title: 'ปราชญ์สวนสมาธิ 🌸', sub: 'Zen Sage (ขั้น 4)', icon: '🌸', color: '#2e7d32' };
    if (xp >= 400) return { title: 'พฤกษาเติบใหญ่ 🌲', sub: 'Flourisher (ขั้น 3)', icon: '🌲', color: '#059669' };
    if (xp >= 150) return { title: 'ผู้พิทักษ์พงไพร 🌿', sub: 'Garden Keeper (ขั้น 2)', icon: '🌿', color: '#0d9488' };
    return { title: 'ต้นกล้าแรกปลูก 🌱', sub: 'Novice Sprout (ขั้น 1)', icon: '🌱', color: '#16a34a' };
  };

  const userRank = getRank(earnedXP);

  // Filtered achievements by active tab
  const filteredAchievements = allAchievements.filter(a => {
    if (badgeCategory === 'all') return true;
    return a.category === badgeCategory;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
      
      {/* Header */}
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
          วิเคราะห์ภาพรวมการเจริญเติบโต ผลผลิตภารกิจ และเหรียญเกียรติยศชาวสวนของคุณ
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

      {/* Companion Species Breakdown Card (Clean Botanical Style) */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: '#ffffff', border: '1px solid rgba(76, 175, 80, 0.2)', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1b4332', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              {statsCategory === 'guardians' ? <Shield size={20} color="#0284c7" /> : <Flower2 size={20} color="#2e7d32" />}
              {statsCategory === 'guardians' ? 'จำแนกสัตว์เทพผู้พิทักษ์' : 'จำแนกพันธุ์ไม้ในสวน'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              บันทึกสถิติการเติบโตและการฝึกฝนสมาธิแยกตามคู่หู
            </span>
          </div>

          {/* Toggle Category Pills */}
          <div style={{ display: 'inline-flex', background: 'rgba(76, 175, 80, 0.08)', padding: '3px', borderRadius: '20px', gap: '3px' }}>
            <button
              type="button"
              onClick={() => setStatsCategory('plants')}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '16px',
                border: 'none',
                background: statsCategory === 'plants' ? '#ffffff' : 'transparent',
                color: statsCategory === 'plants' ? '#1b4332' : 'var(--text-muted)',
                boxShadow: statsCategory === 'plants' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              🪴 พืชพรรณ
            </button>
            <button
              type="button"
              onClick={() => setStatsCategory('guardians')}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '16px',
                border: 'none',
                background: statsCategory === 'guardians' ? '#ffffff' : 'transparent',
                color: statsCategory === 'guardians' ? '#0369a1' : 'var(--text-muted)',
                boxShadow: statsCategory === 'guardians' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer'
              }}
            >
              ⚔️ สัตว์เทพ
            </button>
          </div>
        </div>

        {/* 5 Companion Grid Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {(statsCategory === 'guardians' ? guardianTypes : plantTypes).map((item, index) => (
            <div 
              key={index} 
              style={{ 
                padding: '0.85rem 1rem', 
                borderRadius: '14px', 
                background: item.bg,
                border: '1px solid rgba(76, 175, 80, 0.15)',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1b4332', marginBottom: '0.35rem' }}>
                {item.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: item.color }}>
                  {item.count}
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {statsCategory === 'guardians' ? 'ตน' : 'ดอก'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          BOTANICAL GARDEN ACHIEVEMENTS (เหรียญเกียรติยศชาวสวน ธีมธรรมชาติ ละมุนตา)
         ========================================================================= */}
      <section style={{ marginBottom: '2.5rem' }}>
        
        {/* Soft Pastel Header & XP Progress Card */}
        <div className="glass" style={{
          padding: '1.5rem',
          borderRadius: '20px',
          background: '#ffffff',
          border: '1px solid rgba(76, 175, 80, 0.22)',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            
            {/* Title & Description */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(76, 175, 80, 0.1)',
                border: '1px solid rgba(76, 175, 80, 0.25)',
                color: '#2e7d32',
                padding: '3px 12px',
                borderRadius: '16px',
                fontSize: '0.74rem',
                fontWeight: 700,
                marginBottom: '0.4rem'
              }}>
                <Award size={14} color="#2e7d32" />
                <span>GARDEN ACHIEVEMENTS & MILESTONES 🏅</span>
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.2rem 0', color: '#1b4332' }}>
                เหรียญเกียรติยศชาวสวน (Achievements) 🎖️🍃
              </h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                บันทึกความสำเร็จและพัฒนาการสมาธิในสวนของคุณ
              </p>
            </div>

            {/* Current Rank Pill */}
            <div style={{
              background: 'rgba(76, 175, 80, 0.08)',
              border: '1px solid rgba(76, 175, 80, 0.25)',
              padding: '0.55rem 1rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem'
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid rgba(76, 175, 80, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem'
              }}>
                {userRank.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700 }}>ยศสมาธิปัจจุบัน</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: userRank.color }}>{userRank.title}</div>
              </div>
            </div>

          </div>

          {/* Calm Green Progress Track */}
          <div style={{ marginTop: '1.15rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', fontWeight: 700, color: '#1b4332', marginBottom: '0.35rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={14} color="#4caf50" />
                คะแนนประสบการณ์: <strong style={{ color: '#2e7d32' }}>{earnedXP}</strong> / {maxXP} XP
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                ปลดล็อกแล้ว {unlockedCount} / 12 เหรียญ ({xpPercent}%)
              </span>
            </div>
            
            <div style={{ width: '100%', height: '8px', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{
                width: `${xpPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #81c784 0%, #4caf50 100%)',
                borderRadius: '8px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

        </div>

        {/* Filter Category Tabs (Clean Pastel Botanical Pills) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
          <div style={{ display: 'inline-flex', background: 'rgba(76, 175, 80, 0.08)', padding: '3px', borderRadius: '20px', gap: '3px' }}>
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
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '16px',
                  border: 'none',
                  background: badgeCategory === tab.id ? '#ffffff' : 'transparent',
                  color: badgeCategory === tab.id ? '#1b4332' : 'var(--text-muted)',
                  boxShadow: badgeCategory === tab.id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            💡 คลิกที่เหรียญเพื่อดูบันทึกและรายละเอียด
          </span>
        </div>

        {/* Badges Grid (Clean, Airy 3-Column Botanical Cards) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem'
        }}>
          {filteredAchievements.map((badge) => {
            const style = tierStyles[badge.tier];
            const progressPercent = Math.min(100, Math.round(((badge.current || 0) / badge.target) * 100));

            return (
              <div
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                style={{
                  padding: '1.1rem',
                  borderRadius: '16px',
                  background: badge.unlocked ? '#ffffff' : 'rgba(255, 255, 255, 0.75)',
                  border: badge.unlocked ? `1px solid ${style.activeBorder}` : '1px dashed #cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: badge.unlocked ? '0 2px 8px rgba(76, 175, 80, 0.05)' : 'none',
                  opacity: badge.unlocked ? 1 : 0.85
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = badge.unlocked ? '0 2px 8px rgba(76, 175, 80, 0.05)' : 'none';
                }}
              >
                {/* Top Row: Emblem & Tier Tag */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    
                    {/* Round Pastel Emblem */}
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: badge.unlocked ? style.emblemBg : '#f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      border: `1.5px solid ${badge.unlocked ? style.accent : '#cbd5e1'}33`,
                      position: 'relative'
                    }}>
                      {badge.unlocked ? badge.icon : '🔒'}
                      {badge.unlocked && (
                        <div style={{
                          position: 'absolute',
                          bottom: '-2px',
                          right: '-2px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: '#10b981',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #ffffff'
                        }}>
                          <CheckCircle2 size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Tier & XP Tag */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: badge.unlocked ? style.pillBg : 'rgba(100, 116, 139, 0.08)',
                        color: badge.unlocked ? style.textColor : '#64748b'
                      }}>
                        {style.label}
                      </span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: badge.unlocked ? '#059669' : '#94a3b8'
                      }}>
                        +{badge.xp} XP
                      </span>
                    </div>

                  </div>

                  {/* Title & Desc */}
                  <h4 style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: badge.unlocked ? '#1b4332' : '#475569',
                    margin: '0 0 0.25rem 0'
                  }}>
                    {badge.title}
                  </h4>
                  <p style={{
                    fontSize: '0.75rem',
                    color: badge.unlocked ? '#4b5563' : '#64748b',
                    margin: '0 0 0.75rem 0',
                    lineHeight: 1.4
                  }}>
                    {badge.desc}
                  </p>
                </div>

                {/* Bottom Row: Status / Clean Progress Bar */}
                <div>
                  {badge.unlocked ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 8px',
                      borderRadius: '8px',
                      background: 'rgba(76, 175, 80, 0.08)',
                      color: '#2e7d32',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={12} color="#2e7d32" /> ปลดล็อกแล้ว
                      </span>
                      <ChevronRight size={13} color="#2e7d32" />
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '3px' }}>
                        <span>ความคืบหน้า</span>
                        <span>{badge.current || 0}/{badge.target} {badge.unit} ({progressPercent}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${progressPercent}%`,
                          height: '100%',
                          background: style.accent,
                          borderRadius: '4px',
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
          BOTANICAL ACHIEVEMENT DETAIL MODAL (สะอาด ละมุน ธีม Focus Space)
         ========================================================================= */}
      {selectedBadge && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(27, 67, 50, 0.45)',
          backdropFilter: 'blur(5px)',
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
              borderRadius: '24px',
              maxWidth: '430px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 45px rgba(27, 67, 50, 0.15)',
              textAlign: 'center',
              position: 'relative',
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'rgba(0,0,0,0.05)',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={16} />
            </button>

            {/* Emblem */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: selectedBadge.unlocked ? tierStyles[selectedBadge.tier].emblemBg : '#f1f5f9',
              margin: '0 auto 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              border: `2px solid ${selectedBadge.unlocked ? tierStyles[selectedBadge.tier].accent : '#cbd5e1'}44`
            }}>
              {selectedBadge.unlocked ? selectedBadge.icon : '🔒'}
            </div>

            {/* Tier & Category Tag */}
            <div style={{ display: 'inline-flex', gap: '6px', marginBottom: '0.5rem' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '12px',
                background: tierStyles[selectedBadge.tier].pillBg,
                color: tierStyles[selectedBadge.tier].textColor
              }}>
                ระดับ: {tierStyles[selectedBadge.tier].label}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '12px',
                background: 'rgba(76, 175, 80, 0.08)',
                color: '#2e7d32'
              }}>
                {selectedBadge.categoryLabel}
              </span>
            </div>

            {/* Title */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1b4332', margin: '0.2rem 0 0.4rem 0' }}>
              {selectedBadge.title}
            </h3>

            {/* Desc */}
            <p style={{ fontSize: '0.82rem', color: '#4b5563', margin: '0 0 1rem 0', lineHeight: 1.45 }}>
              {selectedBadge.desc}
            </p>

            {/* Lore Box (Soft Botanical Note) */}
            <div style={{
              padding: '0.85rem',
              borderRadius: '14px',
              background: 'rgba(238, 247, 242, 0.75)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              fontStyle: 'italic',
              fontSize: '0.78rem',
              color: '#1b4332',
              lineHeight: 1.5,
              marginBottom: '1.15rem'
            }}>
              "{selectedBadge.lore}"
            </div>

            {/* Progress / Status Block */}
            <div style={{
              padding: '0.75rem',
              borderRadius: '14px',
              background: selectedBadge.unlocked ? 'rgba(76, 175, 80, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              border: selectedBadge.unlocked ? '1px solid rgba(76, 175, 80, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: selectedBadge.unlocked ? '#2e7d32' : '#b45309' }}>
                {selectedBadge.unlocked ? '✅ ปลดล็อกสำเร็จแล้ว' : `⏳ ความคืบหน้า: ${selectedBadge.current || 0}/${selectedBadge.target} ${selectedBadge.unit}`}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1b4332' }}>
                +{selectedBadge.xp} XP
              </span>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              style={{
                width: '100%',
                padding: '0.7rem',
                borderRadius: '14px',
                border: 'none',
                background: '#2e7d32',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)'
              }}
            >
              ปิดหน้าต่าง
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default GardenStats;
