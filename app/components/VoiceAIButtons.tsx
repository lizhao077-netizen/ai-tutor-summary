"use client";

interface Props {
  isRecording: boolean;
  speechSupported: boolean;
  correcting: boolean;
  hasInput: boolean;
  onVoiceStart: () => void;
  onVoiceStop: () => void;
  onCorrect: () => void;
}

export default function VoiceAIButtons({
  isRecording,
  speechSupported,
  correcting,
  hasInput,
  onVoiceStart,
  onVoiceStop,
  onCorrect,
}: Props) {
  return (
    <div className="px-4 mt-3 grid grid-cols-2 gap-3">
      {/* 语音输入 */}
      <button
        type="button"
        onClick={speechSupported ? (isRecording ? onVoiceStop : onVoiceStart) : undefined}
        disabled={!speechSupported}
        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
          !speechSupported
            ? "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed"
            : isRecording
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${
          !speechSupported ? "bg-gray-200" : isRecording ? "bg-red-500 animate-gentle-pulse" : "bg-gray-400"
        }`} />
        {speechSupported ? (isRecording ? "录音中，点击停止" : "语音输入") : "语音输入（需 Chrome）"}
      </button>

      {/* 术语一键替换 */}
      <button
        type="button"
        onClick={onCorrect}
        disabled={!hasInput || correcting}
        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
          !hasInput || correcting
            ? "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed"
            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 active:scale-[0.98]"
        }`}
      >
        <span className={`w-2 h-2 rounded-full ${
          correcting ? "bg-yellow-400 animate-gentle-pulse" : hasInput ? "bg-gray-400" : "bg-gray-200"
        }`} />
        {correcting ? "替换中..." : "术语一键替换"}
      </button>
    </div>
  );
}
