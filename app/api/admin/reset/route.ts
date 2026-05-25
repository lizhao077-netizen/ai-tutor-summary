import { resetDailyQuota } from "@/lib/ratelimit";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  resetDailyQuota();
  return Response.json({ message: "配额已重置" });
}

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("action_logs").delete().neq("id", 0);
    await supabase.from("generation_logs").delete().neq("id", 0);
    resetDailyQuota();
    return Response.json({ message: "数据库已清空，配额已重置" });
  } catch (e) {
    console.error("/api/admin/reset POST error:", e);
    return Response.json({ error: "清空失败" }, { status: 500 });
  }
}
