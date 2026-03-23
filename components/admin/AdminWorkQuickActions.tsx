"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface AdminWorkQuickActionsProps {
  id: string;
  initialPublished: boolean;
  initialFeatured: boolean;
}

export default function AdminWorkQuickActions({
  id,
  initialPublished,
  initialFeatured,
}: AdminWorkQuickActionsProps) {
  const router = useRouter();
  const [published, setPublished] = useState(Boolean(initialPublished));
  const [featured, setFeatured] = useState(Boolean(initialFeatured));
  const [loading, setLoading] = useState(false);

  async function patchWork(next: {
    isPublished?: boolean;
    isFeatured?: boolean;
  }) {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/works", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...next,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result?.ok) {
        window.alert(result?.error || "Не удалось обновить статус");
        return;
      }

      setPublished(Boolean(result.data.isPublished));
      setFeatured(Boolean(result.data.isFeatured));
      router.refresh();
    } catch {
      window.alert("Ошибка обновления статуса");
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePublished() {
    if (loading) return;

    if (published) {
      await patchWork({
        isPublished: false,
        isFeatured: false,
      });
      return;
    }

    await patchWork({
      isPublished: true,
      isFeatured: featured,
    });
  }

  async function handleToggleFeatured() {
    if (loading || !published) return;

    await patchWork({
      isPublished: true,
      isFeatured: !featured,
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleTogglePublished}
        disabled={loading}
        className={
          "rounded-2xl px-4 py-2.5 text-sm " +
          (published
            ? "border border-amber-400/20 bg-amber-500/10 text-amber-300"
            : "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300")
        }
      >
        {loading
          ? "Обновление..."
          : published
            ? "Снять с публикации"
            : "Опубликовать"}
      </button>

      <button
        type="button"
        onClick={handleToggleFeatured}
        disabled={loading || !published}
        className={
          "rounded-2xl px-4 py-2.5 text-sm disabled:opacity-40 " +
          (featured
            ? "border border-purple-400/20 bg-purple-500/10 text-purple-200"
            : "border border-white/10 bg-white/[0.03] text-gray-200")
        }
      >
        {featured ? "Убрать featured" : "Сделать featured"}
      </button>
    </div>
  );
}
