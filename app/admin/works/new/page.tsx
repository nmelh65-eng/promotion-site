import { requireAdmin } from "@/lib/admin-auth";
import WorkForm from "@/components/admin/WorkForm";

export default async function AdminNewWorkPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16">
      <WorkForm />
    </div>
  );
}
