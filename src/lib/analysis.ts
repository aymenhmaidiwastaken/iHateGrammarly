export type IssueSeverity = "error" | "warning" | "suggestion";

export interface AnalysisIssue {
  type: IssueSeverity;
  category: string;
  message: string;
  suggestion: string;
  text: string;
  start: number;
  end: number;
}

export interface AnalysisResult {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  avgSentenceLength: number;
  avgWordLength: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  overallScore: number;
  issues: AnalysisIssue[];
}

const WEASEL_WORDS = [
  "very", "really", "quite", "basically", "actually", "literally",
  "just", "simply", "somewhat", "perhaps", "maybe", "probably",
  "relatively", "fairly", "rather", "slightly", "practically",
  "virtually", "essentially", "arguably", "supposedly",
];

const CLICHES = [
  "at the end of the day", "think outside the box", "low-hanging fruit",
  "take it to the next level", "hit the ground running", "move the needle",
  "circle back", "deep dive", "on the same page", "touch base",
  "at this point in time", "few and far between", "the fact of the matter",
  "in the grand scheme of things", "it goes without saying",
  "better late than never", "each and every", "first and foremost",
  "needless to say", "last but not least", "when all is said and done",
  "all walks of life", "the bottom line", "crystal clear",
  "paradigm shift", "push the envelope", "synergy", "leverage",
  "game changer", "best practice", "value proposition",
  "actionable insights", "bleeding edge", "boil the ocean",
];

const LY_EXCLUSIONS = new Set([
  "family", "only", "early", "holy", "poly", "rely", "apply", "supply",
  "reply", "fly", "july", "italy", "ally", "belly", "bully", "folly",
  "jolly", "lily", "rally", "silly", "tally", "ugly", "daily",
  "friendly", "lonely", "lovely", "likely", "unlikely", "namely",
  "namely", "assembly", "homely", "comely", "anomaly",
]);

const PASSIVE_HELPERS = new Set([
  "is", "are", "was", "were", "be", "been", "being",
  "am", "has been", "have been", "had been", "will be",
  "is being", "are being", "was being", "were being",
]);

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 2) return 1;
  let count = 0;
  const vowels = "aeiouy";
  let prevVowel = false;
  for (let i = 0; i < w.length; i++) {
    const isVowel = vowels.includes(w[i]);
    if (isVowel && !prevVowel) count++;
    prevVowel = isVowel;
  }
  if (w.endsWith("e") && !w.endsWith("le") && count > 1) count--;
  if (w.endsWith("le") && w.length > 3 && !vowels.includes(w[w.length - 3])) count++;
  return Math.max(1, count);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function splitWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z'-]/g, ""))
    .filter((w) => w.length > 0);
}

function detectPassiveVoice(text: string): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  const pattern = /\b(is|are|was|were|be|been|being|am)\s+([\w]+ed|[\w]+en|[\w]+t)\b/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const helper = match[1].toLowerCase();
    if (PASSIVE_HELPERS.has(helper)) {
      issues.push({
        type: "warning",
        category: "Passive Voice",
        message: `"${match[0]}" appears to be passive voice.`,
        suggestion: "Consider rewriting in active voice for stronger, clearer prose.",
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }
  return issues;
}

function detectAdverbs(text: string): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  const pattern = /\b(\w+ly)\b/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const word = match[1].toLowerCase();
    if (!LY_EXCLUSIONS.has(word) && word.length > 3) {
      issues.push({
        type: "suggestion",
        category: "Adverb",
        message: `"${match[1]}" — adverbs can weaken your writing.`,
        suggestion: "Try using a stronger verb instead of a verb + adverb combination.",
        text: match[1],
        start: match.index,
        end: match.index + match[1].length,
      });
    }
  }
  return issues;
}

function detectCliches(text: string): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  const lower = text.toLowerCase();
  for (const cliche of CLICHES) {
    let idx = lower.indexOf(cliche);
    while (idx !== -1) {
      issues.push({
        type: "warning",
        category: "Cliche",
        message: `"${text.slice(idx, idx + cliche.length)}" is a cliche.`,
        suggestion: "Replace with more original, specific language.",
        text: text.slice(idx, idx + cliche.length),
        start: idx,
        end: idx + cliche.length,
      });
      idx = lower.indexOf(cliche, idx + 1);
    }
  }
  return issues;
}

