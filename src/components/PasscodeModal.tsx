import React, { useEffect, useRef, useState } from 'react';
import { Delete, Lock, ShieldCheck, X } from 'lucide-react';

interface PasscodeModalProps {
  open: boolean;
  expectedPasscode: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const PasscodeModal: React.FC<PasscodeModalProps> = ({
  open,
  expectedPasscode,
  onSuccess,
  onClose,
}) => {
  const [input, setInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setInput('');
      setErrorMsg('');
      setShaking(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const verifyCode = (codeToCheck: string) => {
    if (!codeToCheck.trim()) {
      setErrorMsg('يرجى إدخال رمز المرور الرقمي');
      triggerShake();
      return;
    }

    if (codeToCheck === expectedPasscode) {
      setErrorMsg('');
      setInput('');
      onSuccess();
    } else {
      setErrorMsg('رمز المرور غير صحيح، حاول مرة أخرى');
      triggerShake();
      setInput('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 380);
  };

  const appendDigit = (digit: string) => {
    if (input.length >= 8) return;
    const next = input + digit;
    setInput(next);
    setErrorMsg('');
    if (next.length === expectedPasscode.length) {
      setTimeout(() => verifyCode(next), 120);
    }
  };

  const removeLastDigit = () => {
    setInput((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyCode(input);
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-[3px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="passcode-modal-title"
      onClick={onClose}
    >
      <div
        className={`app-card w-full max-w-sm p-6 relative ${shaking ? 'animate-shake' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 app-control flex items-center justify-center bg-[var(--accent-soft)] text-[var(--accent-color)]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="passcode-modal-title"
                className="text-base font-bold text-[var(--text-primary)]"
              >
                الدخول للوحة الإعدادات
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                أدخل رمز المرور الرقمي للمتابعة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-2 app-control text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hidden/visible numeric field for keyboard entry */}
          <div>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={input}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 8);
                setInput(digitsOnly);
                setErrorMsg('');
              }}
              placeholder="••••"
              dir="ltr"
              className="app-input w-full text-center text-2xl tracking-[0.55em] font-mono-num py-3 px-4"
              aria-label="رمز المرور الرقمي"
            />
          </div>

          {/* Visual status / error message */}
          <div className="min-h-[20px] text-center">
            {errorMsg ? (
              <p className="text-xs font-semibold text-rose-500" role="alert">
                {errorMsg}
              </p>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                الرمز الافتراضي الأولي: <span className="font-mono-num font-semibold">2026</span>
              </p>
            )}
          </div>

          {/* On-screen Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2" dir="ltr">
            {digits.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => appendDigit(d)}
                className="h-12 app-control border border-[var(--surface-border)] bg-[var(--surface-subtle)] hover:border-[var(--accent-color)] text-base font-bold font-mono-num text-[var(--text-primary)] transition-colors cursor-pointer active:scale-95"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setInput('');
                setErrorMsg('');
              }}
              className="h-12 app-control border border-[var(--surface-border)] bg-[var(--surface-subtle)] hover:border-[var(--accent-color)] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              مسح
            </button>
            <button
              type="button"
              onClick={() => appendDigit('0')}
              className="h-12 app-control border border-[var(--surface-border)] bg-[var(--surface-subtle)] hover:border-[var(--accent-color)] text-base font-bold font-mono-num text-[var(--text-primary)] transition-colors cursor-pointer active:scale-95"
            >
              0
            </button>
            <button
              type="button"
              onClick={removeLastDigit}
              aria-label="حذف آخر رقم"
              className="h-12 app-control border border-[var(--surface-border)] bg-[var(--surface-subtle)] hover:border-[var(--accent-color)] flex items-center justify-center text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            className="btn-accent w-full py-2.5 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>فتح لوحة التحكم</span>
          </button>
        </form>
      </div>
    </div>
  );
};
