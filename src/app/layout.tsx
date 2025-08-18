import type { Metadata, Viewport } from "next";
import { Poppins, Raleway } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import Script from "next/script";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
const StoreProvider = dynamic(() => import("./StoreProvider"));
const DeferredCSSLoader = dynamic(() =>
  import("@/components/ui/deferred-css-loader").then(
    (mod) => mod.DeferredCSSLoader
  )
);
import { CSPostHogProvider } from "./PosthogProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
  preload: true,
});

export const metadata: Metadata = {
  title: "ResearchCollab",
  description:
    "Smart Research, Simplified. Find papers, share ideas, stay organized - all in one place",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://researchcollab.com"
  ),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <DeferredCSSLoader href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" />

        <Script
          id="plerdy-variables"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
      window._suid = "${process.env.NEXT_PUBLIC_PLERDY_SUID}";
      window._site_hash_code = "${process.env.NEXT_PUBLIC_PLERDY_SITE_HASH_CODE}";
      
      // Add global error handler for Plerdy
      window.addEventListener('error', function(event) {
        if (event.filename && event.filename.includes('plerdy') || 
            (event.message && (event.message.includes('JSON') || event.message.includes('failed to co')))) {
          console.warn('Plerdy error intercepted:', event.message);
          event.preventDefault();
          return true; // Prevents the error from bubbling up
        }
      }, true);

      // Patch fetch and XMLHttpRequest to handle Plerdy API errors
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        const fetchPromise = originalFetch(url, options);
        
        if (url && url.toString().includes('plerdy')) {
          return fetchPromise.catch(error => {
            console.warn('Plerdy fetch error intercepted:', error);
            return { ok: true, json: () => Promise.resolve({}) }; // Return empty success
          });
        }
        
        return fetchPromise;
      };

      // Also patch XMLHttpRequest for older implementations
      const originalXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        const xhr = this;
        if (url && url.toString().includes('plerdy')) {
          const originalSend = xhr.send;
          xhr.send = function(...sendArgs) {
            xhr.addEventListener('error', function(e) {
              console.warn('Plerdy XHR error intercepted');
              e.preventDefault();
            });
            return originalSend.apply(xhr, sendArgs);
          };
        }
        return originalXHROpen.apply(xhr, [method, url, ...rest]);
      };
    `,
          }}
        />

        <Script
          id="site-behaviour-script"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
      (function() {
        if ('${process.env.NEXT_PUBLIC_NODE_ENV}' === 'production') {
          var sbSiteSecret = '${process.env.NEXT_PUBLIC_SITE_BEHAVIOUR_SECRET}';
          window.sitebehaviourTrackingSecret = sbSiteSecret;
          var scriptElement = document.createElement('script');
          scriptElement.async = true;
          scriptElement.id = 'site-behaviour-script-v2';
          scriptElement.src = 'https://sitebehaviour-cdn.fra1.cdn.digitaloceanspaces.com/index.min.js?sitebehaviour-secret=' + sbSiteSecret;
          document.head.appendChild(scriptElement);
        }
      })()
    `,
          }}
        />
      </head>
      <body className={poppins.className}>
        <CSPostHogProvider>
          <StoreProvider>
            {children}
            <Toaster
              toastOptions={{
                duration: 7000,
                success: {
                  className: "hot-toast-container",
                },
                error: {
                  className: "hot-toast-container",
                },
              }}
            />
          </StoreProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
