import Link from "next/link";

interface EmptyWorksStateProps {
  title: string;
  description: string;
  resetHref: string;
}

export default function EmptyWorksState({
  title,
  description,
  resetHref,
}: EmptyWorksStateProps) {
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

      <div className="mt-6">
        <Link
          href={resetHref}
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-gray-200"
        >
          Сбросить фильтры
        </Link>
      </div>
    </section>
  );
}
