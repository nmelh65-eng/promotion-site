import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllWorksLive } from "@/lib/works-store";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminNav from "@/components/admin/AdminNav";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AdminWorksPage() {
  await requireAdmin();
  const works = await getAllWorksLive();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <AdminNav current="works" />

      <AdminPageHeader
        eyebrow="Admin Content"
        title="Публикации"
        description="Управление всеми материалами: drafts, published и featured публикации."
        actions={
          <Link
            href="/admin/works/new"
            className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white"
          >
            Новая публикация
          </Link>
        }
      />

      {!works.length ? (
        <AdminEmptyState
          title="Публикаций пока нет"
          description="Создай первую публикацию, чтобы она появилась в списке и стала доступна в админке."
          actions={
            <Link
              href="/admin/works/new"
              className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white"
            >
              Создать первую публикацию
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {works.map((work) => (
            <div
              key={work.id}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5"
            >
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
