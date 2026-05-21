import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://madeye.github.io/silicon-civilization-stock-trade/"),
  title: {
    default: "硅基文明消费股交易系统",
    template: "%s · 硅基文明消费股交易系统",
  },
  description: "DeepSeek、Tushare 与 AkShare 驱动的 A 股主题股票池、目标价、信号与回测系统。",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: "硅基文明消费股交易系统",
    title: "硅基文明消费股交易系统",
    description: "A 股硅基文明消费主题股票池、分析师目标价、DeepSeek 信号与策略回测。",
    url: "/",
    images: [
      {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "硅基文明消费股交易系统社交分享卡片",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "硅基文明消费股交易系统",
    description: "A 股硅基文明消费主题股票池、分析师目标价、DeepSeek 信号与策略回测。",
    images: ["/social-card.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
