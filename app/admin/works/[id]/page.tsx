import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getAnyWorkByIdLive } from "@/lib/works-store";
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
      <WorkForm initialWork={work} />
    </div>
  );
}
