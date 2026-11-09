import React from 'react';

/**
 * BotanicalPlant Component
 * Renders custom, hand-crafted SVG illustrations for 5 plant species across 4 unique growth stages:
 * Stage 1: Seedling / Sprout (ต้นอ่อนเฉพาะสายพันธุ์)
 * Stage 2: Vegetative Growth (ลำต้นและใบเฉพาะสายพันธุ์)
 * Stage 3: Budding (ตาดอกตูมเฉพาะสายพันธุ์)
 * Stage 4: Full Bloom (ดอกไม้บานสะพรั่งสมบูรณ์)
 * 
 * Supports: 'sunflower', 'tulip', 'daisy', 'sakura', 'pine'
 */

export const PLANT_SPECIES = [
  { 
    id: 'sunflower', 
    name: 'ทานตะวัน', 
    emoji: '🌻',
    color: '#f59e0b',
    stageLabels: [
      'ต้นกล้าทานตะวันเริ่มแทงหน่ออวบ',
      'ลำต้นทานตะวันยืดสูงแตกใบกว้าง',
      'ช่อดอกตูมสีเขียวอมเหลืองเริ่มตั้งช่อ',
      'ทานตะวันสีทองเบ่งบานรับแสงอาทิตย์!'
    ]
  },
  { 
    id: 'tulip', 
    name: 'ทิวลิป', 
    emoji: '🌷',
    color: '#ec4899',
    stageLabels: [
      'หน่อทิวลิปสีเขียวแทงพ้นผิวดิน',
      'ใบเลี้ยงเรียวยาวโอบอุ้มก้านช่อ',
      'ดอกตูมรูปไข่ปลายแหลมสีชมพูละมุน',
      'ดอกทิวลิปบานสะพรั่งสง่างาม!'
    ]
  },
  { 
    id: 'daisy', 
    name: 'เดซี่', 
    emoji: '🌼',
    color: '#10b981',
    stageLabels: [
      'ต้นอ่อนเดซี่เม็ดจิ๋วแทงหน่ออ่อน',
      'พุ่มใบหยักเล็กๆ ขยายกอเขียวสด',
      'ตาดอกกระดุมกลมเริ่มเผยกลีบขาว',
      'ดอกเดซี่สีขาวบริสุทธิ์บานสดใส!'
    ]
  },
  { 
    id: 'sakura', 
    name: 'ซากุระ', 
    emoji: '🌸',
    color: '#f472b6',
    stageLabels: [
      'กิ่งซากุระเริ่มแตกตุ่มตาอ่อน',
      'กิ่งก้านผลิใบอ่อนแซมเขียวขจี',
      'ช่อตุ่มดอกสีชมพูฟูมฟักแน่นกิ่ง',
      'ซากุระสีชมพูบานสะพรั่งทั่วกิ่ง!'
    ]
  },
  { 
    id: 'pine', 
    name: 'ต้นสน', 
    emoji: '🌲',
    color: '#059669',
    stageLabels: [
      'ต้นกล้าสนแทงใบเข็มเป็นวงดาว',
      'กิ่งสนอ่อนแตกช่อใบเข็มเรียวเล็ก',
      'พุ่มสนอ่อนตั้งยอดทรงกรวยหนาแน่น',
      'ต้นสนใหญ่เขียวชอุ่มสง่างามท้าลมหนาว!'
    ]
  }
];

export const getStageFromRatio = (ratio) => {
  if (ratio < 0.25) return 1;
  if (ratio < 0.60) return 2;
  if (ratio < 0.85) return 3;
  return 4;
};

