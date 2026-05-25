import OpenAI from "openai";
import { SYSTEM_PROMPT, REVISION_PROMPT } from "@/lib/prompt";
import { checkIpRateLimit, checkDailyQuota } from "@/lib/ratelimit";
import { createClient, DEFAULT_MODEL } from "@/lib/openai";

const MAX_LENGTH = 500;

export async function POST(req: Request) {
  const userKey = req.headers.get("x-user-api-key");
  const apiBase = req.headers.get("x-api-base");
  const model = req.headers.get("x-model") || DEFAULT_MODEL;

  let input: string;
  let revision: string | undefined;
  let previousOutput: string | undefined;
  let homework: string | undefined;
  let nextClass: string | undefined;
  try {
    const body = await req.json();
    input = body.input?.trim() ?? "";
    revision = body.revision?.trim();
    previousOutput = body.previousOutput?.trim();
    homework = body.homework?.trim();
    nextClass = body.nextClass?.trim();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!input || input.length > MAX_LENGTH) {
    return new Response("输入内容为空或超过 500 字限制", { status: 400 });
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

  let messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];

  if (revision && previousOutput) {
    messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `根据以下课堂情况生成了课后反馈：\n${input}`,
      },
      {
        role: "assistant",
        content: previousOutput,
      },
      {
        role: "user",
        content: `${REVISION_PROMPT}\n${revision}`,
      },
    ];
  } else {
    let userContent = input;
    if (homework) {
      userContent += `\n\n课后作业：${homework}`;
    }
    if (nextClass) {
      userContent += `\n\n下节课内容：${nextClass}`;
    }
    messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userContent },
    ];
  }

  try {
    const stream = await createClient(userKey, apiBase).chat.completions.create({
      model,
      messages,
      max_tokens: 800,
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
