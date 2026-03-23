import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function AdminPageHeader({
  eyebrow = "Admin",
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <section className="mb-8 flex flex-col gap-4 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
      <div className="min-w-0">
        <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-bold text-white sm:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex flex-wrap gap-3">{actions}</div>
      ) : null}
    </section>
  );
}
