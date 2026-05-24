import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 课后总结助手",
  description: "30 秒生成专业的家长反馈",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
