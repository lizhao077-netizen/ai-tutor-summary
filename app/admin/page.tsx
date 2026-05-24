"use client";

import { useState, useEffect } from "react";
import AdminStats from "../components/AdminStats";

interface StatsData {
  genCount: number;
  copyCount: number;
  directCopyCount: number;
  copyRate: number;
  directCopyRate: number;
  avgIterations: number;
  avgGenMs: number;
  actionCounts: Record<string, number>;
  voiceCount: number;
  correctCount: number;
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStats = async (pw: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "x-access-password": pw },
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("密码错误");
        throw new Error("获取数据失败");
      }
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    }
    setLoading(false);
  };

  const handleLogin = () => {
    if (!password.trim()) return;
    setAuthenticated(true);
    fetchStats(password);
  };

  useEffect(() => {
    if (authenticated && password) {
      const timer = setInterval(() => fetchStats(password), 30000);
      return () => clearInterval(timer);
    }
  }, [authenticated, password]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-bold mb-2">数据后台</h1>
          <p className="text-sm text-gray-400 mb-8">AI 课后总结助手</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
            placeholder="请输入管理密码"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-gray-300 text-base"
          />
          <button
            onClick={handleLogin}
            className="w-full mt-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium text-base"
          >
            进入
          </button>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">数据后台</h1>
            <p className="text-xs text-gray-400 mt-0.5">今日数据概览（30 秒自动刷新）</p>
          </div>
          <button
            onClick={() => fetchStats(password)}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {loading ? "刷新中..." : "刷新"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl text-sm">{error}</div>
        )}

        {data ? (
          <AdminStats data={data} />
        ) : loading ? (
          <div className="text-center text-gray-300 py-12">加载中...</div>
        ) : null}
      </div>
    </div>
  );
}
