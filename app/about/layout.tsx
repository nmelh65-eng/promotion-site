import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { buildAboutPageJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Обо мне",
  description:
    "Информация об авторе, литературном направлении, творческой подаче и публичном авторском проекте.",
  path: "/about",
  keywords: [
    "об авторе",
    "обо мне",
    "литературный автор",
    "авторский проект",
    "Natalia Melkher",
  ],
});

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <JsonLd data={buildAboutPageJsonLd()} />
      {children}
    </>
  );
}
