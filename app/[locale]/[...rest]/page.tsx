import { notFound } from "next/navigation";

/** Будь-яка невідома адреса всередині мовної версії → сторінка 404 цією мовою. */
export default function CatchAll() {
  notFound();
}
