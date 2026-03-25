import { authorProfile } from "@/data/author-profile";
import {
  getPlatformLinksLive,
  getSocialLinksLive,
} from "@/lib/links-store";
import ProfileFeatureGrid from "@/components/public/ProfileFeatureGrid";
import TrackedLinkCard from "@/components/TrackedLinkCard";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [socialLinks, platformLinks] = await Promise.all([
    getSocialLinksLive(),
    getPlatformLinksLive(),
  ]);

  const activeSocialLinks = socialLinks.filter((item) => item.isActive);
  const activePlatforms = platformLinks.filter((item) => item.isActive).slice(0, 3);

  const telegramLink =
    activeSocialLinks.find((item) => item.id === "telegram") ||
    activeSocialLinks[0];

  const emailLink =
    activeSocialLinks.find((item) => item.id === "email") ||
    activeSocialLinks.find((item) => item.href.startsWith("mailto:"));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <section className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          Contact
        </p>
        <h1 className="text-4xl font-bold text-white sm:text-6xl">
          Контакты
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-gray-300">
          Основные точки входа для связи, сотрудничества и перехода к публичным
          площадкам автора.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-3 text-xs uppercase tracking-[0.18em] text-purple-200/70">
            Email
          </div>
          <h2 className="text-2xl font-semibold text-white">Email</h2>
          <p className="mt-3 text-sm leading-7 text-gray-400">
            Для вопросов сотрудничества, публикаций и содержательных обращений.
          </p>

          {emailLink ? (
            <TrackedLinkCard
              href={emailLink.href}
              targetType="social"
              targetId={emailLink.id}
              className="mt-5 inline-flex rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-gray-200 hover:text-white"
            >
              {emailLink.label}
            </TrackedLinkCard>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-3 text-xs uppercase tracking-[0.18em] text-purple-200/70">
            Telegram
          </div>
          <h2 className="text-2xl font-semibold text-white">Telegram</h2>
          <p className="mt-3 text-sm leading-7 text-gray-400">
            Быстрая точка входа для публичной коммуникации и актуальных ссылок.
          </p>

          {telegramLink ? (
            <TrackedLinkCard
              href={telegramLink.href}
              targetType="social"
              targetId={telegramLink.id}
              className="mt-5 inline-flex rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-gray-200 hover:text-white"
            >
              {telegramLink.icon ? `${telegramLink.icon} ` : ""}
              {telegramLink.label}
            </TrackedLinkCard>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-3 text-xs uppercase tracking-[0.18em] text-purple-200/70">
            Response
          </div>
          <h2 className="text-2xl font-semibold text-white">
            Время ответа
          </h2>
          <p className="mt-3 text-sm leading-7 text-gray-400">
            {authorProfile.responseTime}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
            Platforms
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Платформы и точки входа
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
            Основные площадки, где представлен авторский проект и его
            публичная витрина.
          </p>

          <div className="mt-5 grid gap-3">
            {activePlatforms.map((item) => (
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
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
            Social
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Социальные ссылки
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
            Публичные профили, через которые можно следить за обновлениями и
            авторскими публикациями.
          </p>

          <div className="mt-5 grid gap-3">
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
          </div>
        </div>
      </section>

      <div className="mt-8">
        <ProfileFeatureGrid
          eyebrow="Collaboration"
          title="По вопросам сотрудничества"
          description="Основные направления, по которым уместно выходить на связь."
          items={authorProfile.collaboration}
          accent="emerald"
        />
      </div>
    </div>
  );
}
