import { OG_SIZE, ogDefaults, renderOg } from "@/lib/og";

export const alt = "Об’єднана українська діаспора в Греції";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg(ogDefaults);
}
