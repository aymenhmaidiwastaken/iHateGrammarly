"use client";
import { useState } from "react";
import { analyzeText, AnalysisResult, AnalysisIssue } from "@/lib/analysis";

interface AnalysisPanelProps {
  open: boolean;
  content: string;
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let color = "var(--success)";
  if (score < 50) color = "var(--error)";
  else if (score < 70) color = "var(--warning)";
  else if (score < 85) color = "#22C55E";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="progress-ring-circle"
        />
      </svg>
      <span
        className="absolute text-lg font-semibold font-[family-name:var(--font-jetbrains)]"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

function ReadabilityBadge({ label, value, unit }: { label: string; value: number; unit?: string }) {
  let color = "var(--success)";
  if (label === "Grade Level") {
    if (value > 12) color = "var(--error)";
    else if (value > 8) color = "var(--warning)";
  } else {
    if (value < 30) color = "var(--error)";
    else if (value < 60) color = "var(--warning)";
  }

  return (
    <div
      className="flex flex-col items-center p-3 rounded-lg"
      style={{ background: "var(--bg-primary)" }}
    >
      <span className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <span className="text-lg font-semibold font-[family-name:var(--font-jetbrains)]" style={{ color }}>
        {value}
        {unit && <span className="text-xs ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

function IssueItem({ issue }: { issue: AnalysisIssue }) {
  const [expanded, setExpanded] = useState(false);
  const colors = {
    error: "var(--error)",
    warning: "var(--warning)",
    suggestion: "var(--suggestion)",
  };

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left p-2.5 rounded-lg transition-colors hover:bg-[var(--bg-primary)]"
    >
      <div className="flex items-start gap-2">
        <span
          className="mt-1 w-2 h-2 rounded-full shrink-0"
          style={{ background: colors[issue.type] }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>
            {issue.message}
          </p>
          {expanded && (
            <div className="mt-2 fade-in">
              <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                <span className="font-medium">Found:</span>{" "}
                <span
                  className="px-1 py-0.5 rounded"
                  style={{ background: "var(--bg-primary)" }}
                >
                  &ldquo;{issue.text}&rdquo;
                </span>
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {issue.suggestion}
              </p>
            </div>
          )}
          <span
            className="text-xs mt-1 inline-block px-1.5 py-0.5 rounded"
            style={{
              color: colors[issue.type],
              background: "var(--bg-primary)",
            }}
          >
            {issue.category}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function AnalysisPanel({ open, content }: AnalysisPanelProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  function runAnalysis() {
    setLoading(true);
    // Simulate slight delay for UX feel
    setTimeout(() => {
      const r = analyzeText(content);
      setResult(r);
      setLoading(false);
    }, 400);
  }

  const errors = result?.issues.filter((i) => i.type === "error") ?? [];
  const warnings = result?.issues.filter((i) => i.type === "warning") ?? [];
  const suggestions = result?.issues.filter((i) => i.type === "suggestion") ?? [];

  return (
    <aside
      className="w-80 h-full flex flex-col shrink-0 slide-in-right border-l overflow-y-auto"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Analysis
          </h2>
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                </svg>
                Analyzing...
              </span>
            ) : (
              "Analyze"
            )}
          </button>
        </div>

        {result && (
          <div className="flex flex-col items-center">
            <ScoreRing score={result.overallScore} />
            <span className="text-xs mt-2 font-medium" style={{ color: "var(--text-secondary)" }}>
              Overall Score
            </span>
          </div>
        )}
      </div>

      {result && (
        <>
          {/* Readability */}
          <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
              READABILITY
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ReadabilityBadge label="Reading Ease" value={result.fleschReadingEase} />
              <ReadabilityBadge label="Grade Level" value={result.fleschKincaidGrade} />
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h3 className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
              STATISTICS
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Words</span>
                <span className="font-[family-name:var(--font-jetbrains)]" style={{ color: "var(--text-primary)" }}>
                  {result.words}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Sentences</span>
                <span className="font-[family-name:var(--font-jetbrains)]" style={{ color: "var(--text-primary)" }}>
                  {result.sentences}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Avg length</span>
                <span className="font-[family-name:var(--font-jetbrains)]" style={{ color: "var(--text-primary)" }}>
                  {result.avgSentenceLength}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>Read time</span>
                <span className="font-[family-name:var(--font-jetbrains)]" style={{ color: "var(--text-primary)" }}>
                  {result.readingTime}m
                </span>
              </div>
            </div>
          </div>

          {/* Issues */}
          <div className="p-4 flex-1">
            <h3 className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
              ISSUES ({result.issues.length})
            </h3>

            {result.issues.length === 0 ? (
              <div className="text-center py-6">
                <svg className="mx-auto mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <path d="M22 4L12 14.01l-3-3" />
                </svg>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Looking good! No issues found.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {errors.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium mb-1" style={{ color: "var(--error)" }}>
                      Errors ({errors.length})
                    </p>
                    {errors.map((issue, i) => (
                      <IssueItem key={`e-${i}`} issue={issue} />
                    ))}
                  </div>
                )}
                {warnings.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium mb-1" style={{ color: "var(--warning)" }}>
                      Warnings ({warnings.length})
                    </p>
                    {warnings.map((issue, i) => (
                      <IssueItem key={`w-${i}`} issue={issue} />
                    ))}
                  </div>
                )}
                {suggestions.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-medium mb-1" style={{ color: "var(--suggestion)" }}>
                      Suggestions ({suggestions.length})
                    </p>
                    {suggestions.map((issue, i) => (
                      <IssueItem key={`s-${i}`} issue={issue} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {!result && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round" className="mb-3 opacity-40">
            <path d="M3 3v18h18" />
            <path d="M7 16l4-6 4 3 5-7" />
          </svg>
          <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
            Click <strong>Analyze</strong> to check your writing for grammar, style, and readability.
          </p>
        </div>
      )}
    </aside>
  );
}
