import Link from "next/link";

interface WorkFilterBarProps {
  basePath: string;
  query: string;
  selectedTag: string;
  availableTags: string[];
  totalCount: number;
  shownCount: number;
  accent: "purple" | "amber";
}

function chipClass(active: boolean, accent: "purple" | "amber"): string {
  const activeClass =
    accent === "purple"
      ? "border-purple-400/20 bg-purple-500/10 text-purple-200"
      : "border-amber-400/20 bg-amber-500/10 text-amber-200";

  return (
    "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors " +
    (active
      ? activeClass
      : "border-white/10 bg-white/[0.03] text-gray-400 hover:text-white")
  );
}

function buildHref(
  basePath: string,
  query: string,
  selectedTag: string
): string {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query.trim());
  }

  if (selectedTag.trim()) {
    params.set("tag", selectedTag.trim());
  }

  const value = params.toString();
  return value ? `${basePath}?${value}` : basePath;
}

export default function WorkFilterBar({
  basePath,
  query,
  selectedTag,
  availableTags,
  totalCount,
  shownCount,
  accent,
}: WorkFilterBarProps) {
  return (
    <section className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <div className="mb-5">
        <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          Public UX
        </p>
        <h2 className="text-2xl font-semibold text-white">
          Фильтр и поиск
        </h2>
        <p className="mt-3 text-sm leading-7 text-gray-400">
          Ищи по заголовку, excerpt, тегам и быстро переключайся по тематике.
        </p>
      </div>

      <form action={basePath} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="grid gap-2">
          <label className="text-sm text-gray-300">Поиск</label>
          <input
            name="q"
            defaultValue={query}
            placeholder="Заголовок, excerpt, теги..."
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
          />
          {selectedTag ? <input type="hidden" name="tag" value={selectedTag} /> : null}
        </div>

        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white"
          >
            Найти
          </button>

          <Link
            href={basePath}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-gray-200"
          >
            Сбросить
          </Link>
        </div>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={buildHref(basePath, query, "")}
          className={chipClass(!selectedTag, accent)}
        >
          all
        </Link>

        {availableTags.map((tag) => (
          <Link
            key={tag}
            href={buildHref(basePath, query, tag)}
            className={chipClass(selectedTag === tag, accent)}
          >
            {tag}
          </Link>
        ))}
      </div>

      <div className="mt-5 text-sm text-gray-500">
        Показано: {shownCount} из {totalCount}
        {query ? ` · поиск: "${query}"` : ""}
        {selectedTag ? ` · тег: #${selectedTag}` : ""}
      </div>
    </section>
  );
}
