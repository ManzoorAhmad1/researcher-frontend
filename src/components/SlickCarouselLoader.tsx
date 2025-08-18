"use client";

import { useEffect, useState } from "react";

export function SlickCarouselLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadSlickStyles = async () => {
      if (loaded) return;

      const slickCss = document.createElement("link");
      slickCss.rel = "stylesheet";
      slickCss.href =
        "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.css";

      const slickThemeCss = document.createElement("link");
      slickThemeCss.rel = "stylesheet";
      slickThemeCss.href =
        "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.css";

      document.head.appendChild(slickCss);
      document.head.appendChild(slickThemeCss);

      setLoaded(true);
    };

    if (typeof IntersectionObserver !== "undefined") {
      const observerTarget = document.createElement("div");
      observerTarget.id = "slick-observer";
      document.body.appendChild(observerTarget);

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadSlickStyles();
            observer.disconnect();
            observerTarget.remove();
          }
        },
        { rootMargin: "200px" }
      );

      observer.observe(observerTarget);

      return () => {
        observer.disconnect();
        if (observerTarget.parentNode) {
          observerTarget.remove();
        }
      };
    } else {
      loadSlickStyles();
    }
  }, [loaded]);

  return null;
}
