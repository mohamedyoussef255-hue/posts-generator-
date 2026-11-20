import React, { useRef } from 'react';
import { Download, PenSquare } from 'lucide-react';

interface HeaderProps {
  onSecretTrigger: () => void;
  queueCount: number;
  hasGeneratedPosts: boolean;
  onExportCsv: () => void;
}

const TAP_THRESHOLD = 5;
const TAP_WINDOW_MS = 2500;

export const Header: React.FC<HeaderProps> = ({
  onSecretTrigger,
  queueCount,
  hasGeneratedPosts,
  onExportCsv,
}) => {
  const tapTimestampsRef = useRef<number[]>([]);

  const handleLogoTap = () => {
    const now = Date.now();
    // Keep only taps within the 2.5s rolling window
    const recentTaps = tapTimestampsRef.current.filter(
      (ts) => now - ts <= TAP_WINDOW_MS
    );
    recentTaps.push(now);

    if (recentTaps.length >= TAP_THRESHOLD) {
      tapTimestampsRef.current = [];
      onSecretTrigger();
    } else {
      tapTimestampsRef.current = recentTaps;
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--surface-border)] bg-[var(--surface-card)]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title & Hidden 5-Tap Logo Trigger */}
        <button
          type="button"
          onClick={handleLogoTap}
          className="flex items-center gap-2.5 text-right select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] app-control px-1 py-1 shrink-0"
          aria-label="منصة توليد منشورات الفيس بوك"
        >
          <span className="w-9 h-9 app-control flex items-center justify-center bg-[var(--accent-color)] text-[var(--accent-contrast)] shrink-0 transition-transform active:scale-95">
            <PenSquare className="w-5 h-5" />
          </span>
          <span className="text-base md:text-lg font-extrabold tracking-tight text-[var(--text-primary)] whitespace-nowrap shrink-0">
            منصة توليد منشورات الفيس بوك
          </span>
        </button>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-7 text-sm font-semibold text-[var(--text-secondary)]"
        >
          <a
            href="#generator-section"
            className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
          >
            معايير التوليد
          </a>
          <a
            href="#posts-section"
            className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
          >
            {hasGeneratedPosts ? 'المنشورات المولدة' : 'المسودات'}
          </a>
          <a
            href="#schedule-section"
            className="hover:text-[var(--text-primary)] transition-colors whitespace-nowrap shrink-0"
          >
            جدول النشر
            {queueCount > 0 && (
              <span className="mr-1.5 text-xs font-mono-num text-[var(--accent-color)]">
                ({queueCount})
              </span>
            )}
          </a>
        </nav>

        {/* Zone 3: Single primary header action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onExportCsv}
            className="btn-accent px-4 py-2 text-xs md:text-sm font-bold flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>تصدير الجدول</span>
          </button>
        </div>
      </div>
    </header>
  );
};
