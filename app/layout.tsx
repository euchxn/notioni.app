import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
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
      <head>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-58X99DCX');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-58X99DCX"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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
<main className="max-w-5xl mx-auto px-4 py-8 min-h-[calc(100vh-180px)]">
              {children}
            </main>
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors">
              <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    © 2025 Notion Template AI
                  </p>
                  <div className="flex items-center gap-6">
                    <Link
                      href="/terms"
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      이용약관
                    </Link>
                    <Link
                      href="/privacy"
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      개인정보처리방침
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </DarkModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
