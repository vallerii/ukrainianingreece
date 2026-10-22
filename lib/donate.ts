/**
 * Донати — налаштування. Усе працює через Stripe Payment Links:
 * готові сторінки оплати Stripe, без нашого бекенду і без ключів у коді.
 * Сюди треба лише вставити посилання (https://buy.stripe.com/...).
 *
 * Що створити в Stripe Dashboard → Payment Links → New:
 *
 *  РАЗОВО
 *  1. Разовий донат, людина вводить суму сама → `oneTime`.
 *     Type: «Customers choose what to pay». Можна задати рекомендовану суму і мінімум (напр. 2 €).
 *
 *  ЩОМІСЯЦЯ
 *  2. Готові суми → `monthly[].url`.
 *     Продукт «Щомісячна підтримка 10 €», ціна Recurring · Monthly · 10 € (і так само 20, 50).
 *  3. «Своя сума щомісяця» → `monthlyCustom`.
 *     Stripe не дає «довільну суму» для підписок, тому трюк:
 *     продукт «Щомісячна підтримка», ціна Recurring · Monthly · 1 €,
 *     увімкнути «Let customers adjust quantity» (min 1, max 1000).
 *     Людина ставить кількість = суму в євро (15 → 15 €/міс).
 *
 *  У КОЖНОМУ посиланні: вкладка After payment → «Don't show confirmation page»
 *  → redirect на https://<домен>/dyakuyemo
 *
 *  4. Скасування підписки → `manageUrl`.
 *     Settings → Billing → Customer portal → увімкнути й скопіювати «Login link».
 *     Донор вводить email, отримує код і сам скасовує чи змінює картку.
 *
 * Поки посилання порожнє, відповідна кнопка неактивна з поясненням.
 */
export const donate = {
  currency: "€",

  /** Разово: Payment Link «Customers choose what to pay» */
  oneTime: "https://donate.stripe.com/test_dRmfZj1D5cHDc3z4rqeEo00", // TODO: замінити на live-посилання

  /** Щомісяця: готові суми (recurring monthly) */
  monthly: [
    { amount: 10, url: "https://buy.stripe.com/test_eVq4gB95x6jf5Fb3nmeEo02" },
    { amount: 20, url: "https://buy.stripe.com/test_fZu3cx2H95fbd7Dga8eEo03" },
    { amount: 50, url: "https://buy.stripe.com/test_4gM6oJ3LddLHaZve20eEo04" },
  ], // TODO: замінити на live-посилання

  /** Щомісяця: своя сума (ціна 1 €/міс + adjustable quantity) */
  monthlyCustom: "https://buy.stripe.com/test_28E8wR1D5fTP2sZga8eEo01", // TODO: замінити на live-посилання

  /** Customer portal login link: скасувати чи змінити підписку */
  manageUrl: "",

  /** Банківський переказ. Поки iban порожній, блок не показується. */
  bank: {
    recipient: "",
    iban: "",
    bic: "",
    bank: "",
    purpose: "Благодійний внесок",
  },

  // Посилання «Звіти про використання коштів» з’являється автоматично,
  // щойно в DatoCMS опубліковано хоча б один «Фінансовий звіт».
};
