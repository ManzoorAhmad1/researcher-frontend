import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PDFData as PDFDataType } from "@/types/types";
import { IoMdCopy } from "react-icons/io";
import toast from "react-hot-toast";
import { CopyToClipboard } from "react-copy-to-clipboard";

interface CitationDialogProps {
  citationDialog: boolean;
  setCitationDialog: (open: boolean) => void;
  PDFData?: PDFDataType;
}

type CitationStyle = "APA" | "MLA" | "Chicago" | "Harvard" | "Vancouver";

const formatAPAAuthors = (authors: string): string => {
  if (!authors) return "";

  const authorList = authors.split(/,\s*|\s+and\s+/).filter((a) => a.trim());

  if (authorList.length === 0) return "";

  const formattedAuthors = authorList.map((author) => {
    const nameParts = author.trim().split(/\s+/);
    if (nameParts.length === 1) return nameParts[0];

    const lastName = nameParts[nameParts.length - 1];
    const initials = nameParts
      .slice(0, nameParts.length - 1)
      .map((part) => `${part.charAt(0)}.`)
      .join(" ");

    if (nameParts.length >= 2) {
      return `${lastName}, ${initials}`;
    }

    return author;
  });

  if (formattedAuthors.length === 1) {
    return formattedAuthors[0];
  }

  return (
    formattedAuthors.slice(0, -1).join(", ") +
    ", & " +
    formattedAuthors[formattedAuthors.length - 1]
  );
};

const formatStandardAuthors = (authors: string): string => {
  if (!authors) return "";

  const authorList = authors.split(/,\s*|\s+and\s+/).filter((a) => a.trim());
  if (authorList.length === 0) return "";

  if (authorList.length === 1) return authorList[0];
  if (authorList.length === 2) return `${authorList[0]} and ${authorList[1]}`;

  return (
    authorList.slice(0, -1).join(", ") +
    ", and " +
    authorList[authorList.length - 1]
  );
};

