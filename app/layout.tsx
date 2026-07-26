import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXT LEVEL MAX منصة",
  description: "المنصة الأولى عالميا و الرائدة في مجال الوساطة التجارية للحسابات الالكترونية لأشهر الألعاب , وجهتك الأولى لبيع و شراء الحسابات , تجربة آمنة , سريعة , أمان تام من خلال متابعة كامل المعاملة حتى اتمامها و تأمين حقوق الأفراد في جميع أنحاء العالم يمكنكم من خلال منصتنا انجاز عمليات البيع و الشراء من مختلف الدول و تأمينكم",
  icons : { icon : "/icon.png"},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
