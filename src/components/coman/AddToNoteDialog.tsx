/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import RecursiveDropdown from "./RecursiveDropdown";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import { fetchFolderListApi } from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import { markdownToHTML } from "./MarkdownToHTML";
import { Member } from "@/apis/notes-bookmarks/types";
import useSocket from "@/app/(app)/info/[...slug]/socket";
import { v4 as uuidv4 } from "uuid";
import { NotesAndBookmarksItem } from "@/app/(app)/knowledge-bank/utils/types";
import { HistoryData } from "@/app/(app)/web-search/utils/types";
import toast from "react-hot-toast";

interface CreateAddToNoteDialogProps {
  page: string;
  updateHistory?: () => void;
  description: string | undefined;
  addToNoteShow: boolean;
  setAddToNoteShow: (item: boolean) => void;
  singleHistoryDatas: HistoryData | any;
  noteTitle?: string;
}
interface SaveDocument {
  data: NotesAndBookmarksItem;
  message: string;
  success: boolean;
}

interface CreateNoteBody {
  type: "note";
  document_id: number | string;
  folder_id: number | string;
  workspace_id?: number | string;
  user_id?: number | string;
  title: string;
  members: Member[];
  description: string | null | undefined;
  web_search_id?: number | undefined;
  creative_thinking_id?: number | undefined;
  outline_id?: number | undefined;
  topic_analysis_id?: number | undefined;
  project_id?: string | undefined;
}

const AddToNoteDialog: React.FC<CreateAddToNoteDialogProps> = ({
  page,
  singleHistoryDatas,
  updateHistory,
  description,
  addToNoteShow,
  setAddToNoteShow,
  noteTitle,
}) => {
  const { socket } = useSocket();
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState<string>("Untitled Document");
  const [loading, setLoading] = useState(false);
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const { notesBookmarksFolderList } = useSelector(
    (state: RootState) => state.notesbookmarks
  );
  const userInfo = useSelector((state: RootState) => state.user.user?.user);
  const [activeFolder, setActiveFolder] = useState({
    name: "Root",
    id: "0",
    project_id: "",
    project_name: "",
  });
  const [projectName, setProjectName] = useState("");
  const { project } = useSelector((state: any) => state?.project);
  const [allNotesBookmarksFolderList, setAllNotesBookmarksFolderList] =
    useState<any>([]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const descriptionNew = await markdownToHTML(description);
      const id = uuidv4();
      const project_id =
        typeof activeFolder?.id === "string"
          ? activeFolder?.id
          : activeFolder?.project_id;

      const body: CreateNoteBody = {
        project_id: project_id,
        type: "note",
        document_id: id,
        user_id: userInfo?.id,
        description: descriptionNew,
        folder_id: typeof activeFolder?.id === "string" ? 0 : activeFolder?.id,
        workspace_id: workspace?.id,
        title,
        members: [
          {
            email: userInfo?.email,
            role: "Owner",
          },
        ],
      };

      const projectName = notesBookmarksFolderList?.find(
        (item: any) => item?.id === project_id
      );
      setProjectName(projectName?.name);
      if (singleHistoryDatas) {
        if (page === "web-search" && singleHistoryDatas?.id) {
          body.web_search_id = singleHistoryDatas.id;
        } else if (page === "creative-thinking" && singleHistoryDatas?.id) {
          body.creative_thinking_id = singleHistoryDatas.id;
        } else if (page === "topic-analysis" && singleHistoryDatas?.id) {
          body.topic_analysis_id = singleHistoryDatas.id;
        } else {
          body.outline_id = singleHistoryDatas.id;
        }
      }

      if (socket) {
        socket.emit("document_id", id);
        socket.emit("save-document", id, body);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("update-save-document", (content: SaveDocument) => {
        if (content?.success) {
          setLoading(false);
          setAddToNoteShow(false);
          toast.success(
            `Your note has been added succesfully in "${projectName}" project knowledge bank.`
          );
          updateHistory && updateHistory();
        }
      });
      return () => {
        socket.off("update-save-document");
      };
    }
  }, [socket, projectName]);

  useEffect(() => {
    async function fetchFolderList() {
      const workspaceId = workspace?.id
        ? workspace?.id
        : localStorage.getItem("currentWorkspace");
      await dispatch(fetchFolderListApi({ id: workspaceId }));
    }
    fetchFolderList();
  }, [dispatch, workspace?.id]);

  useEffect(() => {
    if (noteTitle) {
      setTitle(noteTitle);
    }
  }, [addToNoteShow]);

  useEffect(() => {
    if (notesBookmarksFolderList?.length && project?.id) {
      const sortedList = [...notesBookmarksFolderList].sort((a, b) => {
        return a.id === project.id ? -1 : b.id === project.id ? 1 : 0;
      });
      setAllNotesBookmarksFolderList(sortedList);
    }
  }, [project?.id, notesBookmarksFolderList?.length]);

  return (
    <Dialog open={addToNoteShow} onOpenChange={() => setAddToNoteShow(false)}>
      <DialogContent className="max-w-[700px] max-h-full overflow-y-auto">
        <div>
          <DialogHeader className="mb-3">Select folder</DialogHeader>
          <div>
            <RecursiveDropdown
              activeFolder={activeFolder}
              setActiveFolder={setActiveFolder}
              menuData={allNotesBookmarksFolderList}
            />
            <div className="flex flex-col mt-3">
              <label htmlFor="title" className="text-[14px]">
                Title
              </label>
              <input
                value={title}
                id="name"
                name="name"
                placeholder="Enter a title"
                onChange={(e) => setTitle(e.target.value)}
                className=" mb-4 mt-1 p-2 text-darkGray font-size-normal font-normal rounded-lg h-[32px] w-full bg-inputBg border border-inputBorder shadow-sm focus:border-gray-400 focus:outline-none transition duration-200 ease-in-out"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-3 !justify-between">
            <div className="text-[14px] w-[60%]">
              <span>
                This document will be stored under the{" "}
                <span className="text-[#0E70FF] font-bold underline">
                  {activeFolder?.name}
                </span>{" "}
                {typeof activeFolder?.id === "string" ? "project" : "folder"}
                {` in the 'knowledge bank' screen`}
              </span>
            </div>
            <div className="flex gap-2 justify-end knowledge-bankitems-center">
              <Button
                onClick={() => setAddToNoteShow(false)}
                className="rounded-[26px] text-[#0E70FF] border-[#0E70FF] h-9 dark:bg-transparent hover:bg-transparent hover:text-[#0E70FF]"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="rounded-[26px] btn text-white h-9 w-20"
              >
                {loading ? (
                  <LoaderCircle className="animate-spin h-5 w-5 mx-auto" />
                ) : (
                  <>
                    <span className="text-nowrap">Save</span>
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToNoteDialog;
