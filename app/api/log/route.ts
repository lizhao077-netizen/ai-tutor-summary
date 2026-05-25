import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { generationId, actionType, metadata } = body as {
      generationId?: number;
      actionType: string;
      metadata?: Record<string, unknown>;
    };

    if (!actionType) {
      return NextResponse.json({ error: "actionType is required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    let gid = generationId;

    // 首次生成：创建 generation_log
    if (actionType === "generate" && metadata) {
      const { data, error } = await supabase
        .from("generation_logs")
        .insert({
          input_length: (metadata.inputLength as number) || 0,
          used_voice: (metadata.usedVoice as boolean) || false,
        } as never)
        .select("id")
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
      } else if (data) {
        gid = (data as { id: number }).id;
      }
    }

    // 生成完成：更新 generation_log
    if (actionType === "generate_complete" && metadata) {
      const targetId = (metadata.generationId as number) || gid;
      if (targetId) {
        await supabase
          .from("generation_logs")
          .update({
            output_text: (metadata.outputText as string) || "",
            generation_ms: (metadata.generationMs as number) || 0,
            iteration_count: (metadata.iterationCount as number) || 0,
            completed: true,
          } as never)
          .eq("id", targetId);
      }
    }

    // 复制：更新 generation_log
    if (actionType === "copy" && gid) {
      await supabase
        .from("generation_logs")
        .update({ copied: true } as never)
        .eq("id", gid);
    }

    // 记录行为日志
    if (gid) {
      await supabase.from("action_logs").insert({
        generation_id: gid,
        action_type: actionType,
      } as never);
    } else {
      // 无 generationId 的行为（如 voice_start, ai_correct）
      await supabase.from("action_logs").insert({
        action_type: actionType,
      } as never);
    }

    return NextResponse.json({ id: gid, ok: true });
  } catch (e) {
    console.error("/api/log error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
