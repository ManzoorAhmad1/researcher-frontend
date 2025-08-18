import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { colors } from "@/mockData/mockTags";

interface FileCardDetailsProps {}
type PdfSearchData = {
  Title: string;
  Authors: string;
  PublicationDate: string;
  NumberOfPages: number;
  UploadDate: string;
  FileSize: number;
  UserDefinedTags: string[];
  Abstract: string;
  OverallStrengthsAndWeaknesses: string[];
  ResearchPublication: string[];
  KeyPointsAndFindings: string[];
  ResearchApproach: string[];
  DataType: string[];
  ResearchMethods: string[];
  ModelsAndFrameworks: string[];
  StatisticalApproachAndMethods: string[];
  StatisticalToolsUsed: string[];
  ResearchTopicAndQuestions: string[];
  LimitationsSharedByTheAuthor: string[];
  FutureDirectionsforFurtherResearch: string[];
  Top5Keywords: string[];
  JournalName: string;
};
interface FileDetails {
  number_of_page: number;
  size: number;
  file_name: string;
  pdf_search_data: PdfSearchData;
}

export const FileCardDetails: React.FC<FileCardDetailsProps> = () => {
  const [fileDetails, setFileDetails] = useState<FileDetails>({
    number_of_page: 0,
    size: 0,
    pdf_search_data: {
      Title: "",
      Authors: "",
      PublicationDate: "",
      NumberOfPages: 0,
      UploadDate: "",
      FileSize: 0,
      UserDefinedTags: [],
      Abstract: "",
      OverallStrengthsAndWeaknesses: [],
      ResearchPublication: [],
      KeyPointsAndFindings: [],
      ResearchApproach: [],
      DataType: [],
      ResearchMethods: [],
      ModelsAndFrameworks: [],
      StatisticalApproachAndMethods: [""],
      StatisticalToolsUsed: [""],
      ResearchTopicAndQuestions: [],
      LimitationsSharedByTheAuthor: [],
      FutureDirectionsforFurtherResearch: [],
      Top5Keywords: [""],
      JournalName: "",
    },
    file_name: "",
  });

  const supabase: SupabaseClient = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("filedocs")
        .select("number_of_page, size, pdf_search_data, file_name")
        .eq("id", 167)
        .single();

      if (data) {
        setFileDetails(data);
      } else {
        console.error("Error fetching data:", error);
      }
    } catch {}
  };

  return (
    <Card
      className="overflow-hidden w-full h-full flex flex-col"
      x-chunk="dashboard"
    >
      <CardContent className="p-6 text-sm h-full">
        <div className="text-2xl font-semibold leading-none tracking-tight w-auto overflow-hidden text-ellipsis line-clamp-1 mb-4">
          {fileDetails.pdf_search_data.Title}
        </div>
        <div className="flex">
          <div className="grid gap-3 w-full h-max">
            <div className="font-semibold">Research Details</div>
            <ul className="grid gap-3">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Authors Name</span>
                <span>{fileDetails.pdf_search_data.Authors}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Publication Date</span>
                <span>{fileDetails.pdf_search_data.PublicationDate}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Keywords </span>
                <div
                  className="w-1/2 flex justify-end rtl"
                  style={{ direction: "rtl" }}
                >
                  <div className="flex flex-wrap">
                    {fileDetails.pdf_search_data?.Top5Keywords?.map(
                      (value, index) => (
                        <div
                          style={{ backgroundColor: colors[index] }}
                          key={value}
                          className="inline-block px-2 py-1 mx-1 my-1 text-sm rounded-lg cursor-pointer"
                        >
                          {value}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Publication</span>
                <span>{fileDetails.pdf_search_data.JournalName}</span>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3 w-full">
          <div>
            <span className="font-semibold">Key Points</span>
            <div>
              {fileDetails.pdf_search_data.KeyPointsAndFindings.map((value) => {
                return value.length ? <li>{value}</li> : "";
              })}
            </div>
          </div>
          <div>
            <span className="font-semibold">Research Topic</span>
            <div>
              {" "}
              {fileDetails.pdf_search_data.ResearchTopicAndQuestions.map(
                (value) => {
                  return value.length ? <li>{value}</li> : "";
                }
              )}
            </div>
          </div>
          <div>
            <span className="font-semibold">Strengths and Weakness</span>
            <div>
              {" "}
              {fileDetails.pdf_search_data.OverallStrengthsAndWeaknesses.map(
                (value) => {
                  return value.length ? <li>{value}</li> : "";
                }
              )}
            </div>
          </div>
          <div>
            <span className="font-semibold">Research Methods</span>
            <div>
              {" "}
              {fileDetails.pdf_search_data.ResearchMethods.map((value) => {
                return value.length ? <li>{value}</li> : "";
              })}
            </div>
          </div>
          <div>
            <span className="font-semibold">Future Directions</span>
            <div>
              {" "}
              {fileDetails.pdf_search_data.FutureDirectionsforFurtherResearch.map(
                (value) => {
                  return value.length ? <li>{value}</li> : "";
                }
              )}
            </div>
          </div>
          <div>
            <span className="font-semibold">Statistical Methods</span>
            <div>
              {" "}
              {fileDetails.pdf_search_data.StatisticalApproachAndMethods.map(
                (value) => {
                  return value.length ? <li>{value}</li> : "";
                }
              )}
            </div>
          </div>

          <div>
            <span className="font-semibold">Statistical Tools</span>
            <div>
              {" "}
              {fileDetails.pdf_search_data.StatisticalToolsUsed.map((value) => {
                return value.length ? <li>{value}</li> : "";
              })}
            </div>
          </div>
          <div>
            <span className="font-semibold">Limitations</span>
            <div>
              {" "}
              {fileDetails.pdf_search_data.LimitationsSharedByTheAuthor.map(
                (value) => {
                  return value.length ? <li>{value}</li> : "";
                }
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
