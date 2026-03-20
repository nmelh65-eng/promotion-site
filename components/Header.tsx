import Link from "next/link";

const navItems = [
  { href: "/", label: "Главная" },
  { href: "/poetry", label: "Поэзия" },
  { href: "/prose", label: "Проза" },
  { href: "/links", label: "Ссылки" },
  { href: "/about", label: "Обо мне" },
  { href: "/contact", label: "Контакты" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0b12]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-purple-400/20 bg-white/[0.03] text-sm font-bold text-white">
                НМ
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-white">
                  Natalia Melkher
                </div>
                <div className="truncate text-xs uppercase tracking-[0.2em] text-gray-500">
                  Promotion Site
                </div>
              </div>
            </div>
          </Link>

          <nav className="hidden flex-wrap items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <nav className="mt-3 flex flex-wrap gap-2 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-gray-300 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
