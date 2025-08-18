import jsPDF from "jspdf";

const downloadBlob = (blob: any, filename: any) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
};

const escapePubMed = (text: string) => {
  if (typeof text !== "string") {
    return text;
  }
  const regex = /[\t\n\r\\]/g;
  return text.replace(regex, " ");
};

const escapeRis = (text: string) => {
  if (typeof text !== "string") {
    console.error("Expected a string, but got:", typeof text);
    return text;
  }
  const regex = /[\\{}%$&]/g;
  return text.replace(regex, (match) => "\\" + match);
};
const escapeBibTex = (text: string) => {
  if (typeof text !== "string") {
    console.error("Expected a string, but got:", typeof text);
    return text;
  }
  const regex = /[\\{}%$&]/g;
  return text.replace(regex, (match) => "\\" + match);
};

export const exportToCSV = (data: any) => {
  const records = Array.isArray(data) ? data : [data];

  const csvHeaders = [
    "PMID",
    "Title",
    "file_link",
    "Authors",
    "Research Approach",
    "Research Topics and Questions",
    "Pages",
    "Keywords",
    "Limitations Shared By Authors",
    "Size",
    "Journal",
    "Abstract",
    "Future Directions For Further Research",
    "Publication Date",
    "Keywords",
    "Strengths",
    "Weaknesses",
    "Citation Count",
  ];

  const escapeCsvValue = (value: any) => {
    if (typeof value === "string") {
      value = `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  if (records.length === 1) {
    const record = records[0];

    const title = record?.pdf_search_data?.Title || "No Title";
    const file_link = record?.file_link || "No File Link";
    const authors = Array.isArray(record?.pdf_metadata?.Authors)
      ? record.pdf_metadata.Authors.join("  ")
      : record?.pdf_search_data?.Authors || "Unknown Author";
    const pages =
      record?.number_of_page ||
      record?.pdf_metadata?.NumberOfPages ||
      "Unknown Pages";
    const size = record?.size || "Unknown Size";
    const journal = record?.pdf_metadata?.JournalName || "No Journal";
    const abstract =
      record?.pdf_metadata?.Abstract ||
      record?.pdf_search_data?.Abstract ||
      "No Abstract";
    const researchApproach =
      record?.pdf_category_data?.ResearchApproach ||
      record?.pdf_metadata?.ResearchApproach ||
      "No Research Approach";
    const keyPoints =
      record?.pdf_search_data?.KeyPointsAndFindings ||
      record?.pdf_category_data?.Keywords ||
      "No Keywords";
    const futureDirections =
      record?.pdf_search_data?.FutureDirectionsforFurtherResearch ||
      "No Future Directions";
    const limitations =
      record?.pdf_search_data?.LimitationsSharedByTheAuthor ||
      "No Limitations shared by Authors";
    const topicsAndQuestions =
      record?.pdf_search_data?.ResearchTopicAndQuestions || "No Topics";
    const publicationDate =
      record?.pdf_metadata?.PublicationDate || "No Publication Date";
    const keywords =
      Array.isArray(record.pdf_metadata?.Keywords) &&
      record.pdf_metadata?.Keywords.length > 0
        ? record.pdf_metadata?.Keywords.join("  ")
        : "No Keywords";
    const strengths = record?.pdf_metadata?.Strengths || "No Strengths";
    const weaknesses = record?.pdf_metadata?.Weaknesses || "No Weaknesses";
    const citationCount = record?.CitationCount || 0;

    const csvRow = [
      [
        record.id || "Unknown ID",
        title,
        file_link,
        authors,
        researchApproach,
        topicsAndQuestions,
        pages,
        keyPoints,
        limitations,
        size,
        journal,
        abstract,
        futureDirections,
        publicationDate,
        keywords,
        strengths,
        weaknesses,

        citationCount,
      ].map(escapeCsvValue),
    ];

    const csvContent = [
      csvHeaders.join(","),
      ...csvRow.map((row) => row.join(",")),
    ].join("\n");

    const fileName = `${record?.file_name || "unknown_name"}.csv`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    downloadBlob(blob, fileName);
  } else {
    const combinedCsvRows = records
      .map((record, index) => {
        const title = record?.pdf_metadata?.Title || `Record_${index + 1}`;
        const authors = Array.isArray(record?.pdf_metadata?.Authors)
          ? record.pdf_metadata.Authors.join(", ")
          : record?.pdf_search_data?.Authors || "Unknown Author";
        const pages =
          record?.number_of_page ||
          record?.pdf_metadata?.NumberOfPages ||
          "Unknown Pages";
        const size = record?.size || "Unknown Size";
        const journal = record?.pdf_metadata?.JournalName || "No Journal";
        const file_link = record?.file_link || "No File Link";
        const abstract =
          record?.pdf_metadata?.Abstract ||
          record?.pdf_search_data?.Abstract ||
          "No Abstract";
        const researchApproach =
          record?.pdf_category_data?.ResearchApproach ||
          record?.pdf_metadata?.ResearchApproach ||
          "No Research Approach";
        const keyPoints =
          record?.pdf_search_data?.KeyPointsAndFindings ||
          record?.pdf_category_data?.Keywords ||
          "No Keywords";
        const futureDirections =
          record?.pdf_search_data?.FutureDirectionsforFurtherResearch ||
          "No Future Directions";
        const limitations =
          record?.pdf_search_data?.LimitationsSharedByTheAuthor ||
          "No Limitations shared by Authors";
        const topicsAndQuestions =
          record?.pdf_search_data?.ResearchTopicAndQuestions || "No Topics";
        const publicationDate =
          record?.pdf_metadata?.PublicationDate || "No Publication Date";
        const keywords =
          Array.isArray(record.pdf_metadata?.Keywords) &&
          record.pdf_metadata?.Keywords.length > 0
            ? record.pdf_metadata?.Keywords.join(", ")
            : "No Keywords";
        const strengths = record?.pdf_metadata?.Strengths || "No Strengths";
        const weaknesses = record?.pdf_metadata?.Weaknesses || "No Weaknesses";
        const citationCount = record?.CitationCount || 0;

        return [
          [
            record.id || "Unknown ID",
            title,
            file_link,
            authors,
            researchApproach,
            topicsAndQuestions,
            pages,
            keyPoints,
            limitations,
            size,
            journal,
            abstract,
            futureDirections,
            publicationDate,
            keywords,
            strengths,
            weaknesses,
            citationCount,
          ].map(escapeCsvValue),
        ].join(",");
      })
      .join("\n");

    const fileName = "combined_records.csv";
    const csvContent = `${csvHeaders.join(",")}\n${combinedCsvRows}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    downloadBlob(blob, fileName);
  }
};

export const exportToPDF = (data: any) => {
  const records = Array.isArray(data) ? data : [data];

  records.forEach((record: any, index: number) => {
    const doc = new jsPDF();

    const fileLink = record?.file_link;

    if (fileLink) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", fileLink, true);
      xhr.responseType = "blob";
      xhr.onload = () => {
        const blob = xhr.response;
        const pdfUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = pdfUrl;

        link.download = `${record?.file_name || `Document_${index + 1}`}.pdf`;
        link.click();
      };
      xhr.onerror = () => {
        console.error("Failed to download the file.");
      };

      xhr.send();
    } else {
      const title = record?.pdf_metadata?.Title || "No Title";
      const authors = Array.isArray(record?.pdf_metadata?.Authors)
        ? record?.pdf_metadata?.Authors.join(", ")
        : record?.pdf_search_data?.Authors || "Unknown Author";
      const pages =
        record?.number_of_page ||
        record?.pdf_metadata?.NumberOfPages ||
        "Unknown Pages";
      const file_link = record?.file_link || "No File Link";
      const size = record?.size || "Unknown Size";
      const journal = record?.pdf_metadata?.JournalName || "No Journal";
      const abstract =
        record?.pdf_metadata?.Abstract ||
        record?.pdf_search_data?.Abstract ||
        "No Abstract";
      const researchApproach =
        record?.pdf_category_data?.ResearchApproach ||
        record?.pdf_metadata?.ResearchApproach ||
        "No Research Approach";
      const keyPoints =
        record?.pdf_search_data?.KeyPointsAndFindings ||
        record?.pdf_category_data?.Keywords ||
        "No Keywords";
      const futureDirections =
        record?.pdf_search_data?.FutureDirectionsforFurtherResearch ||
        "No Future Directions";
      const limitations =
        record?.pdf_search_data?.LimitationsSharedByTheAuthor ||
        "No Limitations";
      const topicsAndQuestions =
        record?.pdf_search_data?.ResearchTopicAndQuestions || "No Topics";
      const publicationDate =
        record?.pdf_metadata?.PublicationDate || "No Publication Date";
      const keywords =
        Array.isArray(record?.pdf_metadata?.Keywords) &&
        record?.pdf_metadata?.Keywords.length > 0
          ? record?.pdf_metadata?.Keywords.join(", ")
          : "No Keywords";
      const strengths = record?.pdf_metadata?.Strengths || "No Strengths";
      const weaknesses = record?.pdf_metadata?.Weaknesses || "No Weaknesses";
      const citationCount = record?.CitationCount || 0;

      const content = `
          PMID: ${record.id || "Unknown ID"}
          Title: ${title}
          Authors: ${authors}
          Research Approach: ${researchApproach}
          Research Topics and Questions: ${topicsAndQuestions}
          Pages: ${pages}
          Keywords: ${keyPoints}
          Limitations Shared By Authors: ${limitations}
          Size: ${size}
          file_link : ${file_link}
          Journal: ${journal}
          Abstract: ${abstract}
          Future Directions For Further Research: ${futureDirections}
          Publication Date: ${publicationDate}
          Keywords: ${keywords}
          Strengths: ${strengths}
          Weaknesses: ${weaknesses}
          Citation Count: ${citationCount}
        `;

      doc.setFontSize(12);
      doc.text(content.trim(), 10, 10);

      doc.save(`${record?.file_name || "unknown_name"}.pdf`);
    }
  });
};
export const exportToRis = (data: any) => {
  const records = Array.isArray(data) ? data : [data];

  const isSingleRecord = records.length === 1;
  const fileName = isSingleRecord
    ? `${records[0].file_name || "unknown_name"}.ris`
    : "combined_records.ris";

  const combinedRis = records
    .map((record: any) => {
      const title = record?.pdf_search_data?.Title || "No Title";
      const authors = Array.isArray(record?.pdf_metadata?.Authors)
        ? record.pdf_metadata.Authors.map(
            (author: string) => `AU  - ${escapeRis(author)}`
          ).join("\n")
        : `AU  - ${escapeRis(
            record?.pdf_metadata?.Authors || "Unknown Author"
          )}`;
      const journal = record?.pdf_metadata?.JournalName || "No Journal";
      const abstract =
        record?.pdf_metadata?.Abstract ||
        record?.pdf_search_data?.Abstract ||
        "No Abstract";
      const researchApproach =
        record?.pdf_category_data?.ResearchApproach ||
        record?.pdf_metadata?.ResearchApproach ||
        "No Research Approach";
      const topicsAndQuestions =
        record?.pdf_search_data?.ResearchTopicAndQuestions || "No Topics";
      const keywords =
        Array.isArray(record.pdf_metadata?.Keywords) &&
        record.pdf_metadata?.Keywords.length > 0
          ? record.pdf_metadata?.Keywords.map(escapeRis).join("; ")
          : "No Keywords";
      const keyPoints =
        record?.pdf_search_data?.KeyPointsAndFindings ||
        record?.pdf_category_data?.Keywords ||
        "No Key Points";
      const futureDirections =
        record?.pdf_search_data?.FutureDirectionsforFurtherResearch ||
        "No Future Directions";
      const limitations =
        record?.pdf_search_data?.LimitationsSharedByTheAuthor ||
        "No Limitations";
      const strengths = record?.pdf_metadata?.Strengths || "No Strengths";
      const weaknesses = record?.pdf_metadata?.Weaknesses || "No Weaknesses";
      const publicationDate =
        record?.pdf_metadata?.PublicationDate || "No Publication Date";
      const year = record?.pdf_metadata?.PublicationYear || "Unknown Year";
      const pages =
        record?.number_of_page ||
        record?.pdf_metadata?.NumberOfPages ||
        "Unknown Pages";
      const size = record?.size || "Unknown Size";
      const citationCount = record?.CitationCount || 0;
      const fileLink = record?.file_link || "No File Link";

      return `
TY  - JOUR
TI  - ${escapeRis(title)}
${authors}
JO  - ${escapeRis(journal)}
PY  - ${escapeRis(year)}
DA  - ${escapeRis(publicationDate)}
SP  - ${escapeRis(record?.pdf_metadata?.StartPage || "Unknown")}
EP  - ${escapeRis(record?.pdf_metadata?.EndPage || "Unknown")}
N1  - Research Approach: ${escapeRis(researchApproach)}
N2  - Abstract: ${escapeRis(abstract)}
KW  - ${keywords}
KW  - Key Points: ${escapeRis(keyPoints)}
KW  - Topics and Questions: ${escapeRis(topicsAndQuestions)}
KW  - Future Directions: ${escapeRis(futureDirections)}
KW  - Limitations: ${escapeRis(limitations)}
KW  - Strengths: ${escapeRis(strengths)}
KW  - Weaknesses: ${escapeRis(weaknesses)}
PB  - Pages: ${escapeRis(pages)}
N1  - Size: ${escapeRis(size)}
N1  - Citation Count: ${citationCount}
UR  - ${fileLink}
ER  -`.trim();
    })
    .join("\n\n");

  const blob = new Blob([combinedRis], {
    type: "application/x-research-info-systems",
  });

  downloadBlob(blob, fileName);
};

