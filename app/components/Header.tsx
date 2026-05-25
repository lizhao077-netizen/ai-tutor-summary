"use client";

import { Settings, ChevronLeft } from "lucide-react";
import { Button } from "./ui/Button";

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
          <Button variant="secondary" size="lg" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
            返回首页
          </Button>
        ) : (
          <>
            <h1 className="text-xl font-bold">AI 课后总结助手</h1>
            <p className="text-xs text-muted-foreground mt-0.5">30 秒生成专业家长反馈</p>
          </>
        )}
      </div>
      {!showBack && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          aria-label="设置"
        >
          <Settings className="h-5 w-5" />
        </Button>
      )}
    </header>
  );
}
