/**
 * Проєкти-сателіти / організації — з DatoCMS (модель «organization»).
 *
 * Єдине джерело для: блоку «Проєкти-сателіти» на головній, /proyekty, /proyekty/[slug],
 * меню «Проєкти», блоку «Засновники» (поле «Founder of the union»), пошуку.
 * Порядок — як у DatoCMS (модель сортована, перетягуванням).
 *
 * Тимчасова страховка: якщо модель ще не налаштована або в ній немає жодного
 * опублікованого запису — показуємо дані з lib/projects.ts (їх перенесено в CMS скриптом).
 */
import { cache } from "react";
import { datoRequest } from "./datocms";
import { toHtml } from "./cms";
import { satellites } from "./projects";

export type OrgLogo = { src: string; width: number; height: number; dark?: boolean };

export type Org = {
  n: string; // «01», «02»…
  slug: string;
  title: string;
  navLabel: string;
  note: string;
  city: string;
  summary: string;
  subtitle: string | null;
  logo: OrgLogo | null;
  facts: { label: string; value: string }[];
  contacts: {
    phone: string | null;
    email: string | null;
    address: string | null;
    website: string | null;
    socials: { icon: "facebook" | "instagram"; label: string; href: string }[];
  };
  html: string;
  founder: boolean;
};

type RawOrg = {
  slug: string;
  name: string;
  shortName: string | null;
  menuNote: string | null;
  subtitle: string | null;
  city: string | null;
  summary: string | null;
  content: string | null;
  facts: string | null;
  foundedYear: number | null;
  head: string | null;
  logo: { url: string; width: number | null; height: number | null } | null;
  logoDark: boolean | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isFounder: boolean | null;
};

const num = (i: number) => String(i + 1).padStart(2, "0");

function parseFacts(text: string | null, year: number | null, head: string | null) {
  const lines = (text ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      return i > 0 ? { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : { label: "", value: l };
    });
  if (lines.length) return lines;
  // фактів не задано — збираємо з окремих полів (напр. для заявок із форми)
  return [
    ...(year ? [{ label: "Засновано", value: String(year) }] : []),
    ...(head ? [{ label: "Керівник", value: head }] : []),
  ];
}

const handle = (url: string) => {
  const m = url.match(/instagram\.com\/([^/?#]+)/i);
  return m ? `@${m[1]}` : "Instagram";
};

function fromCms(o: RawOrg, i: number): Org {
  return {
    n: num(i),
    slug: o.slug,
    title: o.name,
    navLabel: o.shortName || o.name,
    note: o.menuNote || o.city || "",
    city: o.city || "Греція",
    summary: o.summary || "",
    subtitle: o.subtitle,
    logo: o.logo
      ? { src: o.logo.url, width: o.logo.width ?? 600, height: o.logo.height ?? 600, dark: Boolean(o.logoDark) }
      : null,
    facts: parseFacts(o.facts, o.foundedYear, o.head),
    contacts: {
      phone: o.phone,
      email: o.email,
      address: o.address,
      website: o.website,
      socials: [
        ...(o.facebook ? [{ icon: "facebook" as const, label: "Facebook", href: o.facebook }] : []),
        ...(o.instagram ? [{ icon: "instagram" as const, label: handle(o.instagram), href: o.instagram }] : []),
      ],
    },
    html: toHtml(o.content),
    founder: Boolean(o.isFounder),
  };
}

/* ── запасний варіант: lib/projects.ts ────────────────────────── */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function fromStatic(): Org[] {
  return satellites.map((s, i) => ({
    n: num(i),
    slug: s.slug,
    title: s.title,
    navLabel: s.navLabel,
    note: s.note,
    city: s.city,
    summary: s.summary,
    subtitle: s.subtitle ?? null,
    logo: s.logo ?? null,
    facts: s.facts ?? [],
    contacts: {
      phone: s.contacts?.phone ?? null,
      email: s.contacts?.email ?? null,
      address: s.contacts?.address ?? null,
      website: null,
      socials: (s.contacts?.socials ?? []).filter(
        (x): x is { icon: "facebook" | "instagram"; label: string; href: string } =>
          x.icon === "facebook" || x.icon === "instagram",
      ),
    },
    html: (s.sections ?? [])
      .map(
        (sec) =>
          (sec.title ? `<h2>${esc(sec.title)}</h2>` : "") +
          sec.blocks
            .map((b) => ("p" in b ? `<p>${esc(b.p)}</p>` : `<ul>${b.list.map((li) => `<li>${esc(li)}</li>`).join("")}</ul>`))
            .join(""),
      )
      .join(""),
    founder: Boolean(s.founder),
  }));
}

export const getOrganizations = cache(async (): Promise<Org[]> => {
  try {
    const data = await datoRequest<{ items: RawOrg[] }>(
      `query Organizations {
        items: allOrganizations(first: 100, orderBy: position_ASC) {
          slug name shortName menuNote subtitle city summary content(markdown: true) facts
          foundedYear head logo { url width height } logoDark
          website facebook instagram phone email address isFounder
        }
      }`,
    );
    if (data.items.length > 0) return data.items.map(fromCms);
  } catch {
    // модель ще не налаштована — нижче запасний варіант
  }
  return fromStatic();
});

export async function getOrganization(slug: string) {
  return (await getOrganizations()).find((o) => o.slug === slug) ?? null;
}

/* ── похідні ───────────────────────────────────────────────── */

const FOUNDER_HUES = [210, 44, 195, 32, 225, 18, 240, 52];

export type Founder = {
  name: string;
  short: string;
  city: string;
  href: string;
  hue: number;
  logo: OrgLogo | null;
};

export const toFounders = (orgs: Org[]): Founder[] =>
  orgs
    .filter((o) => o.founder)
    .map((o, i) => ({
      name: o.title,
      short: o.navLabel,
      city: o.city,
      href: `/proyekty/${o.slug}`,
      hue: FOUNDER_HUES[i % FOUNDER_HUES.length],
      logo: o.logo,
    }));

/** Дані для блоку «Проєкти-сателіти» на головній (клієнтський компонент). */
export type ProjectCard = { n: string; title: string; href: string; city: string; text: string; logo: OrgLogo | null };

export const toProjectCards = (orgs: Org[]): ProjectCard[] =>
  orgs.map((o) => ({ n: o.n, title: o.title, href: `/proyekty/${o.slug}`, city: o.city, text: o.summary, logo: o.logo }));
