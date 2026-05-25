"use client";

import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card";
import { BookOpen, Sparkles, ClipboardCheck, Calendar } from "lucide-react";

const CARD_CONFIG: Record<string, { icon: React.ReactNode; label: string }> = {
  "课堂内容": { icon: <BookOpen className="h-4 w-4" />, label: "课堂内容" },
  "课堂表现": { icon: <Sparkles className="h-4 w-4" />, label: "课堂表现" },
  "课后作业": { icon: <ClipboardCheck className="h-4 w-4" />, label: "课后作业" },
  "下节课计划": { icon: <Calendar className="h-4 w-4" />, label: "下节课计划" },
};

interface Props {
  label: string;
  content: string;
}

export default function FeedbackCard({ label, content }: Props) {
  const config = CARD_CONFIG[label] || { icon: <BookOpen className="h-4 w-4" />, label };

  return (
    <Card className="bg-muted/50 border-0">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground/80">
          {config.icon}
          {config.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base leading-relaxed text-foreground">{content}</p>
      </CardContent>
    </Card>
  );
}
