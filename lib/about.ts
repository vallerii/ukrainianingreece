/**
 * Тексти сторінки «Про нас» переїхали у словники: lib/i18n/dict/{uk,en,el}.ts → about.
 * Тут — лише українська версія для сумісності зі старим кодом і скриптами.
 */
import { uk } from "./i18n/dict/uk";

export const { aboutNav, mission, vision, values, goals, audiences, timeline, geography, team } = uk.about;
