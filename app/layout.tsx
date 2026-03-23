import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import {
  buildPersonJsonLd,
  buildWebsiteJsonLd,
  getSiteUrl,
  siteConfig,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.defaultDescription,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  openGraph: {
    siteName: siteConfig.name,
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary",
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
        <JsonLd data={buildWebsiteJsonLd()} />
        <JsonLd data={buildPersonJsonLd()} />
        <div className="min-h-screen bg-[#090a10] text-white">
          <Header />
          <main className="pt-6">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
