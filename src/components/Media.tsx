"use client";

import Image from "next/image";
import { useState } from "react";
import type { Tone } from "@/lib/content";
import { useSlot } from "@/lib/siteContent";

interface Props {
  /** woven-art colour tone, used when no image/video is supplied (or the file is missing) */
  tone?: Tone;
  /** path in /public, e.g. "/images/hero.jpg" */
  image?: string;
  /** path in /public, e.g. "/videos/hero.mp4": muted, looping, autoplay */
  video?: string;
  poster?: string;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Media slot. Shows a video, else a photo, else animated woven art.
 * If a video or photo file is missing or fails to load, it falls back automatically
 * (video, then poster photo, then woven art) so a missing file never shows a broken image.
 */
export default function Media({ tone = "wine", image: imageProp, video: videoProp, poster: posterProp, alt: altProp, sizes = "100vw", priority = false, className = "" }: Props) {
  // Picks up replacements made in the admin (Site content); otherwise the built-in files are used.
  const { image, video, poster, alt = "" } = useSlot({ image: imageProp, video: videoProp, poster: posterProp, alt: altProp });
  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  if (video && !videoFailed) {
    return (
      <div className={`relative overflow-hidden ${className}`.trim()}>
        <video className="absolute inset-0 h-full w-full object-cover" src={video} poster={poster} autoPlay muted loop playsInline preload="auto" aria-hidden="true" onError={() => setVideoFailed(true)} />
      </div>
    );
  }
  const src = image ?? (video ? poster : undefined);
  if (src && !imageFailed) {
    return (
      <div className={`relative overflow-hidden ${className}`.trim()}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={src.startsWith("http") || src.startsWith("data:")} className="kb object-cover" onError={() => setImageFailed(true)} />
      </div>
    );
  }
  return <div className={`weave tone-${tone} ${className}`.trim()} aria-hidden="true" />;
}
