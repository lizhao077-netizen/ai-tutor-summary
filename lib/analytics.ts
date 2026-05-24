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

export function markGenerateStart() {
  _generationStart = Date.now();
}

export function markGenerateEnd() {
  return Date.now() - _generationStart;
}

function post(actionType: string, meta?: Record<string, unknown>) {
  if (!_password) return;
  const body: Record<string, unknown> = { actionType };
  if (_generationId) body.generationId = _generationId;
  if (meta) body.metadata = meta;

  fetch("/api/log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-access-password": _password,
    },
    body: JSON.stringify(body),
  }).catch(() => {});
}

/** 生成开始时调用，返回 generationId 占位 */
export function trackGenerate(inputLength: number, usedVoice: boolean) {
  _generationStart = Date.now();
  post("generate", { inputLength, usedVoice });
}

/** 生成完成后调用 */
export function trackGenerateComplete(generationId: number, outputText: string, iterationCount: number) {
  _generationId = generationId;
  const ms = Date.now() - _generationStart;
  post("generate_complete", { generationId, outputText, generationMs: ms, iterationCount });
}

/** 复制 */
export function trackCopy() {
  post("copy");
}

/** 快捷修改 */
export function trackQuickAction(label: string) {
  // 映射中文标签到 action_type
  const map: Record<string, string> = {
    "更亲切一点": "more_friendly",
    "更专业一点": "more_professional",
    "简短一些": "shorter",
    "多鼓励一些": "more_encourage",
    "更像真人": "more_human",
  };
  post(map[label] || label);
}

/** 语音开始 */
export function trackVoiceStart() {
  post("voice_start");
}

/** 语音结束 */
export function trackVoiceEnd(durationMs?: number) {
  post("voice_end", durationMs ? { durationMs } : undefined);
}

/** AI 润色 */
export function trackAICorrect(inputLength: number) {
  post("ai_correct", { inputLength });
}
