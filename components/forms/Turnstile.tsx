"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/components/i18n/I18nProvider";

/**
 * Віджет Cloudflare Turnstile. Зазвичай невидимий (appearance: interaction-only):
 * показується, лише якщо Cloudflare засумнівався, що це людина.
 * Кладе в форму приховане поле `cf-turnstile-response` — його читає FormData.
 * Без NEXT_PUBLIC_TURNSTILE_SITE_KEY нічого не рендерить.
 */

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<void> | null = null;

function loadScript() {
  if (window.turnstile) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = null;
      reject(new Error("turnstile script"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

export default function Turnstile({ theme = "light", className }: { theme?: "light" | "dark"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return;
    const el = ref.current;
    let id: string | undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !window.turnstile) return;
        id = window.turnstile.render(el, {
          sitekey: SITE_KEY,
          theme,
          language: locale === "uk" ? "uk" : locale,
          appearance: "interaction-only",
          size: "flexible",
        });
        el.dataset.turnstileId = id;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (id) window.turnstile?.remove(id);
    };
  }, [theme, locale]);

  if (!SITE_KEY) return null;
  return <div ref={ref} className={className} />;
}

/** Токен одноразовий: після кожної відправки форми віджет треба скинути. */
export function resetTurnstile(form: HTMLFormElement | null) {
  const id = form?.querySelector<HTMLElement>("[data-turnstile-id]")?.dataset.turnstileId;
  if (id) window.turnstile?.reset(id);
}
