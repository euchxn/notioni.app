import type { Metadata } from "next";
import "./globals.css";
import DarkModeProvider from "@/components/DarkModeProvider";
import DarkModeToggle from "@/components/DarkModeToggle";
import AuthProvider from "@/components/AuthProvider";
import AuthButton from "@/components/AuthButton";

export const metadata: Metadata = {
  title: "Notion Template AI",
  description: "AI가 자동으로 노션 템플릿을 생성해드립니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <AuthProvider>
          <DarkModeProvider>
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
              <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Notion Template AI
                </h1>
                <div className="flex items-center gap-4">
                  <AuthButton />
                  <DarkModeToggle />
                </div>
              </div>
            </header>
            <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
          </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
