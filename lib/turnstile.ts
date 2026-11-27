/**
 * Cloudflare Turnstile — перевірка «ви не робот» для форм сайту (підписка, заявки).
 *
 * Змінні середовища:
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY — Site Key (публічний, потрапляє в браузер)
 *   TURNSTILE_SECRET_KEY           — Secret Key (лише на сервері)
 * Поки ключів немає, перевірка вимкнена і форми працюють як раніше
 * (захищені honeypot-полем і обмеженням частоти).
 */
export const turnstileEnabled = () => !!process.env.TURNSTILE_SECRET_KEY;

export async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "local") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      cache: "no-store",
    });
    const json = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (!json.success) console.warn("[turnstile] відхилено", json["error-codes"]);
    return !!json.success;
  } catch (e) {
    // Cloudflare недоступний — не блокуємо людей, лишаються honeypot і ліміт частоти
    console.error("[turnstile] помилка перевірки", e);
    return true;
  }
}
