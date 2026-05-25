import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
    const offset = (page - 1) * limit;

    const supabase = getSupabaseAdmin();

    // 查 generation_logs
    const { data: logs, error, count } = await supabase
      .from("generation_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // 查每条记录的 action_logs
    const ids = (logs || []).map((r: { id: number }) => r.id);
    let actions: { generation_id: number; action_type: string; metadata: unknown }[] = [];
    if (ids.length > 0) {
      const { data: rawActions } = await supabase
        .from("action_logs")
        .select("generation_id, action_type, metadata")
        .in("generation_id", ids)
        .order("created_at", { ascending: true });
      actions = (rawActions || []) as typeof actions;
    }

    // 将 action_logs 按 generation_id 分组
    const actionsByGen: Record<number, typeof actions> = {};
    for (const a of actions) {
      if (!actionsByGen[a.generation_id]) actionsByGen[a.generation_id] = [];
      actionsByGen[a.generation_id].push(a);
    }

    const records = (logs || []).map((log: Record<string, unknown>) => ({
      ...log,
      actions: actionsByGen[log.id as number] || [],
    }));

    return NextResponse.json({
      records,
      total: count || 0,
      page,
      limit,
    });
  } catch (e) {
    console.error("/api/admin/records error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
