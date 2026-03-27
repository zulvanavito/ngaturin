import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ClientProviders } from "@/components/client-providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";
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

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${manrope.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader color="#D1FC00" height={3} showSpinner={false} shadow="0 0 10px #D1FC00,0 0 5px #D1FC00" />
          <ClientProviders>
            {children}
          </ClientProviders>
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
