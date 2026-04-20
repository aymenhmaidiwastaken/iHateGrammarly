"use client";
import { Document, WritingMode } from "@/lib/documents";

const MODES: { value: WritingMode; label: string }[] = [
  { value: "fiction", label: "Fiction" },
  { value: "academic", label: "Academic" },
  { value: "technical", label: "Technical" },
  { value: "casual", label: "Casual" },
  { value: "legal", label: "Legal" },
];

interface SidebarProps {
  open: boolean;
  documents: Document[];
  activeDocId: string | null;
  writingMode: WritingMode;
  onSelectDoc: (id: string) => void;
  onNewDoc: () => void;
  onDeleteDoc: (id: string) => void;
  onSetWritingMode: (mode: WritingMode) => void;
}

export default function Sidebar({
  open,
  documents,
  activeDocId,
  writingMode,
  onSelectDoc,
  onNewDoc,
  onDeleteDoc,
  onSetWritingMode,
}: SidebarProps) {
  if (!open) return null;

  function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  return (
    <aside
      className="w-64 h-full flex flex-col shrink-0 slide-in-left border-r"
      style={{
        background: "var(--bg-primary)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={onNewDoc}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: "var(--accent)",
            color: "#FFFFFF",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Document
        </button>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto py-2">
        {documents.length === 0 ? (
          <p
            className="text-xs text-center py-8 px-4 italic"
            style={{ color: "var(--text-muted)" }}
          >
            No documents yet. Create one to get started.
          </p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className={`group flex items-start justify-between mx-2 mb-0.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                doc.id === activeDocId ? "bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]"
              }`}
              onClick={() => onSelectDoc(doc.id)}
            >
              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-medium truncate"
                  style={{
                    color: doc.id === activeDocId ? "var(--accent)" : "var(--text-primary)",
                  }}
                >
                  {doc.title || "Untitled"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {formatDate(doc.updatedAt)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDoc(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity hover:bg-[var(--border)]"
                title="Delete"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Writing Mode Selector */}
      <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>
          WRITING MODE
        </p>
        <div className="flex flex-col gap-0.5">
          {MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => onSetWritingMode(m.value)}
              className={`text-left text-sm px-2.5 py-1.5 rounded-md transition-colors ${
                writingMode === m.value
                  ? "bg-[var(--bg-secondary)] font-medium"
                  : "hover:bg-[var(--bg-secondary)]"
              }`}
              style={{
                color: writingMode === m.value ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
