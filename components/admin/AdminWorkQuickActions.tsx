"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ModerationState } from "@/lib/works-store";

interface AdminWorkQuickActionsProps {
  id: string;
  initialModerationState?: ModerationState;
  initialPublished: boolean;
  initialFeatured: boolean;
  initialHidden?: boolean;
}

function badgeClass(active: boolean, color: "purple" | "amber" | "emerald") {
  if (!active) {
    return "border border-white/10 bg-white/[0.03] text-gray-200";
  }

  if (color === "amber") {
    return "border border-amber-400/20 bg-amber-500/10 text-amber-300";
  }

  if (color === "emerald") {
    return "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
  }

  return "border border-purple-400/20 bg-purple-500/10 text-purple-200";
}

export default function AdminWorkQuickActions({
  id,
  initialModerationState,
  initialPublished,
  initialFeatured,
  initialHidden,
}: AdminWorkQuickActionsProps) {
  const router = useRouter();
  const [moderationState, setModerationState] = useState<ModerationState>(
    initialModerationState || (initialPublished ? "published" : "draft")
  );
  const [featured, setFeatured] = useState(Boolean(initialFeatured));
  const [hidden, setHidden] = useState(Boolean(initialHidden));
  const [loading, setLoading] = useState(false);

  const isPublished = moderationState === "published";

  async function patchWork(next: {
    moderationState?: ModerationState;
    isFeatured?: boolean;
    isHidden?: boolean;
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
        window.alert(result?.error || "Не удалось обновить moderation state");
        return;
      }

      setModerationState(result.data.moderationState || "draft");
      setFeatured(Boolean(result.data.isFeatured));
      setHidden(Boolean(result.data.isHidden));
      router.refresh();
    } catch {
      window.alert("Ошибка обновления moderation state");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <span className={"rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.18em] " + badgeClass(moderationState === "published", "emerald")}>
          published
        </span>
        <span className={"rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.18em] " + badgeClass(moderationState === "review", "purple")}>
          review
        </span>
        <span className={"rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.18em] " + badgeClass(moderationState === "draft", "amber")}>
          draft
        </span>
        <span className={"rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.18em] " + badgeClass(moderationState === "archived", "amber")}>
          archived
        </span>
        <span className={"rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.18em] " + badgeClass(hidden, "purple")}>
          hidden
        </span>
        <span className={"rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.18em] " + badgeClass(featured, "purple")}>
          featured
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || moderationState === "published"}
          onClick={() =>
            patchWork({
              moderationState: "published",
              isHidden: false,
            })
          }
          className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300 disabled:opacity-40"
        >
          {loading ? "Обновление..." : "Опубликовать"}
        </button>

        <button
          type="button"
          disabled={loading || moderationState === "review"}
          onClick={() =>
            patchWork({
              moderationState: "review",
              isFeatured: false,
              isHidden: false,
            })
          }
          className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-sm text-purple-200 disabled:opacity-40"
        >
          На review
        </button>

        <button
          type="button"
          disabled={loading || moderationState === "draft"}
          onClick={() =>
            patchWork({
              moderationState: "draft",
              isFeatured: false,
              isHidden: false,
            })
          }
          className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300 disabled:opacity-40"
        >
          В draft
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() =>
            patchWork({
              moderationState:
                moderationState === "archived" ? "draft" : "archived",
              isFeatured: false,
              isHidden: false,
            })
          }
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-200 disabled:opacity-40"
        >
          {moderationState === "archived" ? "Вернуть из архива" : "Архивировать"}
        </button>

        <button
          type="button"
          disabled={loading || !isPublished}
          onClick={() =>
            patchWork({
              moderationState: "published",
              isHidden: !hidden,
              isFeatured: hidden ? featured : false,
            })
          }
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-200 disabled:opacity-40"
        >
          {hidden ? "Показать публично" : "Скрыть из public"}
        </button>

        <button
          type="button"
          disabled={loading || !isPublished || hidden}
          onClick={() =>
            patchWork({
              moderationState: "published",
              isFeatured: !featured,
              isHidden: hidden,
            })
          }
          className="rounded-2xl border border-purple-400/20 bg-purple-500/10 px-4 py-2.5 text-sm text-purple-200 disabled:opacity-40"
        >
          {featured ? "Убрать featured" : "Сделать featured"}
        </button>
      </div>
    </div>
  );
}
