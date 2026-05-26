"use client";

import { ChevronLeft } from "lucide-react";
import SettingsPanel from "./SettingsPanel";
import SubjectTermsManager from "./SubjectTermsManager";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";

interface Props {
  studentNames: string;
  onStudentNamesChange: (v: string) => void;
  onBack: () => void;
}

export default function SettingsPage({
  studentNames,
  onStudentNamesChange,
  onBack,
}: Props) {

  return (
    <div className="pb-24 space-y-4">
      {/* 返回按钮 */}
      <div className="px-4">
        <Button variant="secondary" size="lg" onClick={onBack}>
          <ChevronLeft className="h-5 w-5" />
          返回首页
        </Button>
      </div>

      {/* 学生信息管理 */}
      <SettingsPanel
        title="学生信息管理"
        description="设置学生姓名，AI 将在语音修正时自动识别"
      >
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">
            学生姓名（每行一个）
          </label>
          <Textarea
            value={studentNames}
            onChange={(e) => onStudentNamesChange(e.target.value)}
            placeholder="张三&#10;李四"
            rows={3}
          />
        </div>
      </SettingsPanel>

      {/* 学科术语 */}
      <SettingsPanel
        title="AI 智能识别增强"
        description="按学科分类管理术语，AI 将在语音修正时自动识别"
      >
        <SubjectTermsManager />
      </SettingsPanel>

      {/* 历史记录（占位） */}
      <SettingsPanel
        title="历史记录"
        description="查看之前生成的课后反馈"
      >
        <p className="text-sm text-muted-foreground">即将上线</p>
      </SettingsPanel>

    </div>
  );
}
