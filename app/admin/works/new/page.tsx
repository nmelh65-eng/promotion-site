import { requireAdmin } from "@/lib/admin-auth";
import AdminNav from "@/components/admin/AdminNav";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import WorkForm from "@/components/admin/WorkForm";

export default async function AdminNewWorkPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16">
      <AdminNav current="works" />
      <AdminPageHeader
        eyebrow="Admin Content"
        title="Новая публикация"
        description="Создай новый текст, укажи категорию, статус и описание. После сохранения откроется страница редактирования."
      />
      <WorkForm />
    </div>
  );
}
