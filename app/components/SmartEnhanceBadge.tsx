"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { Badge } from "./ui/Badge";

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

const ALL_SUBJECTS = ["数学", "物理", "化学", "英语", "语文", "历史", "地理", "生物", "政治"];

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
  const hasConfig = !!(studentNames.trim() || subjects.some((s) => s.terms?.trim()));
  const nameList = studentNames.trim() ? studentNames.trim().split("\n").filter(Boolean) : [];

  if (!hasConfig) {
    return (
      <div className="px-4 mt-4">
        <button
          onClick={onManageClick}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-gray-300 transition-colors"
        >
          <span>开启学科术语增强，提升识别准确率</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Card className="mx-4 mt-4 bg-muted/30 border-0">
      <CardHeader
        className="py-3 px-4 cursor-pointer select-none hover:bg-muted/50 rounded-t-xl transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span>学科术语增强</span>
          <span className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">已开启</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </span>
        </CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent className="px-4 pb-4 space-y-3">
          {nameList.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">学生姓名</p>
              <div className="flex flex-wrap gap-1.5">
                {nameList.map((name) => (
                  <Badge key={name} variant="outline" className="bg-white">{name}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* 学科切换 */}
          <div>
            <select
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full py-1.5 px-2.5 border border-input rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-ring"
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
                <Badge key={t} variant="outline" className="bg-white text-xs">{t}</Badge>
              ))}
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onManageClick(); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            管理识别词库 &rarr;
          </button>
        </CardContent>
      )}
    </Card>
  );
}
