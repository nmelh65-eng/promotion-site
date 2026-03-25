import Link from "next/link";
import { authorProfile } from "@/data/author-profile";
import { getSocialLinksLive } from "@/lib/links-store";
import AuthorProfileCard from "@/components/public/AuthorProfileCard";
import ProfileFeatureGrid from "@/components/public/ProfileFeatureGrid";
import TrackedLinkCard from "@/components/TrackedLinkCard";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const socialLinks = (await getSocialLinksLive()).filter((item) => item.isActive);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <section className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          About
        </p>
        <h1 className="text-4xl font-bold text-white sm:text-6xl">Обо мне</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-gray-300">
          Публичная авторская витрина, литературный контент и цифровая среда,
          в которой тексты получают структуру, видимость и устойчивое
          присутствие.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <AuthorProfileCard
          actions={
            <>
              <Link
                href="/contact"
                className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white"
              >
                Связаться
              </Link>
              <Link
                href="/links"
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-gray-200"
              >
                Открыть links hub
              </Link>
            </>
          }
        />

        <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
            Author Story
          </p>
          <h2 className="text-3xl font-semibold text-white">
            О проекте и подаче
          </h2>

          <div className="mt-5 grid gap-5">
            {authorProfile.longBio.map((paragraph, index) => (
              <p
                key={index}
                className="text-sm leading-8 text-gray-300"
              >
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-gray-400">
              Где читать и следить
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {socialLinks.map((item) => (
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
      </section>

      <div className="mt-8">
        <ProfileFeatureGrid
          eyebrow="Focus"
          title="Фокус и направления"
          description="Основные смысловые и контентные линии, вокруг которых строится авторская витрина."
          items={authorProfile.focusAreas}
          accent="purple"
        />
      </div>

      <div className="mt-8">
        <ProfileFeatureGrid
          eyebrow="Principles"
          title="Принципы работы"
          description="То, как выстраивается литературная подача, редакционная логика и публичная структура проекта."
          items={authorProfile.principles}
          accent="amber"
        />
      </div>
    </div>
  );
}
