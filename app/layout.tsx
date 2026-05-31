import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ClientProviders } from "@/components/shared/client-providers";
import { DeferredAnalytics } from "@/components/shared/deferred-analytics";
import NextTopLoader from "nextjs-toploader";
import { UserPreferencesProvider } from "@/components/providers/user-preferences-provider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Ngaturin - Atur Keuangan Pribadimu",
  description:
    "Ngaturin adalah aplikasi expense tracker pribadi yang membantu Anda melacak pemasukan dan pengeluaran dengan mudah.",
};

const interFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${interFont.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#9fe870" height={3} showSpinner={false} shadow="0 0 10px #9fe870,0 0 5px #9fe870" />
          <UserPreferencesProvider>
            <ClientProviders>
              {children}
            </ClientProviders>
          </UserPreferencesProvider>
          <DeferredAnalytics />
        </ThemeProvider>

        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
