"use client";

import { Textarea } from "./ui/Textarea";
import { Input } from "./ui/Input";

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
    <>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          "例如：\n今天讲了圆周运动，基础概念理解不错，\n但向心力分析仍不稳定，解题时容易遗漏条件。"
        }
        maxLength={maxLength}
        rows={6}
        className="min-h-[160px] text-base leading-relaxed border-0 shadow-none resize-none focus-visible:ring-0 px-0"
      />

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {value.length}/{maxLength}
        </p>
        <div className="flex gap-2 flex-1">
          <Input
            type="text"
            value={homework}
            onChange={(e) => onHomeworkChange(e.target.value)}
            placeholder="课后作业（选填）"
            maxLength={100}
            className="h-8 text-xs"
          />
          <Input
            type="text"
            value={nextClass}
            onChange={(e) => onNextClassChange(e.target.value)}
            placeholder="下节课内容（选填）"
            maxLength={100}
            className="h-8 text-xs"
          />
        </div>
      </div>
    </>
  );
}
