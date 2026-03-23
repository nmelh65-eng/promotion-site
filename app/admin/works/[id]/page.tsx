import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getAnyWorkByIdLive } from "@/lib/works-store";
import AdminNav from "@/components/admin/AdminNav";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import WorkForm from "@/components/admin/WorkForm";

export const dynamic = "force-dynamic";

export default async function AdminEditWorkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const work = await getAnyWorkByIdLive(id);

  if (!work) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16">
      <AdminNav current="works" />
      <AdminPageHeader
        eyebrow="Admin Content"
        title="Редактирование публикации"
        description={`ID: ${work.id} · Категория: ${work.category} · Просмотры: ${work.views || 0} · Лайки: ${work.likes || 0}`}
      />
      <WorkForm initialWork={work} />
    </div>
  );
}
