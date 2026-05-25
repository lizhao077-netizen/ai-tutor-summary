"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import SettingsPanel from "./SettingsPanel";
import SubjectTermsManager from "./SubjectTermsManager";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";

interface Props {
  studentNames: string;
  onStudentNamesChange: (v: string) => void;
  userApiKey: string;
  apiBase: string;
  modelName: string;
  onUserApiKeyChange: (v: string) => void;
  onApiBaseChange: (v: string) => void;
  onModelNameChange: (v: string) => void;
  onBack: () => void;
}

const MODEL_PRESETS = [
  ["DeepSeek", "https://api.deepseek.com/v1", "deepseek-chat"],
  ["OpenAI", "https://api.openai.com/v1", "gpt-4o-mini"],
  ["智谱 GLM", "https://open.bigmodel.cn/api/paas/v4", "glm-4-flash"],
  ["通义千问", "https://dashscope.aliyuncs.com/compatible-mode/v1", "qwen-turbo"],
  ["Moonshot", "https://api.moonshot.cn/v1", "moonshot-v1-8k"],
] as const;

export default function SettingsPage({
  studentNames,
  onStudentNamesChange,
  userApiKey,
  apiBase,
  modelName,
  onUserApiKeyChange,
  onApiBaseChange,
  onModelNameChange,
  onBack,
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);

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

      {/* 风格偏好（占位） */}
      <SettingsPanel
        title="风格偏好"
        description="设置默认的反馈风格"
      >
        <div className="flex gap-2">
          {["专业", "亲切", "简洁"].map((style) => (
            <Button key={style} variant="outline" size="sm" className="rounded-full">
              {style}
            </Button>
          ))}
        </div>
      </SettingsPanel>

      {/* 历史记录（占位） */}
      <SettingsPanel
        title="历史记录"
        description="查看之前生成的课后反馈"
      >
        <p className="text-sm text-muted-foreground">即将上线</p>
      </SettingsPanel>

      {/* 高级设置 */}
      <SettingsPanel
        title="高级设置"
        description="API 密钥、模型配置等。普通用户无需修改。"
      >
        <Button
          variant="link"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "收起高级设置" : "展开高级设置"}
        </Button>

        {showAdvanced && (
          <div className="space-y-3 mt-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">预设模型</label>
              <div className="flex flex-wrap gap-1.5">
                {MODEL_PRESETS.map(([label, url, m]) => (
                  <Button
                    key={label}
                    variant={apiBase === url && modelName === m ? "default" : "outline"}
                    size="sm"
                    onClick={() => { onApiBaseChange(url); onModelNameChange(m); }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">API Key</label>
              <Input
                type="password"
                value={userApiKey}
                onChange={(e) => onUserApiKeyChange(e.target.value)}
                placeholder="粘贴你的 API Key"
              />
              <p className="text-xs text-muted-foreground mt-1">
                填入后使用你自己的额度。留空则共享站点额度。
              </p>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">API 地址</label>
              <Input
                type="text"
                value={apiBase}
                onChange={(e) => onApiBaseChange(e.target.value)}
                placeholder="https://api.deepseek.com/v1"
                className="font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">模型名称</label>
              <Input
                type="text"
                value={modelName}
                onChange={(e) => onModelNameChange(e.target.value)}
                placeholder="deepseek-chat"
                className="font-mono"
              />
            </div>
          </div>
        )}
      </SettingsPanel>
    </div>
  );
}
