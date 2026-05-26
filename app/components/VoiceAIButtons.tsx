"use client";

import { Mic, MicOff, Wand2 } from "lucide-react";
import { Button } from "./ui/Button";

interface Props {
  isRecording: boolean;
  correcting: boolean;
  hasInput: boolean;
  onVoiceStart: () => void;
  onVoiceStop: () => void;
  onCorrect: () => void;
}

export default function VoiceAIButtons({
  isRecording,
  correcting,
  hasInput,
  onVoiceStart,
  onVoiceStop,
  onCorrect,
}: Props) {
  return (
    <>
      {/* 语音输入 */}
      <Button
        type="button"
        variant={isRecording ? "destructive" : "ghost"}
        size="sm"
        onClick={isRecording ? onVoiceStop : onVoiceStart}
        className="gap-1.5"
      >
        {isRecording ? (
          <MicOff className="h-3.5 w-3.5 animate-gentle-pulse" />
        ) : (
          <Mic className="h-3.5 w-3.5" />
        )}
        {isRecording ? "停止" : "语音"}
      </Button>

      {/* AI 修正 */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onCorrect}
        disabled={!hasInput || correcting}
        className="gap-1.5"
      >
        <Wand2 className={`h-3.5 w-3.5 ${correcting ? "animate-gentle-pulse" : ""}`} />
        {correcting ? "修正中" : "修正"}
      </Button>
    </>
  );
}
