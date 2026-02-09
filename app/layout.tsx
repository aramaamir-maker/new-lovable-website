import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "קמי תכשיטי קירות | גלריית אמנות עכשווית",
  description: "גלריה המתמחה ביצירות אמנות מודרניות ומינימליסטיות. כל יצירה נוצרת בקפידה ומשלבת אסתטיקה עכשווית עם טכניקות מסורתיות.",
  keywords: ["אמנות", "גלריה", "תכשיטי קירות", "אמנות עכשווית", "מינימליזם", "ישראל"],
  authors: [{ name: "קמי תכשיטי קירות" }],
  openGraph: {
    title: "קמי תכשיטי קירות | גלריית אמנות עכשווית",
    description: "גלריה המתמחה ביצירות אמנות מודרניות ומינימליסטיות",
    locale: "he_IL",
    type: "website",
    siteName: "קמי תכשיטי קירות",
  },
  twitter: {
    card: "summary_large_image",
    title: "קמי תכשיטי קירות | גלריית אמנות עכשווית",
    description: "גלריה המתמחה ביצירות אמנות מודרניות ומינימליסטיות",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body style={{
        fontFamily: 'var(--font-family)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <Header />
        <main style={{
          flex: 1,
          marginTop: 'var(--header-height)'
        }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
