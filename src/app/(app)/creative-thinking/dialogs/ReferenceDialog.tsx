/* eslint-disable react-hooks/exhaustive-deps */
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/reducer/store";
import { openAImodelKey } from "../utils/const";
import { generateWebSearch } from "@/utils/aiTemplates";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { updateCredits } from "@/reducer/services/subscriptionApi";
import { Loader } from "rizzui";
import AddToNoteDialog from "@/components/coman/AddToNoteDialog";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import { fetchToAi } from "@/apis/topic-explorer";
import { useRouter } from "next-nprogress-bar";
import { topicExploreDetails } from "@/reducer/topic-explorer/topicExplorerSlice";

interface ReferenceDialogProps {
  isOpen?: boolean;
  onOpenChange?: () => void;
  scamperDetail: string;
  inputValue:string
}

export const ReferenceDialog: React.FC<ReferenceDialogProps> = ({
  isOpen,
  onOpenChange,
  scamperDetail,
  inputValue
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false);
  const [apiRes, setApiRes] = useState("");
  const dispatch: AppDispatch = useDispatch();
  const [addToNoteShow, setAddToNoteShow] = useState(false);
  const [singleHistoryDatas, setSingleHistoryDatas] = useState<any>();
  const { user } = useSelector((state: RootState) => state.user?.user || "");

  const handleDialogContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  function extractJsonFromText(input:any) {
    const jsonMatch = input.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      throw new Error("No valid JSON block found in the input.");
    }
  
    try {
      const jsonString = jsonMatch[1];
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error("Failed to parse JSON: ");
    }
  }

  const handleSelectSuggestion = async (suggestion: any) => {
    try {
      setLoading(true);
      const { forward, message, mode } = await verifyCreditApi(user.id) as { forward: boolean, message: string, mode: string };

      if (forward) {

        const body = { prompt: `${generateWebSearch(scamperDetail)}` }
        const apiRes = await fetchToAi(body)

        apiRes.data &&
          dispatch(
            updateCredits({
              credits: apiRes.data.overall_price.total,
              activity: "Creative Thinking Dialog",
              credit_type: "Other",
            })
          );
        if (
          apiRes.data.completions[openAImodelKey].completion.choices.length > 0
        ) {
         const jsonRes = await extractJsonFromText(apiRes?.data?.completions[openAImodelKey].completion.choices[0]
            .message.content)
            
            setApiRes(jsonRes.article)
          }
      }
    } catch (error) { }

    setLoading(false);
  };

  const updateHistory = async () => {
    onOpenChange && onOpenChange();
  };

  const handleSend =()=>{
  router.push(`/topic-analysis`)
    dispatch(topicExploreDetails({keyWord:inputValue,ans:JSON.stringify(apiRes)}))
  }

  useEffect(() => {
    const selectSuggestionAsync = async () => {
      await handleSelectSuggestion(scamperDetail);
    };
    selectSuggestionAsync();
  }, [scamperDetail]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[800px] h-[95vh] overflow-y-hidden"
        onClick={handleDialogContentClick}
      >
        <div>
          <h2 className="font-bold mb-5" />

          <div className="w-full h-[calc(94vh-121px)] overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader variant="threeDot" size="lg" className="ms-1" />
              </div>
            ) : (
              <MarkdownPreview
                style={{ background: "transparent" }}
                className="my-6 dark:text-[#CCCCCC]"
                components={{
                  a: ({ href, children, ...props }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                }}
                source={apiRes}
                wrapperElement={{ "data-color-mode": "light" }}
              />
            )}
          </div>
          <div className="flex justify-end mt-[24px] gap-2">
            <button
              disabled={loading}
              className="button-full inline-block rounded-[26px]"
              onClick={() => setAddToNoteShow(true)}
            >
              Save to Knowledge Bank
            </button>

            <button
               disabled={loading}
              onClick={() =>
                handleSend()
              }
              type="button"
              className="button-full rounded-[26px]"
            >
              Send to Topic Analysis
            </button>
          </div>
        </div>
      </DialogContent>

      {addToNoteShow && (
        <AddToNoteDialog
          page="web-search"
          noteTitle={`${apiRes.match(/##\s*(.*?)\n/)?.[1]} - Creative Tool` || ""}
          description={apiRes}
          singleHistoryDatas={singleHistoryDatas}
          updateHistory={updateHistory}
          addToNoteShow={addToNoteShow}
          setAddToNoteShow={setAddToNoteShow}
        />
      )}
    </Dialog>
  );
};
