import React, { useState, useEffect,useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchApi } from "@/utils/fetchApi";
import { pdfInAiChat } from "@/utils/aiTemplates";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { Loader } from "rizzui";
import { selectedValueInPDF } from "@/reducer/services/folderSlice";
import { useDispatch, useSelector } from "react-redux";
import { updateCredits } from "@/reducer/services/subscriptionApi";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import { RootState, AppDispatch } from "@/reducer/store";

interface PDFInAIDialogProps {
  pdfInAIDialog: boolean;
  setPDFInAIDialog: (open: boolean) => void;
  chatURL: string;
  selectedText: string;
}

const PDFInAIDialog: React.FC<PDFInAIDialogProps> = ({
  selectedText,
  pdfInAIDialog,
  setPDFInAIDialog,
  chatURL,
}) => {
  const dispatch = useDispatch();
  const dispatche: AppDispatch = useDispatch();
  const dropdownValues = ["Summarize", "Explain Text"];
  const [selectedValue, setSelectedValue] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const openAImodelKey = "openai/gpt-4o-mini";
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.user?.user || "");
  const filterData = async () => {
    const lastCheckTime = localStorage.getItem('lastCreditCheckTime');
    const currentTime = new Date().getTime();
    
    if (!lastCheckTime || (currentTime - parseInt(lastCheckTime)) > 3600000) {
     
    const { forward, message, mode } = await verifyCreditApi(user.id) as { forward: boolean, message: string, mode: string };
    localStorage.setItem('lastCreditCheckTime', currentTime.toString());
        }
  }

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    filterData()
  }, [user?.id])

  const handleChange = async (value: string) => {
    setSelectedValue(value);
    setLoading(true);
    try {
      const { forward, message, mode } = await verifyCreditApi(user.id) as { forward: boolean, message: string, mode: string };

      if (forward) {
        const response = await fetchApi(
          `${process.env.NEXT_PUBLIC_STRAICO_API}/v1/prompt/completion`,
          {
            method: "POST",
            body: JSON.stringify({
              models: [openAImodelKey],
              message: pdfInAiChat(selectedText, value),
              file_urls: [chatURL],
            }),
          }
        );

        response.data &&
          dispatche(
            updateCredits({ credits: response.data.overall_price.total, activity: 'Research on PDF', credit_type: 'Summarization' })
          );

        if (
          response.data.completions[openAImodelKey].completion.choices.length > 0
        ) {
          const aiRes = {
            ai: response.data.completions[openAImodelKey].completion.choices[0]
              .message.content,
          };
          setMessages((prev) => [...prev, aiRes]);
        }
        dispatch(selectedValueInPDF({}));
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex justify-end">
      <Dialog open={pdfInAIDialog} onOpenChange={() => setPDFInAIDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Chat</DialogTitle>
          </DialogHeader>
          <div className="my-4">
            <Select onValueChange={handleChange} defaultValue={selectedValue}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a value" />
              </SelectTrigger>
              <SelectContent>
                {dropdownValues.map((item) => (
                  <SelectItem key={item} value={item || ""}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-col h-[710px] max-w-full w-full overflow-hidden mt-4">
              <div className="flex-1 p-0.5 overflow-y-auto scrollbar-hide">
                {messages?.map((item, i) => {
                  const messageBackClasses = `rounded-lg p-4 w-full bg-[#faf9ff] text-[#131315] mb-3`;
                  return (
                    <div className={messageBackClasses} key={i}>
                      <MarkdownPreview
                        source={item.ai}
                        wrapperElement={{ "data-color-mode": "light" }}
                        style={{
                          background: "transparent",
                          color: item.user === "Me" ? "white" : "black",
                        }}
                      />
                    </div>
                  );
                })}
                {loading && (
                  <Loader variant="threeDot" size="lg" className="ms-1" />
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PDFInAIDialog;
