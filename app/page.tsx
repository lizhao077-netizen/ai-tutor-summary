"use client";

import { useState, useRef, useEffect } from "react";

interface Version {
  id: number;
  text: string;
  label: string;
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [input, setInput] = useState("");
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(false);
  const [revision, setRevision] = useState("");
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef(false);
  const versionIdRef = useRef(0);

  // 语音输入
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const baseInputRef = useRef("");

  // 设置
  const [showSettings, setShowSettings] = useState(false);
  const [studentNames, setStudentNames] = useState("");
  const [subjectTerms, setSubjectTerms] = useState("");
  const [correcting, setCorrecting] = useState(false);

  useEffect(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (Ctor) setSpeechSupported(true);
    setStudentNames(localStorage.getItem("studentNames") || "");
    setSubjectTerms(localStorage.getItem("subjectTerms") || "");
  }, []);

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

  // AI 修正语音识别文本
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
        },
        body: JSON.stringify({
          text: input.trim(),
          names: studentNames,
          terms: subjectTerms,
        }),
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

  const handlePasswordSubmit = () => {
    setAuthenticated(true);
  };

  const streamFetch = async (body: Record<string, string>, onChunk: (text: string) => void) => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-password": password,
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
        } catch {
          // ignore parse errors
        }
      }
    }

    return text;
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setVersions([]);
    setError("");
    setCopied(null);
    setRevision("");
    abortRef.current = false;

    try {
      const id = ++versionIdRef.current;
      setVersions([{ id, text: "", label: "第 1 版" }]);

      await streamFetch({ input: input.trim() }, (text) => {
        setVersions([{ id, text, label: "第 1 版" }]);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "网络错误，请检查网络后重试");
    }

    setLoading(false);
  };

  const handleRevise = async () => {
    if (!revision.trim() || versions.length === 0) return;
    const latest = versions[0].text;
    if (!latest) return;

    setRevisionLoading(true);
    setError("");
    abortRef.current = false;

    try {
      const id = ++versionIdRef.current;
      const label = `第 ${versions.length + 1} 版`;
      setVersions((prev) => [{ id, text: "", label }, ...prev]);

      await streamFetch(
        { input: input.trim(), previousOutput: latest, revision: revision.trim() },
        (text) => {
          setVersions((prev) => {
            const rest = prev.slice(1);
            return [{ id, text, label }, ...rest];
          });
        },
      );
      setRevision("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "网络错误，请检查网络后重试");
    }

    setRevisionLoading(false);
  };

  const handleCopy = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  // localStorage 持久化设置
  const saveStudentNames = (v: string) => {
    setStudentNames(v);
    localStorage.setItem("studentNames", v);
  };

  const saveSubjectTerms = (v: string) => {
    setSubjectTerms(v);
    localStorage.setItem("subjectTerms", v);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center mb-8">AI 课后总结助手</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handlePasswordSubmit();
            }}
            placeholder="请输入访问密码"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-center"
          />
          {passwordError && (
            <p className="text-red-500 text-sm mt-2 text-center">{passwordError}</p>
          )}
          <button
            onClick={handlePasswordSubmit}
            className="w-full mt-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            进入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">AI 课后总结助手</h1>
          <button
            onClick={() => setShowSettings((v) => !v)}
            className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${showSettings ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-600"}`}
          >
            ⚙ 设置
          </button>
        </div>

        {/* 设置面板 */}
        {showSettings && (
          <div className="mb-6 p-5 border border-gray-200 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                学生姓名（每行一个）
              </label>
              <textarea
                value={studentNames}
                onChange={(e) => saveStudentNames(e.target.value)}
                placeholder={"小明\n小红"}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                学科术语（每行一个）
              </label>
              <textarea
                value={subjectTerms}
                onChange={(e) => saveSubjectTerms(e.target.value)}
                placeholder={"二次函数\n顶点式\n判别式\n抛物线"}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400 text-sm"
              />
            </div>
            <p className="text-xs text-gray-400">
              用于 AI 修正语音识别错误。设置一次，自动保存，下次打开无需重新填写。
            </p>
          </div>
        )}

        <div className="mb-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入今天课堂情况…"
            maxLength={500}
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400 text-base"
          />
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={speechSupported ? (isRecording ? stopRecording : startRecording) : undefined}
                title={speechSupported ? "" : "语音输入需要 Chrome 或 Edge 浏览器"}
                className={`flex items-center gap-1.5 text-xs transition-colors ${speechSupported ? (isRecording ? "text-red-500" : "text-gray-400 hover:text-gray-600") : "text-gray-300 cursor-not-allowed"}`}
              >
                <span className={`inline-block w-2 h-2 rounded-full ${speechSupported ? (isRecording ? "bg-red-500 animate-pulse" : "bg-gray-300") : "bg-gray-200"}`} />
                {speechSupported ? (isRecording ? "录音中，点击停止" : "语音输入") : "语音输入（需 Chrome/Edge）"}
              </button>
              {input.trim() && (
                <button
                  type="button"
                  onClick={handleCorrect}
                  disabled={correcting}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:text-gray-300"
                >
                  <span className={`inline-block w-2 h-2 rounded-full ${correcting ? "bg-yellow-400 animate-pulse" : "bg-gray-300"}`} />
                  {correcting ? "修正中..." : "AI 修正"}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {input.length}/500
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? "正在生成..." : "生成课后总结"}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {versions.map((v, i) => (
          <div key={v.id} className={i === 0 ? "mt-6" : "mt-4"}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${i === 0 ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"}`}>
                {v.label}
              </span>
              {v.text && (
                <button
                  onClick={() => handleCopy(v.text, v.id)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copied === v.id ? "已复制 ✓" : "复制此版本"}
                </button>
              )}
            </div>

            <div className={`p-6 rounded-lg whitespace-pre-wrap text-base leading-relaxed min-h-[80px] ${i === 0 ? "bg-gray-50" : "bg-gray-50/50 text-gray-500 text-sm"}`}>
              {v.text}
              {((i === 0 && loading) || (i === 0 && revisionLoading)) && (
                <span className="inline-block w-1 h-4 bg-gray-900 ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          </div>
        ))}

        {versions.length >= 5 && (
          <div className="mt-6 border-t pt-4">
            <p className="text-center text-sm text-gray-400">
              已达到最多 5 个版本的上限
            </p>
          </div>
        )}

        {versions.length > 0 && versions[0].text && !revisionLoading && versions.length < 5 && (
          <div className="mt-6 border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              修改意见
            </label>
            <textarea
              value={revision}
              onChange={(e) => setRevision(e.target.value)}
              placeholder="例如：语气再亲切一点、不用结构，用一段话的形式、再简短一些…"
              maxLength={200}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400 text-sm"
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {revision.length}/200
            </p>
            <button
              onClick={handleRevise}
              disabled={revisionLoading || !revision.trim()}
              className="w-full mt-3 py-2.5 border border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              {revisionLoading ? "正在修改..." : "提交修改意见"}
            </button>
          </div>
        )}

        {revisionLoading && (
          <div className="mt-6 border-t pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              修改意见
            </label>
            <div className="w-full px-4 py-3 border border-gray-100 rounded-lg bg-gray-50 text-gray-400 text-sm">
              正在生成修改后的版本...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
