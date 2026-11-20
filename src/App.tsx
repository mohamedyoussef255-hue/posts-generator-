import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Header } from './components/Header';
import { PasscodeModal } from './components/PasscodeModal';
import { PostCard } from './components/PostCard';
import { ScheduleTable } from './components/ScheduleTable';
import {
  AGE_GROUP_OPTIONS,
  ANGLE_OPTIONS,
  AUDIENCE_SUGGESTIONS,
  CATEGORY_GROUPS,
  DEFAULT_PASSCODE,
  DEFAULT_SETTINGS,
  DIALECT_OPTIONS,
} from './constants/defaults';
import {
  AdminSettings,
  AgeGroup,
  CreativeAngle,
  Dialect,
  GeneratedPost,
  PostCategory,
  ScheduledPost,
} from './types/platform';
import { generatePostsBatch } from './utils/postGenerator';
import {
  clearAllPlatformData,
  darkenHex,
  exportJsonBackup,
  exportQueueToCSV,
  getAccessibleTextOnHex,
  hexToRgba,
  loadGeneratedPosts,
  loadPasscode,
  loadScheduledQueue,
  loadSettings,
  parseJsonBackup,
  saveGeneratedPosts,
  savePasscode,
  saveScheduledQueue,
  saveSettings,
} from './utils/storage';

type PendingConfirm =
  | null
  | {
      type: 'clearQueue' | 'restoreDefaults' | 'clearAllData';
      title: string;
      message: string;
      confirmLabel: string;
      danger: boolean;
    };

