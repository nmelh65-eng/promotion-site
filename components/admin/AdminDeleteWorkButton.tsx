"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminDeleteWorkButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm("Удалить публикацию?");
    if (!confirmed) return;

    try {
      setLoading(true);

      const res = await fetch(`/api/admin/works?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok || !result?.ok) {
        window.alert(result?.error || "Не удалось удалить публикацию");
        return;
      }

      router.replace("/admin/works");
      router.refresh();
    } catch {
      window.alert("Ошибка удаления");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300 transition-colors hover:bg-red-500/15"
    >
      {loading ? "Удаление..." : "Удалить"}
    </button>
  );
}
