"use client";

import React, { useState, useEffect, useCallback } from "react";

interface ActionLog {
  generation_id: number;
  action_type: string;
  metadata: { [key: string]: unknown } | null;
  created_at?: string;
}

interface GenRecord {
  id: number;
  created_at: string;
  input_text: string;
  input_length: number;
  used_voice: boolean;
  output_text: string;
  generation_ms: number;
  copied: boolean;
  iteration_count: number;
  completed: boolean;
  actions: ActionLog[];
}

interface RecordsData {
  records: GenRecord[];
  total: number;
  page: number;
  limit: number;
}

const ACTION_LABELS: { [key: string]: string } = {
  generate: "开始生成",
  generate_complete: "生成完成",
  copy: "复制",
  add_encourage: "加入鼓励",
  add_advice: "补充学习建议",
  shorter: "精简为短信版",
  expand_analysis: "展开学科分析",
  warmer_tone: "语气更亲切",
  voice_start: "语音开始",
  voice_end: "语音结束",
  ai_correct: "术语一键替换",
  more_friendly: "更亲切(旧)",
  more_professional: "更专业(旧)",
  more_encourage: "多鼓励(旧)",
  more_human: "更像真人(旧)",
};

export default function AdminRecords() {
  const [data, setData] = useState<RecordsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const limit = 20;

  const fetchRecords = useCallback(async (p: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/records?page=${p}&limit=${limit}`);
      if (!res.ok) throw new Error("获取数据失败");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "未知错误");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords(page);
  }, [page, fetchRecords]);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const handleDownloadCSV = () => {
    if (!data?.records) return;
    const header = "ID,时间,输入内容,输入字数,语音,输出内容,生成耗时ms,已复制,修改次数,已完成,操作记录";
    const rows = data.records.map((r) => {
      const input = (r.input_text || "").replace(/"/g, '""');
      const output = (r.output_text || "").replace(/"/g, '""');
      const actions = r.actions.map((a) => {
        const label = ACTION_LABELS[a.action_type] || a.action_type;
        const meta = a.metadata ? ` (${JSON.stringify(a.metadata).replace(/"/g, "''")})` : "";
        return `${label}${meta}`;
      }).join("; ");
      return `"${r.id}","${r.created_at}","${input}","${r.input_length}","${r.used_voice ? "是" : "否"}","${output}","${r.generation_ms}","${r.copied ? "是" : "否"}","${r.iteration_count}","${r.completed ? "是" : "否"}","${actions}"`;
    });
    const csv = "﻿" + header + "\n" + rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `records_page${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRevisionTexts = (actions: ActionLog[]) => {
    return actions
      .filter((a) => a.action_type && !["generate", "generate_complete", "copy", "voice_start", "voice_end", "ai_correct"].includes(a.action_type))
      .map((a) => {
        const label = ACTION_LABELS[a.action_type] || a.action_type;
        const customText = a.metadata && (a.metadata as { [key: string]: unknown }).revisionText;
        return customText && typeof customText === "string" ? `${label}: ${customText}` : label;
      });
  };

  return (
    <div className="space-y-4">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          共 {data?.total ?? "-"} 条记录
        </p>
        <button
          onClick={handleDownloadCSV}
          disabled={!data?.records?.length}
          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          下载当前页 CSV
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-500 rounded-xl text-sm">{error}</div>
      )}

      {/* 表格 */}
      {loading ? (
        <div className="text-center text-gray-300 py-12">加载中...</div>
      ) : data && data.records.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-2 text-gray-400 font-normal text-xs">时间</th>
                  <th className="text-left py-2 pr-2 text-gray-400 font-normal text-xs">输入</th>
                  <th className="text-left py-2 pr-2 text-gray-400 font-normal text-xs">输出</th>
                  <th className="text-left py-2 pr-2 text-gray-400 font-normal text-xs whitespace-nowrap">修改</th>
                  <th className="text-right py-2 text-gray-400 font-normal text-xs">操作</th>
                </tr>
              </thead>
              <tbody>
                {data.records.map((r) => {
                  const revisions = getRevisionTexts(r.actions);
                  const isOpen = expanded.has(r.id);
                  return (
                    <React.Fragment key={r.id}>
                      <tr
                        className="border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer"
                        onClick={() => toggleExpand(r.id)}
                      >
                        <td className="py-2 pr-2 text-gray-400 text-xs whitespace-nowrap align-top">
                          {new Date(r.created_at).toLocaleString("zh-CN", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-2 pr-2 max-w-[140px] align-top">
                          <span className="line-clamp-2 text-gray-700">
                            {r.input_text || <span className="text-gray-300">-</span>}
                          </span>
                        </td>
                        <td className="py-2 pr-2 max-w-[160px] align-top">
                          <span className="line-clamp-2 text-gray-700">
                            {r.output_text || <span className="text-gray-300">-</span>}
                          </span>
                        </td>
                        <td className="py-2 pr-2 align-top">
                          {revisions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {revisions.map((rev, i) => (
                                <span
                                  key={i}
                                  className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-500 max-w-[120px] truncate"
                                >
                                  {rev}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="py-2 text-right align-top">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.copied && (
                              <span className="px-1.5 py-0.5 bg-green-50 text-green-500 rounded text-xs">已复制</span>
                            )}
                            {r.used_voice && (
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-400 rounded text-xs">语音</span>
                            )}
                            <span className="text-gray-300 text-xs">{isOpen ? "▲" : "▼"}</span>
                          </div>
                        </td>
                      </tr>
                      {/* 展开行 */}
                      {isOpen && (
                        <tr key={`${r.id}-exp`}>
                          <td colSpan={5} className="py-3 px-4 bg-gray-50 rounded-lg">
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-gray-400 mb-1">原始输入</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.input_text || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-1">生成输出</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.output_text || "-"}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-1">操作流水</p>
                                <div className="space-y-1">
                                  {r.actions.map((a, i) => {
                                    const label = ACTION_LABELS[a.action_type] || a.action_type;
                                    const meta = a.metadata ? JSON.stringify(a.metadata) : null;
                                    return (
                                      <div key={i} className="text-xs text-gray-500 flex gap-2">
                                        <span className="text-gray-300 w-4 flex-shrink-0">{i + 1}.</span>
                                        <span>{label}</span>
                                        {meta && <span className="text-gray-300 truncate">{meta}</span>}
                                      </div>
                                    );
                                  })}
                                  {r.actions.length === 0 && (
                                    <p className="text-xs text-gray-300">无</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-300 py-12 text-sm">暂无记录</div>
      )}
    </div>
  );
}
