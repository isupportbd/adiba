import Image from "next/image";
import type { MediaVM } from "@/lib/types";

/**
 * Responsive photo via next/image (sharp → AVIF/WebP, lazy below the fold).
 * `priority` is reserved for the single LCP hero image.
 */
export function Photo({
  media,
  className,
  sizes = "(max-width: 640px) 100vw, 50vw",
  priority = false,
  rounded = "rounded-2xl",
}: {
  media: MediaVM;
  /** Container class — include an aspect ratio for a cropped frame. */
  className?: string;
  sizes?: string;
  priority?: boolean;
  rounded?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-cream-100 ${className ?? ""}`}>
      <Image
        src={media.src}
        alt={media.alt}
        width={media.width ?? 800}
        height={media.height ?? 600}
        sizes={sizes}
        priority={priority}
        className={`h-full w-full object-cover ${rounded}`}
      />
    </div>
  );
}
