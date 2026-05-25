import { createClient, DEFAULT_MODEL } from "@/lib/openai";

const SUBJECT_OPTIONS = "数学、物理、化学、英语、语文、历史、地理、生物、政治";

export async function POST(req: Request) {
  const userKey = req.headers.get("x-user-api-key");
  const apiBase = req.headers.get("x-api-base");
  const model = req.headers.get("x-model") || DEFAULT_MODEL;

  let text: string;
  try {
    const body = await req.json();
    text = body.text?.trim() ?? "";
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!text || text.length < 2) {
    return Response.json({ subject: "" });
  }

  const systemPrompt = `你是一个学科分类助手。根据用户输入的教学内容，判断属于以下哪个学科：${SUBJECT_OPTIONS}。只输出学科名称，不要添加任何解释。如果无法判断，输出"未知"。`;

  try {
    const completion = await createClient(userKey, apiBase).chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text.slice(0, 200) },
      ],
      max_tokens: 10,
      temperature: 0.1,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const subject = raw.trim();
    // 验证是否在合法学科列表中
    const all = SUBJECT_OPTIONS.split("、");
    if (all.includes(subject)) {
      return Response.json({ subject });
    }
    return Response.json({ subject: "" });
  } catch {
    return Response.json({ subject: "" });
  }
}
