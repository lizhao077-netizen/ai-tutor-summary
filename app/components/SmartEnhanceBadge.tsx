"use client";

import { useState, useEffect } from "react";

interface Subject {
  id: number;
  subject: string;
  terms: string;
}

interface Props {
  studentNames: string;
  onManageClick: () => void;
}

export default function SmartEnhanceBadge({ studentNames, onManageClick }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetch("/api/subject-terms")
      .then((r) => r.json())
      .then((d) => setSubjects(d.subjects || []))
      .catch(() => {});
  }, []);

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
          {subjects.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1.5">学科术语</p>
              {subjects.map((s) => {
                const terms = s.terms ? s.terms.split("\n").filter(Boolean) : [];
                if (terms.length === 0) return null;
                return (
                  <div key={s.id} className="mb-2">
                    <p className="text-xs text-gray-500 mb-0.5">{s.subject}</p>
                    <div className="flex flex-wrap gap-1">
                      {terms.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-600">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
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
