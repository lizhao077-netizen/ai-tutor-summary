"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
  homework: string;
  onHomeworkChange: (v: string) => void;
  nextClass: string;
  onNextClassChange: (v: string) => void;
}

export default function InputArea({ value, onChange, maxLength, homework, onHomeworkChange, nextClass, onNextClassChange }: Props) {
  return (
    <div className="px-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          "例如：\n今天讲了圆周运动，\n基础概念理解不错，\n但向心力分析仍不稳定，\n解题时容易遗漏条件。"
        }
        maxLength={maxLength}
        rows={8}
        className="w-full min-h-[200px] px-5 py-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-300 text-base leading-relaxed"
      />
      <p className="text-right text-xs text-gray-300 mt-1.5">
        {value.length}/{maxLength}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <input
            type="text"
            value={homework}
            onChange={(e) => onHomeworkChange(e.target.value)}
            placeholder="课后作业（选填）"
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-300"
          />
        </div>
        <div>
          <input
            type="text"
            value={nextClass}
            onChange={(e) => onNextClassChange(e.target.value)}
            placeholder="下节课内容（选填）"
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-300"
          />
        </div>
      </div>
    </div>
  );
}
