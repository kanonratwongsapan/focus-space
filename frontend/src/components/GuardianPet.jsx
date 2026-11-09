import React from 'react';

/**
 * GuardianPet Component
 * Renders custom, hand-crafted SVG illustrations for 5 epic mythical beasts & guardians across 4 growth stages:
 * Stage 1: Mythical Egg / Slumbering Cub (กำเนิดไข่มนตรา / ลูกสัตว์หลับใหล)
 * Stage 2: Hatchling / Prowler (ฟักตัว / เริ่มสำรวจ)
 * Stage 3: Adolescent Beast (วัยรุ่นปราดเปรียวสยายปีก)
 * Stage 4: Majestic Apex Guardian (ร่างสุดยอดราชาผู้พิทักษ์)
 * 
 * Supports: 'phoenix', 'dragon', 'tiger', 'wolf', 'gryphon'
 */

export const GUARDIAN_SPECIES = [
  { 
    id: 'phoenix', 
    name: 'ฟีนิกซ์สุริยะ', 
    emoji: '🔥',
    color: '#f97316',
    stageLabels: [
      'ไข่เพลิงสุริยะเริ่มเปล่งประกายไอความร้อน',
      'ลูกวิหคเพลิงฟักตัวสะบัดปีกประกายไฟ',
      'นกเพลิงวัยหนุ่มสยายปีกเปลวไฟสีส้มทอง',
      'พญาฟีนิกซ์สยายปีกเพลิงอมตะสง่างามเหนือเปลวเพลิง!'
    ]
  },
  { 
    id: 'dragon', 
    name: 'มังกรดำรัตติกาล', 
    emoji: '🐉',
    color: '#06b6d4',
    stageLabels: [
      'ไข่ออบซิเดียนเรืองแสงอักขระมนตราสีคราม',
      'ลูกมังกรทมิฬตื่นขึ้นพร้อมกรงเล็บและปีกคู่แรก',
      'มังกรเกล็ดเงาสยายปีกแกร่งเริ่มรวบรวมไอพลัง',
      'พญามังกรดำสยายปีกเต็มผืนฟ้าคำรามสะกดจักรวาล!'
    ]
  },
  { 
    id: 'tiger', 
    name: 'พยัคฆ์ขาวเขี้ยวเงิน', 
    emoji: '🐯',
    color: '#38bdf8',
    stageLabels: [
      'ลูกเสือขาวหิมะนอนขดสะสมสมาธิอย่างเงียบสงบ',
      'พยัคฆ์น้อยลืมตาฟ้าไอซ์บลูพร้อมก้าวเท้าสำรวจ',
      'เสือหนุ่มลายพาดกลอนสีเงินปราดเปรียวและว่องไว',
      'พยัคฆ์ขาวเขี้ยวเงินตัวเต็มวัยคำรามกึกก้องบนหน้าผา!'
    ]
  },
  { 
    id: 'wolf', 
    name: 'หมาป่าอัลฟ่าสีเงิน', 
    emoji: '🐺',
    color: '#94a3b8',
    stageLabels: [
      'ลูกหมาป่าขนสีควันบุหรี่นอนพักผ่อนอย่างอบอุ่น',
      'หมาป่าวัยซนเงี่ยหูตั้งรับฟังสรรพเสียงรอบกาย',
      'หมาป่าหนุ่มขนสีเงินปราดเปรียววิ่งทะยานอย่างมุ่งมั่น',
      'จ่าฝูงหมาป่าสีเงินยืนตระหง่านหอนก้องใต้แสงจันทร์เต็มดวง!'
    ]
  },
  { 
    id: 'gryphon', 
    name: 'กริฟฟอนสายฟ้า', 
    emoji: '🦅',
    color: '#eab308',
    stageLabels: [
      'ไข่อัสนีบาตเริ่มมีประกายสายฟ้าสีทองแล่นผ่าน',
      'ลูกกริฟฟอนกางกรงเล็บอินทรีและขยับปีกขนนุ่ม',
      'กริฟฟอนสายฟ้าสยายปีกทองคำพร้อมโฉบทะยาน',
      'ราชากริฟฟอนสยายปีกสายฟ้าเกาะยอดผาท้าทายพายุ!'
    ]
  }
];

