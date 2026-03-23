import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getPublishedWorksLive } from "@/lib/works-store";
import {
  getAnalyticsSummary,
  getPlatformLinksLive,
  getReferralLinksLive,
  getSocialLinksLive,
} from "@/lib/links-store";
import AdminNav from "@/components/admin/AdminNav";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireAdmin();

  const [works, analytics, socialLinks, platformLinks, referralLinks] =
    await Promise.all([
      getPublishedWorksLive(),
      getAnalyticsSummary(),
      getSocialLinksLive(),
      getPlatformLinksLive(),
      getReferralLinksLive(),
    ]);

  const totalViews = works.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalLikes = works.reduce((sum, item) => sum + (item.likes || 0), 0);
  const activeLinksCount = [...socialLinks, ...platformLinks, ...referralLinks]
    .filter((item) => item.isActive)
    .length;

  const topWorks = [...works]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <AdminNav current="dashboard" />

      <AdminPageHeader
        eyebrow="Admin Dashboard"
        title="Панель управления"
        description={`Вход выполнен как: ${session.username}`}
        actions={
          <>
            <Link
              href="/admin/works"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-200"
            >
              Открыть публикации
            </Link>
            <Link
              href="/admin/links"
              className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-sm text-purple-200"
            >
              Открыть ссылки
            </Link>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-sm text-gray-500">Публикации</div>
          <div className="mt-2 text-3xl font-bold gradient-text">
            {works.length}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-sm text-gray-500">Просмотры</div>
          <div className="mt-2 text-3xl font-bold gradient-text">
            {totalViews}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-sm text-gray-500">Лайки</div>
          <div className="mt-2 text-3xl font-bold gradient-text">
            {totalLikes}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-sm text-gray-500">Клики по ссылкам</div>
          <div className="mt-2 text-3xl font-bold gradient-text">
            {analytics.totalClicks}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-sm text-gray-500">Активные ссылки</div>
          <div className="mt-2 text-3xl font-bold gradient-text">
            {activeLinksCount}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">
              Топ публикаций по просмотрам
            </h2>

            <Link
              href="/admin/works"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-gray-200"
            >
              Все публикации
            </Link>
          </div>

          <div className="grid gap-3">
            {topWorks.length ? (
              topWorks.map((work) => (
                <Link
                  key={work.id}
                  href={`/admin/works/${work.id}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200 hover:text-white"
                >
                  <div className="font-medium">{work.title}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {work.category} · 👁 {work.views} · ❤ {work.likes}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-sm text-gray-500">Публикаций пока нет</div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">
              Клики по ссылкам
            </h2>

            <Link
              href="/admin/links"
              className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-sm text-purple-200"
            >
              Управлять
            </Link>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Социальные ссылки</div>
              <div className="mt-1 text-xs text-gray-500">
                Всего кликов: {analytics.totalSocialClicks}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Платформы</div>
              <div className="mt-1 text-xs text-gray-500">
                Всего кликов: {analytics.totalPlatformClicks}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Реферальные ссылки</div>
              <div className="mt-1 text-xs text-gray-500">
                Всего кликов: {analytics.totalReferralClicks}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
