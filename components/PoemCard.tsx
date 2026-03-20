import Link from "next/link";
import type { WorkItem } from "@/types";

export default function PoemCard({ work }: { work: WorkItem }) {
  return (
    <article className="glass rounded-[28px] border border-white/10 p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-purple-200">
          Поэзия
        </span>
        <span className="text-xs text-gray-500">
          {work.readingTime} мин
        </span>
      </div>

      <h3 className="mb-3 text-2xl font-semibold text-white">{work.title}</h3>
      <p className="mb-5 text-sm leading-7 text-gray-300">{work.excerpt}</p>

      <div className="mb-5 flex flex-wrap gap-2">
        {work.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-gray-400"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-xs text-gray-500">
          👁 {work.views} · ❤ {work.likes}
        </div>

        <Link
          href={`/poetry/${work.id}`}
          className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-200 hover:bg-purple-500/15"
        >
          Читать
        </Link>
      </div>
    </article>
  );
}
