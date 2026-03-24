import type { Metadata } from "next";
import { getWorksByCategoryLive } from "@/lib/works-store";
import { buildMetadata } from "@/lib/seo";
import ProseCard from "@/components/ProseCard";
import WorkFilterBar from "@/components/public/WorkFilterBar";
import EmptyWorksState from "@/components/public/EmptyWorksState";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Проза",
  description:
    "Авторская проза: рассказы, короткие тексты, литературные заметки и новые публикации.",
  path: "/prose",
  keywords: ["проза", "рассказы", "авторская проза", "литература"],
});

type ProseSearchParams = {
  q?: string;
  tag?: string;
};

export default async function ProsePage({
  searchParams,
}: {
  searchParams: Promise<ProseSearchParams>;
}) {
  const params = await searchParams;
  const prose = await getWorksByCategoryLive("prose");

  const q = String(params.q || "").trim();
  const tag = String(params.tag || "").trim();
  const qLower = q.toLowerCase();

  const availableTags = [...new Set(prose.flatMap((item) => item.tags || []))].sort(
    (a, b) => a.localeCompare(b, "ru")
  );

  const filteredProse = prose.filter((work) => {
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
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-amber-200/70">
          Prose
        </p>
        <h1 className="text-4xl font-bold text-white sm:text-6xl">Проза</h1>
      </section>

      <WorkFilterBar
        basePath="/prose"
        query={q}
        selectedTag={tag}
        availableTags={availableTags}
        totalCount={prose.length}
        shownCount={filteredProse.length}
        accent="amber"
      />

      {!filteredProse.length ? (
        <EmptyWorksState
          title="По запросу ничего не найдено"
          description="Попробуй другой поисковый запрос или убери фильтр по тегу."
          resetHref="/prose"
        />
      ) : (
        <div className="grid gap-5">
          {filteredProse.map((work) => (
            <ProseCard key={work.id} work={work} />
          ))}
        </div>
      )}
    </div>
  );
}
