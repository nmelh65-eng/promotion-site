import { requireAdmin } from "@/lib/admin-auth";
import {
  getPlatformLinksLive,
  getReferralLinksLive,
  getSocialLinksLive,
} from "@/lib/links-store";
import AdminNav from "@/components/admin/AdminNav";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
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
      <AdminNav current="links" />

      <AdminPageHeader
        eyebrow="Admin Links"
        title="Управление ссылками"
        description="Редактируй live-коллекции social, platform и referral links. Клики продолжают считаться в общей аналитике."
      />

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
