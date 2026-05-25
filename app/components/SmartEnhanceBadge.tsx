"use client";

import { useState, useEffect } from "react";

const ALL_SUBJECTS = ["数学", "物理", "化学", "英语", "语文", "历史", "地理", "生物", "政治"];

interface Subject {
  id: number;
  subject: string;
  terms: string;
}

interface Props {
  studentNames: string;
  detectedSubject: string;
  onManageClick: () => void;
}

export default function SmartEnhanceBadge({ studentNames, detectedSubject, onManageClick }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [current, setCurrent] = useState(detectedSubject || "数学");

  useEffect(() => {
    fetch("/api/subject-terms")
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (detectedSubject && ALL_SUBJECTS.includes(detectedSubject)) {
      setCurrent(detectedSubject);
    }
  }, [detectedSubject]);

  const selected = subjects.find((s) => s.subject === current);
  const terms = selected?.terms ? selected.terms.split("\n").filter(Boolean) : [];
  const totalTerms = subjects.reduce((acc, s) => acc + (s.terms ? s.terms.split("\n").filter(Boolean).length : 0), 0);
  const hasConfig = !!(studentNames.trim() || totalTerms > 0);
  const nameList = studentNames.trim() ? studentNames.trim().split("\n").filter(Boolean) : [];

  if (!hasConfig) {
    return (
      <div className="px-4 mt-3">
        <button
          onClick={onManageClick}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 hover:text-gray-500 hover:border-gray-300 transition-colors"
        >
          <span>开启理科术语增强，提升识别准确率</span>
          <span className="text-gray-300">&rarr;</span>
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-green-50 border border-green-100 text-sm text-green-700 transition-colors"
      >
        <span>已开启理科术语增强</span>
        <span className="text-green-400 text-xs">{expanded ? "收起" : "展开"}</span>
      </button>

      {expanded && (
        <div className="mt-2 p-4 bg-gray-50 rounded-xl text-sm space-y-3">
          {nameList.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5">学生姓名</p>
              <div className="flex flex-wrap gap-1.5">
                {nameList.map((name) => (
                  <span key={name} className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-xs text-gray-600">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 学科切换 */}
          <div>
            <select
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full py-1.5 px-2.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
            >
              {ALL_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 当前学科术语 */}
          {terms.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {terms.map((t) => (
                <span key={t} className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600">
                  {t}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onManageClick(); }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            管理识别词库 &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
