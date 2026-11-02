import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "School SaaS — Emerson Technology",
  description:
    "Multi-tenant school management platform by Emerson Technology. Manage schools, students, fees, attendance and parents — all in one place.",
  keywords: [
    "School Management",
    "SaaS",
    "Emerson Technology",
    "Student Information System",
    "POS",
    "ERP",
  ],
  authors: [{ name: "Emerson Technology", url: "https://emersontechnology.com" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "School SaaS — Emerson Technology",
    description:
      "Multi-tenant school management platform. Projects on time, on budget.",
    siteName: "School SaaS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "School SaaS — Emerson Technology",
    description: "Multi-tenant school management platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${mono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
