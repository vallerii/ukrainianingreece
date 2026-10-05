import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/cms/PageHead";

export const metadata: Metadata = { title: "Підписку підтверджено", robots: { index: false } };

/** Сюди Brevo повертає людину після кліку «Підтвердити підписку» в листі. */
export default function Page() {
  return (
    <PageHead
      eyebrow="Розсилка"
      title={
        <>
          Підписку <span className="text-sky-700">підтверджено</span>
        </>
      }
      lead="Дякуємо! Раз на місяць надсилатимемо новини спільноти та календар подій. Відписатися можна посиланням у кожному листі."
    >
      <div className="mt-10 flex flex-wrap gap-6">
        <Link href="/" className="link-underline text-sm font-bold text-ink">
          ← На головну
        </Link>
        <Link href="/podiyi" className="link-underline text-sm font-bold text-ink">
          Прийдешні події →
        </Link>
      </div>
    </PageHead>
  );
}
