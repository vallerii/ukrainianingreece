import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import PageHead from "@/components/cms/PageHead";
import SearchForm from "@/components/search/SearchForm";
import { getT } from "@/lib/i18n/server";

export const metadata: Metadata = { robots: { index: false } };


export default function NotFound() {
  const t = getT();
  const nf = t.notFound;
  const LINKS = [
    { href: "/novyny", label: t.nav.news, note: nf.news },
    { href: "/podiyi", label: t.searchPage.events, note: nf.events },
    { href: "/proyekty", label: t.nav.projects, note: nf.projects },
    { href: "/korysno", label: t.usefulPage.metaTitle, note: nf.useful },
    { href: "/kontakty", label: t.nav.contacts, note: nf.contacts },
  ];
  return (
    <>
      <title>{nf.title}</title>
      <PageHead
        eyebrow={nf.eyebrow}
        title={
          <>
            {nf.h1A}<span className="text-sky-700">{nf.h1B}</span>
          </>
        }
        lead={nf.lead}
      >
        <SearchForm />
      </PageHead>

      <section className="bg-paper pb-24 pt-14">
        <div className="shell">
          <ul className="grid gap-px overflow-hidden rounded-sm bg-line sm:grid-cols-2 lg:grid-cols-3">
            <li className="bg-paper">
              <Link href="/" className="group block h-full p-7 transition-colors hover:bg-paper-dim">
                <span className="font-display text-xl text-ink group-hover:text-sky-700">{t.common.home}</span>
                <span className="mt-2 block text-sm text-mute">{t.site.name}</span>
              </Link>
            </li>
            {LINKS.map((l) => (
              <li key={l.href} className="bg-paper">
                <Link href={l.href} className="group block h-full p-7 transition-colors hover:bg-paper-dim">
                  <span className="font-display text-xl text-ink group-hover:text-sky-700">{l.label}</span>
                  <span className="mt-2 block text-sm text-mute">{l.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
