import type { Metadata } from "next";
import { getWorksByCategoryLive } from "@/lib/works-store";
import { buildMetadata } from "@/lib/seo";
import PoemCard from "@/components/PoemCard";
import WorkFilterBar from "@/components/public/WorkFilterBar";
import EmptyWorksState from "@/components/public/EmptyWorksState";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Поэзия",
  description:
    "Подборка авторских поэтических текстов: новые стихотворения, лирика и литературные публикации.",
  path: "/poetry",
  keywords: ["поэзия", "стихи", "авторские стихи", "литература"],
});

type PoetrySearchParams = {
  q?: string;
  tag?: string;
};

export default async function PoetryPage({
  searchParams,
}: {
  searchParams: Promise<PoetrySearchParams>;
}) {
  const params = await searchParams;
  const poetry = await getWorksByCategoryLive("poetry");

  const q = String(params.q || "").trim();
  const tag = String(params.tag || "").trim();
  const qLower = q.toLowerCase();

  const availableTags = [...new Set(poetry.flatMap((item) => item.tags || []))].sort(
    (a, b) => a.localeCompare(b, "ru")
  );

  const filteredPoetry = poetry.filter((work) => {
    if (tag && !(work.tags || []).includes(tag)) {
      return false;
    }

    if (qLower) {
      const haystack = [
        work.title,
        work.excerpt,
        ...(work.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(qLower)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <section className="mb-8">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          Poetry
        </p>
        <h1 className="text-4xl font-bold text-white sm:text-6xl">Поэзия</h1>
      </section>

      <WorkFilterBar
        basePath="/poetry"
        query={q}
        selectedTag={tag}
        availableTags={availableTags}
        totalCount={poetry.length}
        shownCount={filteredPoetry.length}
        accent="purple"
      />

      {!filteredPoetry.length ? (
        <EmptyWorksState
          title="По запросу ничего не найдено"
          description="Попробуй другой поисковый запрос или убери фильтр по тегу."
          resetHref="/poetry"
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredPoetry.map((work) => (
            <PoemCard key={work.id} work={work} />
          ))}
        </div>
      )}
    </div>
  );
}
