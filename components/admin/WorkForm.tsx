"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { WorkCategory, WorkItem } from "@/types";
import AdminDeleteWorkButton from "@/components/admin/AdminDeleteWorkButton";

interface WorkFormProps {
  initialWork?: WorkItem | null;
}

export default function WorkForm({ initialWork }: WorkFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialWork?.id);

  const [title, setTitle] = useState(initialWork?.title || "");
  const [excerpt, setExcerpt] = useState(initialWork?.excerpt || "");
  const [content, setContent] = useState(initialWork?.content || "");
  const [category, setCategory] = useState<WorkCategory>(
    initialWork?.category || "poetry"
  );
  const [tags, setTags] = useState((initialWork?.tags || []).join(", "));
  const [isPublished, setIsPublished] = useState(
    Boolean(initialWork?.isPublished)
  );
  const [isFeatured, setIsFeatured] = useState(
    Boolean(initialWork?.isFeatured)
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const modeLabel = useMemo(
    () => (isEdit ? "Редактирование публикации" : "Новая публикация"),
    [isEdit]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        id: initialWork?.id,
        title,
        excerpt,
        content,
        category,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isPublished,
        isFeatured,
      };

      const res = await fetch("/api/admin/works", {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result?.ok) {
        setError(result?.error || "Не удалось сохранить публикацию");
        return;
      }

      router.replace(`/admin/works/${result.data.id}`);
      router.refresh();
    } catch {
      setError("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <div className="mb-6">
        <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          Admin Content
        </p>
        <h1 className="text-3xl font-bold text-white sm:text-5xl">
          {modeLabel}
        </h1>
        {isEdit && initialWork ? (
          <p className="mt-3 text-sm text-gray-500">
            ID: {initialWork.id}
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid gap-2">
          <label className="text-sm text-gray-300">Заголовок</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-gray-300">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-gray-300">Категория</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as WorkCategory)}
            className="rounded-2xl border border-white/10 bg-[#11131b] px-4 py-3 text-white outline-none"
          >
            <option value="poetry">poetry</option>
            <option value="prose">prose</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-gray-300">Теги (через запятую)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-gray-300">Текст публикации</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
            required
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            Опубликовано
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            Featured
          </label>
        </div>

        {error ? <div className="text-sm text-red-400">{error}</div> : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 font-medium text-white disabled:opacity-70"
          >
            {saving ? "Сохранение..." : isEdit ? "Сохранить" : "Создать"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/works")}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-200"
          >
            Назад к списку
          </button>

          {isEdit && initialWork ? (
            <AdminDeleteWorkButton id={initialWork.id} />
          ) : null}
        </div>
      </form>
    </section>
  );
}
