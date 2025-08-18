"use client";
import React from "react";
import {
  DynamicDocument as Document,
  DynamicPage as Page,
  DynamicText as Text,
  DynamicView as View,
} from "./DynamicPDFComponents";
import dynamic from "next/dynamic";

// Dynamically import Html component
const Html = dynamic(() => import("react-pdf-html"), { ssr: false });

// Define styles outside component
const styles = {
  container: {
    padding: 16,
  },
};

const NotesPdf: React.FC<{ htmlContent: string }> = ({ htmlContent }) => {
  const styledHtmlContent = `
  <style>
    body { font-size: 14px; } /* Adjust as needed */
    p { font-size: 14px; } 
  </style>
  ${htmlContent}
`;
  return (
    <Document>
      <Page style={styles.container}>
        <View>
          <Html>{styledHtmlContent}</Html>
        </View>
      </Page>
    </Document>
  );
};

export default NotesPdf;
