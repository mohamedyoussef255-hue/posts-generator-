import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Search,
  Trash2,
} from 'lucide-react';
import { ScheduledPost } from '../types/platform';

interface ScheduleTableProps {
  queue: ScheduledPost[];
  onExportCsv: () => void;
  onRequestClearQueue: () => void;
  onDeleteRow: (id: number) => void;
  onToggleStatus: (id: number) => void;
  onCopyContent: (content: string) => void;
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  queue,
  onExportCsv,
  onRequestClearQueue,
  onDeleteRow,
  onToggleStatus,
  onCopyContent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'مجدول' | 'تم النشر'>('all');

  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.trim().toLowerCase();
      return (
        item.topic.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.dialect.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [queue, searchQuery, statusFilter]);

  return (
    <section id="schedule-section" className="app-card p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--surface-border)]">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            جدول المنشورات والمواعيد المحفوظة
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            تُحفظ المنشورات المجدولة محلياً في المتصفح وتبقى جاهزة للتصدير في أي وقت ·{' '}
            <span className="font-mono-num">{queue.length}</span> منشور
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onExportCsv}
            className="btn-accent px-4 py-2 text-xs font-bold flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير إلى Excel (CSV)</span>
          </button>

          {queue.length > 0 && (
            <button
              type="button"
              onClick={onRequestClearQueue}
              className="px-3.5 py-2 text-xs font-semibold app-control border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح الجدول</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search bar when queue has entries */}
      {queue.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الموضوع أو نص المنشور..."
              className="app-input w-full pr-9 pl-3 py-2 text-xs"
            />
          </div>

          <div className="inline-flex items-center p-1 app-control bg-[var(--surface-subtle)] border border-[var(--surface-border)] self-start">
            {(['all', 'مجدول', 'تم النشر'] as const).map((tab) => {
              const label =
                tab === 'all' ? 'الكل' : tab === 'مجدول' ? 'مجدول' : 'تم النشر';
              const active = statusFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 text-xs font-semibold app-control transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Table or Empty State */}
      {queue.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm font-semibold text-[var(--text-secondary)]">
            لا توجد منشورات مجدولة حالياً
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">
            قم بتوليد دفعة منشورات جديدة ثم اختر موعد الجدولة لإضافتها إلى هذا الجدول.
          </p>
        </div>
      ) : filteredQueue.length === 0 ? (
        <div className="py-10 text-center text-xs text-[var(--text-muted)]">
          لا توجد نتائج مطابقة للبحث الحالي.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 md:-mx-6 px-5 md:px-6">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--surface-border)] text-[var(--text-muted)]">
                <th className="py-3 pl-3 font-semibold whitespace-nowrap">الموضوع</th>
                <th className="py-3 px-3 font-semibold">محتوى المنشور</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">الصورة</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">اللهجة والفئة</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">موعد النشر</th>
                <th className="py-3 px-3 font-semibold whitespace-nowrap">الحالة</th>
                <th className="py-3 pr-3 font-semibold text-left whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)]">
              {filteredQueue.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[var(--surface-subtle)]/50 transition-colors"
                >
                  <td className="py-3.5 pl-3 font-bold text-[var(--text-primary)] whitespace-nowrap max-w-[160px] truncate">
                    {item.topic}
                  </td>
                  <td className="py-3.5 px-3 text-[var(--text-secondary)] max-w-xs truncate">
                    {item.content}
                  </td>
                  <td className="py-3.5 px-3 text-[var(--text-secondary)] whitespace-nowrap">
                    {item.imageStatus}
                  </td>
                  <td className="py-3.5 px-3 text-[var(--text-muted)] whitespace-nowrap">
                    {item.dialect} · {item.category}
                  </td>
                  <td className="py-3.5 px-3 text-[var(--text-secondary)] font-mono-num whitespace-nowrap">
                    {item.time}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(item.id)}
                      className={`inline-flex items-center gap-1.5 font-semibold cursor-pointer hover:underline ${
                        item.status === 'تم النشر'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                      title="انقر لتبديل الحالة"
                    >
                      {item.status === 'تم النشر' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>{item.status}</span>
                    </button>
                  </td>
                  <td className="py-3.5 pr-3 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onCopyContent(item.content)}
                        className="p-1.5 app-control text-[var(--text-muted)] hover:text-[var(--accent-color)] hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                        aria-label="نسخ نص المنشور"
                        title="نسخ النص"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRow(item.id)}
                        className="p-1.5 app-control text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        aria-label="حذف المنشور من الجدول"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
