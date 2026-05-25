"use client";

let _generationId = 0;
let _generationStart = 0;

export function getGenerationId() {
  return _generationId;
}

async function post(actionType: string, meta?: Record<string, unknown>) {
  const body: Record<string, unknown> = { actionType };
  if (_generationId) body.generationId = _generationId;
  if (meta) body.metadata = meta;

  try {
    const res = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** 生成开始时调用，返回服务端 generationId */
export async function trackGenerate(inputText: string, inputLength: number, usedVoice: boolean): Promise<number> {
  _generationStart = Date.now();
  const result = await post("generate", { inputText, inputLength, usedVoice });
  if (result && result.id) {
    _generationId = result.id;
    return result.id;
  }
  return 0;
}

/** 生成完成后调用 */
export async function trackGenerateComplete(outputText: string, iterationCount: number) {
  const ms = Date.now() - _generationStart;
  await post("generate_complete", { generationId: _generationId, outputText, generationMs: ms, iterationCount });
}

/** 复制 */
export function trackCopy() {
  const body: Record<string, unknown> = { actionType: "copy" };
  if (_generationId) body.generationId = _generationId;
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

/** 快捷修改 */
export function trackQuickAction(label: string, revisionText?: string) {
  const map: Record<string, string> = {
    "加入鼓励": "add_encourage",
    "补充学习建议": "add_advice",
    "精简为短信版": "shorter",
    "展开学科分析": "expand_analysis",
    "语气更亲切": "warmer_tone",
  };
  const actionType = map[label] || label;

  const body: Record<string, unknown> = { actionType };
  if (_generationId) body.generationId = _generationId;
  if (revisionText) body.metadata = { revisionText };
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

/** 语音开始 */
export function trackVoiceStart() {
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actionType: "voice_start" }),
  }).catch(() => {});
}

/** 语音结束 */
export function trackVoiceEnd(durationMs?: number) {
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actionType: "voice_end",
      metadata: durationMs ? { durationMs } : undefined,
    }),
  }).catch(() => {});
}

/** 术语一键替换 */
export function trackAICorrect(inputLength: number) {
  fetch("/api/log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      actionType: "ai_correct",
      metadata: { inputLength },
    }),
  }).catch(() => {});
}
