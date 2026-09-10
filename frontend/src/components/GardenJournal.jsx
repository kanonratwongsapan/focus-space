import React, { useState, useEffect, useContext } from 'react';
import { BookOpen, Sparkles, Copy, Trash2, Check, PlusCircle, Bookmark, Lightbulb, Heart } from 'lucide-react';
import { TaskContext } from '../context/TaskContext';
import CustomModal from './CustomModal';

const GardenJournal = () => {
  const { addTask, createTask } = useContext(TaskContext);
  const handleTaskCreate = addTask || createTask;
  const [journalText, setJournalText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copied, setCopied] = useState(false);
  const [taskCreated, setTaskCreated] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('focus_space_garden_journal');
    if (saved) {
      setJournalText(saved);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setJournalText(val);
    localStorage.setItem('focus_space_garden_journal', val);
  };

  const handleCopy = () => {
    if (!journalText.trim()) return;
    navigator.clipboard.writeText(journalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearClick = () => {
    if (!journalText.trim()) return;
    setConfirmClearOpen(true);
  };

  const executeClear = () => {
    setJournalText('');
    localStorage.removeItem('focus_space_garden_journal');
  };

  const handleConvertToTask = async () => {
    if (!journalText.trim()) return;
    const lines = journalText.trim().split('\n').filter(l => l.trim().length > 0);
    const firstLine = lines[0] || 'โน้ตบันทึกจากสวน';
    
    if (handleTaskCreate) {
      await handleTaskCreate({
        title: firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine,
        description: journalText,
        priority: 'Medium',
        category: 'งานทั่วไป'
      });
      setTaskCreated(true);
      setTimeout(() => setTaskCreated(false), 2500);
    }
  };

  const charCount = journalText.length;
  const wordCount = journalText.trim() ? journalText.trim().split(/\s+/).length : 0;

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
          <span>BOTANICAL GARDEN JOURNAL & REFLECTION 📓</span>
        </div>
        <h1 className="page-title" style={{ fontSize: '1.75rem', marginBottom: '0.2rem', color: '#1b4332', fontWeight: 800 }}>
          สมุดบันทึกในสวน (Garden Journal) 📖🍃
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
          บันทึกไอเดีย ข้อคิดความทรงจำ หรือไดอารี่สมาธิประจำวัน พร้อมเปลี่ยนเป็นภารกิจได้ใน 1 คลิกค่ะ
        </p>
      </header>

      {/* Main Journal Card */}
      <div className="glass" style={{ padding: '1.75rem', borderRadius: '24px', background: '#ffffff', border: '1px solid rgba(76, 175, 80, 0.25)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)' }}>
        
        {/* Category Pills & Controls Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1b4332', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Bookmark size={15} color="#2e7d32" /> โหมดบันทึก:
            </span>
            {[
              { id: 'all', label: '🌸 ไดอารี่สวน' },
              { id: 'ideas', label: '💡 ไอเดียภารกิจ' },
              { id: 'gratitude', label: '💖 ขอบคุณประจำวัน' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '12px',
                  border: selectedCategory === cat.id ? '1px solid #4caf50' : '1px solid var(--border-glass)',
                  background: selectedCategory === cat.id ? 'rgba(76, 175, 80, 0.18)' : 'rgba(241, 245, 249, 0.6)',
                  color: selectedCategory === cat.id ? '#2e7d32' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handleConvertToTask}
              disabled={!journalText.trim()}
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                color: 'white',
                border: 'none',
                cursor: journalText.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: journalText.trim() ? 1 : 0.5
              }}
            >
              <PlusCircle size={14} />
              {taskCreated ? 'สร้างภารกิจสำเร็จ! ✅' : 'แปลงเป็นภารกิจ'}
            </button>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!journalText.trim()}
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid var(--border-glass)',
                color: '#334155',
                cursor: journalText.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              {copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}
            </button>

            <button
              type="button"
              onClick={handleClearClick}
              disabled={!journalText.trim()}
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '12px',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                color: '#e11d48',
                cursor: journalText.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={14} />
              ล้าง
            </button>
          </div>
        </div>

        {/* Textarea Notebook Box */}
        <textarea
          value={journalText}
          onChange={handleChange}
          placeholder="✍️ เขียนความรู้สึก สิ่งที่ได้เรียนรู้ หรือไอเดียใหม่ๆ ในสวนวันนี้..."
          style={{
            width: '100%',
            height: '320px',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid rgba(76, 175, 80, 0.2)',
            background: 'radial-gradient(circle, #ffffff 0%, #fcfdfd 100%)',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            color: '#1b4332',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'inherit',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.02)'
          }}
        />

        {/* Bottom Counter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem', fontSize: '0.78rem', color: '#64748b' }}>
          <span>💾 ระบบบันทึกข้อความให้อัตโนมัติในเครื่องของคุณ</span>
          <span>จำนวนตัวอักษร: <strong>{charCount}</strong> ตัว | <strong>{wordCount}</strong> คำ</span>
        </div>
      </div>

      {/* Beautiful Custom Botanical Confirm Modal */}
      <CustomModal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={executeClear}
        title="ยืนยันการล้างสมุดบันทึก"
        message="คุณต้องการล้างข้อความในสมุดบันทึกสวนทั้งหมดใช่ไหมคะ? 🌸"
        type="delete"
        confirmText="ล้างข้อมูล"
        cancelText="ยกเลิก"
      />
    </div>
  );
};

export default GardenJournal;
