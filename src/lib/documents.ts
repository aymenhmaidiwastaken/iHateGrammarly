export type WritingMode = "fiction" | "academic" | "technical" | "casual" | "legal";

export interface Document {
  id: string;
  title: string;
  content: string;
  writingMode: WritingMode;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "ihg-documents";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getDocuments(): Document[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getDocument(id: string): Document | null {
  return getDocuments().find((d) => d.id === id) ?? null;
}

export function createDocument(
  title = "Untitled",
  writingMode: WritingMode = "casual"
): Document {
  const doc: Document = {
    id: generateId(),
    title,
    content: "",
    writingMode,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const docs = getDocuments();
  docs.unshift(doc);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  return doc;
}

export function updateDocument(id: string, updates: Partial<Document>): Document | null {
  const docs = getDocuments();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  docs[idx] = { ...docs[idx], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  return docs[idx];
}

export function deleteDocument(id: string): void {
  const docs = getDocuments().filter((d) => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
}

export function exportAsMarkdown(doc: Document): string {
  return `# ${doc.title}\n\n${doc.content}`;
}
