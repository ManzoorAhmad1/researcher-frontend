"use client";
import React, { useEffect, useRef, useState } from "react";
import vector from "@/images/icons/creative-thinking-icons/vector.png";
import DropDowns from "@/components/coman/DropDowns";
import { purposeValues } from "./utils/const";
import vector2 from "@/images/icons/creative-thinking-icons/vector2.png";
import { LoaderCircle } from "lucide-react";
import history from "@/images/icons/history.png";
import Information from "./components/Information";
import Progress from "./components/Progress/Progress";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { ImageSizes } from "@/utils/image-optimizations";
import { OptimizedImage } from "@/components/ui/optimized-image";
import toast from "react-hot-toast";
import ToastInfo from "@/components/coman/ToastInfo";
import AIResearchAssistantHistoryDialog from "./dialogs/HistoryDialog";
import { IoSearchSharp } from "react-icons/io5";
import historyIcon from "@/images/icons/creative-thinking-icons/history.png";
import { lastResearch, researchAssistantApi } from "@/apis/research-assistant";
import { fetchSubscription } from "@/reducer/services/subscriptionApi";
import { supabase } from "@/app/(auth)/signup/supabaseClient";
import { getUserSubscription } from "@/apis/user";

const TopicAssistance = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isCreativeMode, setIsCreativeMode] = React.useState(true);
  const [form, setForm] = useState({
    inputValue: "",
    purposeValue: "Topics",
  });
  const { socket } = useSocket();
  const userInfo = useSelector((state: RootState) => state.user.user?.user);
  const [steps, setSteps] = useState<any>([]);
  const [mainProgress, setMainProgress] = useState(0);
  const [id, setId] = useState("");
  const [progressName, setProgressName] = useState("");
  const [startResearchDisabled, setStartResearchDisabled] = useState(false);
  const [startResearchLoader, setStartResearchLoader] = useState(false);
  const [mainLoading, setMainLoading] = useState(false);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const { keywords } = useSelector(
    (state: RootState) => state.researchKeywords
  );
  const [loadingForTags, setLoadingForTags] = useState<boolean>(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          setLoadingForTags(false);
        }
      };
   
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, inputValue: value }));

    if (value.trim().endsWith("/")) {
      setLoadingForTags(true);
    } else {
      setLoadingForTags(false);
    }
  };

  const handleKeywordSelect = (selected: string) => {
    // setForm((prev) => ({ ...prev, inputValue: keyword }));
    // setLoadingForTags(false);
    const input = form?.inputValue;
    const lastSlashIndex = input.lastIndexOf("/");

    if (lastSlashIndex !== -1) {
      const prefix = input.slice(0, lastSlashIndex).trimEnd();
      const newValue = `${prefix} ${selected}`.replace(/\s+/g, " ").trim();
      setForm((prev) => ({ ...prev, inputValue: newValue }));
    }

    setLoadingForTags(false);
  };

  const dispatch: AppDispatch = useDispatch();
  const handleSelect = (value: string) => {
    setForm((prev) => {
      return { ...prev, purposeValue: value };
    });
  };

  const handleGenerate = async () => {
    if (!form?.inputValue?.trim()) {
      ToastInfo(
        "The search field is empty. Please enter a keyword to proceed."
      );
      return;
    }

    // if (!form?.purposeValue?.trim()) {
    //   ToastInfo("It looks like you haven’t selected a topic or question yet. Please choose one to proceed.");
    //   return;
    // }

    setIsLoading(true);

    const response = await getUserSubscription(userInfo?.id);
    const currentData = response?.data?.data;

    // userInfo?.subscription?.credit_limit - userInfo?.subscription?.credit
    if (currentData?.credit_limit - currentData?.credit > 15) {
      // setIsLoading(true);
      setIsDisabled(true);
      setStartResearchDisabled(false);
      setDisabled(false)
      await researchAssistantApi({
        inputValue: form.inputValue,
        purposeValue: "Topics",
      });
      await dispatch(fetchSubscription({ id: userInfo?.id }));
    } else {
      setIsLoading(false);
      toast.error(
        `You are nearing your AI credit limit. Approximately ${Math.max(
          0,
          currentData?.credit_limit - currentData?.credit
        )} remaining credits left. Please consider recharging to continue enjoying uninterrupted services.\nThank you for using ResearchCollab!`
      );
    }

    // toast.custom((t) => (
    //   <div
    //     className={`${
    //       t.visible ? "animate-enter" : "animate-leave"
    //     } bg-white shadow-md rounded-md p-4 flex items-start space-x-3 w-[520px]`}
    //   >
    //     <BsInfoCircle className="text-[#17a2b8] text-xl mt-[2px]" />
    //     <span className="text-sm text-gray-800">
    //       AI Research Assistant is In Progress. We will notify you once done.
    //     </span>
    //   </div>
    // ));
  };

  const lastResearchAPI = async () => {
    const apiRes = await lastResearch();
    if (apiRes.success) {
      if (!apiRes?.data?.loading) setSteps(apiRes?.data?.data);
      setMainProgress(apiRes?.data?.main_progress);
      setProgressName(apiRes?.data?.progress_name);
      setStartResearchDisabled(apiRes?.data?.outline_generation_analysis);
      setForm({
        inputValue: apiRes?.data?.keywords,
        purposeValue: apiRes?.data?.purposeValue,
      });
      setId(apiRes?.data?.id);
      if (apiRes?.data?.progress_name === "Information Search") {
        setStartResearchLoader(false);
      }
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("update-research-assistant", (data) => {
        if (userInfo?.id == data.user_id) {
          setIsLoading(false);
          setIsDisabled(true);
          setSteps(data?.data);
          setMainLoading(data?.loading);
          setMainProgress(data?.main_progress);
          setProgressName(data?.progress_name);
          if (data?.progress_name === "Information Search") {
            setStartResearchLoader(false);
          }
        }
      });

      socket.on("add-research-assistant", (data) => {
        if (userInfo?.id == data?.[0].user_id) {
          setId(data?.[0].id);
        }
      });

      return () => {
        socket.off("update-texteditor-description");
      };
    }
    lastResearchAPI();
  }, [socket, userInfo]);

  // 619
  // 640

  return (
    <>
      <div className="relative top-[-34px] ">
        <form
          onSubmit={(e: any) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="w-[85%] justify-between mx-auto bg-white dark:bg-[#2C3A3F] border border-[#CCCCCC] dark:border-[#CCCCCC33] box-shadow py-2 rounded-lg px-8"
        >
          <div className="flex flex-col gap-4 lg:gap-4 lg:flex-row lg:divide-x dark:divide-[#CCCCCC33] py-3">
            <div className="w-full flex items-center gap-4 pe-5">
              <OptimizedImage
                width={16}
                height={16}
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//vector2.png`}
                alt="AI-icon"
              />
              <div className="w-full relative">
                <div className="text-[13px]">
                  <input
                    type="text"
                    value={form.inputValue}
                    className="outline-none w-full dark:bg-[#2C3A3F] bg-transparent"
                    placeholder={"Enter your text here..."}
                    // onChange={(e) => {
                    //   setForm((prev) => ({
                    //     ...prev,
                    //     inputValue: e.target.value,
                    //   }));
                    //     if (form.inputValue.includes('/')) {
                    //     setSuggestions(['AI', 'ML', 'Data Science', 'Deep Learning']);
                    //   } else {
                    //     setSuggestions([]);
                    //   }
                    // }}
                    onChange={handleInputChange}
                  />
                </div>
                {loadingForTags && (
                  <div ref={wrapperRef} className="absolute left-0 right-0 mt-[10px] bg-[#ffffff] dark:bg-[#2C3A3F] border border-gray-200 dark:border-[#475154] rounded-lg shadow-lg z-10 p-2 max-h-80 overflow-y-auto">
                    {keywords.map((i: string) => (
                      <div
                        key={i}
                        onClick={() => handleKeywordSelect(i)}
                        className="cursor-pointer px-2 py-1 rounded-full hover:bg-[#E2EEFF] dark:hover:bg-[#3E4C51] transition-colors"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* <div className="flex lg:w-[30rem] items-center gap-4 lg:px-6">
                <OptimizedImage
                  width={16}
                  height={16}
                  src={
                    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//vector.png`
                  }
                  alt="AI-icon"
                />
                <DropDowns
                  isOpen={isOpen}
                  options={purposeValues}
                  selectedValue={`${form.purposeValue || "Please select"}`}
                  toggleDropdown={() => setIsOpen(!isOpen)}
                  onSelect={handleSelect}
                />
            </div> */}

            <div className="flex justify-center items-center w-full gap-2 ps-3 lg:w-[270px]">
              <button type="submit" className="button-full w-[120px]">
                {isLoading ? (
                  <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  <span
                    className={`text-nowrap flex justify-center items-center gap-2`}
                  >
                    <IoSearchSharp className="text-lg" /> Search
                  </span>
                )}
              </button>

              <button
                type="button"
                className="button-full w-[120px]"
                onClick={() => setHistoryDialog(true)}
              >
                <OptimizedImage
                  width={16}
                  height={16}
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//history.png`}
                  alt="history-icon"
                />{" "}
                History
              </button>
            </div>

            {/* <div className="flex items-center gap-2 ps-3">
              <button
                type="button"
                className="button-full w-[120px]"
                onClick={handleGenerate}
              >
                {isLoading ? (
                  <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  <span className="text-nowrap">Search</span>
                )}
              </button>
              <OptimizedImage
                onClick={() => setHistoryDialog(true)}
                width={ImageSizes.icon.lg.width}
                height={ImageSizes.icon.lg.height}
                src={history}
                alt="history-icon"
              />
            </div> */}
          </div>
        </form>
        <div
          className={`w-[85%] flex items-center gap-4 pt-6 mx-auto transition-opacity duration-500 ease-in-out ${
            mainLoading ? "opacity-100" : "opacity-0"
          }`}
        >
          <h4 className="font-medium text-[18px] dark:text-[#CCCCCC]">
            {progressName}
          </h4>
          <p className="text-[#666666] font-normal text-[13px] dark:text-[#CCCCCC]">
            Currently in progress<span className="blinking-dots"></span>
          </p>
        </div>
      </div>
      <div className="w-full overflow-x-hidden relative bottom-2">
        {steps?.length > 0 && (
          <div className="grid grid-cols-12 px-6 gap-6">
            <div className="col-span-12 lg:col-span-3 ">
              <Progress steps={steps} mainProgress={mainProgress} />
            </div>
            <div className="col-span-12 lg:col-span-9 relative bottom-[15px]">
              <Information
                id={id}
                steps={steps}
                setSteps={setSteps}
                mainLoading={mainLoading}
                progressName={progressName}
                startResearchLoader={startResearchLoader}
                startResearchDisabled={startResearchDisabled}
                setStartResearchLoader={setStartResearchLoader}
                disabled={disabled}
                setDisabled={setDisabled}
              />
            </div>
          </div>
        )}
        <AIResearchAssistantHistoryDialog
          historyDialog={historyDialog}
          setHistoryDialog={setHistoryDialog}
          setSteps={setSteps}
          setMainLoading={setMainLoading}
          setMainProgress={setMainProgress}
          setForm={setForm}
          setStartResearchDisabled={setStartResearchDisabled}
        />
      </div>
    </>
  );
};

export default TopicAssistance;
