import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { ClientProviders } from "@/components/client-providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientProviders>
            {children}
          </ClientProviders>
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
