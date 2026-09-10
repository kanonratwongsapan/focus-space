import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, Info, Sparkles, Trash2, X } from 'lucide-react';

const CustomModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'แจ้งเตือนระบบ Focus Space',
  message = '',
  type = 'info', // 'confirm', 'success', 'warning', 'error', 'info', 'delete'
  confirmText = 'ตกลง',
  cancelText = 'ยกเลิก',
  confirmBg = 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
}) => {
  if (!isOpen) return null;

  const renderIcon = () => {
    switch (type) {
      case 'delete':
      case 'error':
      case 'warning':
        return (
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.12)',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            {type === 'delete' ? <Trash2 size={28} /> : <AlertCircle size={28} />}
          </div>
        );
      case 'success':
        return (
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.12)',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <CheckCircle2 size={28} />
          </div>
        );
      case 'confirm':
        return (
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(76, 175, 80, 0.15)',
            color: '#2e7d32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <HelpCircle size={28} />
          </div>
        );
      default:
        return (
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.12)',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Info size={28} />
          </div>
        );
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{
        maxWidth: '420px',
        padding: '2rem 1.75rem',
        borderRadius: '24px',
        textAlign: 'center',
        background: '#ffffff',
        border: '1px solid rgba(76, 175, 80, 0.25)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)'
      }}>
        {/* Header Icon */}
        {renderIcon()}

        {/* Modal Title */}
        <h3 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.25rem',
          fontWeight: 800,
          color: '#1b4332',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}>
          {title}
        </h3>

        {/* Modal Message Body */}
        <p style={{
          fontSize: '0.9rem',
          color: '#475569',
          lineHeight: 1.6,
          margin: '0 0 1.75rem 0',
          fontWeight: 500
        }}>
          {message}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {(type === 'confirm' || type === 'delete' || onConfirm) && (
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '14px',
                background: 'rgba(241, 245, 249, 0.9)',
                border: '1px solid var(--border-glass)',
                color: '#64748b',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: '14px',
              background: type === 'delete' ? 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' : confirmBg,
              border: 'none',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: type === 'delete' ? '0 4px 14px rgba(225, 29, 72, 0.25)' : '0 4px 14px rgba(76, 175, 80, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
