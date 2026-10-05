import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/cms/PageHead";

export const metadata: Metadata = { title: "Дякуємо!", robots: { index: false } };

/** Сюди Stripe повертає людину після успішної оплати (налаштовується в Payment Link). */
export default function Page() {
  return (
    <PageHead
      eyebrow="Дякуємо"
      title={
        <>
          Дякуємо за <span className="text-sky-700">підтримку</span>!
        </>
      }
      lead="Ваш внесок отримано. Квитанцію Stripe надіслав на вашу пошту. Завдяки вам спільнота може більше."
    >
      <div className="mt-10 flex flex-wrap gap-6">
        <Link href="/" className="link-underline text-sm font-bold text-ink">
          ← На головну
        </Link>
        <Link href="/podiyi" className="link-underline text-sm font-bold text-ink">
          Події спільноти →
        </Link>
      </div>
    </PageHead>
  );
}
