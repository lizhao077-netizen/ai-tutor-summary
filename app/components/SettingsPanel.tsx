"use client";

import { type ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  collapsed?: boolean;
}

export default function SettingsPanel({ title, description, children, collapsed }: Props) {
  return (
    <section className="px-4">
      <Card className="bg-muted/50 border-0">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </CardHeader>
        {!collapsed && (
          <CardContent className="space-y-3">{children}</CardContent>
        )}
      </Card>
    </section>
  );
}
