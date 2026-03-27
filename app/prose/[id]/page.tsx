import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import {
  getPublicWorkBySlugOrIdLive,
  getWorksByCategoryLive,
} from "@/lib/works-store";
import {
  buildBreadcrumbJsonLd,
  buildNoIndexMetadata,
  buildWorkArticleJsonLd,
  buildWorkMetadata,
} from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import WorkStats from "@/components/WorkStats";
import ProseCard from "@/components/ProseCard";

export const dynamic = "force-dynamic";

function overlapScore(currentTags: string[], candidateTags: string[]): number {
  return candidateTags.filter((tag) => currentTags.includes(tag)).length;
}

function safeDecodeRouteParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const rawId = (await params).id;
  const routeId = safeDecodeRouteParam(rawId);
  const work = await getPublicWorkBySlugOrIdLive(routeId);

  if (!work || work.category !== "prose") {
    return buildNoIndexMetadata(
      "Материал не найден",
      "Запрошенный прозаический текст не найден.",
      `/prose/${rawId}`
    );
  }

  const publicSlug = encodeURIComponent(work.slug || work.id);

  return buildWorkMetadata(work, `/prose/${publicSlug}`);
}

export default async function ProseItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const rawId = (await params).id;
  const routeId = safeDecodeRouteParam(rawId);
  const work = await getPublicWorkBySlugOrIdLive(routeId);

  if (!work || work.category !== "prose") {
    notFound();
  }

  const publicSlug = encodeURIComponent(work.slug || work.id);

  if (routeId === work.id && work.slug && work.slug !== work.id) {
    permanentRedirect(`/prose/${publicSlug}`);
  }

  const parts = work.content.split(/\n\n+/).filter(Boolean);

  const related = (await getWorksByCategoryLive("prose"))
    .filter((item) => item.id !== work.id)
    .map((item) => ({
      item,
      score: overlapScore(work.tags || [], item.tags || []),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      return (
        new Date(b.item.createdAt).getTime() -
        new Date(a.item.createdAt).getTime()
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
            { name: "Проза", path: "/prose" },
            { name: work.title, path: `/prose/${publicSlug}` },
          ]),
          buildWorkArticleJsonLd(work, `/prose/${publicSlug}`),
        ]}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/prose"
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
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-amber-200/70">
          Проза
        </p>
        <h1 className="mb-4 text-4xl font-bold text-white sm:text-6xl">
          {work.title}
        </h1>

        {work.tags?.length ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {work.tags.map((tag) => (
              <Link
                key={tag}
                href={`/prose?tag=${encodeURIComponent(tag)}`}
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
              href="/prose"
              className="text-sm text-amber-300 hover:text-amber-200"
            >
              Вся проза →
            </Link>
          </div>

          <div className="grid gap-5">
            {related.map((item) => (
              <ProseCard key={item.id} work={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
