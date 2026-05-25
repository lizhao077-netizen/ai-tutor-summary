"use client";

let _password = "";
let _generationId = 0;
let _generationStart = 0;

export function setPassword(pw: string) {
  _password = pw;
}

export function getGenerationId() {
  return _generationId;
}

async function post(actionType: string, meta?: Record<string, unknown>) {
  if (!_password) return null;
  const body: Record<string, unknown> = { actionType };
  if (_generationId) body.generationId = _generationId;
  if (meta) body.metadata = meta;

  try {
    const res = await fetch("/api/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-password": _password,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** 生成开始时调用，返回服务端 generationId */
export async function trackGenerate(inputLength: number, usedVoice: boolean): Promise<number> {
  _generationStart = Date.now();
  const result = await post("generate", { inputLength, usedVoice });
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
  // fire-and-forget
  if (!_password) return;
  const body: Record<string, unknown> = { actionType: "copy" };
  if (_generationId) body.generationId = _generationId;
  fetch("/api/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-password": _password,
    },
    body: JSON.stringify(body),
  }).catch(() => {});
}

/** 快捷修改 */
export function trackQuickAction(label: string) {
  const map: Record<string, string> = {
    "更亲切一点": "more_friendly",
    "更专业一点": "more_professional",
    "简短一些": "shorter",
    "多鼓励一些": "more_encourage",
    "更像真人": "more_human",
  };
  const actionType = map[label] || label;

  // fire-and-forget
  if (!_password) return;
  const body: Record<string, unknown> = { actionType };
  if (_generationId) body.generationId = _generationId;
  fetch("/api/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-password": _password,
    },
    body: JSON.stringify(body),
  }).catch(() => {});
}

/** 语音开始 */
export function trackVoiceStart() {
  if (!_password) return;
  fetch("/api/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-password": _password,
    },
    body: JSON.stringify({ actionType: "voice_start" }),
  }).catch(() => {});
}

/** 语音结束 */
export function trackVoiceEnd(durationMs?: number) {
  if (!_password) return;
  fetch("/api/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-password": _password,
    },
    body: JSON.stringify({
      actionType: "voice_end",
      metadata: durationMs ? { durationMs } : undefined,
    }),
  }).catch(() => {});
}

/** 术语一键替换 */
export function trackAICorrect(inputLength: number) {
  if (!_password) return;
  fetch("/api/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-password": _password,
    },
    body: JSON.stringify({
      actionType: "ai_correct",
      metadata: { inputLength },
    }),
  }).catch(() => {});
}
