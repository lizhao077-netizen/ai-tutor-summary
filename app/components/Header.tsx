"use client";

interface Props {
  onSettingsClick: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export default function Header({ onSettingsClick, showBack, onBack }: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-4">
      <div>
        {showBack ? (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 px-4 py-2 text-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
          >
            &larr; 返回首页
          </button>
        ) : (
          <>
            <h1 className="text-xl font-bold">AI 课后总结助手</h1>
            <p className="text-xs text-gray-400 mt-0.5">30 秒生成专业家长反馈</p>
          </>
        )}
      </div>
      {!showBack && (
        <button
          onClick={onSettingsClick}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors text-lg"
          aria-label="设置"
        >
          &#9881;
        </button>
      )}
    </header>
  );
}
