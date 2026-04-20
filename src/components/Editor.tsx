"use client";
import { useCallback, useRef, useEffect } from "react";

interface EditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  focusMode: boolean;
}

export default function Editor({
  title,
  content,
  onTitleChange,
  onContentChange,
  focusMode,
}: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, []);

  useEffect(() => {
    resize();
  }, [content, resize]);

  const words = content.split(/\s+/).filter((w) => w.length > 0).length;
  const chars = content.length;
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = content.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const readingTime = Math.max(1, Math.ceil(words / 238));

  return (
    <div
      className={`flex-1 flex flex-col items-center overflow-y-auto ${
        focusMode ? "focus-mode" : ""
      }`}
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-[720px] px-5 py-12 flex-1">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled"
          className="title-input w-full text-3xl font-semibold mb-6 bg-transparent border-none font-[family-name:var(--font-literata)]"
          style={{ color: "var(--text-primary)" }}
        />

        {/* Content */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            onContentChange(e.target.value);
            resize();
          }}
          placeholder="Start writing..."
          className="writing-area w-full min-h-[60vh] bg-transparent border-none resize-none font-[family-name:var(--font-literata)] text-lg"
          style={{
            color: "var(--text-primary)",
            lineHeight: "1.8",
            letterSpacing: "0.01em",
          }}
          spellCheck={false}
        />
      </div>

      {/* Stats footer */}
      <div
        className={`sticky bottom-0 w-full flex items-center justify-center gap-6 py-2.5 text-xs font-[family-name:var(--font-jetbrains)] border-t transition-opacity ${
          focusMode ? "opacity-0 hover:opacity-100" : ""
        }`}
        style={{
          color: "var(--text-muted)",
          borderColor: "var(--border)",
          background: "var(--bg-primary)",
        }}
      >
        <span>{words} words</span>
        <span className="opacity-30">|</span>
        <span>{chars} characters</span>
        <span className="opacity-30">|</span>
        <span>{sentences} sentences</span>
        <span className="opacity-30">|</span>
        <span>{paragraphs} paragraphs</span>
        <span className="opacity-30">|</span>
        <span>{readingTime} min read</span>
      </div>
    </div>
  );
}
