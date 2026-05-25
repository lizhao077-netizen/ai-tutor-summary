"use client";

import { useState, useEffect } from "react";
import AdminStats from "../components/AdminStats";
import AdminRecords from "../components/AdminRecords";

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

type Tab = "overview" | "records";

export default function AdminPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("获取数据失败");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    const timer = setInterval(() => fetchStats(), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">数据后台</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {tab === "overview" ? "今日数据概览（30 秒自动刷新）" : "详细生成记录"}
            </p>
          </div>
          {tab === "overview" && (
            <button
              onClick={() => fetchStats()}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {loading ? "刷新中..." : "刷新"}
            </button>
          )}
        </div>

        {/* 标签页切换 */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setTab("overview")}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              tab === "overview"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            数据概览
          </button>
          <button
            onClick={() => setTab("records")}
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${
              tab === "records"
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            详细记录
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-xl text-sm">{error}</div>
        )}

        {tab === "overview" ? (
          data ? (
            <AdminStats data={data} />
          ) : loading ? (
            <div className="text-center text-gray-300 py-12">加载中...</div>
          ) : null
        ) : (
          <AdminRecords />
        )}
      </div>
    </div>
  );
}
