import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PDFData as PDFDataType } from "@/types/types";
import { supabase } from "@/app/(auth)/signup/supabaseClient";
import CopyToClipboard from "react-copy-to-clipboard";
import { Folder as FolderType } from "@/types/types";
import { IoMdCopy } from "react-icons/io";
import toast from "react-hot-toast";

interface CitationDialogProps {
  data: FolderType | any;
  selectedItems: any | [];
  referencesGeneratorDialog: boolean;
  setReferencesGeneratorDialog: (open: boolean) => void;
}

type CitationStyles = {
  APA: string;
  MLA: string;
  Chicago: string;
  Harvard: string;
  Vancouver: string;
};

const citationStyles = ["APA", "Chicago", , "Harvard", "MLA", "Vancouver"];

const ReferencesGeneratorDialog: React.FC<CitationDialogProps> = ({
  data,
  selectedItems,
  referencesGeneratorDialog,
  setReferencesGeneratorDialog,
}) => {
  const [selectedStyle, setSelectedStyle] = useState("APA");
  const [selectedDropdown, setSelectedDropdown] = useState("APA");
  const [generatedReferences, setGeneratedReferences] = useState<
    CitationStyles[]
  >([]);
  const [PDFDatas, setPDFDatas] = useState<PDFDataType[]>([]);

  const handleStyleChange = (value: string) => {
    setSelectedStyle(value);
  };

  const generateReferences = () => {
    setSelectedDropdown(selectedStyle);

    const citationStylesArray = PDFDatas.map((paper) => {
      const authors = paper?.pdf_search_data?.Authors
        ? paper.pdf_search_data.Authors + "."
        : "";
      const title = paper?.pdf_search_data?.Title
        ? paper.pdf_search_data.Title + "."
        : "";
      const journal = paper?.pdf_search_data?.JournalName
        ? paper.pdf_search_data.JournalName
        : "";
      const year = paper?.pdf_metadata?.PublicationYear
        ? paper.pdf_metadata.PublicationYear
        : "";
      const size = paper?.size || "";
      const pages = paper?.pdf_metadata?.NumberOfPages
        ? paper.pdf_metadata.NumberOfPages
        : "";

      return {
        APA: `${authors} ${year ? `(${year}).` : ""} ${title} ${
          journal ? journal + "," : ""
        } ${size ? size + "," : ""} ${pages ? pages + "." : ""}`,
        MLA: `${authors} "${title}" ${journal ? journal + "," : ""} ${
          size ? "vol. " + size + "," : ""
        } ${year ? year + "," : ""} ${pages ? "pp. " + pages + "." : ""}`,
        Chicago: `${authors} "${title}" ${journal ? journal + "," : ""} ${
          size ? size + "," : ""
        } ${year ? `(${year}):` : ""} ${pages ? pages + "." : ""}`,
        Harvard: `${authors} ${year ? year + "." : ""} ${title} ${
          journal ? journal + "," : ""
        } ${size ? size + "," : ""} ${pages ? "pp. " + pages + "." : ""}`,
        Vancouver: `${authors} ${title} ${journal ? journal + "." : ""} ${
          year ? year + ";" : ""
        }${size ? size + ":" : ""} ${pages ? pages + "." : ""}`,
      };
    });

    setGeneratedReferences(citationStylesArray);
  };

  const fetchDataById = async (): Promise<void> => {
    try {
      const results = await Promise.all(
        selectedItems.map((fileName: any) =>
          supabase.from("filedocs").select("*").eq("id", fileName).single()
        )
      );

      const dataArr: PDFDataType[] = results
        .filter(({ data, error }) => data && !error)
        .map(({ data }) => data as PDFDataType);
      if (dataArr.length > 0) {
        setPDFDatas(dataArr);
      } else {
        console.error("Error fetching data or no data found.");
      }
    } catch (error: any) {
      console.error("An error occurred:", error);
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    }
  };

  const handleCopy = (item: boolean) => {
    if (item) {
      toast.success("Copy to clipboard!");
    } else {
      toast.error("Failed to copy citation.");
    }
  };

  useEffect(() => {
    fetchDataById();
  }, [selectedItems]);

  return (
    <div className="flex justify-end">
      <Dialog
        open={referencesGeneratorDialog}
        onOpenChange={() => setReferencesGeneratorDialog(false)}
      >
        <DialogContent className="max-h-full overflow-y-auto">
          <div>
            <h1 className="text-2xl font-bold mb-6">References Generator</h1>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Citation Style
              </label>
              <Select
                onValueChange={handleStyleChange}
                defaultValue={selectedStyle}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a citation style" />
                </SelectTrigger>
                <SelectContent>
                  {citationStyles.map((style) => (
                    <SelectItem key={style} value={style || ""}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-6 p-4 bg-gray-100 rounded">
              <h2 className="text-sm font-medium text-gray-700 mb-2">
                Preview
              </h2>
              <p className="text-sm text-gray-600">
                {selectedStyle === "APA" &&
                  "Author, A. A. (Year). Title of work. Publisher."}
                {selectedStyle === "Harvard" &&
                  "Author Surname, Initial. Year. Title of work. City: Publisher."}
                {selectedStyle === "Chicago" &&
                  "Author Last Name, First Name. Year. Title of Work. City: Publisher."}
                {selectedStyle === "MLA" &&
                  "Author Surname, First Name. Title of Work. Publisher, Year."}
              </p>
            </div>

            <Button onClick={generateReferences} className="w-full mb-6">
              Generate References
            </Button>
            {generatedReferences?.length > 0 && (
              <div className="mb-6 p-4 bg-gray-100 rounded">
                {generatedReferences?.map((item: any, i) => (
                  <div className="flex text-sm text-gray-600 mb-4" key={i}>
                    <div className="text-nowrap">{i + 1} . </div>
                    <p className="ps-2">{item?.[selectedDropdown]}</p>
                    <div className="col-span-1">
                      <CopyToClipboard text={item?.[selectedDropdown]}>
                        <IoMdCopy
                          className="text-[20px] cursor-pointer"
                          onClick={() => handleCopy(true)}
                        />
                      </CopyToClipboard>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {generatedReferences?.length > 0 && (
              <CopyToClipboard
                text={
                  generatedReferences
                    ?.map((item: any) => item?.[selectedDropdown])
                    .join("\n") + "\n"
                }
              >
                <div
                  className="flex justify-end"
                  onClick={() => handleCopy(true)}
                >
                  <Button variant="outline" size="sm" className="rounded-[26px]">
                    <Copy className="mr-2 h-4 w-4" /> Copy References
                  </Button>
                </div>
              </CopyToClipboard>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReferencesGeneratorDialog;
