import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Database,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Moon,
  Palette,
  RotateCcw,
  Share2,
  SlidersHorizontal,
  Sun,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  ACCENT_PRESETS,
  ANGLE_OPTIONS,
  CATEGORY_GROUPS,
  COUNTRY_CODE_PRESETS,
  DIALECT_OPTIONS,
} from '../constants/defaults';
import {
  AdminSettings,
  CardStyle,
  CreativeAngle,
  Dialect,
  PostCategory,
  RadiusStyle,
} from '../types/platform';

type SettingsTab = 'theme' | 'generation' | 'sharing' | 'data' | 'security';

interface AdminSettingsModalProps {
  open: boolean;
  settings: AdminSettings;
  currentPasscode: string;
  queueCount: number;
  generatedCount: number;
  onUpdateSettings: (updater: (prev: AdminSettings) => AdminSettings) => void;
  onApplyDefaultsToForm: () => void;
  onExportBackup: (includeToken: boolean) => void;
  onImportBackup: (file: File) => void;
  onRequestRestoreDefaults: () => void;
  onRequestClearAllData: () => void;
  onChangePasscode: (newPasscode: string) => void;
  onNotify: (msg: string) => void;
  onClose: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  open,
  settings,
  currentPasscode,
  queueCount,
  generatedCount,
  onUpdateSettings,
  onApplyDefaultsToForm,
  onExportBackup,
  onImportBackup,
  onRequestRestoreDefaults,
  onRequestClearAllData,
  onChangePasscode,
  onNotify,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('theme');
  const [showApiToken, setShowApiToken] = useState(false);
  const [includeTokenInBackup, setIncludeTokenInBackup] = useState(false);