const toSentenceCase = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const toTitleCase = (str: string): string => {
  if (!str) return "";
  const smallWords =
    /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

  return str
    .toLowerCase()
    .split(/\s+/)
    .map((word, index, array) => {
      if (index === 0 || index === array.length - 1 || !smallWords.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(" ");
};

const getIdentifier = (
  paper: PDFDataType
): {
  type: "doi" | "arxiv" | "working-paper" | "author-year" | "none";
  value: string;
} => {
  const metadataAny = paper?.pdf_metadata as any;
  const searchDataAny = paper?.pdf_search_data as any;

  const identifier =
    metadataAny?.DOI ||
    metadataAny?.Identifier ||
    searchDataAny?.DOI ||
    searchDataAny?.Identifier ||
    searchDataAny?.Keywords?.find(
      (k: string) => k.includes("arXiv") || k.includes("10.")
    ) ||
    "";

  if (!identifier) return { type: "none", value: "" };

  if (identifier.includes("10.")) {
    return { type: "doi", value: identifier };
  } else if (identifier.includes("arXiv")) {
    return { type: "arxiv", value: identifier };
  } else if (
    identifier.includes("Working Paper") ||
    identifier.match(/\d+-\d+/)
  ) {
    return { type: "working-paper", value: identifier };
  } else if (
    identifier.match(/[A-Za-z]+Et[Aa]l\d{4}/) ||
    identifier.match(/[A-Za-z]+\d{4}/)
  ) {
    return { type: "author-year", value: identifier };
  }

  return { type: "none", value: identifier };
};

const getInstitution = (paper: PDFDataType): string => {
  const metadataAny = paper?.pdf_metadata as any;
  const searchDataAny = paper?.pdf_search_data as any;

  return (
    metadataAny?.Institution ||
    searchDataAny?.Institution ||
    metadataAny?.Publisher ||
    searchDataAny?.Publisher ||
    ""
  );
};

const citationStyles: Record<CitationStyle, (paper: PDFDataType) => string> = {
  APA: (paper: PDFDataType) => {
    const authors = formatAPAAuthors(paper?.pdf_search_data?.Authors || "");
    const year = paper?.pdf_metadata?.PublicationYear || "";
    const title = toSentenceCase(paper?.pdf_search_data?.Title || "");
    const journal = paper?.pdf_search_data?.JournalName || "";
    const volume = (paper?.pdf_metadata as any)?.Volume || "";
    const pages = paper?.pdf_metadata?.NumberOfPages || "";
    const identifier = getIdentifier(paper);
    const institution = getInstitution(paper);

    let citation = `${authors}${authors ? " " : ""}`;
    citation += year ? `(${year}). ` : "";
    citation += title ? `${title}. ` : "";

    if (identifier.type === "working-paper") {
      citation += `${identifier.value}`;
      if (institution) {
        citation += `, ${institution}`;
      }
      citation += ".";
    } else if (identifier.type === "author-year") {
      if (journal) {
        citation += `${journal}`;
      } else {
        citation += "Preprint";
      }

      if (volume) {
        citation += `, ${volume}`;
      }

      if (pages) {
        citation += `, ${pages}`;
      }

      citation += ".";
    } else {
      if (journal) {
        citation += `${journal}`;

        if (volume) {
          citation += `, ${volume}`;
        }

        if (pages) {
          citation += `, ${pages}`;
        }

        citation += ".";
      }

      if (identifier.type === "doi") {
        citation += ` https://doi.org/${identifier.value}`;
      } else if (identifier.type === "arxiv") {
        citation += ` ${identifier.value}`;
      }
    }

    return citation.trim();
  },
  MLA: (paper: PDFDataType) => {
    const authors = formatStandardAuthors(
      paper?.pdf_search_data?.Authors || ""
    );
    const title = `"${toTitleCase(paper?.pdf_search_data?.Title || "")}"`;
    const journal = toTitleCase(paper?.pdf_search_data?.JournalName || "");
    const volume = (paper?.pdf_metadata as any)?.Volume || "";
    const issue = (paper?.pdf_metadata as any)?.Issue || "";
    const year = paper?.pdf_metadata?.PublicationYear || "";
    const pages = paper?.pdf_metadata?.NumberOfPages || "";
    const identifier = getIdentifier(paper);
    const institution = getInstitution(paper);

    let citation = "";

    if (authors) {
      citation += `${authors}. `;
    }

    if (title) {
      citation += `${title}. `;
    }

    if (identifier.type === "working-paper") {
      citation += `${identifier.value}`;
      if (institution) {
        citation += `, ${institution}`;
      }
      if (year) {
        citation += `, ${year}`;
      }
      citation += ".";
      return citation.trim();
    }

    if (identifier.type === "author-year") {
      if (journal) {
        citation += `${journal}`;
      } else {
        citation += "Preprint";
      }

      if (year) {
        citation += `, ${year}`;
      }

      citation += ".";
      return citation.trim();
    }

    if (journal) {
      citation += `${journal}`;
    }

    if (volume) {
      citation += `, vol. ${volume}`;
    }

    if (issue) {
      citation += `, no. ${issue}`;
    }

    if (year) {
      citation += `, ${year}`;
    }

    if (pages) {
      citation += `, pp. ${pages}`;
    }

    citation += ".";

    return citation.trim();
  },
  Chicago: (paper: PDFDataType) => {
    const authors = formatStandardAuthors(
      paper?.pdf_search_data?.Authors || ""
    );
    const title = `"${toTitleCase(paper?.pdf_search_data?.Title || "")}"`;
    const journal = toTitleCase(paper?.pdf_search_data?.JournalName || "");
    const volume = (paper?.pdf_metadata as any)?.Volume || "";
    const issue = (paper?.pdf_metadata as any)?.Issue || "";
    const year = paper?.pdf_metadata?.PublicationYear || "";
    const pages = paper?.pdf_metadata?.NumberOfPages || "";
    const identifier = getIdentifier(paper);
    const institution = getInstitution(paper);

    let citation = "";

    if (authors) {
      citation += `${authors}. `;
    }

    if (title) {
      citation += `${title}. `;
    }

    if (identifier.type === "working-paper") {
      citation += `${identifier.value}`;
      if (institution) {
        citation += `, ${institution}`;
      }
      if (year) {
        citation += `, ${year}`;
      }
      citation += ".";
      return citation.trim();
    }

    if (identifier.type === "author-year") {
      if (journal) {
        citation += `${journal}`;
      } else {
        citation += "Preprint";
      }

      if (year) {
        citation += `, ${year}`;
      }

      citation += ".";
      return citation.trim();
    }

    if (journal) {
      citation += `${journal}`;
    }

    if (volume) {
      citation += ` ${volume}`;
    }

    if (issue) {
      citation += `, no. ${issue}`;
    }

    if (year) {
      citation += ` (${year})`;
    }

    if (pages) {
      citation += `: ${pages}`;
    }

    citation += ".";

    return citation.trim();
  },
  Harvard: (paper: PDFDataType) => {
    const authors = formatStandardAuthors(
      paper?.pdf_search_data?.Authors || ""
    );
    const year = paper?.pdf_metadata?.PublicationYear || "";
    const title = toSentenceCase(paper?.pdf_search_data?.Title || "");
    const journal = paper?.pdf_search_data?.JournalName || "";
    const volume = (paper?.pdf_metadata as any)?.Volume || "";
    const issue = (paper?.pdf_metadata as any)?.Issue || "";
    const pages = paper?.pdf_metadata?.NumberOfPages || "";
    const identifier = getIdentifier(paper);
    const institution = getInstitution(paper);

    let citation = "";

    if (authors) {
      citation += `${authors}`;
    }

    if (year) {
      citation += ` (${year})`;
    }

    if (title) {
      citation += ` '${title}'`;
    }

    if (identifier.type === "working-paper") {
      citation += `, ${identifier.value}`;
      if (institution) {
        citation += `, ${institution}`;
      }
      citation += ".";
      return citation.trim();
    }

    if (identifier.type === "author-year") {
      if (journal) {
        citation += `, ${journal}`;
      } else {
        citation += `, Preprint`;
      }
      citation += ".";
      return citation.trim();
    }

    if (journal) {
      citation += `, ${journal}`;
    }

    if (volume) {
      citation += `, ${volume}`;
    }

    if (issue) {
      citation += `(${issue})`;
    }

    if (pages) {
      citation += `, pp. ${pages}`;
    }

    citation += ".";

    return citation.trim();
  },
  Vancouver: (paper: PDFDataType) => {
    const authors = paper?.pdf_search_data?.Authors || "";
    const authorList = authors.split(/,\s*|\s+and\s+/).filter((a) => a.trim());

    const formattedAuthors = authorList
      .map((author) => {
        const nameParts = author.trim().split(/\s+/);
        if (nameParts.length === 1) return nameParts[0];

        const lastName = nameParts[nameParts.length - 1];
        const initials = nameParts
          .slice(0, nameParts.length - 1)
          .map((part) => part.charAt(0))
          .join("");

        return `${lastName} ${initials}`;
      })
      .join(", ");

    const title = paper?.pdf_search_data?.Title || "";
    const journal = paper?.pdf_search_data?.JournalName || "";
    const year = paper?.pdf_metadata?.PublicationYear || "";
    const volume = (paper?.pdf_metadata as any)?.Volume || "";
    const issue = (paper?.pdf_metadata as any)?.Issue || "";
    const pages = paper?.pdf_metadata?.NumberOfPages || "";
    const identifier = getIdentifier(paper);
    const institution = getInstitution(paper);

    let citation = "";

    if (formattedAuthors) {
      citation += `${formattedAuthors}. `;
    }

    if (title) {
      citation += `${title}. `;
    }

    if (identifier.type === "working-paper") {
      citation += `${identifier.value}`;
      if (institution) {
        citation += `. ${institution}`;
      }
      if (year) {
        citation += `; ${year}`;
      }
      citation += ".";
      return citation.trim();
    }

    if (identifier.type === "author-year") {
      if (journal) {
        citation += `${journal}`;
      } else {
        citation += "Preprint";
      }

      if (year) {
        citation += ` ${year}`;
      }

      citation += ".";
      return citation.trim();
    }

    if (journal) {
      citation += `${journal}`;
    }

    if (year) {
      citation += ` ${year}`;
    }

    if (volume) {
      citation += `;${volume}`;
    }

    if (issue) {
      citation += `(${issue})`;
    }

    if (pages) {
      citation += `:${pages}`;
    }

    citation += ".";

    return citation.trim();
  },
};

const Citation: CitationStyle[] = [
  "APA",
  "MLA",
  "Chicago",
  "Harvard",
  "Vancouver",
];

const handleCopy = (item: boolean) => {
  if (item) {
    toast.success("Copy to clipboard!");
  } else {
    toast.error("Failed to copy citation.");
  }
};

const CitationDialog: React.FC<CitationDialogProps> = ({
  citationDialog,
  setCitationDialog,
  PDFData,
}) => {
  return (
    <div className="flex justify-end h-fit">
      <Dialog
        open={citationDialog}
        onOpenChange={() => setCitationDialog(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cite</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[500px] overflow-y-auto">
            {Citation?.map((citation, i) => (
              <div key={i} className="grid grid-cols-10 gap-4 mt-4 text-[13px]">
                <div className="col-span-2 text-end text-[#777]">
                  {citation}
                </div>
                <div className="col-span-7">
                  {PDFData && citationStyles?.[citation]?.(PDFData)}
                </div>
                <div className="col-span-1">
                  <CopyToClipboard
                    text={
                      PDFData ? citationStyles?.[citation]?.(PDFData) || "" : ""
                    }
                    onCopy={(text, result) => handleCopy(result)}
                  >
                    <IoMdCopy
                      className="text-[20px] cursor-pointer"
                      onClick={() => {}}
                    />
                  </CopyToClipboard>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CitationDialog;
