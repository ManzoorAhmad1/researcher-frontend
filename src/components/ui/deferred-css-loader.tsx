"use client";

import { useEffect } from "react";

type DeferredCSSLoaderProps = {
  href: string;
};

export function DeferredCSSLoader({ href }: DeferredCSSLoaderProps) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.media = "print";

    link.onload = () => {
      link.media = "all";
    };

    document.head.appendChild(link);

    return () => {
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink && existingLink.parentNode) {
        existingLink.parentNode.removeChild(existingLink);
      }
    };
  }, [href]);

  return null;
}
