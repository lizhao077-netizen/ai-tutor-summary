"use client";

import { useState, useRef, useEffect } from "react";
import PasswordGate from "./components/PasswordGate";
import Header from "./components/Header";
import InputArea from "./components/InputArea";
import VoiceAIButtons from "./components/VoiceAIButtons";
import SmartEnhanceBadge from "./components/SmartEnhanceBadge";
import GenerateButton from "./components/GenerateButton";
import ResultView from "./components/ResultView";
import QuickActions from "./components/QuickActions";
import SettingsPage from "./components/SettingsPage";
import Toast from "./components/Toast";

interface Version {
  id: number;
  text: string;
  label: string;
}

type View = "home" | "result" | "settings";

export default function Home() {
  // 认证
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  // 视图
  const [currentView, setCurrentView] = useState<View>("home");

  // 输入
  const [input, setInput] = useState("");
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(false);
  const versionIdRef = useRef(0);

  // 语音
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const baseInputRef = useRef("");

  // 修正
  const [correcting, setCorrecting] = useState(false);

  // 复制
  const [copied, setCopied] = useState(false);

  // Toast
  const [toast, setToast] = useState("");

  // 设置
  const [studentNames, setStudentNames] = useState("");
  const [subjectTerms, setSubjectTerms] = useState("");
  const [userApiKey, setUserApiKey] = useState("");
  const [apiBase, setApiBase] = useState("");
  const [modelName, setModelName] = useState("");

  // 初始化
  useEffect(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Ctor) setSpeechSupported(true);
    setStudentNames(localStorage.getItem("studentNames") || "");
    setSubjectTerms(localStorage.getItem("subjectTerms") || "");
    setUserApiKey(localStorage.getItem("userApiKey") || "");
    setApiBase(localStorage.getItem("apiBase") || "");
    setModelName(localStorage.getItem("modelName") || "");
  }, []);

  // localStorage 持久化
  const saveStudentNames = (v: string) => { setStudentNames(v); localStorage.setItem("studentNames", v); };
  const saveSubjectTerms = (v: string) => { setSubjectTerms(v); localStorage.setItem("subjectTerms", v); };
  const saveUserApiKey = (v: string) => { setUserApiKey(v); localStorage.setItem("userApiKey", v); };
  const saveApiBase = (v: string) => { setApiBase(v); localStorage.setItem("apiBase", v); };
  const saveModelName = (v: string) => { setModelName(v); localStorage.setItem("modelName", v); };

  // 密码提交
  const handlePasswordSubmit = () => {
    setAuthenticated(true);
  };

  // 语音
  const startRecording = () => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "zh-CN";
    recognition.interimResults = true;
    recognition.continuous = false;
    baseInputRef.current = input;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(baseInputRef.current + transcript);
    };
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  // AI 修正
  const handleCorrect = async () => {
    if (!input.trim()) return;
    setCorrecting(true);
    setError("");
    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-password": password,
          ...(userApiKey ? { "x-user-api-key": userApiKey } : {}),
          ...(apiBase ? { "x-api-base": apiBase } : {}),
          ...(modelName ? { "x-model": modelName } : {}),
        },
        body: JSON.stringify({ text: input.trim(), names: studentNames, terms: subjectTerms }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "修正失败");
      }
      const data = await res.json();
      setInput(data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "修正失败，请重试");
    }
    setCorrecting(false);
  };

  // 流式请求
  const streamFetch = async (body: Record<string, string>, onChunk: (text: string) => void) => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-password": password,
        ...(userApiKey ? { "x-user-api-key": userApiKey } : {}),
        ...(apiBase ? { "x-api-base": apiBase } : {}),
        ...(modelName ? { "x-model": modelName } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "请求失败");
    }
    const reader = res.body?.getReader();
    if (!reader) throw new Error("浏览器不支持流式读取");
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done || abortRef.current) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data: ")) continue;
        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          text += parsed.content;
          onChunk(text);
        } catch { /* ignore */ }
      }
    }
    return text;
  };

  // 生成
  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setVersions([]);
    setError("");
    setCopied(false);
    abortRef.current = false;
    try {
      const id = ++versionIdRef.current;
      setVersions([{ id, text: "", label: "第 1 版" }]);
      setCurrentView("result");
      await streamFetch({ input: input.trim() }, (text) => {
        setVersions([{ id, text, label: "第 1 版" }]);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "网络错误，请检查网络后重试");
      setCurrentView("home");
    }
    setLoading(false);
  };

  // 快捷操作（重新生成）
  const handleQuickAction = async (action: string) => {
    if (versions.length === 0) return;
    const latest = versions[0].text;
    if (!latest) return;
    setLoading(true);
    setError("");
    abortRef.current = false;
    try {
      const id = ++versionIdRef.current;
      const label = `第 ${versions.length + 1} 版`;
      setVersions((prev) => [{ id, text: "", label }, ...prev]);
      await streamFetch(
        { input: input.trim(), previousOutput: latest, revision: `请${action}` },
        (text) => {
          setVersions((prev) => {
            const rest = prev.slice(1);
            return [{ id, text, label }, ...rest];
          });
        },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "网络错误，请检查网络后重试");
    }
    setLoading(false);
  };

  // 复制
  const handleCopy = async () => {
    const text = versions[0]?.text;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setToast("已复制，可直接发送家长");
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  };

  // 新建（返回首页并保留输入）
  const handleNew = () => {
    setVersions([]);
    setCurrentView("home");
    setError("");
  };

  // ==================== 密码门 ====================
  if (!authenticated) {
    return (
      <PasswordGate
        password={password}
        onPasswordChange={(v) => { setPassword(v); }}
        onSubmit={handlePasswordSubmit}
      />
    );
  }

  // ==================== 设置页 ====================
  if (currentView === "settings") {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto">
          <SettingsPage
            studentNames={studentNames}
            subjectTerms={subjectTerms}
            onStudentNamesChange={saveStudentNames}
            onSubjectTermsChange={saveSubjectTerms}
            userApiKey={userApiKey}
            apiBase={apiBase}
            modelName={modelName}
            onUserApiKeyChange={saveUserApiKey}
            onApiBaseChange={saveApiBase}
            onModelNameChange={saveModelName}
            onBack={() => setCurrentView("home")}
          />
        </div>
        <Toast message={toast} visible={!!toast} onClose={() => setToast("")} />
      </div>
    );
  }

  // ==================== 首页 / 结果页 ====================
  const latestText = versions[0]?.text || "";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto">
        {/* 顶部 */}
        <Header
          onSettingsClick={() => setCurrentView("settings")}
          showBack={currentView === "result"}
          onBack={handleNew}
        />

        {currentView === "home" ? (
          <>
            {/* 输入区 */}
            <InputArea value={input} onChange={setInput} maxLength={500} />

            {/* 语音 + AI 修正按钮 */}
            <VoiceAIButtons
              isRecording={isRecording}
              speechSupported={speechSupported}
              correcting={correcting}
              hasInput={!!input.trim()}
              onVoiceStart={startRecording}
              onVoiceStop={stopRecording}
              onCorrect={handleCorrect}
            />

            {/* 术语增强 */}
            <SmartEnhanceBadge
              studentNames={studentNames}
              subjectTerms={subjectTerms}
              onManageClick={() => setCurrentView("settings")}
            />

            {/* 错误提示 */}
            {error && (
              <div className="px-4 mt-4">
                <div className="p-3 bg-red-50 text-red-500 rounded-xl text-sm">{error}</div>
              </div>
            )}

            {/* 底部生成按钮 */}
            <GenerateButton
              loading={loading}
              disabled={loading || !input.trim()}
              onClick={handleGenerate}
            />

            {/* 底部占位 */}
            <div className="h-24" />
          </>
        ) : (
          <>
            {/* 结果页 */}
            {error && (
              <div className="px-4 mb-3">
                <div className="p-3 bg-red-50 text-red-500 rounded-xl text-sm">{error}</div>
              </div>
            )}

            <ResultView
              text={latestText}
              loading={loading}
              copied={copied}
              onCopy={handleCopy}
            />

            {/* 快捷修改 */}
            {latestText && !loading && versions.length < 5 && (
              <QuickActions onAction={handleQuickAction} loading={loading} />
            )}

            {versions.length >= 5 && (
              <div className="px-4 pb-24">
                <p className="text-center text-sm text-gray-300">已达到最多 5 个版本的上限</p>
              </div>
            )}

            {/* 底部占位 */}
            <div className="h-8" />
          </>
        )}
      </div>

      {/* Toast */}
      <Toast message={toast} visible={!!toast} onClose={() => setToast("")} />
    </div>
  );
}
