import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getWorkByIdLive } from "@/lib/works-store";
import {
  buildBreadcrumbJsonLd,
  buildNoIndexMetadata,
  buildWorkArticleJsonLd,
  buildWorkMetadata,
} from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import WorkStats from "@/components/WorkStats";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const work = await getWorkByIdLive(id);

  if (!work || work.category !== "prose") {
    return buildNoIndexMetadata(
      "Материал не найден",
      "Запрошенный прозаический текст не найден.",
      `/prose/${id}`
    );
  }

  return buildWorkMetadata(work, `/prose/${work.id}`);
}

export default async function ProseItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = await getWorkByIdLive(id);

  if (!work || work.category !== "prose") {
    notFound();
  }

  const parts = work.content.split(/\n\n+/).filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Проза", path: "/prose" },
            { name: work.title, path: `/prose/${work.id}` },
          ]),
          buildWorkArticleJsonLd(work, `/prose/${work.id}`),
        ]}
      />

      <section className="glass rounded-[32px] border border-white/10 p-8 sm:p-12">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-amber-200/70">
          Проза
        </p>
        <h1 className="mb-4 text-4xl font-bold text-white sm:text-6xl">
          {work.title}
        </h1>

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
    </div>
  );
}
