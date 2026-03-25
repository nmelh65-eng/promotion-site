import type { ReactNode } from "react";
import { authorProfile } from "@/data/author-profile";

interface AuthorProfileCardProps {
  actions?: ReactNode;
}

export default function AuthorProfileCard({
  actions,
}: AuthorProfileCardProps) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
        Author Profile
      </p>

      <h2 className="text-3xl font-bold text-white sm:text-4xl">
        {authorProfile.name}
      </h2>

      <div className="mt-4 flex flex-wrap gap-2">
        {authorProfile.roles.map((role) => (
          <span
            key={role}
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-gray-300"
          >
            {role}
          </span>
        ))}
      </div>

      <p className="mt-5 text-sm leading-7 text-gray-300">
        {authorProfile.shortBio}
      </p>

      <div className="mt-5 rounded-[24px] border border-purple-400/20 bg-purple-500/10 p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-purple-200">
          Mission
        </div>
        <div className="mt-2 text-sm leading-7 text-purple-100/90">
          {authorProfile.mission}
        </div>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-gray-400">
          Quote
        </div>
        <div className="mt-2 text-sm italic leading-7 text-gray-300">
          “{authorProfile.quote}”
        </div>
      </div>

      {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}
