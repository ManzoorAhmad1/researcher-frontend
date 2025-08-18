import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PDFData as PDFDataType } from "@/types/types";
import { overviewTag, overviewFieldLineColor } from "@/utils/commonUtils";
import { isValidListArray, isValidString } from "@/utils/commonUtils";
import { RxDotFilled } from "react-icons/rx";

interface FileResearchCategoryProps {
  fileId?: number;
  fileName: string;
  PDFData: any;
  hideSideView: boolean;
}

export const FileResearchCategory: React.FC<FileResearchCategoryProps> = ({
  PDFData,
  hideSideView,
}) => {
  const {
    ResearchApproach,
    DataType,
    ResearchQuestion,
    PublicationDetails,
    Metrics,
    TheoreticalFramework,
    ResearchDesign,
    IndustryApplicationContext,
    StakeholderPerspective,
    GeographicalContext,
    ImpactAssessment,
    Limitations,
    FutureDirections,
  } = PDFData?.pdf_category_data || {};

  const {
    PublicationDate,
    OverallStrengthsAndWeaknesses,
    KeyPointsAndFindings,
    ResearchMethods,
    StatisticalApproachAndMethods,
    StatisticalToolsUsed,
    ResearchTopicAndQuestions,
    LimitationsSharedByTheAuthor,
    FutureDirectionsforFurtherResearch,
    Top5Keywords,
    JournalName,
    Summary,
  } = PDFData?.pdf_search_data || {};

  const renderSection = (
    title: string,
    data: string | string[] | undefined,
    lineColor: string
  ) => {
    if (Array.isArray(data) && isValidListArray(data)) {
      return (
        <div className="flex">
          <div
            className={`bg-[lineColor] px-1 mr-6 mt-2 mb-2.5 ml-1 ${
              hideSideView ? "hidden" : "block"
            }`}
            style={{ backgroundColor: lineColor }}
          ></div>
          <div>
            <span className="font-poppins text-base font-medium leading-[25.5px] text-[#333333] dark:text-[#CCCCCC]">
              {title}
            </span>
            <div className="mt-1">
              {data.map((value: string, index: number) =>
                value.length > 0 ? (
                  <div className="flex" key={index}>
                    <RxDotFilled
                      width="30px"
                      height="30px"
                      className="dark:text-[#CCCCCC] text-[#333333]"
                      style={{ margin: "0.3rem 8px" }}
                    />
                    <div className="text-base dark:text-[#CCCCCC]">{value}</div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      );
    } else if (typeof data === "string" && isValidString(data)) {
      return (
        <div className="flex">
          <div
            className={`bg-[lineColor] px-1 mr-6 mt-2 mb-3 ml-1 ${
              hideSideView ? "hidden" : "block"
            }`}
            style={{ backgroundColor: lineColor }}
          ></div>
          <div>
            <span className="font-poppins text-base font-medium leading-[25.5px] text-[#333333] dark:text-[#CCCCCC]">
              {title}
            </span>
            <div className="mt-1">
              <div className="flex">
                <RxDotFilled
                  width="30px"
                  height="30px"
                  className="dark:text-[#CCCCCC] text-[#333333] my-[0.3rem] mx-[8px]"
                  style={{ margin: "0.3rem 8px" }}
                />
                <div className="text-base">{data}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const overviewData = [
    { title: "Research Approach", data: ResearchApproach },
    { title: "Data Type", data: DataType },
    { title: "Research Question", data: ResearchQuestion },
    { title: "Publication Details", data: PublicationDetails?.JournalName },
    {
      title: "Author Affiliations",
      data: PublicationDetails?.AuthorAffiliations,
    },
    { title: "Citations Count", data: PDFData?.CitationCount?.toString() },
    { title: "Impact Factor", data: Metrics?.ImpactFactor },
    { title: "H-Index", data: Metrics?.HIndex },
    { title: "Theoretical Framework", data: TheoreticalFramework },
    {
      title: "Research Design",
      data: ResearchDesign
        ? ResearchDesign.Quantitative
          ? "Quantitative"
          : ResearchDesign.Qualitative
          ? "Qualitative"
          : "Mixed Methods"
        : "",
    },
    { title: "Industry Application Context", data: IndustryApplicationContext },
    {
      title: "Stakeholder Perspective",
      data: StakeholderPerspective
        ? Object.keys(StakeholderPerspective)
            .filter((key) => StakeholderPerspective[key])
            .join(", ")
        : "",
    },
    { title: "Geographical Context", data: GeographicalContext?.Region },
    {
      title: "Impact Assessment",
      data: ImpactAssessment
        ? Object.keys(ImpactAssessment)
            .filter((key) => ImpactAssessment[key])
            .join(", ")
        : "",
    },
    { title: "Limitations", data: Limitations },
    { title: "Future Directions", data: FutureDirections },
  ];

  return (
    <Card
      className="overflow-hidden w-full h-full flex flex-col mb-12"
      x-chunk="dashboard"
    >
      <CardContent className="p-6 text-sm h-full dark:bg-[#152428]">
        <div className="flex">
          <div className="flex w-[65%] flex-col gap-y-1">
            <label className="font-poppins text-[12px] font-semibold leading-[18px] text-left text-[#999999]">
              PUBLICATION
            </label>
            <div className="font-poppins text-[18px] font-medium leading-[27px] text-left text-[#333333] dark:text-[#CCCCCC]">
              {isValidString(JournalName) && JournalName}
            </div>
            <label className="text-gray-400 font-poppins text-sm font-semibold leading-[22.5px] text-left mt-2">
              Publication Year:
              <span className="font-poppins text-sm font-medium leading-[22.5px] text-left text-gray-800 dark:text-[#CCCCCC]">
                &nbsp;
                {isValidString(PDFData?.pdf_search_data?.PublicationDate) &&
                  (() => {
                    const pubDate = PDFData?.pdf_search_data?.PublicationDate;
                    if (/^\d{4}$/.test(pubDate)) {
                      return pubDate;
                    }
                    const yearMatch = pubDate.match(/\b(19|20)\d{2}\b/);
                    return yearMatch ? yearMatch[0] : pubDate;
                  })()}
              </span>
            </label>
          </div>
          <div className="flex flex-col gap-y-1 w-[35%]">
            <label className="font-poppins text-[12px] font-semibold leading-[18px] text-left text-[#999999] ml-1">
              KEYWORDS
            </label>
            <div className="flex flex-wrap">
              {isValidListArray(Top5Keywords) &&
                Top5Keywords.slice(0, 5).map((value: string, index: number) => {
                  const tag = overviewTag[index % overviewTag.length];
                  return (
                    <div
                      style={{ backgroundColor: tag.bgColor, color: tag.color }}
                      key={value}
                      className="inline-block  mx-1 my-1 font-poppins text-sm font-medium leading-[19.5px] text-left px-3 py-1"
                    >
                      {value}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3 w-full">
          {overviewData
            .filter((value) => value.data !== "" && value.data?.length > 0)
            .map((value, index) => {
              const lineColor =
                overviewFieldLineColor[index % overviewFieldLineColor.length];
              return (
                <div className="flex" key={index}>
                  <span
                    className={`text-2xl leading-[35px] font-poppins font-normal text-left pr-2 min-w-[45px] text-[28px] ${
                      hideSideView ? "hidden" : "block"
                    }`}
                  >
                    {index + 1}
                  </span>
                  {renderSection(value.title, value.data, lineColor)}
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );
};
