import React, { useState, useEffect ,useRef} from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import toast from "react-hot-toast";
import { ScamperCardsProps } from "./utils/types";
import { createScampArray, openAImodelKey } from "./utils/const";
import { singlegenerateIdeas } from "@/utils/aiTemplates";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { updateCredits } from "@/reducer/services/subscriptionApi";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import SingleSwipeableCardDialog from "./dialogs/SingleSwipeableCardDialog";
import Image from "next/image";
import references from "@/images/icons/references.png";
import references2 from "@/images/icons/references-white.png";
import {
  CopyIcon,
  FavoriteIcon,
  NotFavoriteIcon,
  ReloadIcon,
} from "./icons/icons";
import { ReferenceDialog } from "./dialogs/ReferenceDialog";
import {
  creativeThinkingAddToFavorite,
  fetchToAi,
} from "@/apis/topic-explorer";
import { FiSend } from "react-icons/fi";
import { useRouter } from "next-nprogress-bar";
import { topicExploreDetails } from "@/reducer/topic-explorer/topicExplorerSlice";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import PlagiarismOutlinedIcon from '@mui/icons-material/PlagiarismOutlined';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { MdOutlineScreenSearchDesktop } from "react-icons/md";

const ScamperCards: React.FC<ScamperCardsProps> = ({
  scamperDataId,
  inputValue,
  isTopicValue,
  isScamperData,
  setIsScamperData,
}) => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [swipeableCardsDialog, setSwipeableCardsDialog] = useState(false);
  const [singleScamperData, setSingleScamperData] = useState<any>([]);
  const [totalCards, setTotalCards] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [scamperDetail, setScamperDetail] = useState("");
  const dispatch: AppDispatch = useDispatch();
  const { lightMode } = useSelector((state: RootState) => state.userUtils);
  const { user } = useSelector((state: RootState) => state.user?.user || "");

  const sortedData = [...isScamperData].sort((a, b) => {
    return (b.interested === true ? 1 : 0) - (a.interested === true ? 1 : 0);
  });

  const handleCopy = () => {
    toast.success("Copy to clipboard!");
  };

  const handleInterested = async (value: boolean, title: string) => {
    const booleanValue = !value;
    const updatedData = isScamperData.map((item: any) =>
      item.title === title ? { ...item, interested: booleanValue } : item
    );

    setIsScamperData(updatedData);
    await creativeThinkingAddToFavorite(scamperDataId, updatedData);
  };

  const filterData = async () => {
    const lastCheckTime = localStorage.getItem("lastCreditCheckTime");
    const currentTime = new Date().getTime();
    if (!lastCheckTime || currentTime - parseInt(lastCheckTime) > 3600000) {
      const { forward, message, mode } = (await verifyCreditApi(user.id)) as {
        forward: boolean;
        message: string;
        mode: string;
      };
      localStorage.setItem("lastCreditCheckTime", currentTime.toString());
    }
  };

  const handleRefresh = async (item: any) => {
    setTitle(item?.title);
    setTotalCards(1);
    const { forward, message, mode } = (await verifyCreditApi(user.id)) as {
      forward: boolean;
      message: string;
      mode: string;
    };

    if (forward) {
      const body = {
        prompt: `${singlegenerateIdeas(inputValue, isTopicValue, item?.title)}`,
      };
      const apiRes = await fetchToAi(body);

      apiRes.data &&
        dispatch(
          updateCredits({
            credits: apiRes.data.overall_price.total,
            activity: "Scamper paper data",
            credit_type: "Other",
          })
        );

      if (
        apiRes.data.completions[openAImodelKey].completion.choices.length > 0
      ) {
        const descriptions = createScampArray(
          apiRes?.data.completions[openAImodelKey].completion.choices[0].message
            .content
        );
        if (descriptions) {
          const findSingleScamperData = isScamperData.find(
            (item) => descriptions?.[item?.title]
          );
          const upDatedSingleScamperData = [
            {
              ...findSingleScamperData,
              ans:
                descriptions?.[item?.title].description ||
                descriptions?.[item?.title].question,
            },
          ];
          setSwipeableCardsDialog(true);
          setTitle("");
          setSingleScamperData(upDatedSingleScamperData);
        }
      }
    }
  };

  const handleSend = (topic:string, data: string) => {
    router.push(`/topic-analysis`);
    dispatch(topicExploreDetails({ keyWord: topic, ans: data }));
  };

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    filterData();
  }, [user?.id]);

  return (
    <div>
      {sortedData?.length > 0 &&
        sortedData?.map((item, i) => {
          return (
            <div
              className={`p-4 border -[var(--line,#E5E5E5)] rounded-lg mb-3 bg-white dark:bg-[#15252A] ${
                item.interested
                  ? "border-2 border-[#0E70FF66]"
                  : "border border-[#E5E5E5] dark:border-[#E5E5E514]"
              }`}
              key={item.id}
            >
              <div className="flex justify-between">
                <div className="flex items-center gap-3">
                  <OptimizedImage
                    src={require(`../../../images/icons/creative-thinking-icons/${item.icon}`)}
                    alt={`${item.icon}-icon`}
                    width={35}
                    height={35}
                  />
                  <div>
                    <div className="text-[#333333] dark:text-[#CCCCCC] text-md font-medium">
                      {item.title}
                    </div>
                    <div className="text-[#0E70FF] text-[15px] font-medium">
                      {item.question}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`cursor-pointer ${
                      title === item?.title && "animate-spin"
                    }`}
                    title="Reanalyze"
                    onClick={() => handleRefresh(item)}
                  >
                    <ReloadIcon />
                  </div>
                  <CopyToClipboard text={item?.ans}>
                    <div className="cursor-pointer" title="Copy to Clipboard" onClick={handleCopy}>
                      <CopyIcon />
                    </div>
                  </CopyToClipboard>
                  <div
                    className="cursor-pointer"
                    onClick={() => {
                      setScamperDetail(item?.ans);
                      setIsOpen(true);
                    }}
                    title="Websearch"
                  >
                    {/* <OptimizedImage
                      src={
                        !lightMode
                          ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//references.png`
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//references2.png`
                      }
                      alt=""
                      width={ImageSizes.icon.sm.width}
                      height={ImageSizes.icon.sm.height}
                      className="w-5 h-5 brightness-[2]"
                    /> */}
                    <MdOutlineScreenSearchDesktop className="text-[#333333ab] dark:text-[#cccccca8] cursor-pointer" style={{fontSize:"19px"}} />
                  </div>
                  <div
                    onClick={() => handleSend(item?.ans, JSON.stringify(item))}
                    title="Send to Topic Analysis"
                  >
                    {/* <FiSend className="text-[#333333ab] dark:text-[#cccccca8] text-[19px] cursor-pointer" /> */}
                    <AnalyticsIcon className="text-[#333333ab] dark:text-[#cccccca8] cursor-pointer" style={{fontSize:"20px"}} />
                  </div>
                  <div
                    className="cursor-pointer"
                    onClick={() =>
                      handleInterested(item.interested, item?.title)
                    }
                    title={item.interested ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    {item.interested ? <FavoriteIcon /> : <NotFavoriteIcon />}
                  </div>
                </div>
              </div>

              <div
                className={`mt-5 w-full bg-white dark:bg-[#233137] dark:text-[#CCCCCC] p-3 text-[17px] border-[#e2e8f0] dark:border-[#CCCCCC33] border border-[var(--line-2, #CCCCCC)] rounded-lg font-normal  ${
                  item?.ans ? "h-auto" : "h-24"
                } ${item.interested ? "text-[#333333]" : "text-[#666666]"}`}
              >
                {item?.ans}
              </div>
            </div>
          );
        })}

      {swipeableCardsDialog && (
        <SingleSwipeableCardDialog
          scamperDataId={scamperDataId}
          isScamperData={isScamperData}
          setIsScamperData={setIsScamperData}
          singleScamperData={singleScamperData}
          swipeableCardsDialog={swipeableCardsDialog}
          totalCards={totalCards}
          setSwipeableCardsDialog={setSwipeableCardsDialog}
        />
      )}

      {isOpen && (
        <ReferenceDialog
          isOpen={isOpen}
          inputValue={inputValue}
          scamperDetail={scamperDetail}
          onOpenChange={() => setIsOpen(!isOpen)}
        />
      )}
    </div>
  );
};

export default ScamperCards;
