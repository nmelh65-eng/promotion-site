import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllWorksLive } from "@/lib/works-store";
import {
  getAnalyticsSummary,
  getPlatformLinksLive,
  getReferralLinksLive,
  getSocialLinksLive,
} from "@/lib/links-store";
import type { ModeratedWork } from "@/lib/works-store";
import AdminNav from "@/components/admin/AdminNav";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export const dynamic = "force-dynamic";

function getState(work: ModeratedWork) {
  return work.moderationState || (work.isPublished ? "published" : "draft");
}

export default async function AdminPage() {
  const session = await requireAdmin();

  const [allWorks, analytics, socialLinks, platformLinks, referralLinks] =
    await Promise.all([
      getAllWorksLive(),
      getAnalyticsSummary(),
      getSocialLinksLive(),
      getPlatformLinksLive(),
      getReferralLinksLive(),
    ]);

  const publicWorks = allWorks.filter(
    (item) => getState(item) === "published" && !item.isHidden
  );
  const hiddenCount = allWorks.filter(
    (item) => getState(item) === "published" && item.isHidden
  ).length;
  const reviewCount = allWorks.filter(
    (item) => getState(item) === "review"
  ).length;
  const draftCount = allWorks.filter(
    (item) => getState(item) === "draft"
  ).length;
  const archivedCount = allWorks.filter(
    (item) => getState(item) === "archived"
  ).length;

  const totalViews = allWorks.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalLikes = allWorks.reduce((sum, item) => sum + (item.likes || 0), 0);
  const activeLinksCount = [...socialLinks, ...platformLinks, ...referralLinks]
    .filter((item) => item.isActive)
    .length;

  const topWorks = [...publicWorks]
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
              Открыть moderation
            </Link>
            <Link
              href="/admin/analytics"
              className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-sm text-purple-200"
            >
              Открыть analytics
            </Link>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-8">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-sm text-gray-500">Всего публикаций</div>
          <div className="mt-2 text-3xl font-bold gradient-text">
            {allWorks.length}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-sm text-gray-500">Public</div>
          <div className="mt-2 text-3xl font-bold gradient-text">
            {publicWorks.length}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-sm text-gray-500">Hidden</div>
          <div className="mt-2 text-3xl font-bold gradient-text">
            {hiddenCount}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-sm text-gray-500">Review</div>
          <div className="mt-2 text-3xl font-bold gradient-text">
            {reviewCount}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-sm text-gray-500">Drafts</div>
          <div className="mt-2 text-3xl font-bold gradient-text">
            {draftCount}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
          <div className="text-sm text-gray-500">Archived</div>
          <div className="mt-2 text-3xl font-bold gradient-text">
            {archivedCount}
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
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">
              Moderation overview
            </h2>

            <Link
              href="/admin/works"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-gray-200"
            >
              Открыть публикации
            </Link>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Public</div>
              <div className="mt-1 text-xs text-gray-500">
                Видно на сайте: {publicWorks.length}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Hidden</div>
              <div className="mt-1 text-xs text-gray-500">
                Скрыто из public: {hiddenCount}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Review</div>
              <div className="mt-1 text-xs text-gray-500">
                На проверке: {reviewCount}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Archived</div>
              <div className="mt-1 text-xs text-gray-500">
                В архиве: {archivedCount}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Активные ссылки</div>
              <div className="mt-1 text-xs text-gray-500">
                Всего активных ссылок: {activeLinksCount}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">
              Топ public-публикаций по просмотрам
            </h2>

            <Link
              href="/admin/analytics"
              className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-sm text-purple-200"
            >
              Вся аналитика
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
      </section>

      <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-white">
            Клики по ссылкам
          </h2>

          <Link
            href="/admin/analytics"
            className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-sm text-purple-200"
          >
            Открыть link analytics
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
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
      </section>
    </div>
  );
}
