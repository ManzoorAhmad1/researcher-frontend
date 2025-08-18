"use client";

import { reportError } from "@/utils/errorReporting";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  reportError(error, { source: "global-error", digest: error.digest });

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <h2>Something went wrong!</h2>
          <button
            onClick={() => reset()}
            style={{
              padding: "10px 15px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
