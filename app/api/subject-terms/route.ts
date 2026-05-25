import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("subject_terms")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return NextResponse.json({ subjects: data || [] });
  } catch (e) {
    console.error("/api/subject-terms GET error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, subject, terms } = body as { id?: number; subject?: string; terms?: string };
    if (!subject?.trim()) {
      return NextResponse.json({ error: "subject is required" }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();

    if (id) {
      // 按 ID 更新（含重命名）
      const { error } = await supabase
        .from("subject_terms")
        .update({ subject: subject.trim(), terms: (terms || "").trim(), updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    } else {
      // 按名称 upsert
      const { data: existing } = await supabase
        .from("subject_terms")
        .select("id")
        .eq("subject", subject.trim())
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("subject_terms")
          .update({ terms: (terms || "").trim(), updated_at: new Date().toISOString() })
          .eq("id", (existing as { id: number }).id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("subject_terms")
          .insert({ subject: subject.trim(), terms: (terms || "").trim() });
        if (error) throw error;
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("/api/subject-terms POST error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("subject_terms").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("/api/subject-terms DELETE error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
