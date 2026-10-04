import { satellites } from "./projects";

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
    // пункти меню — з lib/projects.ts (єдине джерело для проєктів-сателітів)
    children: satellites.map((p) => ({ label: p.navLabel, href: `/proyekty/${p.slug}`, note: p.note })),
  },
  { label: "Корисна інформація", href: "/korysno" },
  { label: "Контакти", href: "/kontakty" },
];

/** Проєкти-сателіти для блоку на головній (дані — у lib/projects.ts). */
export const projects = satellites.map((p, i) => ({
  n: String(i + 1).padStart(2, "0"),
  title: p.title,
  href: `/proyekty/${p.slug}`,
  city: p.city,
  text: p.summary,
  logo: p.logo,
}));

export const founders = [
  { name: "Спілка українців Греції", city: "Афіни", href: "/pro-nas#zasnovnyky", hue: 210 },
  { name: "Школа «Трембіта»", city: "Афіни", href: "/pro-nas#zasnovnyky", hue: 44 },
  { name: "Українська громада Криту", city: "Ханья", href: "/pro-nas#zasnovnyky", hue: 195 },
  { name: "Культурний центр «Дніпро»", city: "Салоніки", href: "/pro-nas#zasnovnyky", hue: 32 },
  { name: "Ініціатива «Разом»", city: "Патри", href: "/pro-nas#zasnovnyky", hue: 225 },
];



export const partners = [
  "Посольство України",
  "Δήμος Αθηναίων",
  "Greek Council for Refugees",
  "UNHCR Greece",
  "Каритас Еллас",
  "Українська Всесвітня Координаційна Рада",
];

export const stats = [
  { value: "5", label: "організацій-засновників" },
  { value: "4", label: "міста присутності" },
  { value: "180+", label: "дітей у суботніх школах" },
  { value: "2022", label: "рік нової хвилі" },
];
