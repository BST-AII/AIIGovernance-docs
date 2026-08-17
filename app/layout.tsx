import type { Metadata } from "next";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const publicOrigin = basePath
  ? `https://bst-aii.github.io${basePath}/`
  : "https://aiigovernance-docs.shenshanlan.chatgpt.site/";

export const metadata: Metadata = {
  metadataBase: new URL(publicOrigin),
  title: "AIIGovernance 文档",
  description: "让 AI 在项目规则内工作，并留下可核验的证据。",
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
