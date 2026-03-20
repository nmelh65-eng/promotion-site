import type { ReferralLink } from "@/types";

export const referrals: ReferralLink[] = [
  {
    id: "ref-001",
    title: "Поддержать автора",
    description: "Страница поддержки и благодарности за творчество.",
    href: "#",
    code: "",
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    clicks: 0,
  },
  {
    id: "ref-002",
    title: "Читать новые публикации",
    description: "Быстрый переход к новым материалам и подборкам.",
    href: "/poetry",
    code: "",
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
    clicks: 0,
  },
];
