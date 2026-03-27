import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { getPublishedWorksLive } from "@/lib/works-store";
import {
  getReferralLinksLive,
  getSocialLinksLive,
} from "@/lib/links-store";
import PoemCard from "@/components/PoemCard";
import ProseCard from "@/components/ProseCard";
import TrackedLinkCard from "@/components/TrackedLinkCard";
import SectionHeader from "@/components/public/SectionHeader";
import HomeMetricCard from "@/components/public/HomeMetricCard";
import NewsletterSignupForm from "@/components/public/NewsletterSignupForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Авторский сайт продвижения",
  description:
    "Главная страница авторского сайта: публикации, социальные ссылки, продвижение и литературный контент.",
  path: "/",
  keywords: [
    "авторский сайт",
    "продвижение автора",
    "литература",
    "поэзия",
    "проза",
    "ссылки",
  ],
});

export default async function HomePage() {
  const [publishedWorks, socialLinks, referralLinks] = await Promise.all([
    getPublishedWorksLive(),
    getSocialLinksLive(),
    getReferralLinksLive(),
  ]);

  const poetry = publishedWorks.filter((item) => item.category === "poetry");
  const prose = publishedWorks.filter((item) => item.category === "prose");

  const featuredWorks = publishedWorks.filter((item) => item.isFeatured).slice(0, 3);

  const trendingWorks = [...publishedWorks]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 4);

  const latestPoetry = poetry.slice(0, 2);
  const latestProse = prose.slice(0, 1);

  const activeSocialLinks = socialLinks.filter((item) => item.isActive);
  const activeReferralLinks = referralLinks.filter((item) => item.isActive);

  const totalViews = publishedWorks.reduce((sum, item) => sum + (item.views || 0), 0);
  const totalLikes = publishedWorks.reduce((sum, item) => sum + (item.likes || 0), 0);
  const activeLinksCount = activeSocialLinks.length + activeReferralLinks.length;

  const latestPoetryTitle = latestPoetry[0]?.title || "Новых стихотворений пока нет";
  const latestProseTitle = latestProse[0]?.title || "Новых прозаических текстов пока нет";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] px-6 py-14 sm:px-10 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18),transparent_45%)]" />
        <div className="relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
              Promotion Site
            </p>
            <h1 className="mb-5 text-4xl font-bold tracking-tight sm:text-6xl">
              <span className="gradient-text">Авторский сайт продвижения</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base leading-8 text-gray-300 sm:text-lg">
              Публичная витрина публикаций, ссылок, платформ и литературного
              контента для роста авторского бренда.
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/poetry"
                className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-3.5 font-medium text-white"
              >
                Смотреть поэзию
              </Link>
              <Link
                href="/prose"
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 font-medium text-gray-200"
              >
                Читать прозу
              </Link>
              <Link
                href="/links"
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 font-medium text-gray-200"
              >
                Ссылки и платформы
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <HomeMetricCard
              label="Published"
              value={publishedWorks.length}
              description="Публично доступных материалов"
              accent="purple"
            />
            <HomeMetricCard
              label="Views"
              value={totalViews}
              description="Суммарные просмотры публикаций"
              accent="emerald"
            />
            <HomeMetricCard
              label="Likes"
              value={totalLikes}
              description="Суммарные лайки читателей"
              accent="amber"
            />
            <HomeMetricCard
              label="Links"
              value={activeLinksCount}
              description="Активные social и referral links"
              accent="purple"
            />
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
            Audience Capture
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Подпишись на обновления
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
            Если хочешь получать новые публикации, подборки и заметные обновления
            проекта, оставь email и следи за развитием авторской витрины.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-300">
              Новые поэтические и прозаические публикации
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-300">
              Обновления featured-материалов и подборок
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm text-gray-300">
              Новые точки входа, платформы и публичные форматы
            </div>
          </div>
        </div>

        <NewsletterSignupForm source="homepage" />
      </section>

      <section className="mt-12">
        <SectionHeader
          eyebrow="Homepage Optimization"
          title="Категории контента"
          description="Быстрый вход в основные направления контента: поэзия и проза."
        />

        <div className="grid gap-5 xl:grid-cols-2">
          <Link
            href="/poetry"
            className="rounded-[28px] border border-purple-400/20 bg-purple-500/10 p-6 transition-colors hover:bg-purple-500/15"
          >
            <div className="mb-3 inline-flex rounded-full border border-purple-400/20 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.18em] text-purple-200">
              Poetry
            </div>
            <h3 className="text-3xl font-semibold text-white">Поэзия</h3>
            <p className="mt-3 text-sm leading-7 text-purple-100/80">
              {poetry.length} публикаций · последнее: {latestPoetryTitle}
            </p>
          </Link>

          <Link
            href="/prose"
            className="rounded-[28px] border border-amber-400/20 bg-amber-500/10 p-6 transition-colors hover:bg-amber-500/15"
          >
            <div className="mb-3 inline-flex rounded-full border border-amber-400/20 bg-white/[0.03] px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber-200">
              Prose
            </div>
            <h3 className="text-3xl font-semibold text-white">Проза</h3>
            <p className="mt-3 text-sm leading-7 text-amber-100/80">
              {prose.length} публикаций · последнее: {latestProseTitle}
            </p>
          </Link>
        </div>
      </section>

      {featuredWorks.length ? (
        <section className="mt-12">
          <SectionHeader
            eyebrow="Featured"
            title="В центре внимания"
            description="Выделенные материалы, которые сейчас лучше всего представляют публичную витрину проекта."
            action={
              <Link
                href="/poetry"
                className="text-sm text-purple-300 hover:text-purple-200"
              >
                Смотреть контент →
              </Link>
            }
          />

          <div className="grid gap-5">
            {featuredWorks.map((work) =>
              work.category === "poetry" ? (
                <PoemCard key={work.id} work={work} />
              ) : (
                <ProseCard key={work.id} work={work} />
              )
            )}
          </div>
        </section>
      ) : null}

      {trendingWorks.length ? (
        <section className="mt-12">
          <SectionHeader
            eyebrow="Trending"
            title="Популярное сейчас"
            description="Материалы с наибольшим количеством просмотров среди опубликованного контента."
            action={
              <Link
                href="/prose"
                className="text-sm text-amber-300 hover:text-amber-200"
              >
                Открыть прозу →
              </Link>
            }
          />

          <div className="grid gap-5 xl:grid-cols-2">
            {trendingWorks.map((work) =>
              work.category === "poetry" ? (
                <PoemCard key={work.id} work={work} />
              ) : (
                <ProseCard key={work.id} work={work} />
              )
            )}
          </div>
        </section>
      ) : null}

      <section className="mt-12">
        <SectionHeader
          eyebrow="Poetry"
          title="Новая поэзия"
          action={
            <Link
              href="/poetry"
              className="text-sm text-purple-300 hover:text-purple-200"
            >
              Все →
            </Link>
          }
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {latestPoetry.map((work) => (
            <PoemCard key={work.id} work={work} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          eyebrow="Prose"
          title="Новая проза"
          action={
            <Link
              href="/prose"
              className="text-sm text-amber-300 hover:text-amber-200"
            >
              Все →
            </Link>
          }
        />

        <div className="grid gap-5">
          {latestProse.map((work) => (
            <ProseCard key={work.id} work={work} />
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-5 lg:grid-cols-2">
        <div className="glass rounded-[28px] border border-white/10 p-6">
          <SectionHeader
            eyebrow="Social"
            title="Социальные ссылки"
            description="Точки входа в авторские профили и публичные каналы."
          />

          <div className="grid gap-3">
            {activeSocialLinks.map((item) => (
              <TrackedLinkCard
                key={item.id}
                href={item.href}
                targetType="social"
                targetId={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-200 hover:text-white"
              >
                {item.icon ? `${item.icon} ` : ""}
                {item.label}
              </TrackedLinkCard>
            ))}

            {!activeSocialLinks.length ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-500">
                Активных социальных ссылок пока нет
              </div>
            ) : null}
          </div>
        </div>

        <div className="glass rounded-[28px] border border-white/10 p-6">
          <SectionHeader
            eyebrow="Referral"
            title="Продвижение и переходы"
            description="Быстрые CTA и переходы к дополнительным точкам вовлечения."
          />

          <div className="grid gap-3">
            {activeReferralLinks.map((item) => (
              <TrackedLinkCard
                key={item.id}
                href={item.href}
                targetType="referral"
                targetId={item.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-200 hover:text-white"
              >
                <div className="font-medium">{item.title}</div>
                {item.description ? (
                  <div className="mt-1 text-xs text-gray-400">
                    {item.description}
                  </div>
                ) : null}
              </TrackedLinkCard>
            ))}

            {!activeReferralLinks.length ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-500">
                Активных реферальных ссылок пока нет
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
