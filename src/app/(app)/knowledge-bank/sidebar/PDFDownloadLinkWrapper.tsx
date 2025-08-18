import React from "react";
import { DynamicPDFDownloadLink } from "./DynamicPDFComponents";

interface PDFDownloadLinkWrapperProps {
  document: React.ReactElement;
  fileName: string;
  className?: string;
  children: React.ReactNode;
}

const PDFDownloadLinkWrapper = ({
  document,
  fileName,
  className,
  children,
}: PDFDownloadLinkWrapperProps) => {
  return (
    <DynamicPDFDownloadLink
      document={document}
      fileName={fileName}
      className={className}
    >
      {children}
    </DynamicPDFDownloadLink>
  );
};

export default PDFDownloadLinkWrapper;
