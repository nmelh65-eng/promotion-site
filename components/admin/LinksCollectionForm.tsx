"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { LinkCollectionType } from "@/lib/links-store";

interface EditableLinkFormItem {
  id?: string;
  href?: string;
  sortOrder?: number;
  isActive?: boolean;
  icon?: string;
  label?: string;
  title?: string;
  description?: string;
}

interface LinksCollectionFormProps {
  type: LinkCollectionType;
  title: string;
  description: string;
  initialItems: EditableLinkFormItem[];
}

export default function LinksCollectionForm({
  type,
  title,
  description,
  initialItems,
}: LinksCollectionFormProps) {
  const router = useRouter();
  const [items, setItems] = useState<EditableLinkFormItem[]>(initialItems);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isSocial = type === "social";

  const totalItems = items.length;
  const activeItems = items.filter((item) => Boolean(item.isActive)).length;

  const subtitle = useMemo(() => {
    return `${totalItems} элементов · ${activeItems} активных`;
  }, [totalItems, activeItems]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function normalizeOrder(nextItems: EditableLinkFormItem[]) {
    return nextItems.map((item, index) => ({
      ...item,
      sortOrder: index + 1,
    }));
  }

  function updateItem(index: number, patch: Partial<EditableLinkFormItem>) {
    clearMessages();

    setItems((prev) =>
      prev.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      )
    );
  }

  function addItem() {
    clearMessages();

    setItems((prev) =>
      normalizeOrder([
        ...prev,
        isSocial
          ? {
              id: "",
              label: "",
              href: "",
              icon: "",
              sortOrder: prev.length + 1,
              isActive: true,
            }
          : {
              id: "",
              title: "",
              description: "",
              href: "",
              sortOrder: prev.length + 1,
              isActive: true,
            },
      ])
    );
  }

  function removeItem(index: number) {
    clearMessages();

    setItems((prev) =>
      normalizeOrder(
        prev.filter((_, currentIndex) => currentIndex !== index)
      )
    );
  }

  function moveItem(index: number, direction: -1 | 1) {
    clearMessages();

    setItems((prev) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= prev.length) {
        return prev;
      }

      const next = [...prev];
      const currentItem = next[index];
      next[index] = next[nextIndex];
      next[nextIndex] = currentItem;

      return normalizeOrder(next);
    });
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/admin/links", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          items,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result?.ok) {
        setError(result?.error || "Не удалось сохранить коллекцию");
        return;
      }

      setItems(result.data);
      setSuccess("Коллекция успешно сохранена");
      router.refresh();
    } catch {
      setError("Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
            Admin Links
          </p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
            {description}
          </p>
          <p className="mt-3 text-sm text-gray-500">{subtitle}</p>
          <p className="mt-3 text-xs text-gray-500">
            ID используется для аналитики кликов. Меняй его только если
            действительно хочешь новый идентификатор статистики.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={addItem}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-200"
          >
            Добавить элемент
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-70"
          >
            {saving ? "Сохранение..." : "Сохранить коллекцию"}
          </button>
        </div>
      </div>

      {success ? (
        <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {success}
        </div>
      ) : null}

      {error ? (
        <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5">
        {items.map((item, index) => (
          <div
            key={`${type}-${item.id || index}`}
            className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm uppercase tracking-[0.2em] text-gray-500">
                Элемент #{index + 1}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-200 disabled:opacity-40"
                >
                  ↑ Вверх
                </button>

                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === items.length - 1}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-gray-200 disabled:opacity-40"
                >
                  ↓ Вниз
                </button>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-300"
                >
                  Удалить
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-gray-300">ID</label>
                <input
                  value={item.id || ""}
                  onChange={(e) => updateItem(index, { id: e.target.value })}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
                />
              </div>

              {isSocial ? (
                <>
                  <div className="grid gap-2">
                    <label className="text-sm text-gray-300">Label</label>
                    <input
                      value={item.label || ""}
                      onChange={(e) =>
                        updateItem(index, { label: e.target.value })
                      }
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm text-gray-300">Icon</label>
                    <input
                      value={item.icon || ""}
                      onChange={(e) =>
                        updateItem(index, { icon: e.target.value })
                      }
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-2">
                    <label className="text-sm text-gray-300">Title</label>
                    <input
                      value={item.title || ""}
                      onChange={(e) =>
                        updateItem(index, { title: e.target.value })
                      }
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm text-gray-300">Description</label>
                    <textarea
                      value={item.description || ""}
                      onChange={(e) =>
                        updateItem(index, { description: e.target.value })
                      }
                      rows={3}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
                    />
                  </div>
                </>
              )}

              <div className="grid gap-2">
                <label className="text-sm text-gray-300">Href</label>
                <input
                  value={item.href || ""}
                  onChange={(e) => updateItem(index, { href: e.target.value })}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-gray-300">Sort order</label>
                  <input
                    type="number"
                    value={item.sortOrder ?? index + 1}
                    onChange={(e) =>
                      updateItem(index, {
                        sortOrder: Number(e.target.value || index + 1),
                      })
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={Boolean(item.isActive)}
                      onChange={(e) =>
                        updateItem(index, { isActive: e.target.checked })
                      }
                    />
                    Активно
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!items.length ? (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-gray-500">
            В коллекции пока нет элементов. Добавь первый элемент и сохрани
            коллекцию.
          </div>
        ) : null}
      </div>
    </section>
  );
}
