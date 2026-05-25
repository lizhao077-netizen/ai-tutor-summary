"use client";

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

const ACTION_LABELS: Record<string, string> = {
  more_friendly: "更亲切一点",
  more_professional: "更专业一点",
  shorter: "简短一些",
  more_encourage: "多鼓励一些",
  more_human: "更像真人",
};

export default function AdminStats({ data }: { data: StatsData }) {
  return (
    <div className="space-y-4">
      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="生成次数" value={String(data.genCount)} />
        <StatCard
          label="复制率"
          value={`${data.copyRate}%`}
          sub={`${data.copyCount} 次复制`}
          highlight={data.copyRate >= 60}
        />
        <StatCard
          label="首次直复制率"
          value={`${data.directCopyRate}%`}
          sub={`${data.directCopyCount} 次`}
          highlight={data.directCopyRate >= 50}
        />
        <StatCard
          label="平均修改次数"
          value={String(data.avgIterations)}
          sub={data.avgIterations <= 1 ? "优秀" : "需优化"}
        />
      </div>

      {/* 次要指标 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="平均生成耗时" value={`${(data.avgGenMs / 1000).toFixed(1)}s`} small />
        <StatCard label="语音使用" value={`${data.voiceCount} 次`} small />
        <StatCard label="术语一键替换使用" value={`${data.correctCount} 次`} small />
      </div>

      {/* 快捷修改排行 */}
      <div className="bg-gray-50 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-3">快捷修改使用排行</h3>
        {Object.entries(data.actionCounts)
          .sort(([, a], [, b]) => b - a)
          .map(([key, count]) => (
            <div key={key} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-600">
                {ACTION_LABELS[key] || key}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-400 rounded-full transition-all"
                    style={{
                      width: `${
                        Math.max(...Object.values(data.actionCounts)) > 0
                          ? (count / Math.max(...Object.values(data.actionCounts))) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
              </div>
            </div>
          ))}
        {Object.values(data.actionCounts).every((v) => v === 0) && (
          <p className="text-sm text-gray-300">暂无数据</p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  highlight,
  small,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  small?: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className={`${small ? "text-xs" : "text-sm"} text-gray-400 mb-1`}>{label}</p>
      <p
        className={`${small ? "text-lg" : "text-2xl"} font-bold ${
          highlight ? "text-green-600" : "text-gray-800"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}