  // Passcode change form state
  const [oldCode, setOldCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState('');

  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setPasscodeError('');
      setPasscodeSuccess('');
      setOldCode('');
      setNewCode('');
      setConfirmCode('');
    }
  }, [open]);

  if (!open) return null;

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'theme', label: 'الألوان والسمات', icon: <Palette className="w-4 h-4" /> },
    { id: 'generation', label: 'التوليد والمحتوى', icon: <SlidersHorizontal className="w-4 h-4" /> },
    { id: 'sharing', label: 'المشاركة والربط', icon: <Share2 className="w-4 h-4" /> },
    { id: 'data', label: 'البيانات والنسخ', icon: <Database className="w-4 h-4" /> },
    { id: 'security', label: 'رمز المرور', icon: <KeyRound className="w-4 h-4" /> },
  ];

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    setPasscodeSuccess('');

    if (oldCode !== currentPasscode) {
      setPasscodeError('رمز المرور الحالي غير صحيح');
      return;
    }
    if (!/^\d{4,8}$/.test(newCode)) {
      setPasscodeError('يجب أن يتكون الرمز الجديد من 4 إلى 8 أرقام فقط');
      return;
    }
    if (newCode !== confirmCode) {
      setPasscodeError('تأكيد رمز المرور لا يطابق الرمز الجديد');
      return;
    }

    onChangePasscode(newCode);
    setOldCode('');
    setNewCode('');
    setConfirmCode('');
    setPasscodeSuccess('تم تحديث رمز المرور وحفظه بنجاح');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
    }
    e.target.value = '';
  };

  const cardStyleOptions: { id: CardStyle; label: string; desc: string }[] = [
    { id: 'balanced', label: 'متوازن', desc: 'خلفية واضحة مع حد رفيع' },
    { id: 'elevated', label: 'تباين مرتفع', desc: 'بروز أوضح للبطاقات مع ظل خفيف' },
    { id: 'subtle', label: 'هادئ مسطح', desc: 'دمج ناعم مع خلفية الصفحة' },
    { id: 'custom', label: 'لون مخصص', desc: 'اختر لون خلفية البطاقة يدوياً' },
  ];

  const radiusOptions: { id: RadiusStyle; label: string; px: string }[] = [
    { id: 'sharp', label: 'حاد عصري', px: '4px' },
    { id: 'medium', label: 'متوازن', px: '12px' },
    { id: 'rounded', label: 'ناعم دائري', px: '20px' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-[3px] p-3 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-settings-title"
      onClick={onClose}
    >
      <div
        className="app-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--surface-border)] flex items-center justify-between gap-4 shrink-0">
          <div>
            <h2
              id="admin-settings-title"
              className="text-lg font-extrabold text-[var(--text-primary)]"
            >
              لوحة التحكم والإعدادات المتقدمة
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              تُطبّق جميع التغييرات فوراً وتُحفظ تلقائياً في ذاكرة المتصفح
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق لوحة الإعدادات"
            className="p-2 app-control text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Layout: Sidebar Tabs + Content */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Navigation Rail */}
          <aside className="md:w-56 border-b md:border-b-0 md:border-l border-[var(--surface-border)] bg-[var(--surface-subtle)]/40 p-3 flex md:flex-col gap-1 overflow-x-auto shrink-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs md:text-sm font-semibold app-control transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent-color)] text-[var(--accent-contrast)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Active Tab Panel */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
            {/* TAB 1: THEME & COLOR PALETTE */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                {/* Light / Dark Mode Switch */}
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                    وضع العرض
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    بدّل بين الوضع النهاري والوضع الليلي مع الحفاظ على تباين النصوص.
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSettings((prev) => ({ ...prev, theme: 'light' }))
                      }
                      className={`p-3.5 app-control border flex items-center justify-center gap-2.5 text-sm font-bold transition-colors cursor-pointer ${
                        settings.theme === 'light'
                          ? 'border-[var(--accent-color)] bg-[var(--accent-soft)] text-[var(--accent-color)]'
                          : 'border-[var(--surface-border)] bg-[var(--surface-subtle)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      <span>الوضع النهاري</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSettings((prev) => ({ ...prev, theme: 'dark' }))
                      }
                      className={`p-3.5 app-control border flex items-center justify-center gap-2.5 text-sm font-bold transition-colors cursor-pointer ${
                        settings.theme === 'dark'
                          ? 'border-[var(--accent-color)] bg-[var(--accent-soft)] text-[var(--accent-color)]'
                          : 'border-[var(--surface-border)] bg-[var(--surface-subtle)]/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      <span>الوضع الليلي</span>
                    </button>
                  </div>
                </div>

                {/* Primary Accent Color */}
                <div className="pt-5 border-t border-[var(--surface-border)]">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                    اللون الرئيسي (Accent Color)
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    يُطبق على الأزرار الرئيسية والروابط النشطة وإطارات التركيز.
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5 mb-3">
                    {ACCENT_PRESETS.map((preset) => {
                      const selected =
                        settings.accentColor.toLowerCase() ===
                        preset.hex.toLowerCase();
                      return (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() =>
                            onUpdateSettings((prev) => ({
                              ...prev,
                              accentColor: preset.hex,
                            }))
                          }
                          className={`px-3 py-2 app-control border flex items-center gap-2 text-xs font-semibold transition-colors cursor-pointer ${
                            selected
                              ? 'border-[var(--accent-color)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                              : 'border-[var(--surface-border)] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full shrink-0 border border-black/15 flex items-center justify-center"
                            style={{ backgroundColor: preset.hex }}
                          >
                            {selected && <Check className="w-2.5 h-2.5 text-white" />}
                          </span>
                          <span>{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs font-semibold text-[var(--text-secondary)]">
                      لون مخصص:
                    </label>
                    <input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          accentColor: e.target.value,
                        }))
                      }
                      className="w-10 h-9 app-control border border-[var(--surface-border)] bg-transparent cursor-pointer p-0.5"
                      aria-label="اختيار لون رئيسي مخصص"
                    />
                    <span className="text-xs font-mono-num text-[var(--text-muted)] uppercase" dir="ltr">
                      {settings.accentColor}
                    </span>
                  </div>
                </div>

                {/* Card Background Style */}
                <div className="pt-5 border-t border-[var(--surface-border)]">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                    خلفية البطاقات
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    تحكم في سطح البطاقات وتباينها مع الخلفية العامة.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {cardStyleOptions.map((opt) => {
                      const active = settings.cardStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            onUpdateSettings((prev) => ({
                              ...prev,
                              cardStyle: opt.id,
                            }))
                          }
                          className={`p-3 text-right app-control border transition-colors cursor-pointer ${
                            active
                              ? 'border-[var(--accent-color)] bg-[var(--accent-soft)]'
                              : 'border-[var(--surface-border)] hover:bg-[var(--surface-subtle)]'
                          }`}
                        >
                          <div className="text-xs font-bold text-[var(--text-primary)]">
                            {opt.label}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            {opt.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {settings.cardStyle === 'custom' && (
                    <div className="mt-3 p-3.5 app-control border border-[var(--surface-border)] bg-[var(--surface-subtle)]/50 flex flex-wrap items-center gap-6">
                      <div className="flex items-center gap-2.5">
                        <label className="text-xs font-semibold text-[var(--text-secondary)]">
                          خلفية البطاقة (الليلي):
                        </label>
                        <input
                          type="color"
                          value={settings.customCardBgDark}
                          onChange={(e) =>
                            onUpdateSettings((prev) => ({
                              ...prev,
                              customCardBgDark: e.target.value,
                            }))
                          }
                          className="w-9 h-8 app-control border border-[var(--surface-border)] cursor-pointer p-0.5"
                        />
                        <span className="text-xs font-mono-num text-[var(--text-muted)]" dir="ltr">
                          {settings.customCardBgDark}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <label className="text-xs font-semibold text-[var(--text-secondary)]">
                          خلفية البطاقة (النهاري):
                        </label>
                        <input
                          type="color"
                          value={settings.customCardBgLight}
                          onChange={(e) =>
                            onUpdateSettings((prev) => ({
                              ...prev,
                              customCardBgLight: e.target.value,
                            }))
                          }
                          className="w-9 h-8 app-control border border-[var(--surface-border)] cursor-pointer p-0.5"
                        />
                        <span className="text-xs font-mono-num text-[var(--text-muted)]" dir="ltr">
                          {settings.customCardBgLight}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Border Radius Style */}
                <div className="pt-5 border-t border-[var(--surface-border)]">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
                    نمط الحواف والاستدارة
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mb-3">
                    تغيير درجة انحناء حواف البطاقات والأزرار وحقول الإدخال.
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 max-w-lg">
                    {radiusOptions.map((opt) => {
                      const active = settings.radiusStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            onUpdateSettings((prev) => ({
                              ...prev,
                              radiusStyle: opt.id,
                            }))
                          }
                          className={`p-3 app-control border text-center transition-colors cursor-pointer ${
                            active
                              ? 'border-[var(--accent-color)] bg-[var(--accent-soft)] text-[var(--accent-color)]'
                              : 'border-[var(--surface-border)] text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]'
                          }`}
                        >
                          <div className="text-xs font-bold">{opt.label}</div>
                          <div className="text-[11px] font-mono-num text-[var(--text-muted)] mt-0.5">
                            {opt.px}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GENERATION & CONTENT */}
            {activeTab === 'generation' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                      عدد المنشورات الافتراضي في كل دفعة
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={settings.defaultBatchSize}
                      onChange={(e) => {
                        const val = Math.min(20, Math.max(1, Number(e.target.value) || 10));
                        onUpdateSettings((prev) => ({
                          ...prev,
                          defaultBatchSize: val,
                        }));
                      }}
                      className="app-input w-full px-3.5 py-2.5 text-sm font-mono-num"
                    />
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      الافتراضي 10 منشورات (من 1 إلى 20 منشور لكل دفعة).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                      الحد الأدنى للأسطر لكل منشور
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={10}
                      value={settings.minLinesPerPost}
                      onChange={(e) => {
                        const val = Math.min(10, Math.max(5, Number(e.target.value) || 5));
                        onUpdateSettings((prev) => ({
                          ...prev,
                          minLinesPerPost: val,
                        }));
                      }}
                      className="app-input w-full px-3.5 py-2.5 text-sm font-mono-num"
                    />
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      الحد الأدنى الإلزامي 5 أسطر لكل منشور (حتى 10 أسطر).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-[var(--surface-border)]">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                      اللهجة الافتراضية
                    </label>
                    <select
                      value={settings.defaultDialect}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          defaultDialect: e.target.value as Dialect,
                        }))
                      }
                      className="app-input w-full px-3 py-2.5 text-xs font-semibold"
                    >
                      {DIALECT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                      الفئة الافتراضية
                    </label>
                    <select
                      value={settings.defaultCategory}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          defaultCategory: e.target.value as PostCategory,
                        }))
                      }
                      className="app-input w-full px-3 py-2.5 text-xs font-semibold"
                    >
                      {CATEGORY_GROUPS.map((group) => (
                        <optgroup key={group.label} label={group.label}>
                          {group.items.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-primary)] mb-1.5">
                      الزاوية الافتراضية
                    </label>
                    <select
                      value={settings.defaultAngle}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          defaultAngle: e.target.value as CreativeAngle,
                        }))
                      }
                      className="app-input w-full px-3 py-2.5 text-xs font-semibold"
                    >
                      {ANGLE_OPTIONS.map((ang) => (
                        <option key={ang} value={ang}>
                          {ang}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      onApplyDefaultsToForm();
                      onNotify('تم تطبيق الإعدادات الافتراضية على نموذج التوليد الحالي');
                    }}
                    className="btn-accent px-4 py-2.5 text-xs font-bold cursor-pointer"
                  >
                    تطبيق الإعدادات الافتراضية على النموذج الآن
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: SHARING & INTEGRATIONS */}
            {activeTab === 'sharing' && (
              <div className="space-y-6">
                {/* WhatsApp Country Code & Quick Number */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    إعدادات واتساب والمشاركة السريعة
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        كود الدولة الافتراضي لواتساب
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={settings.whatsappCountryCode}
                          onChange={(e) =>
                            onUpdateSettings((prev) => ({
                              ...prev,
                              whatsappCountryCode: e.target.value.replace(/[^\d+]/g, '').slice(0, 6),
                            }))
                          }
                          placeholder="+20"
                          className="app-input w-24 px-3 py-2 text-xs font-mono-num text-center"
                        />
                        <select
                          value={
                            COUNTRY_CODE_PRESETS.some(
                              (c) => c.code === settings.whatsappCountryCode
                            )
                              ? settings.whatsappCountryCode
                              : ''
                          }
                          onChange={(e) => {
                            if (e.target.value) {
                              onUpdateSettings((prev) => ({
                                ...prev,
                                whatsappCountryCode: e.target.value,
                              }));
                            }
                          }}
                          className="app-input flex-1 px-3 py-2 text-xs"
                        >
                          <option value="">اختر دولة سريعة...</option>
                          {COUNTRY_CODE_PRESETS.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        رقم واتساب افتراضي سريع (اختياري)
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={settings.defaultWhatsappNumber}
                        onChange={(e) =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            defaultWhatsappNumber: e.target.value,
                          }))
                        }
                        placeholder="+201012345678"
                        className="app-input w-full px-3 py-2 text-xs font-mono-num text-left"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start justify-between gap-4 p-3.5 app-control border border-[var(--surface-border)] bg-[var(--surface-subtle)]/35 cursor-pointer">
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                          النسخ التلقائي للنص قبل مشاركة فيسبوك / واتساب
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          ينسخ نص المنشور تلقائياً للحافظة فور الضغط على زر المشاركة لتسهيل اللصق.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.autoCopyBeforeShare}
                        onChange={(e) =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            autoCopyBeforeShare: e.target.checked,
                          }))
                        }
                        className="mt-1 w-4 h-4 accent-[var(--accent-color)] cursor-pointer shrink-0"
                      />
                    </label>

                    <label className="flex items-start justify-between gap-4 p-3.5 app-control border border-[var(--surface-border)] bg-[var(--surface-subtle)]/35 cursor-pointer">
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">
                          تفعيل خيار Web Share API للهواتف
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          يُظهر زر «مشاركة الهاتف» على كل منشور لفتح قائمة المشاركة الأصلية مع الصورة.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.enableWebShareApi}
                        onChange={(e) =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            enableWebShareApi: e.target.checked,
                          }))
                        }
                        className="mt-1 w-4 h-4 accent-[var(--accent-color)] cursor-pointer shrink-0"
                      />
                    </label>
                  </div>
                </div>

                {/* Optional External Generation Engine / API Config */}
                <div className="pt-5 border-t border-[var(--surface-border)] space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)]">
                        إعدادات محرك التوليد الخارجي والذكاء الاصطناعي (اختياري)
                      </h3>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        تعمل المنصة محلياً بدون إنترنت افتراضياً. يمكنك لاحقاً ربط نقطة API خارجية لتوليد مخصص.
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={settings.externalAi.enabled}
                        onChange={(e) =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            externalAi: {
                              ...prev.externalAi,
                              enabled: e.target.checked,
                            },
                          }))
                        }
                        className="w-4 h-4 accent-[var(--accent-color)] cursor-pointer"
                      />
                      <span>تفعيل</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        رابط نقطة الربط (External API Endpoint URL)
                      </label>
                      <input
                        type="url"
                        dir="ltr"
                        value={settings.externalAi.endpointUrl}
                        onChange={(e) =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            externalAi: {
                              ...prev.externalAi,
                              endpointUrl: e.target.value,
                            },
                          }))
                        }
                        placeholder="https://your-service.example.com/api/generate-posts"
                        className="app-input w-full px-3 py-2 text-xs font-mono-num text-left"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        اسم النموذج / المحرك (اختياري)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={settings.externalAi.modelName}
                        onChange={(e) =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            externalAi: {
                              ...prev.externalAi,
                              modelName: e.target.value,
                            },
                          }))
                        }
                        placeholder="custom-arabic-copywriter"
                        className="app-input w-full px-3 py-2 text-xs font-mono-num text-left"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                        مفتاح الربط / رمز المصادقة (محفوظ محلياً فقط)
                      </label>
                      <div className="relative">
                        <input
                          type={showApiToken ? 'text' : 'password'}
                          dir="ltr"
                          value={settings.externalAi.apiToken}
                          onChange={(e) =>
                            onUpdateSettings((prev) => ({
                              ...prev,
                              externalAi: {
                                ...prev.externalAi,
                                apiToken: e.target.value,
                              },
                            }))
                          }
                          placeholder="اختياري..."
                          className="app-input w-full pl-9 pr-3 py-2 text-xs font-mono-num text-left"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiToken((v) => !v)}
                          aria-label={showApiToken ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                        >
                          {showApiToken ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <label className="font-semibold text-[var(--text-secondary)]">
                          درجة الإبداع والتنوع (Creativity / Temperature)
                        </label>
                        <span className="font-mono-num font-bold text-[var(--accent-color)]">
                          {settings.externalAi.creativity.toFixed(1)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.1}
                        value={settings.externalAi.creativity}
                        onChange={(e) =>
                          onUpdateSettings((prev) => ({
                            ...prev,
                            externalAi: {
                              ...prev.externalAi,
                              creativity: Number(e.target.value),
                            },
                          }))
                        }
                        className="w-full accent-[var(--accent-color)] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DATA MANAGEMENT & BACKUP */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <div className="p-4 app-control border border-[var(--surface-border)] bg-[var(--surface-subtle)]/40 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-[var(--text-muted)]">المنشورات المجدولة المحفوظة: </span>
                    <span className="font-mono-num font-bold text-[var(--text-primary)]">
                      {queueCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">المنشورات المولدة حالياً: </span>
                    <span className="font-mono-num font-bold text-[var(--text-primary)]">
                      {generatedCount}
                    </span>
                  </div>
                </div>

                {/* Export / Import JSON Backup */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    النسخ الاحتياطي والاستعادة (JSON Backup)
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    صدّر كافة إعدادات المنصة والمنشورات المولدة وجدول النشر في ملف JSON واحد، أو استعد نسخة سابقة.
                  </p>

                  <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTokenInBackup}
                      onChange={(e) => setIncludeTokenInBackup(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[var(--accent-color)]"
                    />
                    <span>تضمين مفتاح الربط الخارجي داخل ملف النسخة الاحتياطية (غير موصى به للمشاركة)</span>
                  </label>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => onExportBackup(includeTokenInBackup)}
                      className="btn-accent px-4 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>تصدير الإعدادات والمنشورات (JSON)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => importFileRef.current?.click()}
                      className="px-4 py-2.5 text-xs font-bold app-control border border-[var(--surface-border)] hover:border-[var(--accent-color)] text-[var(--text-primary)] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>استيراد نسخة احتياطية</span>
                    </button>
                    <input
                      ref={importFileRef}
                      type="file"
                      accept="application/json,.json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Reset & Danger Zone */}
                <div className="pt-5 border-t border-[var(--surface-border)] space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    إعادة التعيين ومسح البيانات
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    تتطلب العمليات التالية تأكيداً صريحاً قبل التنفيذ لحماية بياناتك المحفوظة.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="button"
                      onClick={onRequestRestoreDefaults}
                      className="px-4 py-2.5 text-xs font-bold app-control border border-[var(--surface-border)] text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>استعادة الإعدادات الافتراضية</span>
                    </button>

                    <button
                      type="button"
                      onClick={onRequestClearAllData}
                      className="px-4 py-2.5 text-xs font-bold app-control border border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>مسح جميع البيانات المحفوظة</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CHANGE PASSCODE */}
            {activeTab === 'security' && (
              <div className="max-w-md space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    تغيير رمز المرور الرقمي للوحة التحكم
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    استخدم رمزاً رقمياً من 4 إلى 8 أرقام. يُحفظ الرمز الجديد فوراً في المتصفح.
                  </p>
                </div>

                <form onSubmit={handlePasscodeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      رمز المرور الحالي
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      dir="ltr"
                      maxLength={8}
                      value={oldCode}
                      onChange={(e) => {
                        setOldCode(e.target.value.replace(/\D/g, '').slice(0, 8));
                        setPasscodeError('');
                        setPasscodeSuccess('');
                      }}
                      placeholder="••••"
                      className="app-input w-full px-3.5 py-2.5 text-sm font-mono-num text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      رمز المرور الجديد (4 إلى 8 أرقام)
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      dir="ltr"
                      maxLength={8}
                      value={newCode}
                      onChange={(e) => {
                        setNewCode(e.target.value.replace(/\D/g, '').slice(0, 8));
                        setPasscodeError('');
                        setPasscodeSuccess('');
                      }}
                      placeholder="مثال: 4820"
                      className="app-input w-full px-3.5 py-2.5 text-sm font-mono-num text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      تأكيد رمز المرور الجديد
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      dir="ltr"
                      maxLength={8}
                      value={confirmCode}
                      onChange={(e) => {
                        setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 8));
                        setPasscodeError('');
                        setPasscodeSuccess('');
                      }}
                      placeholder="أعد إدخال الرمز الجديد"
                      className="app-input w-full px-3.5 py-2.5 text-sm font-mono-num text-left"
                    />
                  </div>

                  {passcodeError && (
                    <p className="text-xs font-semibold text-rose-500" role="alert">
                      {passcodeError}
                    </p>
                  )}

                  {passcodeSuccess && (
                    <p className="text-xs font-semibold text-emerald-500" role="status">
                      {passcodeSuccess}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="btn-accent px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>حفظ رمز المرور الجديد</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
