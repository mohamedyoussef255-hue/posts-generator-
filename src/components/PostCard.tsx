import React from 'react';
import {
  CalendarClock,
  Check,
  Copy,
  ImagePlus,
  MessageCircle,
  Pencil,
  RefreshCw,
  Share2,
  Trash2,
} from 'lucide-react';
import { AdminSettings, GeneratedPost } from '../types/platform';
import { countContentLines } from '../utils/postGenerator';
import { formatWhatsAppPhone } from '../utils/storage';

interface PostCardProps {
  post: GeneratedPost;
  index: number;
  settings: AdminSettings;
  onToggleEdit: (id: number) => void;
  onTextChange: (id: number, text: string) => void;
  onImageUpload: (id: number, file: File) => void;
  onImageRemove: (id: number) => void;
  onPhoneChange: (id: number, phone: string) => void;
  onCopy: (text: string) => void;
  onSchedule: (post: GeneratedPost, timeOption: 'instant' | '2hours' | 'tomorrow') => void;
  onNotify: (msg: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  index,
  settings,
  onToggleEdit,
  onTextChange,
  onImageUpload,
  onImageRemove,
  onPhoneChange,
  onCopy,
  onSchedule,
  onNotify,
}) => {
  const lineCount = countContentLines(post.text);

  const effectivePhone =
    post.phoneNumber.trim() || settings.defaultWhatsappNumber.trim();
  const formattedWhatsApp = formatWhatsAppPhone(
    effectivePhone,
    settings.whatsappCountryCode
  );

  const whatsappMessage = post.image
    ? `${post.text}\n\n(مرفق صورة مع المنشور)`
    : post.text;

  const whatsappHref = formattedWhatsApp
    ? `https://api.whatsapp.com/send?phone=${formattedWhatsApp}&text=${encodeURIComponent(whatsappMessage)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`;

  const facebookShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    window.location.origin
  )}&quote=${encodeURIComponent(post.text)}`;

  const handleAutoCopyIfEnabled = (platformLabel: string) => {
    if (settings.autoCopyBeforeShare) {
      navigator.clipboard?.writeText(post.text).catch(() => {});
      onNotify(`تم نسخ النص تلقائياً وجارٍ فتح ${platformLabel}`);
    } else {
      onNotify(`جارٍ فتح ${platformLabel}`);
    }
  };

  const handleWebShare = async () => {
    if (settings.autoCopyBeforeShare) {
      navigator.clipboard?.writeText(post.text).catch(() => {});
    }

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        const shareData: ShareData = {
          title: `منشور فيسبوك #${index + 1}`,
          text: post.text,
        };

        if (post.image && navigator.canShare) {
          try {
            const response = await fetch(post.image);
            const blob = await response.blob();
            const ext = blob.type.split('/')[1] || 'png';
            const file = new File([blob], `post_${index + 1}.${ext}`, {
              type: blob.type || 'image/png',
            });
            if (navigator.canShare({ files: [file] })) {
              shareData.files = [file];
            }
          } catch {
            // Proceed with text-only share if image conversion fails
          }
        }

        await navigator.share(shareData);
        onNotify('تمت مشاركة المنشور بنجاح');
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          onCopy(post.text);
          onNotify('تم نسخ المنشور لعدم دعم المشاركة المباشرة في هذا المتصفح');
        }
      }
    } else {
      onCopy(post.text);
      onNotify('المتصفح الحالي لا يدعم Web Share API — تم نسخ النص إلى الحافظة');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(post.id, file);
    }
    e.target.value = '';
  };

  return (
    <article className="app-card overflow-hidden flex flex-col justify-between transition-colors">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-[var(--surface-border)] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono-num text-sm font-bold text-[var(--accent-color)]">
              #{String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
              {post.angleLabel}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-0.5 flex-wrap">
            <span>{post.dialect}</span>
            <span aria-hidden="true">·</span>
            <span>{post.category}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{lineCount} أسطر</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onToggleEdit(post.id)}
            className={`px-3 py-1.5 text-xs font-semibold app-control flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              post.isEditing
                ? 'btn-accent'
                : 'border border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]'
            }`}
          >
            {post.isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>حفظ</span>
              </>
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onCopy(post.text)}
            className="px-3 py-1.5 text-xs font-semibold app-control border border-[var(--surface-border)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)] flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="نسخ نص المنشور"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>نسخ</span>
          </button>
        </div>
      </div>

      {/* Post Body */}
      <div className="p-5 flex-1">
        {post.isEditing ? (
          <textarea
            value={post.text}
            onChange={(e) => onTextChange(post.id, e.target.value)}
            rows={9}
            className="app-input w-full p-3.5 text-sm leading-relaxed resize-y"
          />
        ) : (
          <p className="text-sm whitespace-pre-wrap text-[var(--text-primary)] leading-[1.85]">
            {post.text}
          </p>
        )}
      </div>

      {/* Image Upload Slot */}
      <div className="px-5 pb-4">
        {post.image ? (
          <div className="relative w-full h-44 app-control overflow-hidden border border-[var(--surface-border)] bg-[var(--surface-subtle)]">
            <img
              src={post.image}
              alt={`صورة المنشور ${index + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/75 via-black/35 to-transparent flex items-center justify-between gap-2">
              <label className="px-2.5 py-1.5 app-control bg-black/60 hover:bg-black/80 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تغيير الصورة</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => onImageRemove(post.id)}
                className="p-1.5 app-control bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                aria-label="إزالة الصورة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <label className="w-full py-5 px-4 border border-dashed border-[var(--surface-border)] hover:border-[var(--accent-color)] app-control flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-[var(--surface-subtle)]/60 hover:bg-[var(--surface-subtle)] transition-colors text-[var(--text-muted)] hover:text-[var(--accent-color)]">
            <ImagePlus className="w-5 h-5" />
            <span className="text-xs font-semibold">
              رفع صورة للمنشور من الجهاز أو الموبايل
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Footer Actions: WhatsApp, Facebook, Web Share, Schedule */}
      <div className="px-5 py-4 border-t border-[var(--surface-border)] bg-[var(--surface-subtle)]/40 space-y-3.5">
        {/* WhatsApp direct send with country code prefix */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
            إرسال عبر واتساب (كود الدولة الافتراضي:{' '}
            <span className="font-mono-num" dir="ltr">
              {settings.whatsappCountryCode}
            </span>
            )
          </label>
          <div className="flex items-center gap-2">
            <input
              type="tel"
              dir="ltr"
              placeholder={
                settings.defaultWhatsappNumber ||
                `${settings.whatsappCountryCode} 1012345678`
              }
              value={post.phoneNumber}
              onChange={(e) => onPhoneChange(post.id, e.target.value)}
              className="app-input flex-1 px-3 py-2 text-xs font-mono-num text-left"
            />
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleAutoCopyIfEnabled('واتساب')}
              className="btn-accent px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>واتساب</span>
            </a>
          </div>
        </div>

        {/* Facebook & Mobile Web Share */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={facebookShareHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleAutoCopyIfEnabled('فيسبوك')}
            className="flex-1 px-3 py-2 text-xs font-semibold app-control border border-[var(--surface-border)] bg-[var(--surface-card)] hover:border-[var(--accent-color)] text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Share2 className="w-3.5 h-3.5 text-[var(--accent-color)]" />
            <span>مشاركة فيسبوك</span>
          </a>

          {settings.enableWebShareApi && (
            <button
              type="button"
              onClick={handleWebShare}
              className="flex-1 px-3 py-2 text-xs font-semibold app-control border border-[var(--surface-border)] bg-[var(--surface-card)] hover:border-[var(--accent-color)] text-[var(--text-primary)] flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>مشاركة الهاتف</span>
            </button>
          )}
        </div>

        {/* Scheduling */}
        <div className="pt-2.5 border-t border-[var(--surface-border)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-2">
            <CalendarClock className="w-3.5 h-3.5" />
            <span>جدولة المنشور في جدول النشر</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onSchedule(post, 'instant')}
              className="py-2 px-2 text-xs font-semibold app-control border border-[var(--surface-border)] bg-[var(--surface-card)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] text-[var(--text-secondary)] transition-colors whitespace-nowrap cursor-pointer"
            >
              فوري
            </button>
            <button
              type="button"
              onClick={() => onSchedule(post, '2hours')}
              className="py-2 px-2 text-xs font-semibold app-control border border-[var(--surface-border)] bg-[var(--surface-card)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] text-[var(--text-secondary)] transition-colors whitespace-nowrap cursor-pointer"
            >
              بعد ساعتين
            </button>
            <button
              type="button"
              onClick={() => onSchedule(post, 'tomorrow')}
              className="py-2 px-2 text-xs font-semibold app-control border border-[var(--surface-border)] bg-[var(--surface-card)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)] text-[var(--text-secondary)] transition-colors whitespace-nowrap cursor-pointer"
            >
              غداً
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
