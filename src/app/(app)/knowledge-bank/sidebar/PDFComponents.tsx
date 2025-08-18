"use client";
import React from "react";
import dynamic from "next/dynamic";

// Create a wrapper component for PDFDownloadLink
const PDFDownloadLinkWrapper = dynamic(
  () =>
    import("@react-pdf/renderer").then((mod) => {
      const { PDFDownloadLink } = mod;
      return function WrappedPDFDownloadLink(props: any) {
        return <PDFDownloadLink {...props} />;
      };
    }),
  { ssr: false }
);

// Create a wrapper component for Document
const DocumentWrapper = dynamic(
  () =>
    import("@react-pdf/renderer").then((mod) => {
      const { Document } = mod;
      return function WrappedDocument(props: any) {
        return <Document {...props} />;
      };
    }),
  { ssr: false }
);

// Create a wrapper component for Page
const PageWrapper = dynamic(
  () =>
    import("@react-pdf/renderer").then((mod) => {
      const { Page } = mod;
      return function WrappedPage(props: any) {
        return <Page {...props} />;
      };
    }),
  { ssr: false }
);

// Create a wrapper component for Text
const TextWrapper = dynamic(
  () =>
    import("@react-pdf/renderer").then((mod) => {
      const { Text } = mod;
      return function WrappedText(props: any) {
        return <Text {...props} />;
      };
    }),
  { ssr: false }
);

// Create a wrapper component for View
const ViewWrapper = dynamic(
  () =>
    import("@react-pdf/renderer").then((mod) => {
      const { View } = mod;
      return function WrappedView(props: any) {
        return <View {...props} />;
      };
    }),
  { ssr: false }
);

export {
  PDFDownloadLinkWrapper as DynamicPDFDownloadLink,
  DocumentWrapper as DynamicDocument,
  PageWrapper as DynamicPage,
  TextWrapper as DynamicText,
  ViewWrapper as DynamicView,
};
