/**
 * Мінімальний клієнт DatoCMS Content Delivery API (GraphQL).
 * Без зовнішніх залежностей — звичайний fetch з кешем Next.js.
 *
 * Потрібна змінна середовища DATOCMS_API_TOKEN (Read-only API token
 * з Project settings → API tokens). Лежить у .env.local, у git не потрапляє.
 */

import { getLocale } from "./i18n/server";

const ENDPOINT = "https://graphql.datocms.com/";

/** Як часто перечитувати контент з CMS (секунди). */
export const CMS_REVALIDATE = 60;

export async function datoRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  // «locale: CUR» у запиті → мова поточної сторінки з запасним варіантом — українською
  const loc = getLocale();
  query = query.replace(/locale: CURM\b/g, `locale: ${loc}`).replace(/locale: CUR\b/g, loc === "uk" ? "locale: uk" : `locale: ${loc}, fallbackLocales: [uk]`);
  const token = process.env.DATOCMS_API_TOKEN;
  if (!token) {
    throw new Error(
      "DATOCMS_API_TOKEN не задано. Додайте Read-only API token з DatoCMS у файл .env.local",
    );
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      // невалідні (недозаповнені) записи не потрапляють на сайт
      "X-Exclude-Invalid": "true",
      ...(process.env.DATOCMS_ENVIRONMENT
        ? { "X-Environment": process.env.DATOCMS_ENVIRONMENT }
        : {}),
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: CMS_REVALIDATE, tags: ["datocms"] },
  });

  if (!res.ok) {
    throw new Error(`DatoCMS: HTTP ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { data?: T; errors?: unknown };
  if (json.errors) {
    throw new Error(`DatoCMS: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}
