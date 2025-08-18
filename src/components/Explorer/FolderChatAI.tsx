/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { SendHorizontal, Pause } from "lucide-react";
import { Input } from "@/components/ui/input";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { Loader } from "rizzui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { dropdownValues } from "./const";
import { useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import { folderChat, getFileHistory, reGenerateApi, updateLoaderStatus } from "@/apis/files";
import "../../app/(app)/info/[...slug]/info.css";
import { Separator } from "@/components/ui/separator";
import LightButton from "@/components/ui/LightButton";
import { HiOutlineShare } from "react-icons/hi";
import toast from "react-hot-toast";
import { TbDownload } from "react-icons/tb";
import { RiRefreshLine } from "react-icons/ri";
import { RiDeleteBinLine } from "react-icons/ri";
import { v4 as uuidv4 } from "uuid";
import RoundBtn from "../ui/RoundBtn";
import { BsFillStarFill } from "react-icons/bs";
import { FaRegStar } from "react-icons/fa";
import { OptimizedImage } from "../ui/optimized-image";
import { ImageSizes } from "@/utils/image-optimizations";
import { addAiHistory, fetchAiHistory, updateAiHistory } from "@/apis/ai-chat";

interface FolderChatAIProps {
  fetchFolders?: any;
}
interface Message {
  user: string;
  text: string;
  answerRole?: string;
  answer?: string;
  id?: string;
}

const FolderChatAI: React.FC<FolderChatAIProps> = ({ fetchFolders }) => {
  const { socket } = useSocket();
  const supabase: SupabaseClient = createClient();
  const user = useSelector((state: RootState) => state.user?.user?.user);
  const { aiChatDialog } = useSelector((state: any) => state.folder);
  const { id } = aiChatDialog;
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState<string>("");
  const [selectedValue, setSelectedValue] = React.useState<string>();
  const [titleLoading, setTitleLoading] = React.useState<string>();
  const [loading, setLoading] = React.useState(false);
  const [chatLoading, setChatLoading] = React.useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const titelStatus = ["All PDF Analysis", "Final Analysis"];
  const [favouriteChat, setfavouriteChat] = React.useState<any>([]);
  const [idLoader, setIdLoader] = React.useState<any>("");
  const [msgId, setMsgId] = useState("");
  const [RAGid, setRAGid] = useState<string>("");
  const { project } = useSelector((state: any) => state?.project);

  const supabaseStatusChange = async () => {
    const data = await updateLoaderStatus({
      userId: user?.id,
      parentId: id,
      project_id: project?.id,
    });
    if (data?.data.success) {
      await fetchFolders(true);
    }
  };

  const supabaserefreshStatusChange = async (msg: string) => {
    const data = await updateLoaderStatus({
      parentId: id,
      msg
    });
    await fetchFolders(true);
  };

  const fetchHistory = async () => {

    const response = await fetchAiHistory(id);
    return { error: response?.isSuccess !== true, data: response?.data };
  };

  const addHistory = async (msg: object | undefined) => {
    const body = {
      pdf_id: id,
      history: msg,
    };
    const { error } = await fetchHistory();
    if (error) {

        await addAiHistory(body);
    } else {
        await updateAiHistory(id, { history: msg });
    }
    return msg;
  };

  const handleSendMessage = async (text: string) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;


    if (text || input) {
      const messageID = uuidv4();
      const newMessages = [
        ...messages,
        { user: "Me", text: text || input, id: messageID },
      ];
      setInput("");
      setMessages(newMessages);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTitleLoading("All PDF Analysis");

      await addHistory(newMessages);
      setChatLoading(true);
      try {

        if (RAGid) {
          await folderChat({
            RAGid,
            userId: user?.id,
            parentId: id,
            question: text || input,
            id: messageID,
            project_id: project?.id,
          }, signal);
        } else {
          await folderChat({
            RAGid: null,
            userId: user?.id,
            parentId: id,
            question: text || input,
            id: messageID,
            project_id: project?.id,
          }, signal);
        }

      } catch (error: any) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
          setTitleLoading("")

          const updatedMessages = messages?.filter((value) => value.id !== messageID);
          setMessages(updatedMessages);
          await addHistory(updatedMessages);
          toast.success("AI request was cancelled.");
          supabaseStatusChange();

        } else {
          toast.error("An error occurred while processing.");
        }
      } finally {
        setChatLoading(false);
      }
    }
  };

  const stopSendMessage = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setChatLoading(false);
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleChange = async (value: string) => {
    setSelectedValue(value);
    await handleSendMessage(value);
  };

  const socketResetAdd = async (res: any) => {
    const newMessage = { answer: res?.data };
    setMessages((prevMessages) => {
      const updatedMessages = prevMessages?.map((value) => {
        if (value.id === res?.id) {
          return { ...value, ...newMessage };
        }
        return value;
      });
      scrollIntoView(`${updatedMessages.length}`, "start");

      return updatedMessages;
    });
    await supabaseStatusChange();
  };

  const scrollIntoView = (
    itemId: string,
    position: "start" | "center" | "end" | "nearest" = "end"
  ) => {
    const sanitizedId = itemId.replace(/\s+/g, "-");
    const item = document.getElementById(itemId);

    if (item) {
      setTimeout(() => {
        item.scrollIntoView({
          behavior: "smooth",
          block: position,
          inline: "nearest",
        });
      }, 100);
    } else {
      console.log(`Element not found for selector ${sanitizedId}`);
    }
  };

  const titleLoader = () => {
    if (titleLoading !== "unread" && titleLoading !== "") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      return (
        <div className="text-sm text-blue-300 flex items-start">
          {titleLoading}{" "}
          <Loader variant="threeDot" size="lg" className="ms-1" />
        </div>
      );
    }
  };

  const shareChat = (msg: Message) => {
    const formatText = `
    Question: ${msg.text}\n
    Answer: ${msg.answer}`;

    navigator.clipboard
      .writeText(formatText)
      .then(() => {
        toast.success("copy chat successfully!");
      })
      .catch((err) => {
        console.error("Could not copy URL: ", err);
      });
  };

  const createDocx = (data: Message) => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${data.text}`,
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "Answer:",
                  bold: true,
                  size: 24,
                }),
              ],
            }),

            ...(data.answer || "").split("\n").map(
              (line) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: line,
                      size: 20,
                    }),
                  ],
                  spacing: {
                    after: 200,
                  },
                })
            ),
          ],
        },
      ],
    });
    return doc;
  };

  const handleInputChange = (id: any, value: any) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg.id === id ? { ...msg, text: value } : msg))
    );
  };

  const handleKeyDown = async (event: any, id: any, text: any) => {
    if (event.key === "Enter") {
      const msg = { text, id };
      await addHistory(messages);
      reGenerate(msg);
    }
  };

  const updateFavouriteChat = async (chatId: number | any) => {
    const favChatIds = favouriteChat?.includes(chatId)
      ? favouriteChat.filter((value: any) => {
        return value !== chatId;
      })
      : [...favouriteChat, chatId];


      const response = await updateAiHistory(id, { favourite_chat: favChatIds });

    if (response?.success !== true) {
      console.error("Error updating favourite_chat:", response?.message);
    } else {
      setfavouriteChat(response?.data?.favourite_chat);
    }
  };

  const downloadDocx = async (filename: any, data: Message) => {
    const doc = createDocx(data);
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = (msg: Message) => {
    downloadDocx(`ResearchCollab Chat(${+new Date()}).docx`, msg);
  };

  const reGenerate = async (msg: any) => {
    await supabaserefreshStatusChange("true");
    // await reGenerateApi({
    //   userId: user?.id,
    //   parentId: id,
    //   question: msg?.text || input,
    //   id: msg?.id,
    // });
    setChatLoading(true)
    if (RAGid) {
      await folderChat({
        RAGid,
        userId: user?.id,
        parentId: id,
        question: msg?.text || input,
        id: msg?.id,
        project_id: project?.id,
      });
    } else {
      await folderChat({
        RAGid: null,
        userId: user?.id,
        parentId: id,
        question: msg?.text || input,
        id: msg?.id,
        project_id: project?.id,
      });
    }
    setChatLoading(false)
  };

  const deleteChat = async (msg: Message) => {
    const removeMessage = messages.filter((value) => value.id !== msg.id);
    try {
      
        const response = await updateAiHistory(id, { history: removeMessage });
    
      if (response?.success !== true) {
        console.error("Error updating the chat history:", response?.message);
      } else {
        setMessages(removeMessage);
      }
    } catch (error) {
      console.error("Error in deleteChat function:", error);
    }
  };

  useLayoutEffect(() => {
    if (messages && !loading) {
      if (aiChatDialog?.question) {
        scrollIntoView(`${messages?.length}`, "start");
      } else {
        scrollIntoView(`${messages?.length}`, "end");
      }
    }
  }, [aiChatDialog.question, loading, chatLoading]);

  useEffect(() => {
    if (socket) {
      socket.on("ai-chat", (res: any) => {
        if (user?.id === parseInt(res?.userId) && id === res?.parent_id) {
          setTitleLoading(res?.message);
          fetchFolders(true);
        }
      });

      socket.on("ai-folder-chat", (res: any) => {
        if (
          user?.id === parseInt(res?.userId) &&
          id === parseInt(res?.parent_id)
        ) {
          if (res.status !== "cancelled-by-user") {
            setRAGid(res.newRADid);
            socketResetAdd(res);
            supabaseStatusChange();
          }
        }
      });

      socket.on("regenerate_questions", (res: any) => {
        if (
          user?.id === parseInt(res?.userId) &&
          id === parseInt(res?.parent_id)
        ) {
          setIdLoader(res?.id);
        }
      });
      return () => {
        socket.off("ai-chat");
        socket.off("ai-folder-chat");
        socket.off("regenerate_questions");
      };
    }
  }, [user, socket]);

  useEffect(() => {
    const fetchHistoryData = async () => {
      setLoading(true);
      try {
        const { data, error } = await fetchHistory();
        if (data?.loading_msg === "unread") {
          await supabaseStatusChange();
        }
        if (data) {
          setMessages(data?.history);
          setfavouriteChat(data?.favourite_chat || []);
          setTitleLoading(data?.loading_msg);
          setIdLoader(data?.regenerate_questions);
        } else {
          setTitleLoading("");
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      }
      setLoading(false);
    };

    if (id && aiChatDialog?.folder?.totalFiles > 0) {
      fetchHistoryData();
    }
  }, [id]);

  return (
    <>
      <div className="folder-chatAI">
        <div className="flex items-center mb-4">
          <div className="font-extrabold chat-hader">
            <OptimizedImage
              src={
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images//ai_chat.svg`
              }
              alt="Logo"
              width={ImageSizes.icon.md.width}
              height={ImageSizes.icon.md.height}
              layout="intrinsic"
            />
          </div>
          <div className="text-[#666666] text-lg font-[500] leading-6 ml-2 dark:text-[#666666]">
            AI Chat Assistance
          </div>
        </div>
        <div className="mb-5">
          <Select onValueChange={handleChange} defaultValue={selectedValue} disabled={aiChatDialog?.folder?.totalFiles == 0} >
            <SelectTrigger className="w-full outline-none shadow-none !ring-transparent">
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
        </div>
        <div className="flex flex-col h-[calc(100vh-280px)] max-w-full w-full overflow-hidden justify-center">
          {aiChatDialog?.folder?.totalFiles == 0 ? (<div className="flex items-center justify-center">
            Please upload files to the folder before starting AI Chat.
          </div>) : !loading ? (
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="flex">
                <div>
                  {messages?.map((msg, index) => {
                    return (
                      <>
                        <div
                          id={`${index + 1}`}
                          className="border-[1px] border-[#e5e5e5] dark:border-[#E5E5E50A] dark:bg-[#E5E5E50A] p-[14px] rounded-[16px] mb-[18px]"
                          key={index}
                        >
                          <input
                            type="text"
                            disabled={
                              msgId !== msg.id ||
                              titelStatus?.includes(titleLoading || "") ||
                              idLoader
                            }
                            className="font-family-poppins bg-transparent text-[18px] font-medium leading-[27px] text-[rgba(14, 112, 255, 1)] dark:bg-[#17252b] text-[#0E70FF] w-full focus-visible:outline-none"
                            id={msg.id}
                            onChange={(e) =>
                              handleInputChange(msg.id, e.target.value)
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, msg.id, msg.text)
                            }
                            value={msg.text}
                          />
                          <Separator className="my-4" />
                          <MarkdownPreview
                            source={msg.answer}
                            wrapperElement={{ "data-color-mode": "light" }}
                            className="font-family-poppins font-Poppins bg-transparent text-[16px] font-normal leading-[24px] text-[#666666] dark:text-[#CCCCCC]"
                            style={{
                              background: "transparent",
                              fontSize: "16px",
                              fontWeight: 400,
                              lineHeight: "24px",
                            }}
                          />
                          {messages.length === index + 1 && titleLoader()}
                          {msg?.answer && (
                            <div className="mt-3">
                              <LightButton>
                                <div
                                  className="cursor-pointer flex items-center me-4"
                                  onClick={() => {
                                    updateFavouriteChat(msg?.id);
                                  }}
                                >
                                  {favouriteChat?.includes(msg.id) ? (
                                    <BsFillStarFill
                                      className="w-[19px] h-[19px]"
                                      color="rgba(14, 112, 255, 1)"
                                    />
                                  ) : (
                                    <FaRegStar
                                      className="w-[19px] h-[19px]"
                                      color="rgba(14, 112, 255, 1)"
                                    />
                                  )}
                                </div>

                                <HiOutlineShare
                                  color="rgba(14, 112, 255, 1)"
                                  className="me-4 w-[20px] h-[20px] cursor-pointer"
                                  onClick={() => {
                                    shareChat(msg);
                                  }}
                                />

                                <TbDownload
                                  color="rgba(14, 112, 255, 1)"
                                  className="me-4 w-[20px] h-[20px] cursor-pointer"
                                  onClick={() => {
                                    handleDownload(msg);
                                  }}
                                />
                                <RiRefreshLine
                                  color="rgba(14, 112, 255, 1)"
                                  className={`me-4 w-[20px] h-[20px] ${idLoader === msg?.id && "animate-spin"
                                    } ${chatLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                  onClick={() => {
                                    reGenerate(msg);
                                  }}
                                />
                                <RiDeleteBinLine
                                  color="rgba(14, 112, 255, 1)"
                                  className="w-[20px] h-[20px] cursor-pointer"
                                  onClick={() => {
                                    deleteChat(msg);
                                  }}
                                />
                              </LightButton>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })}
                </div>
              </div>
              <div ref={messagesEndRef}></div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Loader variant="threeDot" size="lg" />
            </div>
          )}
        </div>
        <div className="flex border border-[rgba(204,204,204,1)] dark:border-[#CCCCCC14] rounded-[28px] p-[6px_8px] mt-4 dark:bg-[#CCCCCC14]">
          <Input
            disabled={titelStatus?.includes(titleLoading || "") || idLoader}
            onKeyPress={(e) => handleKeyPress(e)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask any question"
            className="flex-1 border-0 border-gray-300 p-2 text-lg text-[0.9rem] focus-visible:ring-2 focus-visible:outline-none rounded-l-md h-[2.2rem] dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0 dark:bg-transparent placeholder:dark:text-[#CCCCCC] bg-transparent"
            style={
              {
                "--tw-ring-color": "hsl(222.2deg 84% 4.9% / 0%)",
                "--tw-ring-shadow":
                  "var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) hsl(222.2deg 84% 4.9% / 0%)",
              } as React.CSSProperties
            }
          />

          {chatLoading ? <RoundBtn
            onClick={stopSendMessage}
            className="chat-round-button px-[17px] py-[6px] shadow-[0px_8px_18px_rgba(17,17,26,0.16),0px_8px_24px_rgba(17,17,26,0.13),0px_30px_24px_rgba(17,17,26,0)]"
            label={
              <span className="flex items-center">
                <Pause className="h-[20px] w-[20px]" />
              </span>
            }
          /> : <RoundBtn
            disabled={aiChatDialog?.folder?.totalFiles == 0 || loading || chatLoading}
            onClick={() => handleSendMessage(input)}
            className="chat-round-button px-[17px] py-[6px] shadow-[0px_8px_18px_rgba(17,17,26,0.16),0px_8px_24px_rgba(17,17,26,0.13),0px_30px_24px_rgba(17,17,26,0)]"
            label={
              <span className="flex items-center">
                <SendHorizontal className="h-[20px] w-[20px]" />
              </span>
            }
          />}
        </div>
      </div>
    </>
  );
};
export default FolderChatAI;

export const styles = {
  button: {
    borderRadius: "0px 7px 7px 0px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    padding: "5px 15px",
    cursor: "pointer" as "pointer",
  },
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  myMsgBack: {
    borderRadius: "7px",
    backgroundColor: "#257ef9",
    maxWidth: "75%",
    padding: "4px 8px",
  },
  otherMsgBack: {
    padding: "4px 8px",
    borderRadius: "7px",
    backgroundColor: "#faf9ff",
    maxWidth: "75%",
    boxShadow:
      "rgba(0, 0, 0, 0.1) 0px 0px 2px 0px, rgba(0, 0, 0, 0.1) 0px 0px 2px 0px",
  },
};
