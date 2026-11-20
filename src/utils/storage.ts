import { DEFAULT_PASSCODE, DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants/defaults';
import {
  AdminSettings,
  BackupPayload,
  GeneratedPost,
  ScheduledPost,
} from '../types/platform';

export function loadSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AdminSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      externalAi: {
        ...DEFAULT_SETTINGS.externalAi,
        ...(parsed.externalAi || {}),
      },
      defaultBatchSize: clampNumber(parsed.defaultBatchSize, 1, 20, DEFAULT_SETTINGS.defaultBatchSize),
      minLinesPerPost: clampNumber(parsed.minLinesPerPost, 5, 10, DEFAULT_SETTINGS.minLinesPerPost),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AdminSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function loadPasscode(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.PASSCODE);
    return saved && /^\d{4,8}$/.test(saved) ? saved : DEFAULT_PASSCODE;
  } catch {
    return DEFAULT_PASSCODE;
  }
}

export function savePasscode(passcode: string): void {
  localStorage.setItem(STORAGE_KEYS.PASSCODE, passcode);
}

export function loadScheduledQueue(): ScheduledPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      id: typeof item.id === 'number' ? item.id : Date.now() + Math.random(),
      topic: String(item.topic || 'موضوع عام'),
      content: String(item.content || ''),
      imageStatus: String(item.imageStatus || 'بدون صورة'),
      dialect: String(item.dialect || item.style || 'عامية مصرية'),
      category: String(item.category || 'عام'),
      time: String(item.time || ''),
      status: item.status === 'تم النشر' ? 'تم النشر' : 'مجدول',
    }));
  } catch {
    return [];
  }
}

export function saveScheduledQueue(queue: ScheduledPost[]): void {
  localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
}

export function loadGeneratedPosts(): GeneratedPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GENERATED);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveGeneratedPosts(posts: GeneratedPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GENERATED, JSON.stringify(posts));
  } catch {
    // If large base64 images exceed quota, persist text-only copies
    const lightweight = posts.map((p) => ({ ...p, image: null }));
    try {
      localStorage.setItem(STORAGE_KEYS.GENERATED, JSON.stringify(lightweight));
    } catch {
      // Ignore storage quota overflow gracefully
    }
  }
}

export function clearAllPlatformData(): void {
  localStorage.removeItem(STORAGE_KEYS.QUEUE);
  localStorage.removeItem(STORAGE_KEYS.GENERATED);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.PASSCODE);
}

export function exportJsonBackup(
  settings: AdminSettings,
  scheduledQueue: ScheduledPost[],
  generatedPosts: GeneratedPost[],
  includeSensitiveToken = false
): void {
  const sanitizedSettings: AdminSettings = {
    ...settings,
    externalAi: {
      ...settings.externalAi,
      apiToken: includeSensitiveToken ? settings.externalAi.apiToken : '',
    },
  };

  const payload: BackupPayload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    settings: sanitizedSettings,
    scheduledQueue,
    generatedPosts,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fb_posts_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseJsonBackup(rawText: string): BackupPayload | null {
  try {
    const parsed = JSON.parse(rawText) as Partial<BackupPayload>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.settings && !Array.isArray(parsed.scheduledQueue)) return null;

    const mergedSettings: AdminSettings = {
      ...DEFAULT_SETTINGS,
      ...(parsed.settings || {}),
      externalAi: {
        ...DEFAULT_SETTINGS.externalAi,
        ...(parsed.settings?.externalAi || {}),
      },
      defaultBatchSize: clampNumber(
        parsed.settings?.defaultBatchSize,
        1,
        20,
        DEFAULT_SETTINGS.defaultBatchSize
      ),
      minLinesPerPost: clampNumber(
        parsed.settings?.minLinesPerPost,
        5,
        10,
        DEFAULT_SETTINGS.minLinesPerPost
      ),
    };

    return {
      version: typeof parsed.version === 'number' ? parsed.version : 1,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
      settings: mergedSettings,
      scheduledQueue: Array.isArray(parsed.scheduledQueue) ? parsed.scheduledQueue : [],
      generatedPosts: Array.isArray(parsed.generatedPosts) ? parsed.generatedPosts : [],
    };
  } catch {
    return null;
  }
}

export function exportQueueToCSV(scheduledQueue: ScheduledPost[]): void {
  let csvContent = '\uFEFF';
  csvContent += 'ID,الموضوع,محتوى المنشور,حالة الصورة,اللهجة,الفئة,موعد النشر المقترح,الحالة\n';

  scheduledQueue.forEach((item) => {
    const cleanContent = `"${item.content.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    const cleanTopic = `"${item.topic.replace(/"/g, '""')}"`;
    csvContent += `${item.id},${cleanTopic},${cleanContent},"${item.imageStatus}","${item.dialect}","${item.category}","${item.time}","${item.status}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `facebook_posts_schedule_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, Math.round(num)));
}

export function darkenHex(hex: string, amount = 18): string {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return '#047857';
  const r = Math.max(0, parseInt(clean.slice(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(clean.slice(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(clean.slice(4, 6), 16) - amount);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return `rgba(5, 150, 105, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getAccessibleTextOnHex(hex: string): string {
  const clean = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return '#ffffff';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.68 ? '#0f172a' : '#ffffff';
}

export function formatWhatsAppPhone(rawNumber: string, countryCode: string): string {
  const trimmed = rawNumber.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';

  const cleanCode = countryCode.replace(/\D/g, '');
  if (trimmed.startsWith('+') || (cleanCode && digits.startsWith(cleanCode))) {
    return digits;
  }
  if (digits.startsWith('00')) {
    return digits.slice(2);
  }
  if (cleanCode && digits.startsWith('0')) {
    return `${cleanCode}${digits.slice(1)}`;
  }
  return cleanCode ? `${cleanCode}${digits}` : digits;
}
