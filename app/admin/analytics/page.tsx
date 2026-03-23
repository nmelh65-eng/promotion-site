import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getAnalyticsSummary } from "@/lib/links-store";
import { getAllWorksLive } from "@/lib/works-store";
import AdminNav from "@/components/admin/AdminNav";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminEmptyState from "@/components/admin/AdminEmptyState";

export const dynamic = "force-dynamic";

function statCard(label: string, value: string | number) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-3xl font-bold gradient-text">{value}</div>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();

  const [works, links] = await Promise.all([
    getAllWorksLive(),
    getAnalyticsSummary(),
  ]);

  const publishedWorks = works.filter((item) => item.isPublished);
  const draftWorks = works.filter((item) => !item.isPublished);
  const featuredWorks = publishedWorks.filter((item) => item.isFeatured);

  const totalViews = works.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalLikes = works.reduce((sum, item) => sum + (item.likes || 0), 0);

  const averageViews =
    works.length > 0 ? Number((totalViews / works.length).toFixed(2)) : 0;
  const averageLikes =
    works.length > 0 ? Number((totalLikes / works.length).toFixed(2)) : 0;

  const poetryWorks = works.filter((item) => item.category === "poetry");
  const proseWorks = works.filter((item) => item.category === "prose");

  const topWorksByViews = [...works]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 8);

  const topWorksByLikes = [...works]
    .sort((a, b) => (b.likes || 0) - (a.likes || 0))
    .slice(0, 8);

  const recentWorks = [...works]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <AdminNav current="analytics" />

      <AdminPageHeader
        eyebrow="Admin Analytics"
        title="Контентная аналитика"
        description="Расширенная аналитика по публикациям и ссылкам: performance, breakdown и top entities."
        actions={
          <>
            <Link
              href="/admin/works"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-200"
            >
              Открыть workflow
            </Link>
            <Link
              href="/admin/links"
              className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-sm text-purple-200"
            >
              Открыть links admin
            </Link>
          </>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-8">
        {statCard("Всего публикаций", works.length)}
        {statCard("Published", publishedWorks.length)}
        {statCard("Drafts", draftWorks.length)}
        {statCard("Featured", featuredWorks.length)}
        {statCard("Views", totalViews)}
        {statCard("Likes", totalLikes)}
        {statCard("Avg views", averageViews)}
        {statCard("Avg likes", averageLikes)}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-5 text-2xl font-semibold text-white">
            Category breakdown
          </h2>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Poetry</div>
              <div className="mt-1 text-xs text-gray-500">
                total: {poetryWorks.length} · published:{" "}
                {poetryWorks.filter((item) => item.isPublished).length} · drafts:{" "}
                {poetryWorks.filter((item) => !item.isPublished).length}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Prose</div>
              <div className="mt-1 text-xs text-gray-500">
                total: {proseWorks.length} · published:{" "}
                {proseWorks.filter((item) => item.isPublished).length} · drafts:{" "}
                {proseWorks.filter((item) => !item.isPublished).length}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-5 text-2xl font-semibold text-white">
            Link analytics totals
          </h2>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Total clicks</div>
              <div className="mt-1 text-xs text-gray-500">
                {links.totalClicks}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Social</div>
              <div className="mt-1 text-xs text-gray-500">
                {links.totalSocialClicks}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Platform</div>
              <div className="mt-1 text-xs text-gray-500">
                {links.totalPlatformClicks}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200">
              <div className="font-medium">Referral</div>
              <div className="mt-1 text-xs text-gray-500">
                {links.totalReferralClicks}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-5 text-2xl font-semibold text-white">
            Recent content
          </h2>

          <div className="grid gap-3">
            {recentWorks.length ? (
              recentWorks.map((work) => (
                <Link
                  key={work.id}
                  href={`/admin/works/${work.id}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200 hover:text-white"
                >
                  <div className="font-medium">{work.title}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {work.category} · {work.isPublished ? "published" : "draft"}
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-sm text-gray-500">Публикаций пока нет</div>
            )}
          </div>
        </div>
      </section>

      {!works.length ? (
        <div className="mt-8">
          <AdminEmptyState
            title="Недостаточно данных для аналитики"
            description="Создай и опубликуй первые материалы, чтобы аналитика начала заполняться просмотрами, лайками и workflow-статусами."
            actions={
              <Link
                href="/admin/works/new"
                className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white"
              >
                Создать публикацию
              </Link>
            }
          />
        </div>
      ) : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-white">
              Top works by views
            </h2>

            <Link
              href="/admin/works"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-gray-200"
            >
              Открыть workflow
            </Link>
          </div>

          <div className="grid gap-3">
            {topWorksByViews.map((work) => (
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
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-5 text-2xl font-semibold text-white">
            Top works by likes
          </h2>

          <div className="grid gap-3">
            {topWorksByLikes.map((work) => (
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
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-5 text-2xl font-semibold text-white">
            Top social clicks
          </h2>

          <div className="grid gap-3">
            {links.topSocialLinks.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200"
              >
                <div className="font-medium">{item.label}</div>
                <div className="mt-1 text-xs text-gray-500">
                  clicks: {item.clicks}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-5 text-2xl font-semibold text-white">
            Top platform clicks
          </h2>

          <div className="grid gap-3">
            {links.topPlatforms.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200"
              >
                <div className="font-medium">{item.title}</div>
                <div className="mt-1 text-xs text-gray-500">
                  clicks: {item.clicks}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-5 text-2xl font-semibold text-white">
            Top referral clicks
          </h2>

          <div className="grid gap-3">
            {links.topReferrals.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-gray-200"
              >
                <div className="font-medium">{item.title}</div>
                <div className="mt-1 text-xs text-gray-500">
                  clicks: {item.clicks}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
