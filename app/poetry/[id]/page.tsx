import { notFound } from "next/navigation";
import { getWorkById } from "@/lib/works-store";

export default async function PoetryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const work = getWorkById(id);

  if (!work || work.category !== "poetry") {
    notFound();
  }

  const parts = work.content.split(/\n\n+/).filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16">
      <section className="glass rounded-[32px] border border-white/10 p-8 sm:p-12">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          Поэзия
        </p>
        <h1 className="mb-4 text-4xl font-bold text-white sm:text-6xl">
          {work.title}
        </h1>
        <div className="mb-8 flex flex-wrap gap-3 text-sm text-gray-400">
          <span>{work.readingTime} мин чтения</span>
          <span>👁 {work.views}</span>
          <span>❤ {work.likes}</span>
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
