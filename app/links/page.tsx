import { referrals } from "@/data/referrals";
import { socialLinks } from "@/data/social-links";
import { platformLinks } from "@/data/links";
import TrackedExternalLink from "@/components/TrackedExternalLink";

export default function LinksPage() {
  const activeSocialLinks = socialLinks
    .filter((item) => item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const activePlatformLinks = platformLinks
    .filter((item) => item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const activeReferrals = referrals
    .filter((item) => item.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <section className="glass rounded-[32px] border border-white/10 p-8 sm:p-12">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          Links
        </p>
        <h1 className="mb-5 text-4xl font-bold text-white sm:text-6xl">
          Ссылки и платформы
        </h1>
        <p className="mb-10 max-w-3xl text-base leading-8 text-gray-300 sm:text-lg">
          Здесь собраны основные точки продвижения: социальные ссылки, платформы,
          внешние переходы и реферальные материалы.
        </p>

        <div className="grid gap-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Социальные ссылки
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeSocialLinks.map((item) => (
                <TrackedExternalLink
                  key={item.id}
                  href={item.href}
                  targetType="social"
                  targetId={item.id}
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 text-gray-200 transition-colors hover:border-purple-400/25 hover:text-white"
                >
                  <div className="font-medium">
                    {item.icon ? `${item.icon} ` : ""}
                    {item.label}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Перейти к каналу или странице
                  </div>
                </TrackedExternalLink>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Платформы
            </h2>

            <div className="grid gap-4 lg:grid-cols-2">
              {activePlatformLinks.map((item) => (
                <TrackedExternalLink
                  key={item.id}
                  href={item.href}
                  targetType="platform"
                  targetId={item.id}
                  className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 text-gray-200 transition-colors hover:border-amber-400/25 hover:text-white"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold">
                        {item.icon ? `${item.icon} ` : ""}
                        {item.title}
                      </div>

                      {item.description ? (
                        <div className="mt-2 text-sm leading-7 text-gray-400">
                          {item.description}
                        </div>
                      ) : null}

                      {item.tags?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-gray-400"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-200">
                      {item.buttonLabel || "Открыть"}
                    </div>
                  </div>
                </TrackedExternalLink>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Реферальные и промо-ссылки
            </h2>

            <div className="grid gap-4 lg:grid-cols-2">
              {activeReferrals.map((item) => (
                <TrackedExternalLink
                  key={item.id}
                  href={item.href}
                  targetType="referral"
                  targetId={item.id}
                  className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 text-gray-200 transition-colors hover:border-purple-400/25 hover:text-white"
                >
                  <div className="font-semibold text-lg">{item.title}</div>

                  {item.description ? (
                    <div className="mt-2 text-sm leading-7 text-gray-400">
                      {item.description}
                    </div>
                  ) : null}

                  <div className="mt-4 text-sm text-purple-200">
                    Перейти →
                  </div>
                </TrackedExternalLink>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
