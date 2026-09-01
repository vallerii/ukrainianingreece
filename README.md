# Об'єднана українська діаспора в Греції

Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + Motion (Framer Motion 12).

## Запуск

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # продакшн-збірка
npm start
```

> Якщо папка `node_modules` вже існує і встановлення обірвалося — видаліть її
> і запустіть `npm install` заново.

## Структура

```
app/
  layout.tsx          Header + Footer, шрифти, метадані
  page.tsx            Головна сторінка (склад секцій)
  globals.css         Дизайн-система: кольори, типографіка, утиліти
  <розділ>/page.tsx   Заглушки внутрішніх сторінок (структура сайту)
components/
  layout/Header.tsx   Шапка: utility-бар, мега-меню, мобільне меню
  layout/Footer.tsx   Підвал: всі розділи, контакти, розсилка
  home/Hero.tsx       Багатошаровий паралакс-герой (миша + скрол)
  home/About.tsx      Про нас, місія/візія/цінності, засновники, цифри
  home/Projects.tsx   Проєкти-сателіти (список + прев'ю за курсором)
  home/Events.tsx     Прийдешні події
  home/News.tsx       Новини
  home/Partners.tsx   Стрічка партнерів
  home/JoinCta.tsx    Заклик долучитися
  ui/                 Reveal, SectionHead, Placeholder
lib/site.ts           ВЕСЬ КОНТЕНТ І НАВІГАЦІЯ — редагувати тут
```

## Що редагувати найчастіше

- **`lib/site.ts`** — меню, проєкти, події, новини, партнери, цифри, контакти.
- **`app/globals.css`** — палітра (`--color-sky-*`, `--color-wheat-*`), шрифти.
- **`components/home/Hero.tsx`** — шари паралаксу. Кожен шар обгорнутий у
  `<Layer depth={...}>`: більший `depth` = сильніший рух. Щоб замінити
  ілюстрацію на фото — покладіть зображення в `public/images/` і підставте
  `<img>`/`next/image` замість SVG усередині відповідного `<Layer>`.

## Логотип

Тимчасовий логотип — коло синій/жовтий з ініціалами, у `Header.tsx` і
`Footer.tsx` (компонент `Logo`). Замініть на `next/image` з файлом у `public/`.

## Шрифти

Unbounded (заголовки) + Manrope (текст) підключені через Google Fonts у
`app/layout.tsx`. Для повної автономності можна перевести на `next/font/local`.
