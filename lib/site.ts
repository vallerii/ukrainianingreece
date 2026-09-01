export const site = {
  name: "Об'єднана українська діаспора в Греції",
  shortName: "УДГ",
  slogan: "Разом ми — українська громада Греції",
  email: "info@ukrainianingreece.gr",
  phone: "+30 000 000 000",
  cities: ["Афіни", "Салоніки", "Крит", "Патри"],
  socials: [
    { label: "Facebook", short: "FB", href: "https://facebook.com" },
    { label: "Instagram", short: "IG", href: "https://instagram.com" },
    { label: "YouTube", short: "YT", href: "https://youtube.com" },
  ],
  languages: [
    { code: "ua", label: "Українська", flag: "🇺🇦" },
    { code: "en", label: "English", flag: "🇬🇧" },
  ],
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
    children: [
      { label: "Інформаційний центр", href: "/proyekty/info-tsentr", note: "Допомога та консультації" },
      { label: "Читацький клуб", href: "/proyekty/chytatskyi-klub", note: "Книги українською" },
      { label: "Школа «Трембіта»", href: "/proyekty/trembita", note: "Суботня школа, Афіни" },
      { label: "Школа «Крит»", href: "/proyekty/kryt", note: "Суботня школа, Крит" },
      { label: "Жіночий хор", href: "/proyekty/khor", note: "Українська пісня" },
    ],
  },
  { label: "Корисна інформація", href: "/korysno" },
  { label: "Контакти", href: "/kontakty" },
];

export const projects = [
  {
    n: "01",
    title: "Інформаційний центр",
    href: "/proyekty/info-tsentr",
    city: "Афіни · онлайн",
    text: "Перша точка контакту: документи, легалізація, житло, робота, медицина. Пояснюємо українською те, що грецька бюрократія пише грецькою.",
  },
  {
    n: "02",
    title: "Читацький клуб",
    href: "/proyekty/chytatskyi-klub",
    city: "Афіни",
    text: "Щомісячні зустрічі навколо української книги. Бібліотека, обговорення, зустрічі з авторами.",
  },
  {
    n: "03",
    title: "Суботня школа «Трембіта»",
    href: "/proyekty/trembita",
    city: "Афіни",
    text: "Українська мова, історія та культура для дітей діаспори. Щосуботи, від дошкільнят до підлітків.",
  },
  {
    n: "04",
    title: "Суботня школа «Крит»",
    href: "/proyekty/kryt",
    city: "Крит",
    text: "Освітній осередок для українських родин на острові. Мова, читання, творчі майстерні.",
  },
  {
    n: "05",
    title: "Жіночий хор",
    href: "/proyekty/khor",
    city: "Афіни · Салоніки",
    text: "Українська пісня на грецькій сцені: концерти, фестивалі, спільні виступи з грецькими колективами.",
  },
];

export const founders = [
  { name: "Спілка українців Греції", city: "Афіни", href: "/pro-nas#zasnovnyky", hue: 210 },
  { name: "Школа «Трембіта»", city: "Афіни", href: "/pro-nas#zasnovnyky", hue: 44 },
  { name: "Українська громада Криту", city: "Ханья", href: "/pro-nas#zasnovnyky", hue: 195 },
  { name: "Культурний центр «Дніпро»", city: "Салоніки", href: "/pro-nas#zasnovnyky", hue: 32 },
  { name: "Ініціатива «Разом»", city: "Патри", href: "/pro-nas#zasnovnyky", hue: 225 },
];

export const events = [
  {
    day: "14",
    month: "вересня",
    year: "2026",
    title: "День української культури в Афінах",
    place: "Технополіс, Афіни",
    time: "12:00 — 20:00",
    tag: "Фестиваль",
    href: "/podiyi",
  },
  {
    day: "21",
    month: "вересня",
    year: "2026",
    title: "Відкриття навчального року в школі «Трембіта»",
    place: "Афіни, Кіпселі",
    time: "10:00",
    tag: "Освіта",
    href: "/podiyi",
  },
  {
    day: "05",
    month: "жовтня",
    year: "2026",
    title: "Читацький клуб: сучасна українська проза",
    place: "Бібліотека, Афіни",
    time: "18:30",
    tag: "Клуб",
    href: "/podiyi",
  },
  {
    day: "19",
    month: "жовтня",
    year: "2026",
    title: "Консультаційний день: документи та легалізація",
    place: "Онлайн",
    time: "11:00 — 15:00",
    tag: "Підтримка",
    href: "/podiyi",
  },
];

export const news = [
  {
    date: "28 серпня 2026",
    tag: "Спільнота",
    title: "П'ять організацій підписали меморандум про об'єднання",
    text: "Українські спільноти Афін, Салонік і Криту домовилися працювати як єдина мережа — з одним голосом перед грецькою владою.",
    href: "/novyny",
    hue: 212,
  },
  {
    date: "12 серпня 2026",
    tag: "Освіта",
    title: "Суботні школи готуються до нового навчального року",
    text: "Понад 180 дітей, чотири міста, нові вчителі та оновлена програма з української літератури.",
    href: "/novyny",
    hue: 42,
  },
  {
    date: "30 липня 2026",
    tag: "Культура",
    title: "Жіночий хор виступив на фестивалі в Салоніках",
    text: "Українські пісні вперше прозвучали на головній сцені міського фестивалю разом із грецькими колективами.",
    href: "/novyny",
    hue: 198,
  },
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
