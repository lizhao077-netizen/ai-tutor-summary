"use client";

const CARD_CONFIG: Record<string, { icon: string; label: string }> = {
  "今日内容": { icon: "📖", label: "今日内容" },
  "课堂表现": { icon: "🌟", label: "课堂表现" },
  "存在问题": { icon: "🎯", label: "存在问题" },
  "后续建议": { icon: "💡", label: "后续建议" },
};

interface Props {
  label: string;
  content: string;
}

export default function FeedbackCard({ label, content }: Props) {
  const config = CARD_CONFIG[label] || { icon: "📌", label };

  return (
    <div className="bg-gray-50 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{config.icon}</span>
        <h4 className="text-sm font-medium text-gray-700">{config.label}</h4>
      </div>
      <p className="text-base leading-relaxed text-gray-800">{content}</p>
    </div>
  );
}
