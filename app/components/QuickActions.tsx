"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Send } from "lucide-react";

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
      <p className="text-xs text-muted-foreground mb-2.5">快捷修改</p>
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action}
            variant="outline"
            size="sm"
            onClick={() => onAction(action)}
            disabled={loading}
            className="rounded-full"
          >
            {action}
          </Button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleCustomSubmit(); }}
          placeholder="输入自定义修改意见..."
          maxLength={80}
          disabled={loading}
        />
        <Button
          onClick={handleCustomSubmit}
          disabled={!custom.trim() || loading}
          size="default"
        >
          <Send className="h-4 w-4" />
          修改
        </Button>
      </div>
    </div>
  );
}
