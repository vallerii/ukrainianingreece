import type { Metadata } from "next";
import { getT, initPage, setLocale } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import Link from "@/components/i18n/Link";
import PageHead from "@/components/cms/PageHead";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  setLocale((await params).locale);
  const d = getT().confirmedPage;
  return { title: d.metaTitle, robots: { index: false } };
}

/** Сюди Brevo повертає людину після кліку «Підтвердити підписку» в листі. */
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { t } = await initPage(params);
  const d = t.confirmedPage;
  return (
    <PageHead
      eyebrow={d.eyebrow}
      title={
        <>
          {d.h1A}<span className="text-sky-700">{d.h1B}</span>
        </>
      }
      lead={d.lead}
    >
      <div className="mt-10 flex flex-wrap gap-6">
        <Link href="/" className="link-underline text-sm font-bold text-ink">
          {t.common.home}
        </Link>
        <Link href="/podiyi" className="link-underline text-sm font-bold text-ink">
          {t.nav.upcoming} →
        </Link>
      </div>
    </PageHead>
  );
}
