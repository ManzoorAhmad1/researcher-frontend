"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    workbox?: {
      addEventListener: (event: string, callback: (event: any) => void) => void;
      register: () => Promise<void>;
    };
  }
}

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      if (window.workbox) {
        const wb = window.workbox;

        wb.addEventListener("installed", (event) => {
          console.log(`Event ${event.type} is triggered.`);
          console.log(event);
        });

        wb.addEventListener("controlling", (event) => {
          console.log(`Event ${event.type} is triggered.`);
          console.log(event);
        });

        wb.addEventListener("activated", (event) => {
          console.log(`Event ${event.type} is triggered.`);
          console.log(event);
        });

        wb.addEventListener("waiting", (event) => {
          console.log(`Event ${event.type} is triggered.`);
          console.log(event);
        });

        wb.register();
      } else {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("ServiceWorker registration successful");
          })
          .catch((err) => {
            console.log("ServiceWorker registration failed: ", err);
          });
      }
    }
  }, []);

  return null;
}
