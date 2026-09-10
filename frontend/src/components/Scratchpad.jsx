import React, { useState, useEffect } from 'react';
import { StickyNote, Copy, Trash2, Check, Sparkles, PlusCircle } from 'lucide-react';

const Scratchpad = ({ compact = false, onConvertToTask }) => {
  const [noteText, setNoteText] = useState('');
  const [copied, setCopied] = useState(false);

  // Load saved note from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('focus_space_scratchpad');
    if (saved) {
      setNoteText(saved);
    }
  }, []);

  // Auto-save on change
  const handleChange = (e) => {
    const val = e.target.value;
    setNoteText(val);
    localStorage.setItem('focus_space_scratchpad', val);
  };

  const handleCopy = () => {
    if (!noteText.trim()) return;
    navigator.clipboard.writeText(noteText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (!noteText.trim()) return;
    if (window.confirm('คุณต้องการล้างข้อความในสมุดจดโน้ตด่วนใช่ไหมคะ? 🌸')) {
      setNoteText('');
      localStorage.removeItem('focus_space_scratchpad');
    }
  };

  // Word and character count
  const charCount = noteText.length;
  const wordCount = noteText.trim() ? noteText.trim().split(/\s+/).length : 0;

  return (
    <div 
      className="glass"
      style={{
        padding: compact ? '1rem' : '1.35rem 1.5rem',
        borderRadius: '20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-glass)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: compact ? '0.95rem' : '1.05rem', 
          fontWeight: 800, 
          color: 'var(--text-main)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem' 
        }}>
          <StickyNote size={18} color="var(--primary)" />
          สมุดจดโน้ตด่วน (Scratchpad) 🌸
        </h3>

        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          {noteText.trim() && (
            <button
              onClick={handleCopy}
              style={{
                background: copied ? 'rgba(16, 185, 129, 0.15)' : 'rgba(138, 92, 245, 0.1)',
                border: copied ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-glass)',
                color: copied ? 'var(--accent-teal)' : 'var(--text-muted)',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'var(--transition-smooth)'
              }}
              title="คัดลอกโน้ตไปยังคลิปบอร์ด"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
            </button>
          )}

          {noteText.trim() && (
            <button
              onClick={handleClear}
              style={{
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                color: 'var(--priority-high)',
                borderRadius: '8px',
                padding: '4px 8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'var(--transition-smooth)'
              }}
              title="ล้างข้อความในสมุดโน้ต"
            >
              <Trash2 size={13} />
              <span>ล้าง</span>
            </button>
          )}
        </div>
      </div>

      {/* Textarea Input Container */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={noteText}
          onChange={handleChange}
          placeholder="✨ พิมพ์โน้ตด่วน ไอเดียที่ผุดขึ้นมา หรือข้อความเตือนความจำสั้นๆ ไว้ตรงนี้ได้เลยน้า ระบบจะช่วยบันทึกให้อัตโนมัติค่ะ..."
          style={{
            width: '100%',
            height: compact ? '90px' : '120px',
            padding: '0.85rem 1rem',
            borderRadius: '14px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-glass)',
            color: 'var(--text-main)',
            fontSize: '0.88rem',
            fontFamily: 'var(--font-main)',
            lineHeight: 1.55,
            resize: 'vertical',
            outline: 'none',
            transition: 'var(--transition-smooth)'
          }}
        />
      </div>

      {/* Footer Info & Auto-save Status */}
      <div style={{ 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center', 
        fontSize: '0.72rem', 
        color: 'var(--text-muted)',
        fontWeight: 600
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-teal)' }}>
          <Sparkles size={13} /> บันทึกอัตโนมัติเรียบร้อย
        </span>

        <span>
          {wordCount} คำ | {charCount} ตัวอักษร
        </span>
      </div>
    </div>
  );
};

export default Scratchpad;
