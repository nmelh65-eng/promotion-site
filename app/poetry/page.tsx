import type { Metadata } from "next";
import { getWorksByCategoryLive } from "@/lib/works-store";
import { buildMetadata } from "@/lib/seo";
import PoemCard from "@/components/PoemCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Поэзия",
  description:
    "Подборка авторских поэтических текстов: новые стихотворения, лирика и литературные публикации.",
  path: "/poetry",
  keywords: ["поэзия", "стихи", "авторские стихи", "литература"],
});

export default async function PoetryPage() {
  const poetry = await getWorksByCategoryLive("poetry");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <section className="mb-8">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          Poetry
        </p>
        <h1 className="text-4xl font-bold text-white sm:text-6xl">Поэзия</h1>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {poetry.map((work) => (
          <PoemCard key={work.id} work={work} />
        ))}
      </div>
    </div>
  );
}
