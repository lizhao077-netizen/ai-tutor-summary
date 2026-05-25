"use client";

import FeedbackCard from "./FeedbackCard";

interface Props {
  text: string;
  loading: boolean;
  copied: boolean;
  onCopy: () => void;
}

function parseSections(text: string): { label: string; content: string }[] {
  const sections: { label: string; content: string }[] = [];
  const regex = /\*\*(课堂内容|课堂表现|课后作业|下节课计划)\*\*/g;
  const matches = Array.from(text.matchAll(regex));

  if (matches.length === 0) {
    return [{ label: "", content: text }];
  }

  for (let i = 0; i < matches.length; i++) {
    const label = matches[i][1];
    const start = matches[i].index! + matches[i][0].length;
    const end = i < matches.length - 1 ? matches[i + 1].index! : text.length;
    const content = text.slice(start, end).trim();
    if (!content) continue;
    // 过滤 AI 偶尔生成的空/占位内容
    if (label === "课后作业" || label === "下节课计划") {
      if (content.length < 8 || /^(无|暂无|待定|未提供)$/.test(content)) continue;
    }
    sections.push({ label, content });
  }

  return sections.length > 0 ? sections : [{ label: "", content: text }];
}

export default function ResultView({ text, loading, copied, onCopy }: Props) {
  if (!text && !loading) return null;

  const sections = text ? parseSections(text) : [];

  return (
    <div className="px-4 pt-2 pb-24">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-gray-800">
          已生成课后反馈
        </h2>
        {text && (
          <button
            onClick={onCopy}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              copied
                ? "bg-green-600 text-white"
                : "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
            }`}
          >
            {copied ? "已复制 ✓" : "📋 一键复制"}
          </button>
        )}
      </div>

      {/* 卡片区域 */}
      {sections.length > 0 ? (
        <div className="space-y-3">
          {sections.map((section, i) => (
            <FeedbackCard
              key={i}
              label={section.label}
              content={section.content}
            />
          ))}
        </div>
      ) : loading ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-300 text-sm">
          正在生成...
        </div>
      ) : null}

      {loading && (
        <div className="flex justify-center mt-3">
          <span className="inline-block w-2 h-4 bg-gray-900 animate-pulse rounded-sm" />
        </div>
      )}
    </div>
  );
}
