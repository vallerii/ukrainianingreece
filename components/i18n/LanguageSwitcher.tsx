"use client";

import NextLink from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { locales, localeMeta, localizeHref, stripLocale } from "@/lib/i18n/config";
import { useLocale } from "./I18nProvider";

function Switcher({ className, itemClass }: { className?: string; itemClass: (active: boolean) => string }) {
  const locale = useLocale();
  const path = stripLocale(usePathname() || "/");
  const qs = useSearchParams()?.toString();
  return (
    <div className={className}>
      {locales.map((l) => {
        const active = l === locale;
        return (
          <NextLink
            key={l}
            href={localizeHref(path, l) + (qs ? `?${qs}` : "")}
            hrefLang={localeMeta[l].hreflang}
            lang={l}
            aria-label={localeMeta[l].label}
            title={localeMeta[l].label}
            aria-current={active ? "true" : undefined}
            className={itemClass(active)}
          >
            {localeMeta[l].short}
          </NextLink>
        );
      })}
    </div>
  );
}

/** UA / EN / GR — веде на ту саму сторінку іншою мовою */
export default function LanguageSwitcher(props: { className?: string; itemClass: (active: boolean) => string }) {
  return (
    <Suspense fallback={<div className={props.className} />}>
      <Switcher {...props} />
    </Suspense>
  );
}
