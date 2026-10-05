import { plural } from "./projects";

export const site = {
  name: "Об'єднана українська діаспора в Греції",
  shortName: "УДГ",
  slogan: "Разом ми — українська громада Греції",
  // контакти — з профілю організації у Світовому конгресі українців (ukrainianworldcongress.org), жовтень 2026
  email: "infoukrainiandiaspora@gmail.com",
  phone: "+30 697 352 0645",
  address: "Feron 4, Athens 104 34",
  cities: ["Афіни", "Салоніки", "Крит", "Патри"],
  socials: [
    { label: "Facebook", short: "FB", icon: "facebook", href: "https://www.facebook.com/uadiasporaingreece/" },
    // Instagram / YouTube — додати, коли буде відомо посилання
  ] as const,
  languages: [
    { code: "uk", short: "UA", label: "Українська" },
    { code: "en", short: "EN", label: "English" },
    { code: "el", short: "GR", label: "Ελληνικά" },
  ] as const,
};

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; note?: string }[];
};

export const nav: NavItem[] = [
  {
    label: "Про нас",
    href: "/pro-nas",
    children: [
      { label: "Хто ми є", href: "/pro-nas#opys", note: "Місія, візія, цінності" },
      { label: "Цілі", href: "/pro-nas#tsili", note: "Що ми робимо щодня" },
      { label: "Історія", href: "/pro-nas#istoriya", note: "Як усе почалося" },
      { label: "Географія", href: "/pro-nas#geografiya", note: "Де ми присутні" },
      { label: "Команда", href: "/pro-nas#komanda", note: "Люди спільноти" },
      { label: "Засновники", href: "/pro-nas#zasnovnyky", note: "Організації-партнери" },
    ],
  },
  { label: "Новини", href: "/novyny" },
  {
    label: "Події та звіти",
    href: "/podiyi",
    children: [
      { label: "Прийдешні події", href: "/podiyi", note: "Календар спільноти" },
      { label: "Звіти", href: "/podiyi/zvity", note: "Прозорість і результати" },
    ],
  },
  {
    label: "Проєкти",
    href: "/proyekty",
    // пункти меню підставляються з DatoCMS у buildNav()
    children: [],
  },
  { label: "Корисна інформація", href: "/korysno" },
  { label: "Контакти", href: "/kontakty" },
];





export const partners = [
  "Посольство України",
  "Δήμος Αθηναίων",
  "Greek Council for Refugees",
  "UNHCR Greece",
  "Каритас Еллас",
  "Українська Всесвітня Координаційна Рада",
];

/** Меню з пунктами «Проєкти» з DatoCMS. */
export function buildNav(projects: { navLabel: string; note: string; slug: string }[]): NavItem[] {
  return nav.map((item) =>
    item.href === "/proyekty"
      ? { ...item, children: projects.map((p) => ({ label: p.navLabel, href: `/proyekty/${p.slug}`, note: p.note })) }
      : item,
  );
}

/** Цифри для «Про нас». Кількість засновників — з DatoCMS (Founder of the union). */
export const buildStats = (foundersCount: number) => [
  {
    value: String(foundersCount),
    label: plural(foundersCount, ["організація-засновник", "організації-засновники", "організацій-засновників"]),
  },
  { value: "4", label: "міста присутності" },
  { value: "180+", label: "дітей у суботніх школах" },
  { value: "2022", label: "рік нової хвилі" },
];