export const exportToBibTex = (data: any) => {
  const records = Array.isArray(data) ? data : [data];

  const combinedBibTexText = records
    .map((record: any) => {
      const title = record?.pdf_search_data?.Title || "No Title";
      const authors = Array.isArray(record?.pdf_metadata?.Authors)
        ? record?.pdf_metadata?.Authors.join(" and ")
        : record?.pdf_metadata?.Authors || "Unknown Author";
      const journal = record?.pdf_metadata?.JournalName || "No Journal";
      const abstract =
        record?.pdf_metadata?.Abstract ||
        record?.pdf_search_data?.Abstract ||
        "No Abstract";
      const researchApproach =
        record?.pdf_category_data?.ResearchApproach ||
        record?.pdf_metadata?.ResearchApproach ||
        "No Research Approach";
      const topicsAndQuestions =
        record?.pdf_search_data?.ResearchTopicAndQuestions || "No topics";
      const keywords =
        Array.isArray(record.pdf_metadata?.Keywords) &&
        record.pdf_metadata?.Keywords.length > 0
          ? record.pdf_metadata?.Keywords.join(", ")
          : "No Keywords";
      const keypoint =
        record?.pdf_search_data?.KeyPointsAndFindings ||
        record?.pdf_category_data?.Keywords ||
        "No Key Points";
      const futureDirections =
        record?.pdf_search_data?.FutureDirectionsforFurtherResearch ||
        "No Future Directions";
      const limitations =
        record?.pdf_search_data?.LimitationsSharedByTheAuthor ||
        "No Limitations";
      const strengths = record.pdf_metadata?.Strengths || "No Strengths";
      const weaknesses = record.pdf_metadata?.Weaknesses || "No Weaknesses";
      const publicationDate =
        record.pdf_metadata?.PublicationDate || "No Publication Date";
      const year = record?.pdf_metadata?.PublicationYear || "Unknown Year";
      const pages =
        record?.number_of_page ||
        record?.pdf_metadata?.NumberOfPages ||
        "Unknown Pages";
      const size = record?.size || "Unknown Size";
      const citationCount = record?.CitationCount || 0;
      const fileLink = record?.file_link || "No File Link";

      return `
  @article{${record.id || "unknown_id"},
    title = {${escapeBibTex(title)}},
    author = {${escapeBibTex(authors)}},
    journal = {${escapeBibTex(journal)}},
    year = {${escapeBibTex(year)}},
    abstract = {${escapeBibTex(abstract)}},
    research_approach = {${escapeBibTex(researchApproach)}},
    topics_and_questions = {${escapeBibTex(topicsAndQuestions)}},
    pages = {${escapeBibTex(pages)}},
    size = {${escapeBibTex(size)}},
    keywords = {${escapeBibTex(keywords)}},
    keypoints = {${escapeBibTex(keypoint)}},
    limitations = {${escapeBibTex(limitations)}},
    future_directions = {${escapeBibTex(futureDirections)}},
    strengths = {${escapeBibTex(strengths)}},
    weaknesses = {${escapeBibTex(weaknesses)}},
    publication_date = {${escapeBibTex(publicationDate)}},
    citation_count = {${citationCount}},
    file_link = {${fileLink}}
  }
        `.trim();
    })
    .join("\n\n");

  const fileName =
    records.length === 1
      ? `${records[0]?.file_name || "unknown_name"}.bib`
      : "combined_records.bib";

  const blob = new Blob([combinedBibTexText], {
    type: "application/x-bibtex",
  });
  downloadBlob(blob, fileName);
};

