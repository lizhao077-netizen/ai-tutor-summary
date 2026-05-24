"use client";

interface Props {
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}

export default function GenerateButton({ loading, disabled, onClick }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-gray-50">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onClick}
          disabled={disabled}
          className={`w-full py-3.5 rounded-xl font-medium text-base transition-all ${
            disabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
          }`}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin-slow h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              正在生成...
            </span>
          ) : (
            "生成课后总结"
          )}
        </button>
      </div>
    </div>
  );
}
