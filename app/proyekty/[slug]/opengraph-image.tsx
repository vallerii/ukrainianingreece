import { getOrganization } from "@/lib/organizations";
import { excerpt } from "@/lib/format";
import { OG_SIZE, ogDefaults, renderOg } from "@/lib/og";

export const alt = "Проєкт Об’єднаної української діаспори в Греції";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const org = await getOrganization((await params).slug);
  if (!org) return renderOg(ogDefaults);
  return renderOg({ eyebrow: `Проєкт · ${org.city}`, title: org.title, subtitle: excerpt(org.summary, 110) });
}
