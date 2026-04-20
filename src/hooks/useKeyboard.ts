"use client";
import { useEffect } from "react";

interface KeyboardActions {
  onCommandPalette?: () => void;
  onSave?: () => void;
  onToggleSidebar?: () => void;
  onToggleAnalysis?: () => void;
  onToggleFocus?: () => void;
}

export function useKeyboard(actions: KeyboardActions) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "k") {
        e.preventDefault();
        actions.onCommandPalette?.();
      }
      if (mod && e.key === "s") {
        e.preventDefault();
        actions.onSave?.();
      }
      if (mod && e.key === "b") {
        e.preventDefault();
        actions.onToggleSidebar?.();
      }
      if (mod && e.shiftKey && e.key === "A") {
        e.preventDefault();
        actions.onToggleAnalysis?.();
      }
      if (mod && e.shiftKey && e.key === "F") {
        e.preventDefault();
        actions.onToggleFocus?.();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [actions]);
}
