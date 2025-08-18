"use client";
import { Sidebar } from "primereact/sidebar";
import React, { useEffect, useState } from "react";
import {
  customHeader,
  customIcons,
} from "@/components/Sidebar(Drower)/customHeader";
import { overviewTag } from "@/utils/commonUtils";
import { Button } from "@/components/ui/button";
import { createPaperPdf, paperExists } from "@/apis/explore";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Loader } from "rizzui";
import { FaCheck } from "react-icons/fa";
import { RootState } from "@/reducer/store";

interface RelativePapersInfoProps {
  visible: boolean;
  setVisible: (item: boolean) => void;
  singleData: any;
}
const RelativePapersInfo: React.FC<RelativePapersInfoProps> = ({
  singleData,
  visible,
  setVisible,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isInProject, setIsInProject] = useState(false);
  const [checking, setChecking] = useState(false);
  const currentProject = useSelector((state: any) => state?.project);
  const { user } = useSelector((state: RootState) => state.user.user);

  const handleFavourite = async (url: any) => {
    try {
      setIsLoading(true);

      const response: any = await createPaperPdf({
        url,
        project_id: currentProject?.project?.id,
      });
      if (response.status === 200) {
        setIsAdded(true);
        toast.success(response?.data?.message);
        setVisible(false);
      } else {
        toast.error(response?.data?.message);
      }
    } catch (error: any) {
      console.error("Error creating paper PDF:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "This paper couldn't be added automatically. Please click 'Preview' to download the file and upload it manually to your Papers"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAvailableOrNot = async () => {
      try {
        setChecking(true);
        const data = await paperExists({
          // title: singleData?.pdf_search_data?.Title,
          url: singleData?.file_link,
          user_id: user?.id,
          project_id: currentProject?.project?.id,
        });
        setIsInProject(data?.exists);
      } catch (error) {
        console.error("Error checking paper existence:", error);
      } finally {
        setChecking(false);
      }
    };
    if (singleData?.pdf_search_data?.Title) {
      checkAvailableOrNot();
    }
  }, []);

  return (
    <Sidebar
      header={customHeader("PDF Info")}
      className="bg-white w-[25rem] dark:bg-[#152428]"
      style={{ boxShadow: "-2px 0px 6px 0px #00000040" }}
      visible={visible}
      closeIcon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-x h-8 w-8 dark:text-[#BBC0C2]"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      }
      position="right"
      onHide={() => setVisible(false)}
    >
      <hr className="mb-4 dark:border-[#BEBFBF]" />
      <div className="dark:text-[#BEBFBF]">
        <label className="font-poppins text-[12px] font-semibold leading-[18px] text-left text-[#999999]">
          TITLE
        </label>
        <div className="h3 font-semibold mb-2">
          {singleData?.pdf_search_data?.Title}
        </div>
        <hr className="my-3 dark:border-[#BEBFBF]" />
        <div>
          <label className="font-poppins text-[12px] font-semibold leading-[18px] text-left text-[#999999]">
            KEYWORDS
          </label>
          <div className="flex flex-wrap">
            {singleData?.pdf_search_data?.Top5Keywords &&
              singleData?.pdf_search_data.Top5Keywords.slice(0, 5).map(
                (value: string, index: number) => {
                  const tag = overviewTag[index % overviewTag.length];
                  return (
                    <div
                      style={{
                        backgroundColor: tag?.bgColor,
                        color: tag?.color,
                      }}
                      key={value}
                      className="inline-block  mx-1 my-1 font-poppins text-sm font-medium leading-[19.5px] text-left px-3 py-1"
                    >
                      {value}
                    </div>
                  );
                }
              )}
          </div>
          <hr className="my-3 dark:border-[#BEBFBF]" />
          {singleData?.pdf_metadata?.Abstract && (
            <div>
              <label className="font-poppins text-[12px] font-semibold leading-[18px] text-left text-[#999999]">
                ABSTRACT
              </label>
              <div className="line-clamp-6">
                {singleData?.pdf_metadata?.Abstract}
              </div>
            </div>
          )}

          <hr className="my-3 dark:border-[#BEBFBF]" />
          <div className="flex justify-end gap-3 items-center">
            <div>
              <a
                target="_blank"
                href={`${singleData?.file_link}`}
                className="line-clamp-4 cursor-pointer text-[#0E70FF] underline"
              >
                Link
              </a>
            </div>
            <Button
              className="h-8 bg-blueTh min-w-40 text-black font-semibold flex items-center justify-center bg-[#E2EEFF] rounded-full hover:bg-[#E2EEFF]"
              variant="secondary"
              onClick={() => handleFavourite(singleData?.file_link)}
              disabled={isInProject}
              // disabled={item?.data?.type !== "pdf"}
            >
              {isLoading || checking ? (
                <Loader variant="threeDot" size="sm" />
              ) : isAdded || isInProject ? (
                <FaCheck className="text-green-500 h-5 w-5" />
              ) : (
                "Add to My Papers"
              )}
            </Button>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default RelativePapersInfo;
