"use client";

import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { LogIn } from "lucide-react";

interface Props {
  password: string;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
}

export default function PasswordGate({ password, onPasswordChange, onSubmit }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">AI 课后总结助手</h1>
        <p className="text-sm text-muted-foreground mb-10">30 秒生成专业家长反馈</p>

        <Input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          placeholder="请输入访问密码"
          className="text-center text-base"
        />

        <Button
          onClick={onSubmit}
          size="lg"
          className="w-full mt-4"
        >
          <LogIn className="h-4 w-4" />
          进入
        </Button>
      </div>
    </div>
  );
}
