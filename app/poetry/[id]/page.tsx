import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkByIdLive, getWorksByCategoryLive } from "@/lib/works-store";
import {
  buildBreadcrumbJsonLd,
  buildNoIndexMetadata,
  buildWorkArticleJsonLd,
  buildWorkMetadata,
} from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import WorkStats from "@/components/WorkStats";
import PoemCard from "@/components/PoemCard";

export const dynamic = "force-dynamic";

function overlapScore(currentTags: string[], candidateTags: string[]): number {
  return candidateTags.filter((tag) => currentTags.includes(tag)).length;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const work = await getWorkByIdLive(id);

  if (!work || work.category !== "poetry") {
    return buildNoIndexMetadata(
      "Материал не найден",
      "Запрошенное стихотворение не найдено.",
      `/poetry/${id}`
    );
  }

  return buildWorkMetadata(work, `/poetry/${work.id}`);
}

export default async function PoetryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = await getWorkByIdLive(id);

  if (!work || work.category !== "poetry") {
    notFound();
  }

  const parts = work.content.split(/\n\n+/).filter(Boolean);

  const related = (await getWorksByCategoryLive("poetry"))
    .filter((item) => item.id !== work.id)
    .map((item) => ({
      item,
      score: overlapScore(work.tags || [], item.tags || []),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      return (
        new Date(b.item.createdAt).getTime() - new Date(a.item.createdAt).getTime()
      );
    })
    .slice(0, 2)
    .map((entry) => entry.item);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Поэзия", path: "/poetry" },
            { name: work.title, path: `/poetry/${work.id}` },
          ]),
          buildWorkArticleJsonLd(work, `/poetry/${work.id}`),
        ]}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/poetry"
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-200"
        >
          ← Назад к списку
        </Link>
        <Link
          href="/"
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-200"
        >
          На главную
        </Link>
      </div>

      <section className="glass rounded-[32px] border border-white/10 p-8 sm:p-12">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          Поэзия
        </p>
        <h1 className="mb-4 text-4xl font-bold text-white sm:text-6xl">
          {work.title}
        </h1>

        {work.tags?.length ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {work.tags.map((tag) => (
              <Link
                key={tag}
                href={`/poetry?tag=${encodeURIComponent(tag)}`}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-gray-300"
              >
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="mb-8">
          <WorkStats
            id={work.id}
            readingTime={work.readingTime}
            initialViews={work.views}
            initialLikes={work.likes}
          />
        </div>

        <article className="space-y-6">
          {parts.map((part, index) => (
            <p
              key={index}
              className="whitespace-pre-line font-serif text-lg leading-9 text-gray-200"
            >
              {part}
            </p>
          ))}
        </article>
      </section>

      {related.length ? (
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-semibold text-white">
              Похожие материалы
            </h2>
            <Link
              href="/poetry"
              className="text-sm text-purple-300 hover:text-purple-200"
            >
              Вся поэзия →
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {related.map((item) => (
              <PoemCard key={item.id} work={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
