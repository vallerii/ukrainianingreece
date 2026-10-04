"use client";

import Image from "next/image";
import { motion } from "motion/react";
import type { CmsImage } from "@/lib/cms";

/**
 * Обкладинка матеріалу: фото з DatoCMS або фірмовий градієнт-заглушка,
 * якщо фото ще не завантажили. Легке збільшення при наведенні на батьківський .group.
 */
export default function Cover({
  image,
  hue,
  ratio = "aspect-[4/3]",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  zoom = true,
  className = "",
}: {
  image: CmsImage | null;
  hue: number;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  zoom?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden bg-paper-dim ${ratio} ${className}`}>
      <motion.div
        className="absolute inset-0"
        whileHover={zoom ? { scale: 1.045 } : undefined}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? ""}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, hsl(${hue} 58% 44%), hsl(${hue + 26} 76% 62%) 60%, hsl(${
                hue - 16
              } 40% 28%))`,
            }}
          />
        )}
      </motion.div>
      {!image && <div className="grain" />}
    </div>
  );
}
