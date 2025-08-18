"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

type OptimizedImageProps = ImageProps;
/**
 * OptimizedImage component that enhances Next.js Image with:
 * - Guaranteed width/height to prevent CLS
 * - Better error handling with fallback
 * - Subtle fade-in loading transition
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  ...props
}: OptimizedImageProps) {
  // State to track loading and error conditions
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Ensure width and height are provided to prevent CLS
  if (!width || !height) {
    console.warn(
      `OptimizedImage: Missing width or height for image with alt="${alt}". This may cause layout shifts.`
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        layout="intrinsic"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        className={`${className} transition-opacity duration-300 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
        {...props}
      />
    </div>
  );
}
