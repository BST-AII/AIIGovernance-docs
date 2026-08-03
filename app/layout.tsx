import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const publicOrigin = basePath
  ? `https://bst-aii.github.io${basePath}/`
  : "https://aiigovernance-docs.shenshanlan.chatgpt.site/";

export const metadata: Metadata = {
  metadataBase: new URL(publicOrigin),
  title: "AIIGovernance Docs · 项目级 AI 治理框架",
  description: "将治理规则、Skills、执行 Hooks 与审计记录部署到项目内部，让 AI 的每次工作有规则、有边界、有证据、可核验。",
  icons: { icon: `${basePath}/app-icon.png`, shortcut: `${basePath}/app-icon.png` },
  openGraph: {
    title: "AIIGovernance Docs",
    description: "Governance as code. Evidence by design.",
    images: [{ url: "/og-light.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og-light.png"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
