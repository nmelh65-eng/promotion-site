import type { ReactNode } from "react";

interface AdminEmptyStateProps {
  title: string;
  description: string;
  actions?: ReactNode;
}

export default function AdminEmptyState({
  title,
  description,
  actions,
}: AdminEmptyStateProps) {
  return (
    <section className="rounded-[32px] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center sm:p-10">
      <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
        Empty State
      </p>
      <h2 className="text-2xl font-semibold text-white sm:text-3xl">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-400">
        {description}
      </p>

      {actions ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {actions}
        </div>
      ) : null}
    </section>
  );
}
