"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Якщо в системі ввімкнено «Зменшити рух», анімації зсуву/масштабу вимикаються
 * для всього сайту (лишається тільки м'яка поява через прозорість).
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
