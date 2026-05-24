"use client";

import { type ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  children: ReactNode;
  collapsed?: boolean;
}

export default function SettingsPanel({ title, description, children, collapsed }: Props) {
  return (
    <section className="px-4">
      <div className="bg-gray-50 rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-800 mb-1">{title}</h3>
        {description && (
          <p className="text-xs text-gray-400 mb-4">{description}</p>
        )}
        {!collapsed && <div className="space-y-3">{children}</div>}
      </div>
    </section>
  );
}
