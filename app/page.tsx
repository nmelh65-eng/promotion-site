import Link from "next/link";
import { getWorksByCategoryLive } from "@/lib/works-store";
import {
  getReferralLinksLive,
  getSocialLinksLive,
} from "@/lib/links-store";
import PoemCard from "@/components/PoemCard";
import ProseCard from "@/components/ProseCard";
import TrackedLinkCard from "@/components/TrackedLinkCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [poetry, prose, socialLinks, referralLinks] = await Promise.all([
    getWorksByCategoryLive("poetry"),
    getWorksByCategoryLive("prose"),
    getSocialLinksLive(),
    getReferralLinksLive(),
  ]);

  const latestPoetry = poetry.slice(0, 2);
  const latestProse = prose.slice(0, 1);
  const activeSocialLinks = socialLinks.filter((item) => item.isActive);
  const activeReferralLinks = referralLinks.filter((item) => item.isActive);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] px-6 py-14 text-center sm:px-10 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18),transparent_45%)]" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
            Promotion Site
          </p>
          <h1 className="mb-5 text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="gradient-text">Авторский сайт продвижения</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base leading-8 text-gray-300 sm:text-lg">
            Публичный сайт для публикаций, ссылок, платформ, реферальных
            материалов и роста авторского бренда.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/poetry"
              className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-6 py-3.5 font-medium text-white"
            >
              Смотреть поэзию
            </Link>
            <Link
              href="/links"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3.5 font-medium text-gray-200"
            >
              Ссылки и платформы
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold text-white">Новая поэзия</h2>
          <Link
            href="/poetry"
            className="text-sm text-purple-300 hover:text-purple-200"
          >
            Все →
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {latestPoetry.map((work) => (
            <PoemCard key={work.id} work={work} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-semibold text-white">Новая проза</h2>
          <Link
            href="/prose"
            className="text-sm text-amber-300 hover:text-amber-200"
          >
            Все →
          </Link>
        </div>

        <div className="grid gap-5">
          {latestProse.map((work) => (
            <ProseCard key={work.id} work={work} />
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-5 lg:grid-cols-2">
        <div className="glass rounded-[28px] border border-white/10 p-6">
          <h3 className="mb-4 text-2xl font-semibold text-white">
            Социальные ссылки
          </h3>
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
          <h3 className="mb-4 text-2xl font-semibold text-white">
            Продвижение и переходы
          </h3>
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
