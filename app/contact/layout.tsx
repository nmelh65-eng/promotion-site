import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { buildContactPageJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Контакты",
  description:
    "Контактная страница автора: способы связи, социальные профили и точки входа для сотрудничества.",
  path: "/contact",
  keywords: [
    "контакты",
    "связаться с автором",
    "автор",
    "telegram",
    "email",
  ],
});

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <JsonLd data={buildContactPageJsonLd()} />
      {children}
    </>
  );
}
