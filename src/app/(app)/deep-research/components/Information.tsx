import React, { useEffect, useState } from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { FaEdit } from "react-icons/fa";
import { getCreditAnalysis, startAnalysisApi } from "@/apis/research-assistant";
import { LoaderCircle } from "lucide-react";
import { AppDispatch, RootState } from "@/reducer/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchSubscription } from "@/reducer/services/subscriptionApi";
import { supabase } from "@/app/(auth)/signup/supabaseClient";
import toast from "react-hot-toast";
import { AcademicPapersDialog } from "./AcademicPapersDialog/AcademicPapersDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ContentInclutionTableDialog } from "./ContentInclutionTableDialog/ContentInclutionTableDialog";
import { ContentInclutionTableDialogForAutoGen } from "./ContentInclutionTableDialog/ContentInclutionTableDialogForAutoGen";

const Information = ({
  id,
  steps,
  setSteps,
  mainLoading,
  progressName,
  startResearchLoader,
  startResearchDisabled,
  setStartResearchLoader,
  disabled,
  setDisabled,
}: any) => {
  const [edit, setEdit] = useState(true);
  // const [disabled, setDisabled] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.user.user?.user);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    stepIndex: number,
    outlineDataIndex: number,
    outlineAnsIndex: number
  ) => {
    const updatedSteps = [...steps];

    if (
      updatedSteps[stepIndex] &&
      updatedSteps[stepIndex].ans &&
      updatedSteps[stepIndex].ans[outlineDataIndex] &&
      updatedSteps[stepIndex].ans[outlineDataIndex].ans
    ) {
      updatedSteps[stepIndex].ans[outlineDataIndex].ans[outlineAnsIndex] =
        e.target.value;
    }
    setSteps(updatedSteps); // Update state
  };

  const startAnalysis = async () => {
    setStartResearchLoader(true);
    setEdit(true)
    const response = await getCreditAnalysis(userInfo?.id);
    const currentData = response?.data;

    // userInfo?.subscription?.credit_limit - userInfo?.subscription?.credit
    if (currentData?.credit_limit - currentData?.credit > 10) {
      // setStartResearchLoader(true);
      setDisabled(true);
      const data = steps
        ?.filter((item: any) => item?.label === "Outline Generation")
        .flatMap((item: any) =>
          item?.ans?.flatMap((outlineData: any) => outlineData || [])
        );

      await startAnalysisApi(id, data);
      await dispatch(fetchSubscription({ id: userInfo?.id }));
    } else {
      setStartResearchLoader(false);
      toast.error(
        `You are nearing your AI credit limit. Approximately ${Math.max(
          0,
          currentData?.credit_limit - currentData?.credit
        )} remaining credits left. Please consider recharging to continue enjoying uninterrupted services.\nThank you for using ResearchCollab!`
      );
    }
  };

  useEffect(() => {
    if (
      startResearchDisabled || 
      progressName === "Information Search" || 
      progressName === "Content Inclusion"
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
    //   setDisabled(startResearchDisabled);
  }, [startResearchDisabled, progressName]);


  const completed = steps.filter(
    (i: any) => i?.status === "completed" && i?.progress === 100
  );
  const [openItems, setOpenItems] = useState<string[]>([
    String(completed?.length - 1),
  ]);
  const handleAccordionChange = (values: string[]) => {
    // const lastIndex = String(steps?.length - 3);
    // if (!values.includes(lastIndex)) {
    //   values.push(lastIndex); // Force last item to remain open
    // }
    setOpenItems(values);
  };

  useEffect(() => {
    setOpenItems([String(completed?.length - 1)]);
  }, [completed?.length]);

  return (
    <div>
      {/* <div
        className={`transition-opacity duration-500 ease-in-out ${
          mainLoading ? "opacity-100" : "opacity-0 hidden"
        }`}
      >
        <h4 className="pt-6 font-medium text-[18px] dark:text-[#CCCCCC]">
          {progressName}
        </h4>
        <p className="text-[#666666] font-normal text-[13px] dark:text-[#CCCCCC]">
          Currently in progress<span className="blinking-dots"></span>
        </p>
      </div> */}

      <div className="mt-0">
        <div className="">
          <Accordion
            type="multiple"
            className="w-full"
            value={openItems}
            onValueChange={handleAccordionChange}
          >
            {steps?.map((item: any, i: any) => {
              if (item?.ans) {
                if (item?.label === "Topic Selection") {
                  return (
                    <div
                      key={i}
                      className="border bg-white dark:bg-[#2C3A3F] border-[#E5E5E5] dark:border-[#2C3A3F] rounded-lg p-4 mt-4"
                    >
                      <div className="mt-2 font-semibold">
                        {steps?.[i].label}
                      </div>
                      <hr className="my-3" />
                      <MarkdownPreview
                        source={item?.ans}
                        wrapperElement={{ "data-color-mode": "light" }}
                        className="font-family-poppins font-Poppins bg-transparent text-[16px] font-normal leading-[24px] text-[#666666] dark:text-[#CCCCCC]"
                        style={{
                          background: "transparent",
                          fontSize: "16px",
                          fontWeight: 400,
                          lineHeight: "24px",
                        }}
                      />
                    </div>
                  );
                }
                if (item?.label === "Outline Generation") {
                  return (
                    <AccordionItem value={String(i)}>
                      <div
                        className="bg-white border border-[#E5E5E5] dark:bg-[#2C3A3F] dark:border-[#2C3A3F] rounded-lg mt-5 p-4 relative "
                        key={i}
                      >
                        <div className="flex justify-between gap-2 items-center">
                          <div className="flex gap-2 items-center">
                            <div className="mt-2 font-semibold whitespace-nowrap">
                              {steps?.[i].label}
                            </div>
                            <AccordionTrigger
                              className="hover:no-underline mt-2"
                              iconStyle="h-6 w-6"
                            >
                              <span>{""}</span>
                            </AccordionTrigger>
                          </div>
                          <div className="flex items-center gap-2 justify-between">
                            {!disabled && (
                              <span className="text-gray-400 text-[12px] italic">
                                Review and edit the outline before starting the
                                research.
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEdit(!edit);
                              }}
                              type="button"
                              disabled={disabled}
                              className={
                                disabled
                                  ? "button-outline w-[150px] cursor-not-allowed"
                                  : "button-outline w-[150px]"
                              }
                            >
                              <span className="text-nowrap">Edit Outline</span>
                            </button>
                            <button
                              type="button"
                              className="button-full w-[150px]"
                              disabled={disabled}
                              onClick={(e) => {
                                e.stopPropagation();
                                startAnalysis();
                              }}
                            >
                              {startResearchLoader ? (
                                <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                              ) : (
                                <span className="text-nowrap">
                                  Start Research
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                        {openItems.includes(String(i)) && (
                          <hr className="my-3" />
                        )}
                        <AccordionContent>
                          {item?.ans?.map(
                            (outlineData: any, outlineDataIndex: any) => {
                              return (
                                <div key={outlineDataIndex}>
                                  <h1 className="text-[14px] font-medium my-1">
                                    {outlineData?.title}
                                  </h1>
                                  <div className="text-[#4D4D4D]">
                                    <ul
                                      className={`list-disc list-insidemb-2 w-full text-sm text-[#4D4D4D] font-normal ps-8 py-2 rounded-lg ${
                                        !edit &&
                                        "bg-slate-100 dark:bg-[#e7effa1c]"
                                      }`}
                                    >
                                      {outlineData?.ans?.map(
                                        (
                                          outlineAns: any,
                                          outlineAnsIndex: any
                                        ) => (
                                          <li
                                            key={outlineAnsIndex}
                                            className="dark:marker:text-[#cccccc]"
                                          >
                                            <input
                                              disabled={edit}
                                              className="w-full focus:outline-none disabled:bg-transparent bg-transparent dark:text-[#CCCCCC] truncate"
                                              key={outlineAnsIndex}
                                              value={outlineAns?.subtitle}
                                              onChange={(e) =>
                                                handleChange(
                                                  e,
                                                  i,
                                                  outlineDataIndex,
                                                  outlineAnsIndex
                                                )
                                              }
                                            />
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </AccordionContent>
                      </div>
                    </AccordionItem>
                  );
                }
                if (
                  item?.label === "Information Search" &&
                  item.status === "completed" &&
                  item?.progress === 100
                ) {
                  return (
                    <AccordionItem value={String(i)}>
                      <div
                        className="mt-5 relative bg-white dark:bg-[#2C3A3F] rounded-lg p-4 border dark:border-[#2C3A3F]"
                        key={i}
                      >
                        <div className="flex gap-2 items-center">
                          <div className="mt-2 font-semibold">
                            {steps?.[i].label}
                          </div>
                          <AccordionTrigger
                            className="hover:no-underline mt-2"
                            iconStyle="h-6 w-6"
                          >
                            <span>{""}</span>
                          </AccordionTrigger>
                        </div>

                        <AccordionContent>
                          {item?.ans?.map(
                            (informationData: any, informationIndex: any) => {
                              return (
                                <div key={informationIndex}>
                                  <div className="bg-white border border-[#E5E5E5] dark:bg-[#2C3A3F] dark:border-[#1B1B25] rounded-lg p-4 mt-4">
                                    <h1 className="text-[14px] font-medium mb-2">
                                      {informationIndex + 1}.{" "}
                                      {informationData?.title}
                                    </h1>
                                    <hr className="border-[#E5E5E5] my-3" />
                                    <ul className="mb-2 text-sm font-normal list-[upper-roman] list-inside">
                                      {Object.entries(
                                        informationData?.ans || {}
                                      ).map(([key, value]) => {
                                        return (
                                          // eslint-disable-next-line react/jsx-key
                                          <li
                                            className="rounded-lg text-sm font-normal border border-[#E5E5E5] p-4 dark:border-[#1B1B25]
                                      mt-4 "
                                          >
                                            {key}
                                            <div className="flex items-center justify-between">
                                              {/* <div className="">{key}</div> */}
                                              {/* <ContentInclutionTableDialog
                                                papersData={informationData?.ans?.[
                                                  key
                                                ]?.academic?.academicpapersData?.filter(
                                                  (item: any) =>
                                                    item.openAccessPdf?.url
                                                )}
                                                sourceData={
                                                  informationData?.ans?.[key]
                                                    ?.web?.items
                                                }
                                                mainTitle={key}
                                                sourceId={id}
                                              /> */}
                                            </div>
                                            <hr className=" my-3" />
                                            <div
                                              key={key}
                                              className="text-[#4D4D4D] dark:text-[#cccccc]"
                                            >
                                              <p className="text-sm font-normal mt-3 ms-3">
                                                Sources Found:
                                              </p>
                                              <hr className=" my-3" />
                                              <ul className="list-[circle] list-inside mb-2 text-sm font-normal ps-8 mt-1">
                                                <li className="flex">
                                                  {/* {informationData?.ans?.[key]
                                                    ?.academic
                                                    ?.academicpapers || 0}{" "} */}
                                                  {informationData?.ans?.[
                                                    key
                                                  ]?.academic?.academicpapersData?.filter(
                                                    (item: any) =>
                                                      item.openAccessPdf?.url
                                                  )?.length || 0}{" "}
                                                  academic papers.{" "}
                                                  <AcademicPapersDialog
                                                    papersData={informationData?.ans?.[
                                                      key
                                                    ]?.academic?.academicpapersData?.filter(
                                                      (item: any) =>
                                                        item.openAccessPdf?.url
                                                    )}
                                                  />
                                                </li>
                                                <li>
                                                  {informationData?.ans?.[key]
                                                    ?.web?.items?.length ||
                                                    0}{" "}
                                                  reliable web sources.
                                                  {informationData?.ans?.[key]
                                                    ?.web?.items?.length >
                                                    0 && (
                                                    <ul className="list-disc list-inside ps-6 mt-1 overflow-hidden">
                                                      {informationData?.ans?.[
                                                        key
                                                      ]?.web?.items.map(
                                                        (
                                                          websource: {
                                                            link: string;
                                                          },
                                                          index: number
                                                        ) => {
                                                          return (
                                                            <li
                                                              key={index}
                                                              className="text-blue-700 cursor-pointer"
                                                            >
                                                              <a
                                                                href={
                                                                  websource.link
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                              >
                                                                {websource.link
                                                                  .length > 75
                                                                  ? `${websource.link.slice(
                                                                      0,
                                                                      75
                                                                    )}...`
                                                                  : websource.link}
                                                              </a>
                                                            </li>
                                                          );
                                                        }
                                                      )}
                                                    </ul>
                                                  )}
                                                </li>
                                              </ul>
                                              <p className="text-sm font-normal mt-1">
                                                Status:
                                                <span>
                                                  {" "}
                                                  This section appears
                                                  well-covered and ready for
                                                  further analysis.
                                                </span>
                                              </p>
                                            </div>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </AccordionContent>
                      </div>
                    </AccordionItem>
                  );
                }
                if (
                  item?.label === "Content Inclusion" &&
                  item.status === "completed" &&
                  item?.progress === 100
                ) {
                  return (
                    <AccordionItem value={String(i)}>
                      <div
                        className="mt-5 relative bg-white dark:bg-[#2C3A3F] rounded-lg p-4 border dark:border-[#2C3A3F]"
                        key={i}
                      >
                        <div className="flex gap-2 items-center">
                          <div className="mt-2 font-semibold">
                            {steps?.[i].label}
                          </div>
                          <AccordionTrigger
                            className="hover:no-underline mt-2"
                            iconStyle="h-6 w-6"
                          >
                            <span>{""}</span>
                          </AccordionTrigger>
                        </div>

                        <AccordionContent>
                          {item?.ans?.map(
                            (informationData: any, informationIndex: any) => {
                              return (
                                <div key={informationIndex}>
                                  <div className="bg-white border border-[#E5E5E5] dark:bg-[#2C3A3F] dark:border-[#1B1B25] rounded-lg p-4 mt-4">
                                    <h1 className="text-[14px] font-medium mb-2">
                                      {informationIndex + 1}.{" "}
                                      {informationData?.title}
                                    </h1>
                                    <hr className="border-[#E5E5E5] my-3" />
                                    <ul className="mb-2 text-sm font-normal list-[upper-roman] list-inside">
                                      {Object.entries(
                                        informationData?.ans || {}
                                      ).map(([key, value]) => {
                                        return (
                                          // eslint-disable-next-line react/jsx-key
                                          <li
                                            className="rounded-lg text-sm font-normal border border-[#E5E5E5] p-4 dark:border-[#1B1B25]
                                      mt-4 "
                                          >
                                            {key}
                                            <span className="flex mt-2 justify-end">
                                              <ContentInclutionTableDialogForAutoGen
                                                sourceData={
                                                  informationData?.ans?.[key]
                                                }
                                                keyTitle={key}
                                              />
                                            </span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </AccordionContent>
                      </div>
                    </AccordionItem>
                  );
                }
              }
            })}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default Information;
// return (
//   <div
//     key={i}
//     className="bg-white border border-[#E5E5E5] rounded-lg p-4 mt-4"
//   >
//     <h1 className="text-[14px] font-medium mb-2">
//       1. OVERVIEW AND HISTORY OF ELECTRIC VEHICLES
//     </h1>
//     <hr className="border-[#E5E5E5]" />
//     <div className="text-[#4D4D4D]">
//       <p className="text-sm text-[#4D4D4D] font-normal mt-3">
//         Sources Found:
//       </p>
//       <ul className="list-disc list-insidemb-2 text-sm text-[#4D4D4D] font-normal ps-8 mt-1">
//         <li>3 academic papers.</li>
//         <li>5 reliable web sources.</li>
//       </ul>
//       <p className="text-sm text-[#4D4D4D] font-normal mt-1">
//         Status:
//         <span className="">
//           This section appears well-covered and ready for further
//           analysis.
//         </span>
//       </p>
//     </div>
//   </div>
// );
