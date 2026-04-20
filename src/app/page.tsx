"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Toolbar from "@/components/Toolbar";
import Sidebar from "@/components/Sidebar";
import Editor from "@/components/Editor";
import AnalysisPanel from "@/components/AnalysisPanel";
import CommandPalette from "@/components/CommandPalette";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboard } from "@/hooks/useKeyboard";
import {
  Document,
  WritingMode,
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  exportAsMarkdown,
} from "@/lib/documents";

export default function Home() {
  const { isDark, toggle: toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [writingMode, setWritingMode] = useState<WritingMode>("casual");

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load documents on mount
  useEffect(() => {
    const docs = getDocuments();
    setDocuments(docs);
    if (docs.length > 0) {
      setActiveDocId(docs[0].id);
      setTitle(docs[0].title);
      setContent(docs[0].content);
      setWritingMode(docs[0].writingMode);
    }
  }, []);

  // Auto-save with debounce
  const saveDoc = useCallback(() => {
    if (activeDocId) {
      updateDocument(activeDocId, { title, content, writingMode });
      setDocuments(getDocuments());
    }
  }, [activeDocId, title, content, writingMode]);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveDoc, 1500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [title, content, writingMode, saveDoc]);

  function handleNewDoc() {
    saveDoc();
    const doc = createDocument("Untitled", writingMode);
    setDocuments(getDocuments());
    setActiveDocId(doc.id);
    setTitle(doc.title);
    setContent(doc.content);
  }

  function handleSelectDoc(id: string) {
    saveDoc();
    const doc = getDocument(id);
    if (doc) {
      setActiveDocId(doc.id);
      setTitle(doc.title);
      setContent(doc.content);
      setWritingMode(doc.writingMode);
    }
  }

  function handleDeleteDoc(id: string) {
    deleteDocument(id);
    const docs = getDocuments();
    setDocuments(docs);
    if (id === activeDocId) {
      if (docs.length > 0) {
        handleSelectDoc(docs[0].id);
      } else {
        setActiveDocId(null);
        setTitle("");
        setContent("");
      }
    }
  }

  function handleExport() {
    if (!activeDocId) return;
    const doc = getDocument(activeDocId);
    if (!doc) return;
    const md = exportAsMarkdown({ ...doc, title, content });
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "untitled"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const commands = [
    { id: "new", label: "New Document", shortcut: "Ctrl+N", action: handleNewDoc },
    { id: "theme", label: "Toggle Dark Mode", shortcut: "", action: toggleTheme },
    { id: "focus", label: "Toggle Focus Mode", shortcut: "Ctrl+Shift+F", action: () => setFocusMode((f) => !f) },
    { id: "sidebar", label: "Toggle Sidebar", shortcut: "Ctrl+B", action: () => setSidebarOpen((s) => !s) },
    { id: "analysis", label: "Toggle Analysis Panel", shortcut: "Ctrl+Shift+A", action: () => setAnalysisOpen((a) => !a) },
    { id: "export", label: "Export as Markdown", shortcut: "", action: handleExport },
    { id: "fiction", label: "Switch to Fiction Mode", shortcut: "", action: () => setWritingMode("fiction") },
    { id: "academic", label: "Switch to Academic Mode", shortcut: "", action: () => setWritingMode("academic") },
    { id: "technical", label: "Switch to Technical Mode", shortcut: "", action: () => setWritingMode("technical") },
    { id: "casual", label: "Switch to Casual Mode", shortcut: "", action: () => setWritingMode("casual") },
    { id: "legal", label: "Switch to Legal Mode", shortcut: "", action: () => setWritingMode("legal") },
  ];

  useKeyboard({
    onCommandPalette: () => setCommandPaletteOpen((o) => !o),
    onSave: saveDoc,
    onToggleSidebar: () => setSidebarOpen((s) => !s),
    onToggleAnalysis: () => setAnalysisOpen((a) => !a),
    onToggleFocus: () => setFocusMode((f) => !f),
  });

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      <Toolbar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        analysisOpen={analysisOpen}
        onToggleAnalysis={() => setAnalysisOpen((a) => !a)}
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode((f) => !f)}
        writingMode={writingMode}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          documents={documents}
          activeDocId={activeDocId}
          writingMode={writingMode}
          onSelectDoc={handleSelectDoc}
          onNewDoc={handleNewDoc}
          onDeleteDoc={handleDeleteDoc}
          onSetWritingMode={setWritingMode}
        />

        {activeDocId ? (
          <Editor
            title={title}
            content={content}
            onTitleChange={setTitle}
            onContentChange={setContent}
            focusMode={focusMode}
          />
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center" style={{ background: "var(--bg-primary)" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="0.8" strokeLinecap="round" className="mb-4 opacity-30">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
            <h2
              className="text-xl font-[family-name:var(--font-literata)] italic mb-2"
              style={{ color: "var(--text-secondary)" }}
            >
              Start writing something beautiful
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Create a new document or select one from the sidebar.
            </p>
            <button
              onClick={handleNewDoc}
              className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              New Document
            </button>
          </div>
        )}

        <AnalysisPanel open={analysisOpen} content={content} />
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
}
