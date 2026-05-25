import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // 今日生成次数
    const { count: genCount } = await supabase
      .from("generation_logs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayISO);

    // 今日复制次数
    const { count: copyCount } = await supabase
      .from("generation_logs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayISO)
      .eq("copied", true);

    // 首次直复制（iteration_count = 0 且 copied = true）
    const { count: directCopyCount } = await supabase
      .from("generation_logs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayISO)
      .eq("copied", true)
      .eq("iteration_count", 0);

    // 平均迭代次数
    const { data: iterData } = await supabase
      .from("generation_logs")
      .select("iteration_count")
      .gte("created_at", todayISO);

    const avgIterations =
      iterData && iterData.length > 0
        ? (iterData as { iteration_count: number }[]).reduce((sum, r) => sum + (r.iteration_count || 0), 0) / iterData.length
        : 0;

    // 快捷修改按钮统计（今日）
    const quickActions = [
      "more_friendly",
      "more_professional",
      "shorter",
      "more_encourage",
      "more_human",
    ];
    const actionCounts: Record<string, number> = {};
    for (const action of quickActions) {
      const { count } = await supabase
        .from("action_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayISO)
        .eq("action_type", action);
      actionCounts[action] = count || 0;
    }

    // 语音使用次数（今日）
    const { count: voiceCount } = await supabase
      .from("action_logs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayISO)
      .eq("action_type", "voice_start");

    // 术语一键替换使用次数（今日）
    const { count: correctCount } = await supabase
      .from("action_logs")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayISO)
      .eq("action_type", "ai_correct");

    // 平均生成耗时
    const { data: rawGenData } = await supabase
      .from("generation_logs")
      .select("generation_ms")
      .gte("created_at", todayISO)
      .not("generation_ms", "is", null);
    const genData = rawGenData as { generation_ms: number }[] | null;

    const avgGenMs =
      genData && genData.length > 0
        ? Math.round(genData.reduce((sum, r) => sum + (r.generation_ms || 0), 0) / genData.length)
        : 0;

    return NextResponse.json({
      genCount: genCount || 0,
      copyCount: copyCount || 0,
      directCopyCount: directCopyCount || 0,
      copyRate: genCount ? Math.round(((copyCount || 0) / genCount) * 100) : 0,
      directCopyRate: genCount ? Math.round(((directCopyCount || 0) / genCount) * 100) : 0,
      avgIterations: Math.round(avgIterations * 10) / 10,
      avgGenMs,
      actionCounts,
      voiceCount: voiceCount || 0,
      correctCount: correctCount || 0,
    });
  } catch (e) {
    console.error("/api/admin/stats error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
