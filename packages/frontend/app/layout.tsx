import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import MSWWorker from "@/app/components/msw/Worker";
import { Toaster } from "react-hot-toast";
import ConfirmProvider from "@/app/components/confirm/ConfirmProvider";

const pretendard = localFont({
  src: [
    {
      path: "../public/fonts/pretendard/Pretendard-Thin.woff2",
      weight: "100",
    },
    {
      path: "../public/fonts/pretendard/Pretendard-ExtraLight.woff2",
      weight: "200",
    },
    {
      path: "../public/fonts/pretendard/Pretendard-Light.woff2",
      weight: "300",
    },
    {
      path: "../public/fonts/pretendard/Pretendard-Regular.woff2",
      weight: "400",
    },
    {
      path: "../public/fonts/pretendard/Pretendard-Medium.woff2",
      weight: "500",
    },
    {
      path: "../public/fonts/pretendard/Pretendard-SemiBold.woff2",
      weight: "600",
    },
    {
      path: "../public/fonts/pretendard/Pretendard-Bold.woff2",
      weight: "700",
    },
    {
      path: "../public/fonts/pretendard/Pretendard-ExtraBold.woff2",
      weight: "800",
    },
    {
      path: "../public/fonts/pretendard/Pretendard-Black.woff2",
      weight: "900",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SYNAPSE - AI 면접 연습 플랫폼",
  description: "AI 기반 면접 연습 플랫폼으로 기술 면접을 완벽하게 준비하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${jetbrainsMono.variable}`}
    >
      <body className={`${pretendard.className} bg-neutral-50`}>
        <MSWWorker />
        <Toaster position="top-right" />
        <ConfirmProvider>{children}</ConfirmProvider>
      </body>
    </html>
  );
}
