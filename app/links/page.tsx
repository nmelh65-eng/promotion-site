import type { Metadata } from "next";
import TrackedLinkCard from "@/components/TrackedLinkCard";
import {
  getPlatformLinksLive,
  getReferralLinksLive,
  getSocialLinksLive,
} from "@/lib/links-store";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Ссылки и платформы",
  description:
    "Актуальные социальные ссылки, платформы и реферальные переходы автора на одной странице.",
  path: "/links",
  keywords: [
    "ссылки",
    "платформы",
    "реферальные ссылки",
    "социальные сети",
    "автор",
  ],
});

export default async function LinksPage() {
  const [socialLinks, platformLinks, referralLinks] = await Promise.all([
    getSocialLinksLive(),
    getPlatformLinksLive(),
    getReferralLinksLive(),
  ]);

  const activeSocialLinks = socialLinks.filter((item) => item.isActive);
  const activePlatformLinks = platformLinks.filter((item) => item.isActive);
  const activeReferralLinks = referralLinks.filter((item) => item.isActive);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <section className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          Links Hub
        </p>
        <h1 className="text-4xl font-bold text-white sm:text-6xl">
          Ссылки и платформы
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-gray-300">
          Здесь собраны все актуальные ссылки: социальные профили, платформы и
          реферальные переходы. Все клики считаются в live-аналитике.
        </p>
      </section>

      <div className="grid gap-8 xl:grid-cols-3">
        <section className="glass rounded-[28px] border border-white/10 p-6">
          <h2 className="mb-4 text-2xl font-semibold text-white">
            Социальные ссылки
          </h2>

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
        </section>

        <section className="glass rounded-[28px] border border-white/10 p-6">
          <h2 className="mb-4 text-2xl font-semibold text-white">Платформы</h2>

          <div className="grid gap-3">
            {activePlatformLinks.map((item) => (
              <TrackedLinkCard
                key={item.id}
                href={item.href}
                targetType="platform"
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

            {!activePlatformLinks.length ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-500">
                Активных платформ пока нет
              </div>
            ) : null}
          </div>
        </section>

        <section className="glass rounded-[28px] border border-white/10 p-6">
          <h2 className="mb-4 text-2xl font-semibold text-white">
            Реферальные ссылки
          </h2>

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
        </section>
      </div>
    </div>
  );
}
