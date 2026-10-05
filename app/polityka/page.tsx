import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/lib/site";
import PageHead from "@/components/cms/PageHead";

export const metadata: Metadata = {
  title: "Політика конфіденційності",
  description: "Як Об’єднана українська діаспора в Греції обробляє персональні дані відвідувачів сайту.",
};

/*
 * ⚠ ПЕРЕД ЗАПУСКОМ:
 *  1. Заповнити реквізити організації в CONTROLLER (юридична назва, реєстраційний номер, АФМ).
 *  2. Звірити список сервісів у розділі «Кому передаємо дані» з тим, що реально підключено
 *     (хостинг, сервіс розсилки).
 *  3. Дати текст на перевірку юристу — це шаблон, а не юридична консультація.
 */
const CONTROLLER = {
  name: site.name,
  legalName: "", // напр. «Σωματείο …» — офіційна назва з реєстру
  regNumber: "", // номер реєстрації організації
  address: site.address,
  email: site.email,
};
const UPDATED = "4 жовтня 2026";

const sections: { id: string; title: string; body: ReactNode }[] = [
  {
    id: "khto-my",
    title: "Хто відповідає за ваші дані",
    body: (
      <>
        <p>
          Контролер даних — {CONTROLLER.legalName || CONTROLLER.name}
          {CONTROLLER.regNumber && `, реєстраційний номер ${CONTROLLER.regNumber}`}, адреса: {CONTROLLER.address}.
        </p>
        <p>
          З усіх питань щодо персональних даних пишіть на{" "}
          <a href={`mailto:${CONTROLLER.email}`}>{CONTROLLER.email}</a>.
        </p>
      </>
    ),
  },
  {
    id: "yaki-dani",
    title: "Які дані ми отримуємо",
    body: (
      <>
        <p>Ми збираємо мінімум даних і лише тоді, коли ви самі щось робите на сайті:</p>
        <ul>
          <li>
            <strong>Перегляд сайту.</strong> Сервер хостингу автоматично фіксує технічні дані запиту: IP-адресу,
            тип браузера, час звернення. Ми не використовуємо рекламних чи аналітичних трекерів і не ставимо
            cookie для стеження.
          </li>
          <li>
            <strong>Донати.</strong> Оплата відбувається на захищеній сторінці Stripe. Ми отримуємо ваше ім’я,
            e-mail, суму й дату внеску. Дані банківської картки обробляє лише Stripe — ми їх не бачимо й не зберігаємо.
          </li>
          <li>
            <strong>Розсилка.</strong> Якщо ви підписалися на новини, ми зберігаємо ваш e-mail і дату підтвердження
            згоди.
          </li>
          <li>
            <strong>Листування.</strong> Коли ви пишете нам на пошту чи телефонуєте, ми бачимо ваші контакти та зміст
            звернення.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "navishcho",
    title: "Навіщо і на якій підставі",
    body: (
      <ul>
        <li>
          Робота сайту та його безпека — наш законний інтерес (ст. 6(1)(f) GDPR).
        </li>
        <li>
          Прийом донатів, надсилання квитанцій і бухгалтерський облік — виконання вашого запиту та юридичні
          обов’язки організації (ст. 6(1)(b), 6(1)(c) GDPR).
        </li>
        <li>Розсилка новин — ваша згода (ст. 6(1)(a) GDPR), яку можна відкликати будь-коли.</li>
        <li>Відповіді на звернення — ваш запит і наш законний інтерес допомогти.</li>
      </ul>
    ),
  },
  {
    id: "komu",
    title: "Кому ми передаємо дані",
    body: (
      <>
        <p>Ми не продаємо й не передаємо дані для реклами. Дані обробляють лише сервіси, без яких сайт не працює:</p>
        <ul>
          <li>
            <strong>Stripe</strong> — платежі (донати).
          </li>
          <li>
            <strong>Хостинг сайту</strong> — технічні журнали відвідувань.
          </li>
          <li>
            <strong>DatoCMS</strong> — система керування вмістом; зображення сайту завантажуються з її сервера.
          </li>
          <li>
            <strong>Сервіс розсилки</strong> — якщо ви підписалися на новини.
          </li>
          <li>
            <strong>OpenStreetMap</strong> — карта місця на сторінках подій завантажується з їхнього сервера.
          </li>
        </ul>
        <p>
          Деякі з цих сервісів можуть обробляти дані за межами ЄС. У таких випадках передача відбувається на підставі
          стандартних договірних положень Європейської комісії або рішення про належний рівень захисту.
        </p>
      </>
    ),
  },
  {
    id: "skilky",
    title: "Як довго зберігаємо",
    body: (
      <ul>
        <li>Дані про донати — стільки, скільки вимагає грецьке законодавство щодо бухгалтерського обліку.</li>
        <li>E-mail для розсилки — доки ви не відпишетеся.</li>
        <li>Листування — доки це потрібно для відповіді, але не довше двох років.</li>
        <li>Технічні журнали хостингу — згідно з налаштуваннями провайдера, зазвичай кілька тижнів.</li>
      </ul>
    ),
  },
  {
    id: "prava",
    title: "Ваші права",
    body: (
      <>
        <p>Відповідно до GDPR ви можете в будь-який момент:</p>
        <ul>
          <li>дізнатися, які ваші дані ми маємо, і отримати їх копію;</li>
          <li>виправити неточні дані;</li>
          <li>попросити видалити дані;</li>
          <li>обмежити обробку або заперечити проти неї;</li>
          <li>відкликати згоду на розсилку — посиланням «Відписатися» в кожному листі;</li>
          <li>отримати дані у зручному форматі для передачі іншій організації.</li>
        </ul>
        <p>
          Напишіть на <a href={`mailto:${CONTROLLER.email}`}>{CONTROLLER.email}</a> — відповімо протягом місяця.
          Якщо вважаєте, що ваші права порушено, ви можете поскаржитися до Грецького органу захисту персональних даних
          (Αρχή Προστασίας Δεδομένων Προσωπικού Χαρακτήρα) —{" "}
          <a href="https://www.dpa.gr" target="_blank" rel="noopener noreferrer">
            www.dpa.gr
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "zminy",
    title: "Зміни політики",
    body: (
      <p>
        Якщо ми змінимо цю політику, нова редакція з’явиться на цій сторінці з оновленою датою. Про суттєві зміни
        повідомимо підписників розсилки.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <>
      <PageHead
        eyebrow="Документи"
        title="Політика конфіденційності"
        lead="Коротко: ми збираємо мінімум даних, не стежимо за вами і не передаємо дані для реклами."
      >
        <p className="mt-6 text-sm text-mute">Редакція від {UPDATED}</p>
      </PageHead>

      <section className="bg-paper pb-28 pt-14 md:pt-16">
        <div className="shell grid gap-14 lg:grid-cols-[16rem_1fr] lg:gap-20">
          <nav aria-label="Зміст" className="hidden lg:sticky lg:top-32 lg:block lg:self-start">
            <p className="eyebrow text-mute">Зміст</p>
            <ol className="mt-4 space-y-2.5">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex gap-3 text-[0.92rem] text-ink-soft transition-colors hover:text-sky-700">
                    <span className="tabular-nums text-mute">{String(i + 1).padStart(2, "0")}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="max-w-[44rem] space-y-14">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-32">
                <h2 className="display text-[clamp(1.4rem,2.4vw,1.9rem)] text-ink">
                  <span className="mr-3 font-display text-base text-mute">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                <div className="rich mt-5">{s.body}</div>
              </section>
            ))}
            <p className="border-t border-line pt-8 text-sm text-mute">
              Питання щодо даних — <Link href="/kontakty" className="link-underline text-ink">контакти</Link> або{" "}
              <a href={`mailto:${CONTROLLER.email}`} className="link-underline text-ink">{CONTROLLER.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