function detectWeaselWords(text: string): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  for (const weasel of WEASEL_WORDS) {
    const pattern = new RegExp(`\\b${weasel}\\b`, "gi");
    let match;
    while ((match = pattern.exec(text)) !== null) {
      issues.push({
        type: "suggestion",
        category: "Weasel Word",
        message: `"${match[0]}" is vague and weakens your point.`,
        suggestion: "Remove it or replace with something more specific.",
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }
  return issues;
}

function detectLongSentences(text: string): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  const sentences = splitSentences(text);
  let pos = 0;
  for (const sentence of sentences) {
    const idx = text.indexOf(sentence, pos);
    const wordCount = splitWords(sentence).length;
    if (wordCount > 30) {
      issues.push({
        type: "warning",
        category: "Long Sentence",
        message: `This sentence has ${wordCount} words. Consider breaking it up.`,
        suggestion: "Aim for sentences under 25 words for better readability.",
        text: sentence.slice(0, 60) + (sentence.length > 60 ? "..." : ""),
        start: idx,
        end: idx + sentence.length,
      });
    }
    pos = idx + sentence.length;
  }
  return issues;
}

function detectRepeatedWords(text: string): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  const words = splitWords(text);
  const skipWords = new Set([
    "the", "a", "an", "and", "or", "but", "is", "are", "was", "were",
    "in", "on", "at", "to", "for", "of", "with", "by", "it", "this",
    "that", "not", "be", "has", "have", "had", "do", "does", "did",
    "will", "would", "could", "should", "may", "might", "can", "i",
    "you", "he", "she", "we", "they", "my", "your", "his", "her",
    "its", "our", "their", "from", "as", "if", "so", "no", "all",
  ]);

  const windowSize = 100;
  const seen = new Map<string, number[]>();

  for (let i = 0; i < words.length; i++) {
    const w = words[i].toLowerCase();
    if (w.length < 4 || skipWords.has(w)) continue;
    if (!seen.has(w)) seen.set(w, []);
    const positions = seen.get(w)!;
    positions.push(i);

    const nearby = positions.filter((p) => i - p < windowSize);
    seen.set(w, nearby);

    if (nearby.length >= 3 && nearby.length === 3) {
      const textIdx = text.toLowerCase().lastIndexOf(w);
      if (textIdx !== -1) {
        issues.push({
          type: "suggestion",
          category: "Repetition",
          message: `"${w}" appears ${nearby.length} times in close proximity.`,
          suggestion: "Vary your word choice to keep the reader engaged.",
          text: w,
          start: textIdx,
          end: textIdx + w.length,
        });
      }
    }
  }
  return issues;
}

export function analyzeText(text: string): AnalysisResult {
  if (!text.trim()) {
    return {
      words: 0, characters: 0, sentences: 0, paragraphs: 0,
      readingTime: 0, avgSentenceLength: 0, avgWordLength: 0,
      fleschReadingEase: 0, fleschKincaidGrade: 0, overallScore: 0,
      issues: [],
    };
  }

  const words = splitWords(text);
  const sentences = splitSentences(text);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

  const wordCount = words.length;
  const sentenceCount = Math.max(sentences.length, 1);
  const charCount = text.length;
  const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);

  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / Math.max(wordCount, 1);
  const avgWordLength =
    words.reduce((sum, w) => sum + w.length, 0) / Math.max(wordCount, 1);

  // Flesch Reading Ease: 206.835 - 1.015 * ASL - 84.6 * ASW
  const fleschReadingEase = Math.max(
    0,
    Math.min(100, 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord)
  );

  // Flesch-Kincaid Grade: 0.39 * ASL + 11.8 * ASW - 15.59
  const fleschKincaidGrade = Math.max(
    0,
    0.39 * avgSentenceLength + 11.8 * avgSyllablesPerWord - 15.59
  );

  const readingTime = Math.ceil(wordCount / 238);

  // Collect all issues
  const issues: AnalysisIssue[] = [
    ...detectPassiveVoice(text),
    ...detectAdverbs(text),
    ...detectCliches(text),
    ...detectWeaselWords(text),
    ...detectLongSentences(text),
    ...detectRepeatedWords(text),
  ];

  // Calculate overall score (100 = perfect, deduct for issues)
  let score = 100;
  for (const issue of issues) {
    if (issue.type === "error") score -= 5;
    else if (issue.type === "warning") score -= 3;
    else score -= 1;
  }
  // Factor in readability
  if (fleschReadingEase < 30) score -= 10;
  else if (fleschReadingEase < 50) score -= 5;
  if (avgSentenceLength > 25) score -= 5;

  const overallScore = Math.max(0, Math.min(100, score));

  return {
    words: wordCount,
    characters: charCount,
    sentences: sentenceCount,
    paragraphs: paragraphs.length,
    readingTime,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
    fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
    overallScore,
    issues,
  };
}
