import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllWorksLive } from "@/lib/works-store";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminNav from "@/components/admin/AdminNav";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminWorkQuickActions from "@/components/admin/AdminWorkQuickActions";

export const dynamic = "force-dynamic";

type AdminWorksSearchParams = {
  status?: string;
  category?: string;
  featured?: string;
  q?: string;
};

function filterChipClass(active: boolean): string {
  return (
    "rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.18em] " +
    (active
      ? "border border-purple-400/20 bg-purple-500/10 text-purple-200"
      : "border border-white/10 bg-white/[0.03] text-gray-400")
  );
}

export default async function AdminWorksPage({
  searchParams,
}: {
  searchParams: Promise<AdminWorksSearchParams>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const works = await getAllWorksLive();

  const status =
    params.status === "published" || params.status === "draft"
      ? params.status
      : "all";

  const category =
    params.category === "poetry" || params.category === "prose"
      ? params.category
      : "all";

  const featured =
    params.featured === "featured" || params.featured === "regular"
      ? params.featured
      : "all";

  const q = String(params.q || "").trim();
  const qLower = q.toLowerCase();

  const filteredWorks = works.filter((work) => {
    if (status === "published" && !work.isPublished) return false;
    if (status === "draft" && work.isPublished) return false;

    if (category !== "all" && work.category !== category) return false;

    if (featured === "featured" && !work.isFeatured) return false;
    if (featured === "regular" && work.isFeatured) return false;

    if (qLower) {
      const haystack = [
        work.id,
        work.title,
        work.excerpt,
        work.category,
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

  const publishedCount = works.filter((work) => work.isPublished).length;
  const draftCount = works.filter((work) => !work.isPublished).length;
  const featuredCount = works.filter(
    (work) => work.isPublished && work.isFeatured
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <AdminNav current="works" />

      <AdminPageHeader
        eyebrow="Admin Content"
        title="Публикации"
        description="Управление контентным workflow: drafts, published, featured и быстрые status-действия."
        actions={
          <Link
            href="/admin/works/new"
            className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white"
          >
            Новая публикация
          </Link>
        }
      />

      <section className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="mb-5">
          <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
            Workflow Filters
          </p>
          <h2 className="text-2xl font-semibold text-white">
            Workflow filters
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-400">
            Фильтруй публикации по статусу, категории, featured-метке и
            поисковому запросу.
          </p>
        </div>

        <form action="/admin/works" className="grid gap-4 xl:grid-cols-5">
          <div className="grid gap-2 xl:col-span-2">
            <label className="text-sm text-gray-300">Поиск</label>
            <input
              name="q"
              defaultValue={q}
              placeholder="ID, заголовок, excerpt, теги..."
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-300">Status</label>
            <select
              name="status"
              defaultValue={status}
              className="rounded-2xl border border-white/10 bg-[#11131b] px-4 py-3 text-white outline-none"
            >
              <option value="all">all</option>
              <option value="published">published</option>
              <option value="draft">draft</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-300">Category</label>
            <select
              name="category"
              defaultValue={category}
              className="rounded-2xl border border-white/10 bg-[#11131b] px-4 py-3 text-white outline-none"
            >
              <option value="all">all</option>
              <option value="poetry">poetry</option>
              <option value="prose">prose</option>
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm text-gray-300">Featured</label>
            <select
              name="featured"
              defaultValue={featured}
              className="rounded-2xl border border-white/10 bg-[#11131b] px-4 py-3 text-white outline-none"
            >
              <option value="all">all</option>
              <option value="featured">featured</option>
              <option value="regular">regular</option>
            </select>
          </div>

          <div className="xl:col-span-5 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white"
            >
              Применить фильтры
            </button>

            <Link
              href="/admin/works"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-gray-200"
            >
              Сбросить
            </Link>
          </div>
        </form>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className={filterChipClass(status === "all")}>
            all: {works.length}
          </span>
          <span className={filterChipClass(status === "published")}>
            published: {publishedCount}
          </span>
          <span className={filterChipClass(status === "draft")}>
            drafts: {draftCount}
          </span>
          <span className={filterChipClass(featured === "featured")}>
            featured: {featuredCount}
          </span>
          <span className={filterChipClass(category === "poetry")}>
            poetry: {works.filter((item) => item.category === "poetry").length}
          </span>
          <span className={filterChipClass(category === "prose")}>
            prose: {works.filter((item) => item.category === "prose").length}
          </span>
        </div>

        <div className="mt-5 text-sm text-gray-500">
          Найдено по текущим фильтрам: {filteredWorks.length}
        </div>
      </section>

      {!filteredWorks.length ? (
        <AdminEmptyState
          title="Ничего не найдено"
          description="По текущим фильтрам и поисковому запросу публикаций не найдено. Измени параметры или сбрось фильтры."
          actions={
            <>
              <Link
                href="/admin/works"
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-gray-200"
              >
                Сбросить фильтры
              </Link>
              <Link
                href="/admin/works/new"
                className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white"
              >
                Создать публикацию
              </Link>
            </>
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredWorks.map((work) => (
            <div
              key={work.id}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-400">
                        {work.category}
                      </span>
                      <span
                        className={
                          "rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] " +
                          (work.isPublished
                            ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                            : "border border-amber-400/20 bg-amber-500/10 text-amber-300")
                        }
                      >
                        {work.isPublished ? "published" : "draft"}
                      </span>
                      {work.isFeatured ? (
                        <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-purple-200">
                          featured
                        </span>
                      ) : null}
                    </div>

                    <h2 className="text-2xl font-semibold text-white">
                      {work.title}
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-400">
                      {work.excerpt}
                    </p>

                    <div className="mt-4 text-xs text-gray-500">
                      ID: {work.id} · 👁 {work.views} · ❤ {work.likes}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/admin/works/${work.id}`}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-200"
                    >
                      Редактировать
                    </Link>
                    <Link
                      href={`/${work.category}/${work.id}`}
                      className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-sm text-purple-200"
                    >
                      Открыть
                    </Link>
                  </div>
                </div>

                <AdminWorkQuickActions
                  id={work.id}
                  initialPublished={Boolean(work.isPublished)}
                  initialFeatured={Boolean(work.isFeatured)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
