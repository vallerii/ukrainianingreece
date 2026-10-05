/**
 * Запис у DatoCMS з форм сайту (Content Management API).
 * Лише на сервері. Токен DATOCMS_FORMS_TOKEN має роль «Форми сайту» — вміє тільки
 * створювати записи у двох моделях, без публікації й без доступу до решти контенту.
 */

const API = "https://site-api.datocms.com";

export const FORM_MODELS = {
  volunteer: process.env.DATOCMS_MODEL_VOLUNTEER,
  organization: process.env.DATOCMS_MODEL_ORGANIZATION,
} as const;

export class CmaNotConfigured extends Error {}

export async function createRecord(modelId: string | undefined, attributes: Record<string, unknown>) {
  const token = process.env.DATOCMS_FORMS_TOKEN;
  if (!token || !modelId) throw new CmaNotConfigured("DATOCMS_FORMS_TOKEN або ID моделі не задано в .env");

  const res = await fetch(`${API}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/vnd.api+json",
      "X-Api-Version": "3",
    },
    body: JSON.stringify({
      data: {
        type: "item",
        attributes,
        relationships: { item_type: { data: { type: "item_type", id: modelId } } },
      },
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`DatoCMS CMA ${res.status}: ${await res.text()}`);
  return (await res.json()).data as { id: string };
}