const BotanicalPlant = ({ 
  flowerId = 'sunflower', 
  stage = 1, 
  size = 80, 
  isActive = false, 
  isBreak = false 
}) => {
  const currentStage = Math.max(1, Math.min(4, stage));

  // Pot / Soil base SVG shared across plants
  const renderPot = () => (
    <g id="pot-base">
      {/* Terracotta Pot */}
      <path d="M 28 82 L 32 96 C 33 98 35 99 37 99 L 63 99 C 65 99 67 98 68 96 L 72 82 Z" fill="#b08968" stroke="#7f5539" strokeWidth="1.5" />
      {/* Pot Rim */}
      <rect x="25" y="78" width="50" height="5" rx="2.5" fill="#c69f7e" stroke="#7f5539" strokeWidth="1.2" />
      {/* Soil */}
      <ellipse cx="50" cy="79" rx="22" ry="3" fill="#583101" />
    </g>
  );

  // 1. SUNFLOWER
  const renderSunflower = () => {
    switch (currentStage) {
      case 1:
        // Sprout with oval cotyledons
        return (
          <g>
            {renderPot()}
            {/* Stem */}
            <path d="M 50 78 Q 49 68 50 60" stroke="#4caf50" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Left oval cotyledon leaf */}
            <ellipse cx="44" cy="58" rx="7" ry="4" fill="#81c784" stroke="#2e7d32" strokeWidth="1" transform="rotate(-25 44 58)" />
            {/* Right oval cotyledon leaf */}
            <ellipse cx="56" cy="58" rx="7" ry="4" fill="#81c784" stroke="#2e7d32" strokeWidth="1" transform="rotate(25 56 58)" />
            {/* Tiny center sprout */}
            <path d="M 50 60 Q 50 54 50 53" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      case 2:
        // Taller stem + 4 broad textured leaves
        return (
          <g>
            {renderPot()}
            {/* Main Stem */}
            <path d="M 50 78 Q 50 55 50 38" stroke="#4caf50" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            {/* Lower Leaves */}
            <path d="M 50 66 Q 36 65 32 70 Q 42 75 50 68" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 50 64 Q 64 63 68 68 Q 58 73 50 66" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1" />
            {/* Upper Leaves */}
            <path d="M 50 50 Q 34 46 32 50 Q 42 56 50 52" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 50 48 Q 66 44 68 48 Q 58 54 50 50" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
            {/* Small crown tip */}
            <circle cx="50" cy="37" r="3.5" fill="#4caf50" stroke="#2e7d32" strokeWidth="1" />
          </g>
        );
      case 3:
        // Sturdy stem + Big Green Calyx Bud with yellow tips
        return (
          <g>
            {renderPot()}
            {/* Main Stem */}
            <path d="M 50 78 Q 50 55 50 35" stroke="#4caf50" strokeWidth="4" fill="none" strokeLinecap="round" />
            {/* Leaves */}
            <path d="M 50 64 Q 32 60 28 66 Q 40 73 50 66" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 50 62 Q 68 58 72 64 Q 60 71 50 64" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 50 50 Q 36 44 32 48 Q 42 54 50 52" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 50 48 Q 64 42 68 46 Q 58 52 50 50" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
            {/* Flower Calyx (Sepals / Green Bud) */}
            <circle cx="50" cy="30" r="10" fill="#4caf50" stroke="#2e7d32" strokeWidth="1.5" />
            {/* Sepal Points */}
            <path d="M 44 26 L 41 21 L 46 23 Z" fill="#66bb6a" />
            <path d="M 50 24 L 50 18 L 53 23 Z" fill="#66bb6a" />
            <path d="M 56 26 L 59 21 L 54 23 Z" fill="#66bb6a" />
            {/* Yellow Petal Peeking */}
            <circle cx="50" cy="30" r="6" fill="#fbc02d" stroke="#f57f17" strokeWidth="1" />
            <circle cx="50" cy="30" r="3" fill="#8d6e63" />
          </g>
        );
      default:
        // Full Bloom Sunflower
        return (
          <g>
            {renderPot()}
            {/* Stem */}
            <path d="M 50 78 Q 50 55 50 36" stroke="#4caf50" strokeWidth="4" fill="none" strokeLinecap="round" />
            {/* Foliage */}
            <path d="M 50 65 Q 28 62 25 70 Q 38 78 50 68" fill="#4caf50" stroke="#2e7d32" strokeWidth="1.2" />
            <path d="M 50 62 Q 72 59 75 67 Q 62 75 50 65" fill="#4caf50" stroke="#2e7d32" strokeWidth="1.2" />
            {/* Radiating Petals (12 petals) */}
            <g id="petals">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <path
                  key={deg}
                  d="M 50 28 Q 47 11 50 8 Q 53 11 50 28"
                  fill="#ffca28"
                  stroke="#f57f17"
                  strokeWidth="0.8"
                  transform={`rotate(${deg} 50 28)`}
                />
              ))}
            </g>
            {/* Center Disc */}
            <circle cx="50" cy="28" r="10" fill="#5d4037" stroke="#3e2723" strokeWidth="1.5" />
            <circle cx="50" cy="28" r="7" fill="#6d4c41" stroke="#3e2723" strokeWidth="0.8" strokeDasharray="1.5,1.5" />
            {/* Sun Glow sparkle */}
            <circle cx="47" cy="25" r="1.5" fill="#ffffff" opacity="0.6" />
          </g>
        );
    }
  };

  // 2. TULIP
  const renderTulip = () => {
    switch (currentStage) {
      case 1:
        // Tulip shoot emerging from bulb in soil
        return (
          <g>
            {renderPot()}
            {/* Tulip Bulb peeking out */}
            <path d="M 44 79 Q 43 71 50 71 Q 57 71 56 79 Z" fill="#8d6e63" stroke="#5d4037" strokeWidth="1" />
            {/* Sharp green shoot tip */}
            <path d="M 47 73 Q 50 56 50 54 Q 50 56 53 73 Z" fill="#81c784" stroke="#388e3c" strokeWidth="1" />
            <path d="M 50 72 L 50 56" stroke="#2e7d32" strokeWidth="1" strokeLinecap="round" />
          </g>
        );
      case 2:
        // Two tall arching tulip leaves + center stem
        return (
          <g>
            {renderPot()}
            {/* Slender Center Stem */}
            <path d="M 50 78 L 50 42" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" />
            {/* Left tall arching leaf */}
            <path d="M 49 78 C 42 70 33 58 35 45 C 39 52 46 64 49 70 Z" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1.2" />
            {/* Right tall arching leaf */}
            <path d="M 51 78 C 58 70 67 56 65 43 C 61 50 54 62 51 70 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="1.2" />
            {/* Small green tip at top */}
            <ellipse cx="50" cy="40" rx="2.5" ry="4" fill="#81c784" stroke="#2e7d32" strokeWidth="0.8" />
          </g>
        );
      case 3:
        // Elegant closed oval pink tulip bud
        return (
          <g>
            {renderPot()}
            {/* Stem */}
            <path d="M 50 78 L 50 36" stroke="#4caf50" strokeWidth="3.2" strokeLinecap="round" />
            {/* Broad graceful leaves */}
            <path d="M 49 78 C 40 68 30 52 32 38 C 38 46 46 60 49 70 Z" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1.2" />
            <path d="M 51 78 C 60 68 70 50 68 36 C 62 44 54 58 51 70 Z" fill="#81c784" stroke="#2e7d32" strokeWidth="1.2" />
            {/* Tulip Bud (Closed oval teardrop with pink gradient) */}
            <path d="M 50 36 C 43 32 44 18 50 15 C 56 18 57 32 50 36 Z" fill="#ec4899" stroke="#be185d" strokeWidth="1.2" />
            <path d="M 50 36 C 44 32 42 22 47 17 C 49 22 50 30 50 36 Z" fill="#f472b6" stroke="#be185d" strokeWidth="1" />
            <path d="M 50 36 C 56 32 58 22 53 17 C 51 22 50 30 50 36 Z" fill="#f472b6" stroke="#be185d" strokeWidth="1" />
            <path d="M 46 36 Q 50 38 54 36" stroke="#4caf50" strokeWidth="2" fill="none" />
          </g>
        );
      default:
        // Open, blooming magnificent tulip
        return (
          <g>
            {renderPot()}
            {/* Stem */}
            <path d="M 50 78 L 50 38" stroke="#4caf50" strokeWidth="3.5" strokeLinecap="round" />
            {/* Leaves */}
            <path d="M 49 78 C 38 68 28 50 30 34 C 37 44 46 58 49 70 Z" fill="#4caf50" stroke="#2e7d32" strokeWidth="1.2" />
            <path d="M 51 78 C 62 68 72 48 70 32 C 63 42 54 56 51 70 Z" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1.2" />
            {/* Tulip Blossom (Classic Cup Shape) */}
            <path d="M 50 38 C 44 33 43 16 50 13 C 57 16 56 33 50 38 Z" fill="#db2777" stroke="#9d174d" strokeWidth="1.2" />
            <path d="M 50 38 C 38 34 36 17 44 14 C 47 21 49 32 50 38 Z" fill="#ec4899" stroke="#9d174d" strokeWidth="1.2" />
            <path d="M 50 38 C 62 34 64 17 56 14 C 53 21 51 32 50 38 Z" fill="#f472b6" stroke="#9d174d" strokeWidth="1.2" />
            <ellipse cx="50" cy="24" rx="2" ry="6" fill="#fdf2f8" opacity="0.6" />
          </g>
        );
    }
  };

  // 3. DAISY
  const renderDaisy = () => {
    switch (currentStage) {
      case 1:
        // Tiny delicate seedling with notched leaves
        return (
          <g>
            {renderPot()}
            <path d="M 50 78 Q 48 68 50 62" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 50 64 C 42 63 38 60 36 64 C 41 68 46 66 50 65" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 50 64 C 58 63 62 60 64 64 C 59 68 54 66 50 65" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
          </g>
        );
      case 2:
        // Bushy clump of frilly foliage + slender rising stalks
        return (
          <g>
            {renderPot()}
            <path d="M 50 78 Q 46 60 44 44" stroke="#4caf50" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 50 78 Q 54 58 56 46" stroke="#4caf50" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 50 75 Q 35 72 30 76 Q 40 80 50 76" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 50 75 Q 65 72 70 76 Q 60 80 50 76" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 50 68 Q 36 64 34 68 Q 42 72 50 70" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 50 68 Q 64 64 66 68 Q 58 72 50 70" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
            <circle cx="44" cy="43" r="2.5" fill="#81c784" />
            <circle cx="56" cy="45" r="2.5" fill="#81c784" />
          </g>
        );
      case 3:
        // Daisy Button Bud (Round button-like green/white bud)
        return (
          <g>
            {renderPot()}
            <path d="M 50 78 Q 50 55 50 38" stroke="#4caf50" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 50 70 Q 32 66 28 72 Q 40 76 50 72" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 50 70 Q 68 66 72 72 Q 60 76 50 72" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 50 56 Q 36 50 34 54 Q 42 60 50 58" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 50 56 Q 64 50 66 54 Q 58 60 50 58" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
            <circle cx="50" cy="32" r="8" fill="#a5d6a7" stroke="#2e7d32" strokeWidth="1.2" />
            <circle cx="50" cy="32" r="6" fill="#f1f8e9" stroke="#81c784" strokeWidth="1" strokeDasharray="2,2" />
            <circle cx="50" cy="32" r="3.5" fill="#fdd835" />
          </g>
        );
      default:
        // Full Pure White Daisy with Yellow Core
        return (
          <g>
            {renderPot()}
            <path d="M 50 78 Q 50 55 50 34" stroke="#4caf50" strokeWidth="3.2" fill="none" strokeLinecap="round" />
            <path d="M 50 68 Q 28 64 24 72 Q 38 77 50 70" fill="#4caf50" stroke="#2e7d32" strokeWidth="1.2" />
            <path d="M 50 68 Q 72 64 76 72 Q 62 77 50 70" fill="#4caf50" stroke="#2e7d32" strokeWidth="1.2" />
            <g id="daisy-petals">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <ellipse
                  key={deg}
                  cx="50"
                  cy="17"
                  rx="3.2"
                  ry="9"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="0.8"
                  transform={`rotate(${deg} 50 28)`}
                />
              ))}
            </g>
            <circle cx="50" cy="28" r="8" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
            <circle cx="50" cy="28" r="5" fill="#eab308" stroke="#ca8a04" strokeWidth="0.6" strokeDasharray="1,1" />
            <circle cx="48" cy="26" r="1.2" fill="#ffffff" opacity="0.7" />
          </g>
        );
    }
  };

  // 4. SAKURA
  const renderSakura = () => {
    switch (currentStage) {
      case 1:
        // Elegant woody branch with swollen buds
        return (
          <g>
            {renderPot()}
            <path d="M 50 78 Q 47 68 53 58 Q 55 52 50 48" stroke="#6d4c41" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 51 62 Q 43 58 40 54" stroke="#6d4c41" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <ellipse cx="40" cy="53" rx="2" ry="3" fill="#f472b6" stroke="#be185d" strokeWidth="0.8" />
            <ellipse cx="50" cy="46" rx="2.5" ry="3.5" fill="#f472b6" stroke="#be185d" strokeWidth="0.8" />
            <ellipse cx="52" cy="57" rx="1.5" ry="2.5" fill="#81c784" stroke="#2e7d32" strokeWidth="0.8" />
          </g>
        );
      case 2:
        // Branching woody twig with serrated tender green leaves
        return (
          <g>
            {renderPot()}
            <path d="M 50 78 Q 46 64 54 52 Q 57 42 50 36" stroke="#6d4c41" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 48 62 Q 38 56 34 50" stroke="#6d4c41" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <path d="M 53 50 Q 64 46 68 40" stroke="#6d4c41" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 34 50 Q 28 46 26 50 Q 32 54 34 50" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 68 40 Q 74 36 76 40 Q 70 44 68 40" fill="#81c784" stroke="#2e7d32" strokeWidth="1" />
            <path d="M 50 36 Q 44 30 42 34 Q 48 38 50 36" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1" />
            <circle cx="36" cy="48" r="2.5" fill="#f472b6" />
            <circle cx="66" cy="38" r="2.5" fill="#f472b6" />
          </g>
        );
      case 3:
        // Branch clustered with tight pink flower buds on red stalks
        return (
          <g>
            {renderPot()}
            <path d="M 50 78 Q 45 62 53 48 Q 56 38 50 30" stroke="#5d4037" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 47 60 Q 36 54 30 46" stroke="#5d4037" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 52 46 Q 66 40 70 32" stroke="#5d4037" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <path d="M 30 46 Q 22 44 20 48 Q 28 52 30 46" fill="#81c784" stroke="#2e7d32" strokeWidth="0.8" />
            <path d="M 70 32 Q 78 30 80 34 Q 72 38 70 32" fill="#81c784" stroke="#2e7d32" strokeWidth="0.8" />
            <circle cx="50" cy="27" r="4.5" fill="#f472b6" stroke="#db2777" strokeWidth="1" />
            <circle cx="45" cy="30" r="3.5" fill="#fb7185" stroke="#e11d48" strokeWidth="1" />
            <circle cx="55" cy="30" r="3.5" fill="#f472b6" stroke="#db2777" strokeWidth="1" />
            <circle cx="28" cy="44" r="4" fill="#f472b6" stroke="#db2777" strokeWidth="1" />
            <circle cx="33" cy="42" r="3" fill="#fb7185" stroke="#e11d48" strokeWidth="1" />
            <circle cx="68" cy="30" r="4" fill="#f472b6" stroke="#db2777" strokeWidth="1" />
            <circle cx="73" cy="33" r="3" fill="#fb7185" stroke="#e11d48" strokeWidth="1" />
          </g>
        );
      default:
        // Full Blooming Cherry Blossoms with 5 petals each
        return (
          <g>
            {renderPot()}
            <path d="M 50 78 Q 45 62 53 48 Q 56 36 50 28" stroke="#5d4037" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 47 60 Q 34 52 28 44" stroke="#5d4037" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 52 46 Q 66 38 72 28" stroke="#5d4037" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <g transform="translate(50, 24)">
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  d="M 0 0 Q -4 -9 0 -11 Q 4 -9 0 0"
                  fill="#fbcfe8"
                  stroke="#f472b6"
                  strokeWidth="0.8"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="2.8" fill="#f43f5e" />
              <circle cx="0" cy="0" r="1.2" fill="#fef08a" />
            </g>
            <g transform="translate(26, 42)">
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  d="M 0 0 Q -3 -7 0 -9 Q 3 -7 0 0"
                  fill="#fbcfe8"
                  stroke="#f472b6"
                  strokeWidth="0.7"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="2" fill="#f43f5e" />
            </g>
            <g transform="translate(72, 26)">
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  d="M 0 0 Q -3 -7 0 -9 Q 3 -7 0 0"
                  fill="#fbcfe8"
                  stroke="#f472b6"
                  strokeWidth="0.7"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="2" fill="#f43f5e" />
            </g>
            <ellipse cx="64" cy="54" rx="2" ry="3.5" fill="#fbcfe8" stroke="#f472b6" strokeWidth="0.6" transform="rotate(35 64 54)" />
            <ellipse cx="38" cy="30" rx="1.8" ry="3" fill="#fbcfe8" stroke="#f472b6" strokeWidth="0.6" transform="rotate(-20 38 30)" />
          </g>
        );
    }
  };

  // 5. PINE TREE
  const renderPine = () => {
    switch (currentStage) {
      case 1:
        // Slender pine sprout with star-like circle of needles
        return (
          <g>
            {renderPot()}
            <path d="M 50 78 L 50 62" stroke="#5d4037" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 50 62 L 40 56" stroke="#2e7d32" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 50 62 L 44 50" stroke="#2e7d32" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 50 62 L 50 48" stroke="#4caf50" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 50 62 L 56 50" stroke="#2e7d32" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 50 62 L 60 56" stroke="#2e7d32" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="50" cy="62" r="1.5" fill="#8d6e63" />
          </g>
        );
      case 2:
        // Small conical pine sapling with tiered curved needles
        return (
          <g>
            {renderPot()}
            <path d="M 50 78 L 50 48" stroke="#5d4037" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M 32 68 Q 50 60 50 52 Q 50 60 68 68 Q 50 66 32 68 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1" />
            <path d="M 36 56 Q 50 48 50 40 Q 50 48 64 56 Q 50 54 36 56 Z" fill="#388e3c" stroke="#1b5e20" strokeWidth="1" />
            <path d="M 50 40 L 50 32" stroke="#4caf50" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 50 35 L 46 31" stroke="#66bb6a" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M 50 35 L 54 31" stroke="#66bb6a" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        );
      case 3:
        // Denser, 3-tiered pine shrub growing strong with curved boughs
        return (
          <g>
            {renderPot()}
            <path d="M 50 78 L 50 36" stroke="#4e342e" strokeWidth="3.8" strokeLinecap="round" />
            <path d="M 26 70 Q 50 60 50 48 Q 50 60 74 70 Q 50 67 26 70 Z" fill="#1b5e20" stroke="#0d3b10" strokeWidth="1.2" />
            <path d="M 30 58 Q 50 48 50 38 Q 50 48 70 58 Q 50 55 30 58 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.2" />
            <path d="M 35 46 Q 50 36 50 26 Q 50 36 65 46 Q 50 43 35 46 Z" fill="#388e3c" stroke="#1b5e20" strokeWidth="1.2" />
            <path d="M 50 26 L 50 18" stroke="#4caf50" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M 50 21 L 46 17" stroke="#66bb6a" strokeWidth="1.4" strokeLinecap="round" />
            <path d="M 50 21 L 54 17" stroke="#66bb6a" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        );
      default:
        // Magnificent Majestic Layered Pine Tree
        return (
          <g>
            {renderPot()}
            <path d="M 50 78 L 50 32" stroke="#3e2723" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 24 72 Q 50 62 50 52 Q 50 62 76 72 Q 50 70 24 72 Z" fill="#1b5e20" stroke="#0f3813" strokeWidth="1.2" />
            <path d="M 28 60 Q 50 50 50 40 Q 50 50 72 60 Q 50 58 28 60 Z" fill="#2e7d32" stroke="#1b5e20" strokeWidth="1.2" />
            <path d="M 32 48 Q 50 38 50 28 Q 50 38 68 48 Q 50 46 32 48 Z" fill="#388e3c" stroke="#1b5e20" strokeWidth="1.2" />
            <path d="M 38 34 Q 50 24 50 14 Q 50 24 62 34 Q 50 32 38 34 Z" fill="#4caf50" stroke="#2e7d32" strokeWidth="1.2" />
            <path d="M 50 14 L 50 8" stroke="#81c784" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
    }
  };

  const getIllustration = () => {
    switch (flowerId) {
      case 'tulip': return renderTulip();
      case 'daisy': return renderDaisy();
      case 'sakura': return renderSakura();
      case 'pine': return renderPine();
      default: return renderSunflower();
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
        viewBox="0 0 100 100" 
        width="100%" 
        height="100%" 
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="soil-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(76, 175, 80, 0.15)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        
        {/* Soft botanical glow backdrop */}
        <circle cx="50" cy="50" r="46" fill="url(#soil-glow)" />

        {/* Dynamic Plant Graphic */}
        {getIllustration()}
      </svg>
    </div>
  );
};

export default BotanicalPlant;
