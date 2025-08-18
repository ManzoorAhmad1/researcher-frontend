"use client";
import { useState, useEffect, useRef } from "react";
import { CornerDownLeft, Mic, Paperclip, Share } from "lucide-react";
import { Loader } from "rizzui";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { AppDispatch } from "@/reducer/store";
import { RAGidGenerateAPI, extractRAGData } from "@/utils/fetchApi";
import { Button } from "@/components/ui/button";
import { updateCredits } from "@/reducer/services/subscriptionApi";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { FileSearcher } from "./FileSearcher";
import ModelSelect from "./ModelSelect";
import SettingsDrawer from "./SettingsDrawer";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { verifyCreditApi } from "@/utils/verifyCreditApi";
import { getFilesByFolderId, getFoldersByUserId, getUserFiles } from "@/apis/files";

export default function Ai() {
  const main = ["Tags", "Folders", "Files"];
  const [currentState, setCurrentState] = useState<
    string[] | { value?: { name: string } }[] | { name: string }[]
  >(main);
  const [currentTemp, setCurrentTemp] = useState<string>("");
  const [filesData, setFilesData] = useState<any>([]);
  const [folderData, setFolderData] = useState<any>([]);
  const [tagData, setTagData] = useState<any>([]);
  const [RAGID, setRAGID] = useState<string>("");
  const [mainFileFormData, setMainFileFormData] = useState<any>();
  const [context, setContext] = useState("");
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] =
    useState<string>("openai/gpt-4o-mini");
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const dispatche: AppDispatch = useDispatch();
  const supabase: SupabaseClient = createClient();
  const userData = useSelector((state: any) => state?.user?.user?.user);
  const checkValid = !(message && context && mainFileFormData);

  const selectKey = (value: any) => {
    setRAGID("");
    if (typeof value == "string") {
      switch (value) {
        case "Tags":
          setCurrentTemp("Tags");
          getTags();
          break;
        case "Folders":
          setCurrentTemp("Folders");
          getFolder();
          break;
        case "Files":
          setCurrentTemp("Files");
          getFiles();
      }
    } else {
      if (currentTemp == "Files") {
        getFileFormData(value);
      } else if (currentTemp == "Folders") {
        getFolderFormData(value);
      } else if (currentTemp == "Tags") {
        getTagFormData(value);
      }
    }
  };

  const filterData = async () => {
    const lastCheckTime = localStorage.getItem('lastCreditCheckTime');
    const currentTime = new Date().getTime();

    if (!lastCheckTime || (currentTime - parseInt(lastCheckTime)) > 3600000) {
      const { forward, message, mode } = (await verifyCreditApi(
        userData?.id
      )) as { forward: boolean; message: string; mode: string };
      localStorage.setItem('lastCreditCheckTime', currentTime.toString());
    }
  };
  const hasRunRef = useRef(false);
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;
    filterData();
  }, [userData.id]);

  const getTagFormData = async (value: { value: string; name: string }) => {
    const formData = new FormData();
    const entityName = value.name;
    const entityDescription =
      "Extract detailed and precise data to generate the best possible question prompts for analysis.";
    formData.append("name", entityName);
    formData.append("description", entityDescription);

    try {
      const fileResponse = await axios.get(value.value, {
        responseType: "arraybuffer",
      });
      const arrayBuffer = fileResponse.data;
      const fileBlob = new Blob([arrayBuffer], { type: "application/pdf" });

      formData.append("files", fileBlob, `file1.pdf`);
      setMainFileFormData(formData);
    } catch (error) {
      console.error(`Error processing file at ${value}:`, error);
    }
  };

  const getFolderFormData = async (value: {
    id?: string;
    file_name?: string;
    file_link?: string;
  }) => {
    try {
      

      const files: any = await getFilesByFolderId(value?.id as string);

      if (files?.data?.data) {
        if (files?.data?.data?.length > 0) {
          const reFormateData = files?.data?.data?.map((value:any) => {
            return { name: value.file_name, value: value.file_link };
          });
          const formData = new FormData();

          const entityName = "General RAG Entity";
          const entityDescription =
            "Extract detailed and precise data to generate the best possible question prompts for analysis.";

          formData.append("name", entityName);
          formData.append("description", entityDescription);

          for (let ind = 0; ind < 4 && ind < reFormateData.length; ind++) {
            const value = reFormateData[ind];
            try {
              const fileResponse = await axios.get(value.value, {
                responseType: "arraybuffer",
              });
              const arrayBuffer = fileResponse.data;
              const fileBlob = new Blob([arrayBuffer], {
                type: "application/pdf",
              });

              formData.append("files", fileBlob, `file${ind}.pdf`);
            } catch (error) {
              console.error(`Error processing file at ${value}:`, error);
            }
          }
          setMainFileFormData(formData);
        }
      } else {
        console.error("Error fetching data:", files?.data?.message);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const getFileFormData = async (value: {
    id?: string;
    file_name?: string;
    file_link?: string;
    value: string;
  }) => {
    const formData = new FormData();
    const entityName = "General RAG Entity";
    const entityDescription =
      "Extract detailed and precise data to generate the best possible question prompts for analysis.";
    formData.append("name", entityName);
    formData.append("description", entityDescription);

    try {
      const fileResponse = await axios.get(value.value, {
        responseType: "arraybuffer",
      });
      const arrayBuffer = fileResponse.data;
      const fileBlob = new Blob([arrayBuffer], { type: "application/pdf" });

      formData.append("files", fileBlob, `file1.pdf`);
      setMainFileFormData(formData);
    } catch (error) {
      console.error(`Error processing file at ${value}:`, error);
    }
  };

  const getTags = async () => {
    if (tagData.length == 0) {
      try {


        const files: any = await getUserFiles();
        const updatedFiles = files?.data?.data?.filter((value: any) => value.tags && value.tags.length > 0);

        if (updatedFiles) {
          if (updatedFiles.length > 0) {
            let formateTags: { name: string; value: string }[] = [];
            for (let ind = 0; ind < updatedFiles.length; ind++) {
              let mainValue = updatedFiles[ind];
              mainValue.tags.forEach((value: { name: string }) => {
                formateTags.push({
                  name: value.name,
                  value: mainValue.file_link,
                });
              });
            }
            setCurrentState(formateTags);
            setTagData(formateTags);
          } else {
            setCurrentState([]);
            setTagData([]);
          }
        } else {
          setCurrentState([]);
          setTagData([]);
          console.error("Error fetching data:", files?.data?.message);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    } else {
      setCurrentState(tagData);
    }
  };

  const getFolder = async () => {
    if (folderData.length == 0) {
      try {
          const folders: any = await getFoldersByUserId();
        if (folders?.data?.data) {
          if (folders?.data?.data?.length > 0) {
            const reFormateData = folders?.data?.data?.map((value:any) => {
              return { name: value.folder_name, id: value.id };
            });
            setCurrentState(reFormateData);
            setFolderData(reFormateData);
          } else {
            setCurrentState([]);
            setFolderData([]);
          }
        } else {
          setCurrentState([]);
          setFolderData([]);
          console.error("Error fetching data:", folders?.data?.message);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    } else {
      setCurrentState(folderData);
    }
  };

  const getFiles = async () => {
    if (filesData.length == 0) {
      try {



        const files: any = await getUserFiles();
        if (files?.data?.data) {
          if (files?.data?.data?.length > 0) {
            const reFormateData = files?.data?.data?.map((value: any) => {
              return { name: value.file_name, value: value.file_link };
            });
            setCurrentState(reFormateData);
            setFilesData(reFormateData);
          } else {
            setCurrentState([]);
            setFilesData([]);
          }
        } else {
          setCurrentState([]);
          setFilesData([]);
          console.error("Error fetching data:", files?.data?.message);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    } else {
      setCurrentState(filesData);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { forward, message, mode } = (await verifyCreditApi(
        userData.id
      )) as { forward: boolean; message: string; mode: string };
      if (forward) {
        let regid;
        let credits = 0;
        if (!RAGID) {
          const reg = await RAGidGenerateAPI({ formData: mainFileFormData });
          regid = reg.data._id;
          credits += reg.total_coins;
          setRAGID(reg.data._id);
        } else {
          regid = RAGID;
        }

        if (regid) {
          try {
            const newApiResponses: any = await extractRAGData({
              regid,
              context,
              message,
              selectedModel,
            });
            setAnswer(newApiResponses.data.response.answer);
            credits += newApiResponses.data.data.coins_used;
          } catch (error) {
            console.log("error", error);
          }
        }

        setTimeout(
          dispatche(() => {
            updateCredits({
              credits: credits,
              activity: "AI chat with paper",
              credit_type: "AI Search",
            });
          }),
          500
        );
        setMessage("");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
    setLoading(false);
  };

  const shareChat = () => {
    const newUrl = `${answer}`;
    navigator.clipboard
      .writeText(newUrl)
      .then(() => {
        toast.success("Copied answer successfully!");
      })
      .catch((err) => {
        console.error("Could not copy URL: ", err);
      });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleContextChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setContext(event.target.value);
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 h-full">
      <div className="flex flex-col h-full">
        <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
          <h1 className="text-xl font-semibold">AI CHAT</h1>
          <SettingsDrawer />
          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 text-sm"
            onClick={shareChat}
          >
            <Share className="size-3.5" />
            Share
          </Button>
        </header>
        <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3 h-full">
          <div
            className="relative hidden flex-col items-start gap-8 md:flex"
            x-chunk="dashboard-03-chunk-0"
          >
            <div className="grid w-full items-start gap-6">
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Settings
                </legend>
                <ModelSelect
                  setSelectedModel={setSelectedModel}
                  selectedModel={selectedModel}
                />
              </fieldset>
              <fieldset className="grid gap-6 rounded-lg border p-4">
                <legend className="-ml-1 px-1 text-sm font-medium">
                  Messages
                </legend>
                <FileSearcher
                  selectKey={selectKey}
                  setCurrentState={setCurrentState}
                  main={main}
                  currentState={currentState}
                  currentTemp={currentTemp}
                />
                <div className="grid gap-3">
                  <Label htmlFor="context">Context</Label>
                  <Textarea
                    id="content"
                    placeholder="You are a..."
                    className="min-h-[9.5rem] max-h-[50vh] overflow-y-auto"
                    value={context}
                    onChange={handleContextChange}
                  />
                </div>
              </fieldset>
            </div>
          </div>
          <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
            <Badge variant="outline" className="absolute right-3 top-3">
              Output
            </Badge>
            <MarkdownPreview
              source={answer}
              wrapperElement={{ "data-color-mode": "light" }}
              className="font-family-poppins font-Poppins bg-transparent text-[16px] font-normal leading-[24px] text-[#666666] dark:text-[#CCCCCC] mt-5 max-h-[62vh] overflow-y-auto"
              style={{
                background: "transparent",
                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "24px",
              }}
            />
            <div className="flex-1" />
            <form
              className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
              x-chunk="dashboard-03-chunk-1"
              onSubmit={handleSubmit}
            >
              <Label htmlFor="message" className="sr-only">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0 max-h-[10vh] overflow-y-auto"
                value={message}
                onChange={handleInputChange}
              />
              <div className="flex items-center p-3 pt-0">
                <Button variant="ghost" size="icon" disabled>
                  <Paperclip className="size-4" />
                  <span className="sr-only">Attach file</span>
                </Button>
                <Button variant="ghost" size="icon" disabled>
                  <Mic className="size-4" />
                  <span className="sr-only">Use Microphone</span>
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="ml-auto gap-1.5"
                  disabled={loading || checkValid}
                >
                  {loading ? (
                    <Loader variant="threeDot" size="lg" className="ms-1" />
                  ) : (
                    <>
                      Send Message <CornerDownLeft className="size-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </main>
  );
}
