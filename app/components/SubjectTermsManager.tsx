"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "./ui/Textarea";

const ALL_SUBJECTS = ["数学", "物理", "化学", "英语", "语文", "历史", "地理", "生物", "政治"];

interface Subject {
  id: number;
  subject: string;
  terms: string;
}

export default function SubjectTermsManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [current, setCurrent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = subjects.find((s) => s.subject === current);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/subject-terms");
        if (!res.ok) throw new Error("加载失败");
        const data = await res.json();
        if (cancelled) return;
        const existing: Subject[] = data.subjects || [];
        const existingNames = existing.map((s) => s.subject);
        const missing = ALL_SUBJECTS.filter((s) => !existingNames.includes(s));
        if (missing.length > 0) {
          for (const name of missing) {
            await fetch("/api/subject-terms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subject: name, terms: "" }),
            });
          }
          const res2 = await fetch("/api/subject-terms");
          const data2 = await res2.json();
          if (!cancelled) {
            setSubjects(data2.subjects || []);
            setCurrent(missing[0]);
          }
        } else {
          setSubjects(existing);
          setCurrent(existing[0]?.subject || "");
        }
      } catch { /* silent */ }
      if (!cancelled) setLoading(false);
    };
    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTermsChange = (value: string) => {
    if (!selected) return;
    setSubjects((prev) => prev.map((s) => (s.id === selected.id ? { ...s, terms: value } : s)));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveSubject(selected.id, value), 800);
  };

  const saveSubject = async (id: number, terms: string) => {
    const s = subjects.find((sub) => sub.id === id);
    if (!s || s.terms === terms) return;
    setSaving(true);
    try {
      await fetch("/api/subject-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, subject: s.subject, terms }),
      });
    } catch { /* silent */ }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">加载中...</div>;
  }

  return (
    <div className="space-y-3">
      {/* 学科下拉 */}
      <select
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        className="w-full py-2 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {ALL_SUBJECTS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* 术语输入 */}
      {selected && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-muted-foreground">{current}术语（每行一个）</label>
            {saving && <span className="text-xs text-muted-foreground">已保存</span>}
          </div>
          <Textarea
            value={selected.terms}
            onChange={(e) => handleTermsChange(e.target.value)}
            placeholder={`输入${current}相关术语，每行一个&#10;如：二次函数&#10;顶点式&#10;判别式`}
            rows={5}
          />
        </div>
      )}
    </div>
  );
}
