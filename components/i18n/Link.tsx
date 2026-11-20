"use client";

import NextLink from "next/link";
import { forwardRef, type ComponentProps } from "react";
import { localizeHref } from "@/lib/i18n/config";
import { useLocale } from "./I18nProvider";

/**
 * next/link, що сам додає мовний префікс: <Link href="/novyny"> на англійській
 * версії веде на /en/novyny. Використовуйте замість next/link у всьому сайті.
 */
const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(function Link({ href, ...rest }, ref) {
  const locale = useLocale();
  const h = typeof href === "string" ? localizeHref(href, locale) : href;
  return <NextLink ref={ref} href={h} {...rest} />;
});

export default Link;