export const exportToPubMed = (data: any) => {
  const records = Array.isArray(data) ? data : [data];

  const pubMedTexts = records.map((record: any) => {
    const title = record?.pdf_search_data?.Title || "No Title";
    const authors =
      record?.pdf_metadata?.Authors ||
      record?.pdf_search_data?.Authors ||
      "Unknown Author";
    const journal = record?.pdf_metadata?.JournalName || "No Journal";
    const abstract =
      record?.pdf_metadata?.Abstract ||
      record?.pdf_search_data?.Abstract ||
      "No Abstract";
    const publicationDate =
      record?.pdf_metadata?.PublicationDate || "No Publication Date";
    const pmid = record.id || "Unknown ID";
    const pages =
      record?.number_of_page ||
      record?.pdf_metadata?.NumberOfPages ||
      "Unknown Pages";
    const size = record?.size || "Unknown Size";
    const researchApproach =
      record?.pdf_category_data?.ResearchApproach ||
      record?.pdf_metadata?.ResearchApproach ||
      "No Research Approach";
    const keywords =
      record?.pdf_search_data?.KeyPointsAndFindings ||
      record?.pdf_category_data?.Keywords ||
      "No Keywords";
    const futureDirections =
      record?.pdf_search_data?.FutureDirectionsforFurtherResearch ||
      "No Future Directions";
    const limitations =
      record?.pdf_search_data?.LimitationsSharedByTheAuthor ||
      "No Limitations shared by Authors";
    const topicsAndQuestions =
      record?.pdf_search_data?.ResearchTopicAndQuestions || "No Topics";
    const strengths = record.pdf_metadata?.Strengths || "No Strengths";
    const weaknesses = record.pdf_metadata?.Weaknesses || "No Weaknesses";
    const citationCount = record?.CitationCount || 0;
    const file_link = record?.file_link || "No File Link";

    return `
    PMID- ${escapePubMed(pmid)}
    TI  - ${escapePubMed(title)}
    AB  - ${escapePubMed(abstract)}
    AU  - ${escapePubMed(authors)}
    DP  - ${escapePubMed(publicationDate)}
    TA  - ${escapePubMed(journal)}
    PG  - ${escapePubMed(pages)}
    SZ  - ${escapePubMed(size)}
    RA  - ${escapePubMed(researchApproach)}
    OT  - ${escapePubMed(keywords)}
    FD  - ${escapePubMed(futureDirections)}
    LM  - ${escapePubMed(limitations)}
    TQ  - ${escapePubMed(topicsAndQuestions)}
    ST  - ${escapePubMed(strengths)}
    WK  - ${escapePubMed(weaknesses)}
    CC  - ${escapePubMed(citationCount.toString())}
    FL  - ${file_link}
    `.trim();
  });

  if (records.length === 1) {
    const fileName = `${records[0].file_name || "unknown_name"}.pubmed.txt`;
    const blob = new Blob([pubMedTexts[0]], { type: "text/plain" });
    downloadBlob(blob, fileName);
  } else {
    const combinedText = pubMedTexts.join("\n\n--------------------------\n\n");
    const fileName = "combined_records.pubmed.txt";
    const blob = new Blob([combinedText], { type: "text/plain" });
    downloadBlob(blob, fileName);
  }
};
