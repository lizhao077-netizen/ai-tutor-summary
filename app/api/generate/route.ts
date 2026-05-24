import OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { checkIpRateLimit, checkDailyQuota } from "@/lib/ratelimit";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

const MAX_INPUT_LENGTH = 500;

export async function POST(req: Request) {
  // 1. 密码门
  const password = req.headers.get("x-access-password");
  if (password !== process.env.ACCESS_PASSWORD) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. 解析输入
  let input: string;
  try {
    const body = await req.json();
    input = body.input?.trim() ?? "";
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  // 3. 输入长度校验
  if (!input || input.length > MAX_INPUT_LENGTH) {
    return new Response("输入内容为空或超过 500 字限制", { status: 400 });
  }

  // 4. IP 频率限制
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipCheck = checkIpRateLimit(ip);
  if (!ipCheck.allowed) {
    return new Response(ipCheck.message, { status: 429 });
  }

  // 5. 日配额检查
  const quotaCheck = checkDailyQuota();
  if (!quotaCheck.allowed) {
    return new Response(quotaCheck.message, { status: 429 });
  }

  // 6. 调用 DeepSeek，流式输出
  try {
    const stream = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: input },
      ],
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    });

    const encoder = new TextEncoder();
    return new Response(
      new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      },
    );
  } catch {
    return new Response("AI 服务暂时不可用，请稍后重试", { status: 500 });
  }
}
