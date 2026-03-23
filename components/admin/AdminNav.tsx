import Link from "next/link";
import AdminLogoutButton from "@/components/admin/AdminLogoutButton";

type AdminSection = "dashboard" | "works" | "links";

interface AdminNavProps {
  current: AdminSection;
}

const navItems: Array<{
  key: AdminSection;
  href: string;
  label: string;
  description: string;
}> = [
  {
    key: "dashboard",
    href: "/admin",
    label: "Dashboard",
    description: "Общая сводка",
  },
  {
    key: "works",
    href: "/admin/works",
    label: "Публикации",
    description: "Тексты и материалы",
  },
  {
    key: "links",
    href: "/admin/links",
    label: "Ссылки",
    description: "Social, platform, referral",
  },
];

function itemClass(active: boolean): string {
  return (
    "rounded-[24px] border px-4 py-4 transition-colors " +
    (active
      ? "border-purple-400/30 bg-purple-500/10"
      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]")
  );
}

export default function AdminNav({ current }: AdminNavProps) {
  return (
    <section className="mb-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="mb-4">
          <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
            Admin Navigation
          </p>
          <h2 className="text-2xl font-semibold text-white">
            Быстрый доступ
          </h2>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {navItems.map((item) => {
            const active = item.key === current;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={itemClass(active)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-white">{item.label}</div>
                  {active ? (
                    <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-purple-200">
                      active
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  {item.description}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="mb-4">
          <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
            Quick Actions
          </p>
          <h2 className="text-2xl font-semibold text-white">
            Действия
          </h2>
        </div>

        <div className="grid gap-3">
          <Link
            href="/admin/works/new"
            className="rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 px-5 py-3 text-sm font-medium text-white"
          >
            Новая публикация
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-gray-200"
          >
            Открыть сайт
          </Link>

          <Link
            href="/links"
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-gray-200"
          >
            Открыть links page
          </Link>

          <AdminLogoutButton />
        </div>
      </div>
    </section>
  );
}
