"use client";

import { useState } from "react";
import SettingsPanel from "./SettingsPanel";

interface Props {
  studentNames: string;
  subjectTerms: string;
  onStudentNamesChange: (v: string) => void;
  onSubjectTermsChange: (v: string) => void;
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
  subjectTerms,
  onStudentNamesChange,
  onSubjectTermsChange,
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
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 px-3 py-2 text-base text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          &larr; 返回首页
        </button>
      </div>

      {/* 学生信息管理 */}
      <SettingsPanel
        title="学生信息管理"
        description="设置学生姓名，AI 将在语音修正时自动识别"
      >
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            学生姓名（每行一个）
          </label>
          <textarea
            value={studentNames}
            onChange={(e) => onStudentNamesChange(e.target.value)}
            placeholder="张三&#10;李四"
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-300 text-sm"
          />
        </div>
      </SettingsPanel>

      {/* 智能识别增强 */}
      <SettingsPanel
        title="AI 智能识别增强"
        description="让 AI 准确识别学科术语和知识点，提升语音修正准确率"
      >
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            理科术语（每行一个）
          </label>
          <textarea
            value={subjectTerms}
            onChange={(e) => onSubjectTermsChange(e.target.value)}
            placeholder="二次函数&#10;顶点式&#10;判别式&#10;楞次定律&#10;洛伦兹力"
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-300 text-sm"
          />
          <p className="text-xs text-gray-300 mt-1.5">
            设置后自动保存。AI 将在语音修正时优先识别这些术语。
          </p>
        </div>
      </SettingsPanel>

      {/* 风格偏好（占位） */}
      <SettingsPanel
        title="风格偏好"
        description="设置默认的反馈风格"
      >
        <div className="flex gap-2">
          {["专业", "亲切", "简洁"].map((style) => (
            <button
              key={style}
              className="px-4 py-1.5 rounded-full border border-gray-200 text-sm text-gray-400"
            >
              {style}
            </button>
          ))}
        </div>
      </SettingsPanel>

      {/* 历史记录（占位） */}
      <SettingsPanel
        title="历史记录"
        description="查看之前生成的课后反馈"
      >
        <p className="text-sm text-gray-300">即将上线</p>
      </SettingsPanel>

      {/* 高级设置 */}
      <SettingsPanel
        title="高级设置"
        description="API 密钥、模型配置等。普通用户无需修改。"
      >
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showAdvanced ? "收起高级设置" : "展开高级设置"}
        </button>

        {showAdvanced && (
          <div className="space-y-3 mt-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">预设模型</label>
              <div className="flex flex-wrap gap-1.5">
                {MODEL_PRESETS.map(([label, url, m]) => (
                  <button
                    key={label}
                    onClick={() => { onApiBaseChange(url); onModelNameChange(m); }}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                      apiBase === url && modelName === m
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">API Key</label>
              <input
                type="password"
                value={userApiKey}
                onChange={(e) => onUserApiKeyChange(e.target.value)}
                placeholder="粘贴你的 API Key"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-300 text-sm"
              />
              <p className="text-xs text-gray-300 mt-1">
                填入后使用你自己的额度。留空则共享站点额度。
              </p>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">API 地址</label>
              <input
                type="text"
                value={apiBase}
                onChange={(e) => onApiBaseChange(e.target.value)}
                placeholder="https://api.deepseek.com/v1"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-300 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">模型名称</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => onModelNameChange(e.target.value)}
                placeholder="deepseek-chat"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-300 text-sm font-mono"
              />
            </div>
          </div>
        )}
      </SettingsPanel>
    </div>
  );
}
