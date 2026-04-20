"use client";
import { WritingMode } from "@/lib/documents";

const MODE_LABELS: Record<WritingMode, string> = {
  fiction: "Fiction",
  academic: "Academic",
  technical: "Technical",
  casual: "Casual",
  legal: "Legal",
};

interface ToolbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  analysisOpen: boolean;
  onToggleAnalysis: () => void;
  focusMode: boolean;
  onToggleFocus: () => void;
  writingMode: WritingMode;
}

export default function Toolbar({
  isDark,
  onToggleTheme,
  sidebarOpen,
  onToggleSidebar,
  analysisOpen,
  onToggleAnalysis,
  focusMode,
  onToggleFocus,
  writingMode,
}: ToolbarProps) {
  return (
    <header
      className={`flex items-center justify-between h-12 px-4 border-b shrink-0 transition-all ${
        focusMode ? "opacity-0 hover:opacity-100" : ""
      }`}
      style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
          title="Toggle sidebar (Ctrl+B)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            {sidebarOpen ? (
              <>
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
        <span
          className="text-base font-[family-name:var(--font-literata)] italic"
          style={{ color: "var(--accent)" }}
        >
          iHateGrammarly
        </span>
      </div>

      {/* Center */}
      <div className="flex items-center gap-2">
        <span
          className="text-xs px-2.5 py-0.5 rounded-full font-medium"
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-secondary)",
          }}
        >
          {MODE_LABELS[writingMode]}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleFocus}
          className={`p-1.5 rounded-md transition-colors ${
            focusMode ? "bg-[var(--accent)] text-white" : "hover:bg-[var(--bg-secondary)]"
          }`}
          title="Focus mode (Ctrl+Shift+F)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M3 12h3M18 12h3M12 3v3M12 18v3" />
          </svg>
        </button>

        <button
          onClick={onToggleAnalysis}
          className={`p-1.5 rounded-md transition-colors ${
            analysisOpen ? "bg-[var(--accent)] text-white" : "hover:bg-[var(--bg-secondary)]"
          }`}
          title="Analysis panel (Ctrl+Shift+A)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 3v18h18" />
            <path d="M7 16l4-6 4 3 5-7" />
          </svg>
        </button>

        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
          title="Toggle theme"
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
