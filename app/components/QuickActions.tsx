"use client";

import { useState } from "react";

const QUICK_ACTIONS = [
  "加入鼓励",
  "补充学习建议",
  "精简为短信版",
  "展开学科分析",
  "语气更亲切",
];

interface Props {
  onAction: (label: string) => void;
  loading: boolean;
}

export default function QuickActions({ onAction, loading }: Props) {
  const [custom, setCustom] = useState("");

  const handleCustomSubmit = () => {
    if (!custom.trim() || loading) return;
    onAction(custom.trim());
    setCustom("");
  };

  return (
    <div className="px-4 pb-24">
      <p className="text-xs text-gray-400 mb-2.5">快捷修改</p>
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            onClick={() => onAction(action)}
            disabled={loading}
            className="px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
          >
            {action}
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCustomSubmit(); }}
          placeholder="输入自定义修改意见..."
          maxLength={80}
          disabled={loading}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-300 disabled:opacity-40"
        />
        <button
          onClick={handleCustomSubmit}
          disabled={!custom.trim() || loading}
          className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.97]"
        >
          修改
        </button>
      </div>
    </div>
  );
}
