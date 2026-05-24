"use client";

const QUICK_ACTIONS = [
  "更亲切一点",
  "更专业一点",
  "简短一些",
  "多鼓励一些",
  "更像真人",
];

interface Props {
  onAction: (label: string) => void;
  loading: boolean;
}

export default function QuickActions({ onAction, loading }: Props) {
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
    </div>
  );
}
