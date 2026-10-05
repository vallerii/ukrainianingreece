/**
 * Донати — налаштування.
 *
 * Оплата йде через Stripe Payment Links (готові сторінки оплати Stripe, без нашого бекенду).
 * Що створити в Stripe Dashboard → Payment Links:
 *
 *  1. РАЗОВИЙ ДОНАТ — тип «Customers choose what to pay» (людина сама вводить суму).
 *     Можна задати рекомендовану суму й мінімум. Скопіюйте посилання в `oneTime`.
 *
 *  2. ЩОМІСЯЧНА ПІДТРИМКА — Stripe не дозволяє «довільну суму» для підписок,
 *     тому створюємо кілька посилань з фіксованою ціною щомісяця (recurring price):
 *     5 €, 10 €, 25 €, 50 € … і вставляємо в `monthly`.
 *
 *  В кожному посиланні: After payment → «Don't show confirmation page» →
 *  redirect на https://<домен>/dyakuyemo
 *
 * Поки посилання порожнє — кнопка показується неактивною з поясненням.
 */
export const donate = {
  currency: "€",

  /** Payment Link «Customers choose what to pay» */
  oneTime: "",

  /** Payment Links з фіксованою щомісячною сумою */
  monthly: [
    { amount: 5, url: "" },
    { amount: 10, url: "" },
    { amount: 25, url: "" },
    { amount: 50, url: "" },
  ],

  /** Банківський переказ. Поки iban порожній — блок не показується. */
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
