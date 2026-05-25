import { checkIpRateLimit, checkDailyQuota } from "@/lib/ratelimit";
import { createClient, DEFAULT_MODEL } from "@/lib/openai";

export async function POST(req: Request) {
  const userKey = req.headers.get("x-user-api-key");
  const apiBase = req.headers.get("x-api-base");
  const model = req.headers.get("x-model") || DEFAULT_MODEL;

  let text: string;
  let names: string;
  let terms: string;
  try {
    const body = await req.json();
    text = body.text?.trim() ?? "";
    names = body.names?.trim() ?? "";
    terms = body.terms?.trim() ?? "";
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!text) {
    return new Response("文本为空", { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipCheck = checkIpRateLimit(ip);
  if (!ipCheck.allowed) {
    return new Response(ipCheck.message, { status: 429 });
  }

  const quotaCheck = checkDailyQuota();
  if (!quotaCheck.allowed) {
    return new Response(quotaCheck.message, { status: 429 });
  }

  const systemPrompt = "你是一个修正语音识别错误的助手。只输出修正后的文本，禁止添加任何解释、前缀、后缀。";

  let userPrompt = "修正以下语音识别文本中的错误：";
  if (names) {
    userPrompt += `\n\n正确学生姓名（只能是以下之一）：${names}`;
  }
  if (terms) {
    userPrompt += `\n\n正确学科术语：${terms}`;
  }
  userPrompt += `\n\n根据发音相似性修正，但不要改变原意和原有结构。只输出修正后的文本：\n\n${text}`;

  try {
    const completion = await createClient(userKey, apiBase).chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });

    const corrected = completion.choices[0]?.message?.content ?? text;
    return Response.json({ text: corrected });
  } catch {
    return new Response("AI 服务暂时不可用，请稍后重试", { status: 500 });
  }
}
