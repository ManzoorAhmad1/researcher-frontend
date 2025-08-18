"use client";
import dynamic from "next/dynamic";

export {
  DynamicPDFDownloadLink,
  DynamicDocument,
  DynamicPage,
  DynamicText,
  DynamicView,
} from "./PDFComponents";

// Note: StyleSheet is removed since we're using plain JavaScript objects for styles
// This avoids the build error related to StyleSheet.create not being available
