import { referrals } from "@/data/referrals";
import { socialLinks } from "@/data/social-links";

export default function LinksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16">
      <section className="glass rounded-[32px] border border-white/10 p-8 sm:p-12">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          Links
        </p>
        <h1 className="mb-5 text-4xl font-bold text-white sm:text-6xl">
          Ссылки и платформы
        </h1>
        <p className="mb-10 max-w-3xl text-base leading-8 text-gray-300 sm:text-lg">
          На этой странице будут собраны социальные платформы, внешние ресурсы,
          реферальные ссылки и другие точки продвижения бренда.
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Социальные ссылки
            </h2>
            <div className="grid gap-3">
              {socialLinks
                .filter((item) => item.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-200 hover:text-white"
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    {item.icon ? `${item.icon} ` : ""}
                    {item.label}
                  </a>
                ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Реферальные и промо-ссылки
            </h2>
            <div className="grid gap-3">
              {referrals
                .filter((item) => item.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-200 hover:text-white"
                  >
                    <div className="font-medium">{item.title}</div>
                    {item.description ? (
                      <div className="mt-1 text-xs text-gray-400">
                        {item.description}
                      </div>
                    ) : null}
                  </a>
                ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
