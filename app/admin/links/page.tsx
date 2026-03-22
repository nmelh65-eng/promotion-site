import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getPlatformLinksLive,
  getReferralLinksLive,
  getSocialLinksLive,
} from "@/lib/links-store";
import LinksCollectionForm from "@/components/admin/LinksCollectionForm";

export const dynamic = "force-dynamic";

export default async function AdminLinksPage() {
  await requireAdmin();

  const [social, platform, referral] = await Promise.all([
    getSocialLinksLive(),
    getPlatformLinksLive(),
    getReferralLinksLive(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <section className="mb-8 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
            Admin Links
          </p>
          <h1 className="text-3xl font-bold text-white sm:text-5xl">
            Управление ссылками
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            Здесь редактируются live-коллекции social, platform и referral
            links.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-200"
          >
            Dashboard
          </Link>
          <Link
            href="/links"
            className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-sm text-purple-200"
          >
            Открыть публичную страницу
          </Link>
        </div>
      </section>

      <div className="grid gap-8">
        <LinksCollectionForm
          type="social"
          title="Социальные ссылки"
          description="Используются на главной странице и на публичной странице ссылок."
          initialItems={social}
        />

        <LinksCollectionForm
          type="platform"
          title="Платформы"
          description="Карточки платформ, маркетплейсов, площадок и сервисов для продвижения."
          initialItems={platform}
        />

        <LinksCollectionForm
          type="referral"
          title="Реферальные ссылки"
          description="Реферальные карточки и партнёрские переходы. Их клики также считаются в аналитике."
          initialItems={referral}
        />
      </div>
    </div>
  );
}