export default function App() {
  const [settings, setSettings] = useState<AdminSettings>(() => loadSettings());
  const [passcode, setPasscode] = useState<string>(() => loadPasscode());

  // Generator Form State initialized from saved AdminSettings defaults
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('25-40');
  const [dialect, setDialect] = useState<Dialect>(() => loadSettings().defaultDialect);
  const [category, setCategory] = useState<PostCategory>(
    () => loadSettings().defaultCategory
  );
  const [angle, setAngle] = useState<CreativeAngle>(() => loadSettings().defaultAngle);
  const [batchSize, setBatchSize] = useState<number>(
    () => loadSettings().defaultBatchSize
  );

  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>(() =>
    loadGeneratedPosts()
  );
  const [scheduledQueue, setScheduledQueue] = useState<ScheduledPost[]>(() =>
    loadScheduledQueue()
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState('');

  // Hidden Admin Modal States
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
  }, []);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(''), 3800);
    return () => clearTimeout(timer);
  }, [notification]);

  // Apply Theme, Accent Color, Card Background, and Border Radius to document root immediately
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.setAttribute('data-card-style', settings.cardStyle);
    root.setAttribute('data-radius-style', settings.radiusStyle);

    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--accent-hover', darkenHex(settings.accentColor, 20));
    root.style.setProperty('--accent-soft', hexToRgba(settings.accentColor, 0.13));
    root.style.setProperty('--accent-ring', hexToRgba(settings.accentColor, 0.32));
    root.style.setProperty(
      '--accent-contrast',
      getAccessibleTextOnHex(settings.accentColor)
    );

    if (settings.cardStyle === 'custom') {
      const customBg =
        settings.theme === 'dark'
          ? settings.customCardBgDark
          : settings.customCardBgLight;
      root.style.setProperty('--surface-card', customBg);
    } else {
      root.style.removeProperty('--surface-card');
    }

    saveSettings(settings);
  }, [settings]);

  // Persist scheduled queue & generated posts
  useEffect(() => {
    saveScheduledQueue(scheduledQueue);
  }, [scheduledQueue]);

  useEffect(() => {
    saveGeneratedPosts(generatedPosts);
  }, [generatedPosts]);

  const handleApplyDefaultsToForm = useCallback(() => {
    setDialect(settings.defaultDialect);
    setCategory(settings.defaultCategory);
    setAngle(settings.defaultAngle);
    setBatchSize(settings.defaultBatchSize);
  }, [settings]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      showNotification('يرجى كتابة الموضوع أو الفكرة أولاً قبل التوليد');
      return;
    }

    setIsGenerating(true);
    try {
      // Short intentional delay for smooth state feedback when generating locally
      if (!settings.externalAi.enabled) {
        await new Promise((r) => setTimeout(r, 420));
      }

      const result = await generatePostsBatch(
        {
          topic: topic.trim(),
          audience: audience.trim(),
          ageGroup,
          dialect,
          category,
          angle,
          count: batchSize,
          minLines: settings.minLinesPerPost,
          defaultPhone: settings.defaultWhatsappNumber,
        },
        settings
      );

      setGeneratedPosts(result.posts);
      if (result.warning) {
        showNotification(result.warning);
      } else {
        showNotification(
          `تم توليد ${result.posts.length} منشورات بنجاح (بحد أدنى ${settings.minLinesPerPost} أسطر لكل منشور)`
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (id: number, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (!dataUrl) return;
      setGeneratedPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, image: dataUrl } : p))
      );
      showNotification('تم إرفاق الصورة بالمنشور بنجاح');
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = (id: number) => {
    setGeneratedPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, image: null } : p))
    );
    showNotification('تمت إزالة الصورة من المنشور');
  };

  const handleToggleEdit = (id: number) => {
    setGeneratedPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isEditing: !p.isEditing } : p))
    );
  };

  const handlePostTextChange = (id: number, text: string) => {
    setGeneratedPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, text } : p))
    );
  };

  const handlePhoneChange = (id: number, phoneNumber: string) => {
    setGeneratedPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, phoneNumber } : p))
    );
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => showNotification('تم نسخ نص المنشور إلى الحافظة'))
      .catch(() => showNotification('تعذر النسخ التلقائي — يمكنك التحديد والنسخ يدوياً'));
  };

  const handleSchedulePost = (
    post: GeneratedPost,
    timeOption: 'instant' | '2hours' | 'tomorrow'
  ) => {
    const now = new Date();
    let publishTime = new Date();
    if (timeOption === 'instant') {
      publishTime = new Date(now.getTime() + 60 * 1000);
    } else if (timeOption === '2hours') {
      publishTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    } else {
      publishTime.setDate(now.getDate() + 1);
    }

    const newEntry: ScheduledPost = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      topic: topic.trim() || 'موضوع عام',
      content: post.text,
      imageStatus: post.image ? 'مرفقة' : 'بدون صورة',
      dialect: post.dialect,
      category: post.category,
      time: publishTime.toLocaleString('ar-EG'),
      status: 'مجدول',
    };

    setScheduledQueue((prev) => [newEntry, ...prev]);
    showNotification('تمت إضافة المنشور إلى جدول النشر بنجاح');
  };

  const handleDeleteScheduledRow = (id: number) => {
    setScheduledQueue((prev) => prev.filter((item) => item.id !== id));
    showNotification('تم حذف المنشور من الجدول');
  };

  const handleToggleScheduledStatus = (id: number) => {
    setScheduledQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'مجدول' ? 'تم النشر' : 'مجدول' }
          : item
      )
    );
  };

  const handleExportCsv = () => {
    if (scheduledQueue.length === 0) {
      showNotification('لا توجد منشورات مجدولة لتصديرها حالياً');
      return;
    }
    exportQueueToCSV(scheduledQueue);
    showNotification('تم تصدير جدول المنشورات إلى ملف Excel بنجاح');
  };

  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const parsed = parseJsonBackup(content);
      if (!parsed) {
        showNotification('ملف النسخة الاحتياطية غير صالح أو تالف');
        return;
      }

      setSettings(parsed.settings);
      setDialect(parsed.settings.defaultDialect);
      setCategory(parsed.settings.defaultCategory);
      setAngle(parsed.settings.defaultAngle);
      setBatchSize(parsed.settings.defaultBatchSize);
      setScheduledQueue(parsed.scheduledQueue);
      setGeneratedPosts(parsed.generatedPosts);
      showNotification('تم استيراد النسخة الاحتياطية واستعادة البيانات بنجاح');
    };
    reader.readAsText(file);
  };

  const handleConfirmAction = () => {
    if (!pendingConfirm) return;

    if (pendingConfirm.type === 'clearQueue') {
      setScheduledQueue([]);
      showNotification('تم مسح جدول المنشورات المجدولة');
    } else if (pendingConfirm.type === 'restoreDefaults') {
      setSettings(DEFAULT_SETTINGS);
      setDialect(DEFAULT_SETTINGS.defaultDialect);
      setCategory(DEFAULT_SETTINGS.defaultCategory);
      setAngle(DEFAULT_SETTINGS.defaultAngle);
      setBatchSize(DEFAULT_SETTINGS.defaultBatchSize);
      showNotification('تمت استعادة الإعدادات الافتراضية بنجاح');
    } else if (pendingConfirm.type === 'clearAllData') {
      clearAllPlatformData();
      setSettings(DEFAULT_SETTINGS);
      setPasscode(DEFAULT_PASSCODE);
      setDialect(DEFAULT_SETTINGS.defaultDialect);
      setCategory(DEFAULT_SETTINGS.defaultCategory);
      setAngle(DEFAULT_SETTINGS.defaultAngle);
      setBatchSize(DEFAULT_SETTINGS.defaultBatchSize);
      setGeneratedPosts([]);
      setScheduledQueue([]);
      setTopic('');
      setAudience('');
      showNotification('تم مسح جميع البيانات المحفوظة وإعادة ضبط المنصة');
    }

    setPendingConfirm(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Clean Top Bar with Hidden 5-Tap Logo Trigger */}
      <Header
        onSecretTrigger={() => setPasscodeModalOpen(true)}
        queueCount={scheduledQueue.length}
        hasGeneratedPosts={generatedPosts.length > 0}
        onExportCsv={handleExportCsv}
      />

      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-md w-[calc(100%-2rem)] px-4 py-3 app-control bg-[var(--text-primary)] text-[var(--surface-canvas)] shadow-lg flex items-center gap-2.5 text-xs md:text-sm font-semibold"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--accent-color)]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-10 space-y-8">
        {/* Concise Workspace Intro */}
        <section className="max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[var(--text-primary)] leading-snug">
            توليد وتنظيم منشورات الفيس بوك في دقائق
          </h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)] mt-2 leading-relaxed">
            أدخل فكرتك وحدد الجمهور واللهجة لتوليد دفعة منشورات مطولة جاهزة للتعديل وإرفاق الصور، والمشاركة المباشرة عبر فيسبوك وواتساب، والجدولة والتصدير.
          </p>
        </section>

        {/* Generator Form Card */}
        <section id="generator-section" className="app-card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <h2 className="text-base md:text-lg font-bold text-[var(--text-primary)]">
              معايير وتوليد المنشورات
            </h2>
            <span className="text-xs text-[var(--text-muted)] tabular-nums">
              الدفعة: {batchSize} منشورات · الحد الأدنى: {settings.minLinesPerPost} أسطر
            </span>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label
                htmlFor="topic-input"
                className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
              >
                الموضوع أو الفكرة الأساسية (موجّه داخلي لتشكيل المحتوى)
              </label>
              <input
                id="topic-input"
                type="text"
                placeholder="مثال: تنظيم يوم عائلي لسكان الكمبوند، مبادرة تطوعية، نصائح صحية أو فكرة مشروع..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="app-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="audience-input"
                  className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
                >
                  الفئة المستهدفة
                </label>
                <input
                  id="audience-input"
                  list="audience-suggestions-list"
                  type="text"
                  placeholder="سكان الكمبوند، الأسر، الجيران، الشباب، عامة الناس..."
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="app-input w-full px-3.5 py-2.5 text-sm"
                />
                <datalist id="audience-suggestions-list">
                  {AUDIENCE_SUGGESTIONS.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              <div>
                <label
                  htmlFor="age-select"
                  className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
                >
                  الفئة العمرية
                </label>
                <select
                  id="age-select"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                  className="app-input w-full px-3.5 py-2.5 text-sm"
                >
                  {AGE_GROUP_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="dialect-select"
                  className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
                >
                  الأسلوب / اللهجة
                </label>
                <select
                  id="dialect-select"
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value as Dialect)}
                  className="app-input w-full px-3.5 py-2.5 text-sm"
                >
                  {DIALECT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="category-select"
                  className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
                >
                  الفئة والمجال
                </label>
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PostCategory)}
                  className="app-input w-full px-3.5 py-2.5 text-sm"
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
                <label
                  htmlFor="angle-select"
                  className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
                >
                  الزاوية الإبداعية
                </label>
                <select
                  id="angle-select"
                  value={angle}
                  onChange={(e) => setAngle(e.target.value as CreativeAngle)}
                  className="app-input w-full px-3.5 py-2.5 text-sm"
                >
                  {ANGLE_OPTIONS.map((ang) => (
                    <option key={ang} value={ang}>
                      {ang}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="batch-input"
                  className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5"
                >
                  عدد المنشورات في الدفعة
                </label>
                <input
                  id="batch-input"
                  type="number"
                  min={1}
                  max={20}
                  value={batchSize}
                  onChange={(e) =>
                    setBatchSize(Math.min(20, Math.max(1, Number(e.target.value) || 1)))
                  }
                  className="app-input w-full px-3.5 py-2.5 text-sm font-mono-num"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="btn-accent w-full py-3 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري توليد {batchSize} منشورات إبداعية...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      توليد {batchSize} منشورات إبداعية (بحد أدنى {settings.minLinesPerPost} أسطر)
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Generated Posts Grid */}
        <section id="posts-section" className="space-y-4">
          {generatedPosts.length > 0 && (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    المنشورات المولدة
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    عدّل النصوص مباشرة، أرفق صورك من الجهاز، شارك عبر فيسبوك وواتساب، أو جدولها للنشر.
                  </p>
                </div>
                <div className="text-xs text-[var(--text-muted)] tabular-nums">
                  {generatedPosts.length} منشور · {dialect} · {category}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {generatedPosts.map((post, idx) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={idx}
                    settings={settings}
                    onToggleEdit={handleToggleEdit}
                    onTextChange={handlePostTextChange}
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                    onPhoneChange={handlePhoneChange}
                    onCopy={handleCopyText}
                    onSchedule={handleSchedulePost}
                    onNotify={showNotification}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {/* Scheduled Queue Table */}
        <ScheduleTable
          queue={scheduledQueue}
          onExportCsv={handleExportCsv}
          onRequestClearQueue={() =>
            setPendingConfirm({
              type: 'clearQueue',
              title: 'مسح جدول المنشورات',
              message:
                'هل أنت متأكد من حذف جميع المنشورات المحفوظة في جدول النشر؟ لا يمكن التراجع عن هذه الخطوة.',
              confirmLabel: 'نعم، امسح الجدول',
              danger: true,
            })
          }
          onDeleteRow={handleDeleteScheduledRow}
          onToggleStatus={handleToggleScheduledStatus}
          onCopyContent={handleCopyText}
        />
      </main>

      {/* Quiet Minimal Footer */}
      <footer className="border-t border-[var(--surface-border)] py-5 mt-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <span>منصة توليد منشورات الفيس بوك</span>
          <span>جميع البيانات والتفضيلات تُحفظ محلياً في متصفحك</span>
        </div>
      </footer>

      {/* Hidden Passcode Gate Modal (triggered by 5-tap logo) */}
      <PasscodeModal
        open={passcodeModalOpen}
        expectedPasscode={passcode}
        onSuccess={() => {
          setPasscodeModalOpen(false);
          setAdminModalOpen(true);
        }}
        onClose={() => setPasscodeModalOpen(false)}
      />

      {/* Hidden Admin Settings Panel */}
      <AdminSettingsModal
        open={adminModalOpen}
        settings={settings}
        currentPasscode={passcode}
        queueCount={scheduledQueue.length}
        generatedCount={generatedPosts.length}
        onUpdateSettings={(updater) => setSettings(updater)}
        onApplyDefaultsToForm={handleApplyDefaultsToForm}
        onExportBackup={(includeToken) => {
          exportJsonBackup(settings, scheduledQueue, generatedPosts, includeToken);
          showNotification('تم تصدير النسخة الاحتياطية (JSON) بنجاح');
        }}
        onImportBackup={handleImportBackup}
        onRequestRestoreDefaults={() =>
          setPendingConfirm({
            type: 'restoreDefaults',
            title: 'استعادة الإعدادات الافتراضية',
            message:
              'سيتم إرجاع السمات والألوان وإعدادات التوليد والمشاركة إلى قيمها الافتراضية، مع بقاء منشوراتك المجدولة ورمز المرور كما هي.',
            confirmLabel: 'استعادة الافتراضيات',
            danger: false,
          })
        }
        onRequestClearAllData={() =>
          setPendingConfirm({
            type: 'clearAllData',
            title: 'مسح جميع البيانات المحفوظة',
            message:
              'تحذير: سيؤدي هذا الإجراء إلى حذف جميع المنشورات المولدة والمجدولة، وإعادة ضبط الإعدادات ورمز المرور إلى القيم الافتراضية.',
            confirmLabel: 'مسح كافة البيانات',
            danger: true,
          })
        }
        onChangePasscode={(newCode) => {
          setPasscode(newCode);
          savePasscode(newCode);
          showNotification('تم حفظ رمز المرور الجديد بنجاح');
        }}
        onNotify={showNotification}
        onClose={() => setAdminModalOpen(false)}
      />

      {/* Reusable In-App Confirmation Modal */}
      <ConfirmDialog
        open={pendingConfirm !== null}
        title={pendingConfirm?.title || ''}
        message={pendingConfirm?.message || ''}
        confirmLabel={pendingConfirm?.confirmLabel || 'تأكيد'}
        danger={pendingConfirm?.danger ?? true}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingConfirm(null)}
      />
    </div>
  );
}