const GuardianPet = ({ 
  guardianId = 'phoenix', 
  stage = 1, 
  size = 82, 
  isActive = false, 
  isBreak = false 
}) => {
  const currentStage = Math.max(1, Math.min(4, stage));

  // Runestone Pedestal shared across all beasts
  const renderPedestal = (gemColor = '#3b82f6') => (
    <g id="guardian-pedestal">
      {/* Stone Pedestal Plinth */}
      <path d="M 24 84 L 30 96 C 32 98 34 99 37 99 L 63 99 C 66 99 68 98 70 96 L 76 84 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
      {/* Runestone Top Rim */}
      <rect x="22" y="80" width="56" height="5" rx="2.5" fill="#334155" stroke="#0f172a" strokeWidth="1.2" />
      {/* Glowing Rune Core */}
      <ellipse cx="50" cy="82" rx="19" ry="2.5" fill={gemColor} opacity="0.8" />
    </g>
  );

  // 1. SOLAR PHOENIX
  const renderPhoenix = () => {
    switch (currentStage) {
      case 1:
        // Ember Egg with fire cracks and sparks
        return (
          <g>
            {renderPedestal('#f97316')}
            {/* Fiery Egg */}
            <ellipse cx="50" cy="58" rx="14" ry="19" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            <path d="M 50 40 Q 55 58 45 76" stroke="#fbbf24" strokeWidth="1.8" fill="none" />
            <path d="M 43 50 Q 52 56 47 68" stroke="#f97316" strokeWidth="1.5" fill="none" />
            <path d="M 54 54 Q 48 64 53 72" stroke="#fef08a" strokeWidth="1.2" fill="none" />
            {/* Sparks */}
            <circle cx="38" cy="44" r="1.5" fill="#f59e0b" />
            <circle cx="62" cy="46" r="1.5" fill="#f59e0b" />
            <circle cx="50" cy="34" r="2" fill="#ef4444" />
          </g>
        );
      case 2:
        // Flame Hatchling (Baby Firebird)
        return (
          <g>
            {renderPedestal('#f97316')}
            {/* Egg base shell */}
            <path d="M 37 68 Q 50 80 63 68 Q 60 78 50 80 Q 40 78 37 68 Z" fill="#b91c1c" />
            {/* Body */}
            <circle cx="50" cy="56" r="12" fill="#ea580c" stroke="#c2410c" strokeWidth="1.2" />
            <circle cx="50" cy="58" r="8" fill="#f97316" />
            {/* Cute eyes */}
            <circle cx="46" cy="54" r="2.2" fill="#1e293b" />
            <circle cx="45.5" cy="53.5" r="0.8" fill="#ffffff" />
            <circle cx="54" cy="54" r="2.2" fill="#1e293b" />
            <circle cx="53.5" cy="53.5" r="0.8" fill="#ffffff" />
            {/* Small golden beak */}
            <path d="M 48 57 L 52 57 L 50 61 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
            {/* Tiny Flame Wings */}
            <path d="M 40 56 Q 30 52 34 62 Q 38 60 41 58" fill="#f59e0b" />
            <path d="M 60 56 Q 70 52 66 62 Q 62 60 59 58" fill="#f59e0b" />
            {/* Fiery Crest */}
            <path d="M 50 44 Q 50 36 53 40 Q 50 42 50 44" fill="#fbbf24" />
            <path d="M 50 44 Q 46 38 48 41 Q 49 43 50 44" fill="#ea580c" />
          </g>
        );
      case 3:
        // Ascending Phoenix (Young Firebird)
        return (
          <g>
            {renderPedestal('#f97316')}
            {/* Fiery Tail Plumes */}
            <path d="M 50 68 Q 44 80 40 78 Q 46 72 48 66" fill="#dc2626" />
            <path d="M 50 68 Q 56 80 60 78 Q 54 72 52 66" fill="#dc2626" />
            {/* Body */}
            <ellipse cx="50" cy="54" rx="9" ry="14" fill="#ea580c" stroke="#b91c1c" strokeWidth="1.2" />
            <ellipse cx="50" cy="56" rx="6" ry="10" fill="#f97316" />
            {/* Spreading Wings */}
            <path d="M 44 52 Q 22 42 20 32 Q 30 42 42 48" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
            <path d="M 56 52 Q 78 42 80 32 Q 70 42 58 48" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
            {/* Head & Beak */}
            <circle cx="50" cy="38" r="7" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
            <circle cx="48" cy="37" r="1.5" fill="#1e293b" />
            <path d="M 50 40 L 55 42 L 50 44 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
            {/* Flowing Flame Crest */}
            <path d="M 49 32 Q 44 20 48 24 Q 50 28 50 32" fill="#fbbf24" />
            <path d="M 51 32 Q 56 22 53 26 Q 51 28 51 32" fill="#ef4444" />
          </g>
        );
      default:
        // Majestic Solar Phoenix (Full Apex)
        return (
          <g>
            {renderPedestal('#f97316')}
            {/* Flaming Aura Background */}
            <circle cx="50" cy="46" r="32" fill="#ffedd5" opacity="0.35" />
            {/* Magnificent Tail Plumes */}
            <path d="M 50 66 Q 34 82 30 76 Q 42 70 47 62" fill="#dc2626" />
            <path d="M 50 66 Q 66 82 70 76 Q 58 70 53 62" fill="#dc2626" />
            <path d="M 50 66 Q 50 84 48 82 Q 52 74 51 62" fill="#f59e0b" />
            {/* Grand Open Wings of Fire */}
            <path d="M 44 50 Q 14 36 8 20 Q 24 34 42 44" fill="#ea580c" stroke="#b91c1c" strokeWidth="1.2" />
            <path d="M 42 46 Q 18 34 14 24 Q 28 34 40 42" fill="#f97316" />
            <path d="M 40 42 Q 22 34 20 28 Q 32 36 38 40" fill="#fbbf24" />
            <path d="M 56 50 Q 86 36 92 20 Q 76 34 58 44" fill="#ea580c" stroke="#b91c1c" strokeWidth="1.2" />
            <path d="M 58 46 Q 82 34 86 24 Q 72 34 60 42" fill="#f97316" />
            <path d="M 60 42 Q 78 34 80 28 Q 68 36 62 40" fill="#fbbf24" />
            {/* Body */}
            <ellipse cx="50" cy="52" rx="10" ry="15" fill="#c2410c" stroke="#991b1b" strokeWidth="1.2" />
            <ellipse cx="50" cy="53" rx="7" ry="11" fill="#f97316" />
            {/* Crown Head */}
            <circle cx="50" cy="35" r="7.5" fill="#f97316" stroke="#c2410c" strokeWidth="1" />
            <circle cx="48" cy="34" r="1.8" fill="#1e293b" />
            <circle cx="47.5" cy="33.5" r="0.6" fill="#ffffff" />
            <path d="M 50 37 L 57 39 L 50 42 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
            {/* Blazing Triple Flame Crown */}
            <path d="M 47 28 Q 40 12 45 18 Q 48 24 48 28" fill="#fbbf24" />
            <path d="M 50 28 Q 50 8 52 14 Q 51 22 51 28" fill="#ef4444" />
            <path d="M 53 28 Q 60 12 55 18 Q 52 24 52 28" fill="#fbbf24" />
          </g>
        );
    }
  };

  // 2. SHADOW DRAGON
  const renderDragon = () => {
    switch (currentStage) {
      case 1:
        // Obsidian Egg with cyan rune fissures
        return (
          <g>
            {renderPedestal('#06b6d4')}
            {/* Black Egg */}
            <ellipse cx="50" cy="58" rx="14" ry="19" fill="#0f172a" stroke="#1e293b" strokeWidth="1.5" />
            <path d="M 44 46 L 48 54 L 43 62 L 48 72" stroke="#06b6d4" strokeWidth="1.8" fill="none" />
            <path d="M 52 48 L 56 58 L 52 66" stroke="#22d3ee" strokeWidth="1.4" fill="none" />
            <circle cx="48" cy="54" r="1.5" fill="#a5f3fc" />
            <circle cx="56" cy="58" r="1.2" fill="#a5f3fc" />
          </g>
        );
      case 2:
        // Shadow Whelp (Baby Dragon)
        return (
          <g>
            {renderPedestal('#06b6d4')}
            {/* Cute black dragon body */}
            <ellipse cx="50" cy="62" rx="11" ry="14" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
            <ellipse cx="50" cy="64" rx="7" ry="9" fill="#1e293b" />
            {/* Tail */}
            <path d="M 58 72 Q 68 76 65 68 Q 63 66 61 70" fill="#06b6d4" />
            {/* Small bat wings */}
            <path d="M 42 58 Q 28 50 30 62 Q 38 60 42 62" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />
            <path d="M 58 58 Q 72 50 70 62 Q 62 60 58 62" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />
            {/* Head & Horns */}
            <circle cx="50" cy="46" r="9" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
            <path d="M 44 40 Q 40 32 44 34" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M 56 40 Q 60 32 56 34" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Cyan glowing eyes */}
            <ellipse cx="46" cy="45" rx="2.5" ry="3" fill="#06b6d4" />
            <circle cx="46" cy="45" r="1.2" fill="#ffffff" />
            <ellipse cx="54" cy="45" rx="2.5" ry="3" fill="#06b6d4" />
            <circle cx="54" cy="45" r="1.2" fill="#ffffff" />
          </g>
        );
      case 3:
        // Sky Drake (Adolescent Dragon)
        return (
          <g>
            {renderPedestal('#06b6d4')}
            {/* Spreading Wings */}
            <path d="M 44 54 Q 18 36 14 26 Q 26 42 42 48" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.2" />
            <path d="M 56 54 Q 82 36 86 26 Q 74 42 58 48" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.2" />
            {/* Tail */}
            <path d="M 54 70 Q 72 78 76 68 Q 66 68 54 66" fill="#1e293b" stroke="#06b6d4" strokeWidth="1" />
            {/* Body */}
            <ellipse cx="50" cy="56" rx="10" ry="16" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
            <path d="M 48 46 L 52 46 L 51 68 L 49 68 Z" fill="#06b6d4" opacity="0.6" />
            {/* Head */}
            <path d="M 44 36 L 56 36 L 50 46 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <path d="M 43 34 Q 38 22 44 26" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 57 34 Q 62 22 56 26" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Glowing Eyes */}
            <circle cx="47" cy="38" r="2" fill="#22d3ee" />
            <circle cx="53" cy="38" r="2" fill="#22d3ee" />
          </g>
        );
      default:
        // Abyssal Sovereign Dragon (Full Apex)
        return (
          <g>
            {renderPedestal('#06b6d4')}
            {/* Dragon Wing Membranes */}
            <path d="M 44 50 Q 8 28 4 14 Q 20 34 40 44" fill="#0f172a" stroke="#0891b2" strokeWidth="1.5" />
            <path d="M 40 44 Q 18 36 12 24 Q 28 38 40 44" fill="#164e63" />
            <path d="M 56 50 Q 92 28 96 14 Q 80 34 60 44" fill="#0f172a" stroke="#0891b2" strokeWidth="1.5" />
            <path d="M 60 44 Q 82 36 88 24 Q 72 38 60 44" fill="#164e63" />
            {/* Spiked Tail */}
            <path d="M 54 72 Q 80 82 82 66 Q 72 68 54 68" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
            <polygon points="82,66 88,64 84,72" fill="#06b6d4" />
            {/* Muscular Dragon Torso */}
            <ellipse cx="50" cy="54" rx="12" ry="18" fill="#090d16" stroke="#1e293b" strokeWidth="1.5" />
            {/* Chest Plate Ridges */}
            <path d="M 46 44 Q 50 46 54 44" stroke="#06b6d4" strokeWidth="1.8" fill="none" />
            <path d="M 45 50 Q 50 53 55 50" stroke="#06b6d4" strokeWidth="1.8" fill="none" />
            <path d="M 46 57 Q 50 60 54 57" stroke="#06b6d4" strokeWidth="1.8" fill="none" />
            {/* Dragon Head */}
            <polygon points="42,32 58,32 54,44 46,44" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
            {/* Menacing Horns */}
            <path d="M 43 32 Q 32 14 42 18" stroke="#06b6d4" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M 57 32 Q 68 14 58 18" stroke="#06b6d4" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            {/* Cyan Eyes & Breath Glow */}
            <circle cx="47" cy="36" r="2.2" fill="#22d3ee" />
            <circle cx="46.8" cy="35.8" r="0.8" fill="#ffffff" />
            <circle cx="53" cy="36" r="2.2" fill="#22d3ee" />
            <circle cx="52.8" cy="35.8" r="0.8" fill="#ffffff" />
            <circle cx="50" cy="44" r="3.5" fill="#06b6d4" opacity="0.6" />
          </g>
        );
    }
  };

  // 3. FROST WHITE TIGER
  const renderTiger = () => {
    switch (currentStage) {
      case 1:
        // Sleeping Cub
        return (
          <g>
            {renderPedestal('#38bdf8')}
            {/* Curled White Cub */}
            <ellipse cx="50" cy="68" rx="14" ry="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
            <circle cx="40" cy="64" r="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            {/* Ears */}
            <circle cx="36" cy="58" r="2.5" fill="#e2e8f0" />
            <circle cx="44" cy="58" r="2.5" fill="#e2e8f0" />
            {/* Silver stripes */}
            <path d="M 48 64 Q 52 66 50 72" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
            <path d="M 54 66 Q 58 68 56 74" stroke="#94a3b8" strokeWidth="1.2" fill="none" />
            {/* Sleeping eyes */}
            <path d="M 37 65 Q 40 67 43 65" stroke="#475569" strokeWidth="1" fill="none" />
            <circle cx="39" cy="67" r="1.2" fill="#fda4af" />
          </g>
        );
      case 2:
        // Frost Prowler (Sitting Cub with Blue Eyes)
        return (
          <g>
            {renderPedestal('#38bdf8')}
            {/* White Body */}
            <ellipse cx="50" cy="66" rx="12" ry="14" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
            {/* Front Paws */}
            <ellipse cx="44" cy="78" rx="4" ry="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
            <ellipse cx="56" cy="78" rx="4" ry="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
            {/* Head */}
            <circle cx="50" cy="50" r="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
            {/* Ears */}
            <polygon points="41,43 45,40 43,47" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
            <polygon points="59,43 55,40 57,47" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
            {/* Tiger Stripes */}
            <path d="M 50 42 L 50 46" stroke="#64748b" strokeWidth="1.5" />
            <path d="M 44 48 L 47 50" stroke="#64748b" strokeWidth="1.2" />
            <path d="M 56 48 L 53 50" stroke="#64748b" strokeWidth="1.2" />
            {/* Ice Blue Eyes */}
            <circle cx="46" cy="51" r="2.2" fill="#0284c7" />
            <circle cx="45.5" cy="50.5" r="0.8" fill="#ffffff" />
            <circle cx="54" cy="51" r="2.2" fill="#0284c7" />
            <circle cx="53.5" cy="50.5" r="0.8" fill="#ffffff" />
            {/* Nose */}
            <polygon points="48.5,56 51.5,56 50,58" fill="#fda4af" />
          </g>
        );
      case 3:
        // Silver Beast (Muscular Adolescent White Tiger)
        return (
          <g>
            {renderPedestal('#38bdf8')}
            {/* Powerful Body */}
            <ellipse cx="50" cy="62" rx="14" ry="16" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Silver Stripes on Flanks */}
            <path d="M 40 56 Q 44 58 42 66" stroke="#475569" strokeWidth="1.8" fill="none" />
            <path d="M 60 56 Q 56 58 58 66" stroke="#475569" strokeWidth="1.8" fill="none" />
            <path d="M 42 66 Q 46 68 44 74" stroke="#475569" strokeWidth="1.8" fill="none" />
            <path d="M 58 66 Q 54 68 56 74" stroke="#475569" strokeWidth="1.8" fill="none" />
            {/* Tiger Head */}
            <circle cx="50" cy="42" r="12.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Ears */}
            <circle cx="40" cy="33" r="3.5" fill="#475569" />
            <circle cx="40" cy="33" r="2" fill="#ffffff" />
            <circle cx="60" cy="33" r="3.5" fill="#475569" />
            <circle cx="60" cy="33" r="2" fill="#ffffff" />
            {/* Forehead King Mark "王" */}
            <path d="M 46 34 L 54 34 M 47 37 L 53 37 M 50 33 L 50 39" stroke="#334155" strokeWidth="1.5" />
            {/* Ice Blue Eyes */}
            <ellipse cx="45.5" cy="43" rx="2.5" ry="2" fill="#0284c7" />
            <ellipse cx="54.5" cy="43" rx="2.5" ry="2" fill="#0284c7" />
            {/* Fangs */}
            <polygon points="46,50 48,50 47,54" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.6" />
            <polygon points="52,50 54,50 53,54" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.6" />
          </g>
        );
      default:
        // Apex Frost Saber Tiger (Majestic Full White Tiger)
        return (
          <g>
            {renderPedestal('#38bdf8')}
            {/* Ice Mist Aura */}
            <circle cx="50" cy="50" r="32" fill="#e0f2fe" opacity="0.4" />
            {/* Muscular Shoulders & Body */}
            <ellipse cx="50" cy="62" rx="16" ry="18" fill="#f8fafc" stroke="#64748b" strokeWidth="1.8" />
            {/* Prominent Sharp Silver Stripes */}
            <path d="M 38 52 Q 44 56 40 64" stroke="#334155" strokeWidth="2.2" fill="none" />
            <path d="M 62 52 Q 56 56 60 64" stroke="#334155" strokeWidth="2.2" fill="none" />
            <path d="M 38 64 Q 45 68 42 76" stroke="#334155" strokeWidth="2.2" fill="none" />
            <path d="M 62 64 Q 55 68 58 76" stroke="#334155" strokeWidth="2.2" fill="none" />
            {/* Muscular Chest ruff */}
            <path d="M 45 74 L 50 78 L 55 74" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
            {/* Head & Jaws */}
            <circle cx="50" cy="38" r="14" fill="#ffffff" stroke="#475569" strokeWidth="1.6" />
            {/* Ears */}
            <polygon points="38,28 44,24 42,32" fill="#1e293b" />
            <polygon points="62,28 56,24 58,32" fill="#1e293b" />
            {/* Forehead Royal Mark */}
            <path d="M 45 28 L 55 28 M 46 32 L 54 32 M 50 26 L 50 35" stroke="#1e293b" strokeWidth="1.8" />
            {/* Glowing Ice Blue Eyes */}
            <ellipse cx="45" cy="38" rx="2.8" ry="2.2" fill="#0284c7" />
            <circle cx="44.5" cy="37.5" r="0.8" fill="#ffffff" />
            <ellipse cx="55" cy="38" rx="2.8" ry="2.2" fill="#0284c7" />
            <circle cx="54.5" cy="37.5" r="0.8" fill="#ffffff" />
            {/* Prominent Curved Saber Fangs */}
            <polygon points="44,46 47,46 45,55" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
            <polygon points="53,46 56,46 55,55" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
            <polygon points="48,46 52,46 50,49" fill="#f43f5e" />
          </g>
        );
    }
  };

  // 4. SILVER FENRIR WOLF
  const renderWolf = () => {
    switch (currentStage) {
      case 1:
        // Pup in Den (Curled sleeping grey pup)
        return (
          <g>
            {renderPedestal('#94a3b8')}
            <ellipse cx="50" cy="68" rx="13" ry="10" fill="#94a3b8" stroke="#64748b" strokeWidth="1.2" />
            <circle cx="42" cy="64" r="7.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" />
            <polygon points="38,58 41,54 42,60" fill="#64748b" />
            <polygon points="45,58 48,54 47,60" fill="#64748b" />
            <path d="M 40 65 Q 43 67 45 65" stroke="#334155" strokeWidth="1" fill="none" />
            {/* Fluffy tail wrapping around */}
            <path d="M 58 72 Q 65 64 56 62" stroke="#cbd5e1" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </g>
        );
      case 2:
        // Stalker Pup (Sitting alert)
        return (
          <g>
            {renderPedestal('#94a3b8')}
            <ellipse cx="50" cy="66" rx="11" ry="13" fill="#94a3b8" stroke="#64748b" strokeWidth="1.2" />
            <ellipse cx="50" cy="67" rx="6" ry="8" fill="#cbd5e1" />
            {/* Paws */}
            <ellipse cx="45" cy="78" rx="3.5" ry="2.5" fill="#e2e8f0" />
            <ellipse cx="55" cy="78" rx="3.5" ry="2.5" fill="#e2e8f0" />
            {/* Wolf Head */}
            <polygon points="42,54 58,54 50,42" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" />
            {/* Pointy ears */}
            <polygon points="42,46 41,34 47,44" fill="#64748b" />
            <polygon points="58,46 59,34 53,44" fill="#64748b" />
            {/* Amber Eyes */}
            <circle cx="46" cy="48" r="2" fill="#f59e0b" />
            <circle cx="54" cy="48" r="2" fill="#f59e0b" />
            <polygon points="48.5,53 51.5,53 50,55" fill="#1e293b" />
          </g>
        );
      case 3:
        // Moon Runner (Athletic young wolf)
        return (
          <g>
            {renderPedestal('#94a3b8')}
            {/* Lean Torso */}
            <ellipse cx="50" cy="62" rx="12" ry="16" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
            <ellipse cx="50" cy="63" rx="7" ry="10" fill="#cbd5e1" />
            {/* Fluffy Chest Mane */}
            <path d="M 46 54 L 42 60 L 48 62 L 44 68 L 50 72 L 56 68 L 52 62 L 58 60 L 54 54 Z" fill="#e2e8f0" />
            {/* Sharp Wolf Head */}
            <polygon points="41,46 59,46 50,34" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
            {/* Tall Ears */}
            <polygon points="40,38 39,24 46,36" fill="#475569" />
            <polygon points="60,38 61,24 54,36" fill="#475569" />
            {/* Glowing Eyes */}
            <circle cx="46" cy="42" r="2.2" fill="#38bdf8" />
            <circle cx="54" cy="42" r="2.2" fill="#38bdf8" />
            <polygon points="48,47 52,47 50,50" fill="#0f172a" />
          </g>
        );
      default:
        // Alpha Fenrir (Full Apex Wolf howling at silver moon)
        return (
          <g>
            {renderPedestal('#94a3b8')}
            {/* Silver Full Moon in background */}
            <circle cx="50" cy="38" r="28" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" opacity="0.6" />
            {/* Grand Wolf Body */}
            <ellipse cx="50" cy="64" rx="14" ry="17" fill="#475569" stroke="#1e293b" strokeWidth="1.8" />
            {/* Dense Silver Mane */}
            <path d="M 44 50 L 36 60 L 46 62 L 38 72 L 50 78 L 62 72 L 54 62 L 64 60 L 56 50 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
            {/* Howling Head Stance */}
            <polygon points="42,44 58,44 50,26" fill="#e2e8f0" stroke="#334155" strokeWidth="1.6" />
            {/* Majestic Pointed Wolf Ears */}
            <polygon points="42,36 38,18 46,32" fill="#334155" />
            <polygon points="58,36 62,18 54,32" fill="#334155" />
            {/* Snout pointing upward to moon */}
            <polygon points="47,26 53,26 50,21" fill="#0f172a" />
            {/* Glowing Moonlight Eyes */}
            <circle cx="46" cy="35" r="2.5" fill="#38bdf8" />
            <circle cx="45.5" cy="34.5" r="0.8" fill="#ffffff" />
            <circle cx="54" cy="35" r="2.5" fill="#38bdf8" />
            <circle cx="53.5" cy="34.5" r="0.8" fill="#ffffff" />
            {/* Moonlight sparkles */}
            <circle cx="28" cy="24" r="1.5" fill="#38bdf8" />
            <circle cx="72" cy="26" r="1.5" fill="#38bdf8" />
          </g>
        );
    }
  };

  // 5. THUNDER GRYPHON
  const renderGryphon = () => {
    switch (currentStage) {
      case 1:
        // Lightning Egg with gold cracks
        return (
          <g>
            {renderPedestal('#eab308')}
            <ellipse cx="50" cy="58" rx="14" ry="19" fill="#854d0e" stroke="#713f12" strokeWidth="1.5" />
            {/* Lightning Cracks */}
            <path d="M 48 42 L 44 52 L 52 56 L 46 68 L 50 74" stroke="#facc15" strokeWidth="2" fill="none" />
            <circle cx="44" cy="52" r="1.5" fill="#fef08a" />
            <circle cx="52" cy="56" r="1.5" fill="#fef08a" />
          </g>
        );
      case 2:
        // Baby Gryphon (Cute eaglet head + lion cub body)
        return (
          <g>
            {renderPedestal('#eab308')}
            <ellipse cx="50" cy="66" rx="12" ry="13" fill="#ca8a04" stroke="#854d0e" strokeWidth="1.2" />
            <ellipse cx="50" cy="68" rx="7" ry="8" fill="#fef08a" />
            {/* Small feathered wings */}
            <path d="M 40 60 Q 28 54 32 64 Q 38 62 41 62" fill="#eab308" />
            <path d="M 60 60 Q 72 54 68 64 Q 62 62 59 62" fill="#eab308" />
            {/* Eaglet Head */}
            <circle cx="50" cy="48" r="10" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.2" />
            <path d="M 50 48 Q 45 42 48 38 Q 50 42 50 48" fill="#eab308" />
            {/* Curved beak */}
            <path d="M 48 51 Q 50 56 50 58 Q 52 56 52 51 Z" fill="#ea580c" />
            {/* Golden eyes */}
            <circle cx="45" cy="47" r="2.2" fill="#713f12" />
            <circle cx="55" cy="47" r="2.2" fill="#713f12" />
          </g>
        );
      case 3:
        // Storm Gryphon (Adolescent gryphon)
        return (
          <g>
            {renderPedestal('#eab308')}
            {/* Golden Eagle Wings spreading */}
            <path d="M 44 54 Q 16 36 12 24 Q 26 42 42 48" fill="#eab308" stroke="#a16207" strokeWidth="1.2" />
            <path d="M 56 54 Q 84 36 88 24 Q 74 42 58 48" fill="#eab308" stroke="#a16207" strokeWidth="1.2" />
            {/* Lion Body */}
            <ellipse cx="50" cy="62" rx="13" ry="16" fill="#a16207" stroke="#713f12" strokeWidth="1.5" />
            <ellipse cx="50" cy="64" rx="7" ry="10" fill="#fef08a" />
            {/* Eagle Head & Crest */}
            <circle cx="50" cy="40" r="11" fill="#fef08a" stroke="#a16207" strokeWidth="1.5" />
            <path d="M 46 32 Q 42 20 48 24 Q 50 30 50 32" fill="#eab308" />
            <path d="M 54 32 Q 58 20 52 24 Q 50 30 50 32" fill="#eab308" />
            {/* Hooked Beak */}
            <path d="M 47 43 Q 50 50 49 53 Q 53 50 53 43 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="0.8" />
            {/* Fierce Amber Eyes */}
            <circle cx="45" cy="39" r="2.2" fill="#ca8a04" />
            <circle cx="55" cy="39" r="2.2" fill="#ca8a04" />
          </g>
        );
      default:
        // Imperial Thunder Gryphon (Full Apex)
        return (
          <g>
            {renderPedestal('#eab308')}
            {/* Lightning Halo */}
            <circle cx="50" cy="46" r="32" fill="#fef9c3" opacity="0.35" />
            {/* Grand Spreading Golden Wings with lightning tips */}
            <path d="M 44 50 Q 10 32 6 16 Q 24 34 42 44" fill="#ca8a04" stroke="#854d0e" strokeWidth="1.5" />
            <path d="M 42 44 Q 16 30 12 20 Q 28 34 40 42" fill="#eab308" />
            <path d="M 56 50 Q 90 32 94 16 Q 76 34 58 44" fill="#ca8a04" stroke="#854d0e" strokeWidth="1.5" />
            <path d="M 58 44 Q 84 30 88 20 Q 72 34 60 42" fill="#eab308" />
            {/* Lion Muscular Torso */}
            <ellipse cx="50" cy="62" rx="15" ry="18" fill="#854d0e" stroke="#713f12" strokeWidth="1.5" />
            {/* Lion Mane blending with Eagle Plumage */}
            <path d="M 42 46 L 36 56 L 44 58 L 38 68 L 50 74 L 62 68 L 56 58 L 64 56 L 58 46 Z" fill="#eab308" stroke="#a16207" strokeWidth="1" />
            {/* Eagle Head */}
            <circle cx="50" cy="36" r="12" fill="#fef08a" stroke="#a16207" strokeWidth="1.5" />
            {/* Imperial Crown Crest */}
            <path d="M 45 26 Q 38 10 44 16 Q 47 22 47 26" fill="#eab308" />
            <path d="M 50 26 Q 50 6 52 12 Q 51 20 51 26" fill="#f59e0b" />
            <path d="M 55 26 Q 62 10 56 16 Q 53 22 53 26" fill="#eab308" />
            {/* Hooked Beak */}
            <path d="M 46 39 Q 50 49 48 53 Q 54 48 54 39 Z" fill="#ea580c" stroke="#9a3412" strokeWidth="1" />
            {/* Glowing Golden Eyes */}
            <circle cx="44" cy="35" r="2.5" fill="#ca8a04" />
            <circle cx="43.5" cy="34.5" r="0.8" fill="#ffffff" />
            <circle cx="56" cy="35" r="2.5" fill="#ca8a04" />
            <circle cx="55.5" cy="34.5" r="0.8" fill="#ffffff" />
            {/* Lightning Sparks */}
            <path d="M 24 16 L 27 22 L 23 24 L 26 30" stroke="#facc15" strokeWidth="1.5" fill="none" />
            <path d="M 76 16 L 73 22 L 77 24 L 74 30" stroke="#facc15" strokeWidth="1.5" fill="none" />
          </g>
        );
    }
  };

  const getIllustration = () => {
    switch (guardianId) {
      case 'dragon': return renderDragon();
      case 'tiger': return renderTiger();
      case 'wolf': return renderWolf();
      case 'gryphon': return renderGryphon();
      default: return renderPhoenix();
    }
  };

  return (
    <div 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        filter: isBreak ? 'grayscale(0.4) opacity(0.85)' : 'none'
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        style={{ overflow: 'visible' }}
      >
        {getIllustration()}
      </svg>
    </div>
  );
};

export default GuardianPet;
