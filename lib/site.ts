import type { Dict } from "./i18n/dictionaries";

/** Незмінні дані. Тексти, що залежать від мови (назва, гасло, адреса), — у словниках t.site. */
export const site = {
  shortName: "УДГ",
  // контакти — з довідки організації (документ «UA Diaspora in Greece», жовтень 2026)
  email: "ukrdiasporagr@gmail.com",
  // основний телефон — за правкою клієнта 22.10.2026
  phone: "+30 697 653 3390",
  /** Офіс / Інформаційний центр, вул. Ферон 4 */
  office: { hours: "10:00–17:00" },
  founded: 2023,
  socials: [
    { label: "Facebook", short: "FB", icon: "facebook", href: "https://www.facebook.com/uadiasporaingreece/" },
    { label: "Instagram", short: "IG", icon: "instagram", href: "https://www.instagram.com/ukrdiasporagr/" },
    // YouTube — додати, коли буде відомо посилання на канал
  ] as const,
};

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; note?: string }[];
};

export function getNav(t: Dict): NavItem[] {
  const n = t.nav;
  return [
    {
      label: n.about,
      href: "/pro-nas",
      children: [
        { label: n.who, href: "/pro-nas#opys", note: n.whoNote },
        { label: n.goals, href: "/pro-nas#tsili", note: n.goalsNote },
        { label: n.history, href: "/pro-nas#istoriya", note: n.historyNote },
        { label: n.geo, href: "/pro-nas#geografiya", note: n.geoNote },
        { label: n.team, href: "/pro-nas#komanda", note: n.teamNote },
        { label: n.founders, href: "/pro-nas#zasnovnyky", note: n.foundersNote },
      ],
    },
    { label: n.news, href: "/novyny" },
    { label: n.blog, href: "/blog" },
    {
      label: n.events,
      href: "/podiyi",
      children: [
        { label: n.upcoming, href: "/podiyi", note: n.upcomingNote },
        { label: n.reports, href: "/podiyi/zvity", note: n.reportsNote },
      ],
    },
    // пункти «Проєкти» підставляються з DatoCMS у buildNav()
    { label: n.projects, href: "/proyekty", children: [] },
    { label: n.useful, href: "/korysno" },
    { label: n.contacts, href: "/kontakty" },
  ];
}

/** Меню з пунктами «Проєкти» з DatoCMS. */
export function buildNav(t: Dict, projects: { navLabel: string; note: string; slug: string }[]): NavItem[] {
  return getNav(t).map((item) =>
    item.href === "/proyekty"
      ? { ...item, children: projects.map((p) => ({ label: p.navLabel, href: `/proyekty/${p.slug}`, note: p.note })) }
      : item,
  );
}

/**
 * Цифри для «Про нас» (правка клієнта 18.10.2026 — лише дві).
 * Кількість засновників — з DatoCMS (Founder of the union).
 */
export const buildStats = (t: Dict, foundersCount: number) => [
  { value: String(foundersCount), label: t.stats.founders(foundersCount) },
  { value: "3", label: t.stats.cities },
];
