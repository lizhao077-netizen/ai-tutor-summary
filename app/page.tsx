"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(false);

  const handlePasswordSubmit = () => {
    setAuthenticated(true);
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    setError("");
    setCopied(false);
    abortRef.current = false;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-password": password,
        },
        body: JSON.stringify({ input: input.trim() }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "请求失败");
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setError("浏览器不支持流式读取");
        setLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

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
            setOutput((prev) => prev + parsed.content);
          } catch {
            // ignore parse errors
          }
        }
      }
    } catch {
      setError("网络错误，请检查网络后重试");
    }

    setLoading(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
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
        <h1 className="text-2xl font-bold text-center mb-8">AI 课后总结助手</h1>

        <div className="mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入今天课堂情况…"
            maxLength={500}
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400 text-base"
          />
          <p className="text-right text-xs text-gray-400 mt-1">
            {input.length}/500
          </p>
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

        {(output || loading) && (
          <div className="mt-6">
            <div className="p-6 bg-gray-50 rounded-lg whitespace-pre-wrap text-base leading-relaxed min-h-[120px]">
              {output}
              {loading && (
                <span className="inline-block w-1 h-4 bg-gray-900 ml-0.5 animate-pulse align-middle" />
              )}
            </div>

            {output && (
              <button
                onClick={handleCopy}
                className="mt-4 w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {copied ? "已复制 ✓" : "复制到剪贴板"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
