import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://your-site.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Promotion Site",
    template: "%s | Promotion Site",
  },
  description:
    "Сайт продвижения авторского бренда, публикаций, ссылок и контента.",
  openGraph: {
    title: "Promotion Site",
    description:
      "Сайт продвижения авторского бренда, публикаций, ссылок и контента.",
    url: siteUrl,
    siteName: "Promotion Site",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Promotion Site",
    description:
      "Сайт продвижения авторского бренда, публикаций, ссылок и контента.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen bg-[#090a10] text-white">
          <Header />
          <main className="pt-6">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
