"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Dynamically import PDF viewer components
const Viewer = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Viewer),
  { ssr: false }
);

const Worker = dynamic(
  () => import("@react-pdf-viewer/core").then((mod) => mod.Worker),
  { ssr: false }
);

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface PDFViewerComponentProps {
  url: string;
}

const PDFViewerComponent = ({ url }: PDFViewerComponentProps) => {
  const [isClient, setIsClient] = useState(false);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading PDF viewer...</div>;
  }

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.js">
      <div style={{ height: "750px" }}>
        <Viewer fileUrl={url} plugins={[defaultLayoutPluginInstance]} />
      </div>
    </Worker>
  );
};

export default PDFViewerComponent;
