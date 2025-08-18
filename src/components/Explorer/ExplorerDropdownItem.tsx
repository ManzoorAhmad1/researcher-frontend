import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { MdOutlineFileDownload } from "react-icons/md";
import {
  MoreVertical,
  Pencil,
  Share2,
  Star,
  Tag,
  Trash,
  Move,
  MessageSquare,
  RotateCcw,
  History,
  Check,
  ScanEye,
  CalendarIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { DeleteItemButton } from "./DeleteItemButton";
import { MoveItemButton } from "./move/MoveItemButton";
import { EditItemButton } from "./EditItemButton";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import { AddTagsButton } from "./AddTagsButton";
import { folderAiChatDialog } from "@/reducer/services/folderSlice";
import { ExportItemButton } from "./ExportItemButton";
import { getMoveData, updateFileStatus } from "@/apis/explore";
import toast from "react-hot-toast";
import { favorites } from "@/apis/favorites/favorites";
import { TEMPLATE_PRIVACY } from "@/constant";
import ReminderDialog from "../coman/ReminderDailog";
interface ExplorerDropdownItemProps {
  itemId: any;
  itemName: any;
  fetchFolders?: any;
  data?: any;
  itemType?: "file" | "folder" | any;
  files?: any;
  ai_loading?: string;
  handleChangeHistory?: (fileId: string, type: string) => void;
  authorName?: string | null;
  handlePrivacyChange?: (status: string, id: number) => void;
  itemIsPrivate?: boolean;
  folder?: any;
}

export const ExplorerDropdownItem: React.FC<ExplorerDropdownItemProps> = ({
  itemId,
  itemName,
  fetchFolders,
  data,
  itemType,
  handleChangeHistory,
  authorName,
  handlePrivacyChange,
  itemIsPrivate,
  folder,
}) => {
  const pathname = usePathname();
  const currentProject = useSelector((state: any) => state?.project);
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isMoveDataLoading, setIsMoveDataLoading] = useState<boolean>(false);
  const [allData, setAllData] = useState<any>(null);
  const dispatch = useDispatch();
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const userId = useSelector((state: any) => state.user?.user?.user?.id);


  const router = useRouter();
  const handleNavigate = () => {
    if (itemType === "folder") {
      dispatch(folderAiChatDialog({ show: true, id: itemId , folder: folder}));
    } else {
      router.push(`/info/${itemId}?tab=chat`);
    }
  };

  const handleFavorites = async () => {
    try {
      const result: any = await favorites({
        itemId: itemId.toString(),
        itemType,
        author_name: authorName,
      });

      if (result?.data?.isSuccess) {
        toast.success(result?.data?.message);
      } else {
        toast.error(
          result?.response?.data?.message ||
            result?.message ||
            "An error occurred."
        );
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || error?.message || "An error occurred."
      );
    }
  };

  const handleFileRenanlyze = async () => {
    try {
      const projectId: any =
        currentProject?.project?.id && currentProject?.project?.id !== null
          ? currentProject?.project?.id
          : localStorage.getItem("currentProject");
      const response = await updateFileStatus(
        { data: { file_status: "reanalyz paper" }, projectId },
        itemId
      );

      if (response) {
        fetchFolders?.(true).then(() => {
          toast.success(response?.data?.message);
        });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message);
    }
  };

  const sharePDF = () => {
    const newUrl = `${window.location.origin}${pathname}?file_id=${itemId}`;
    navigator.clipboard
      .writeText(newUrl)
      .then(() => {
        toast.success("PDF URL successfully copied to clipboard!");
        router.push(newUrl);
      })
      .catch((err) => {
        console.error("Could not copy URL: ", err);
      });
  };
  const getLastItemFromUrl = (url: string) => {
    const parts = url.replace(/\/$/, "").split("/");
    return parseInt(parts[parts.length - 1]);
  };
  const handleMove = async () => {
    try {
      const lastItem = getLastItemFromUrl(pathname);
      const folderId = pathname.startsWith("/explorer")
        ? typeof lastItem === "number"
          ? lastItem
          : ""
        : "";
      setIsMoveDialogOpen(true);
      setIsMoveDataLoading(true);

      const response = await getMoveData({
        projectId: currentProject?.project?.id,
      });
      setAllData(response?.data);
    } catch (error) {
      console.log(error, "erroraaaaaaaa");
    } finally {
      setIsMoveDataLoading(false);
    }
  };

const [isReminderDialogOpen, setIsReminderDialogOpen] = useState<boolean>(false);


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-5 border-none  bg-transparent rounded-full focus:bg-[#0E70FF33]  transition duration-200 ease-in-out"
            onClick={handleDropdownClick}
          >
            <MoreVertical className=" opacity-30  h-[18px] w-[18px]" />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onClick={handleDropdownClick}
          className="p-4 bg-inputBackground "
        >
          {itemType !== "folder" && (
            <DropdownMenuItem
              onSelect={() => setIsAddTagDialogOpen(true)}
              className="gap-3 font-size-normal font-normal text-lightGray"
            >
              <Tag className="h-[18px] w-[18px] " color="#666666" /> Manage tags
            </DropdownMenuItem>
          )}
          {itemType !== "folder" && (<DropdownMenuItem
            onSelect={() => setIsReminderDialogOpen(true)}
            className="gap-3 font-size-normal font-normal text-lightGray"
          >
            <CalendarIcon className="h-[18px] w-[18px] " color="#666666" /> Manage Reminders
          </DropdownMenuItem>)}

          <DropdownMenuItem
            className="gap-2 font-size-normal font-normal text-lightGray"
            onClick={() => handleFavorites()}
          >
            <Star className="h-[18px] " color="#666666" /> Add to favorites
          </DropdownMenuItem>

          {itemType !== "folder" && (<DropdownMenuItem
            className="gap-3 font-size-normal font-normal text-lightGray"
            onClick={() => sharePDF()}
          >
            <Share2 className="h-[18px] w-[18px]" color="#666666" /> Share
          </DropdownMenuItem>)}

          <DropdownMenuItem
            onSelect={() => setIsEditDialogOpen(true)}
            className="gap-3 font-size-normal font-normal text-lightGray"
          >
            <Pencil className="h-[18px] w-[18px]" color="#666666" /> Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => handleMove()}
            className="gap-3 font-size-normal font-normal text-lightGray"
          >
            <Move className="h-[18px] w-[18px]" color="#666666" /> Move
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setIsDeleteDialogOpen(true)}
            className="gap-3 font-size-normal font-normal text-lightGray"
          >
            <Trash className="h-[18px] w-[18px]" color="#666666" /> Delete
          </DropdownMenuItem>
          {itemType !== "folder" && (
            <DropdownMenuItem
              onSelect={() => setIsExportOpen(true)}
              className="gap-3  font-size-normal font-normal text-lightGray"
            >
              <MdOutlineFileDownload
                className="h-[18px] w-[18px] rotate-180"
                color="#666666"
              />{" "}
              Export
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            onSelect={() => handleNavigate()}
            className="gap-3 cursor-pointer font-size-normal font-normal text-lightGray"
          >
            <MessageSquare className="h-[18px] w-[18px]" color="#666666" /> AI
            Chat
          </DropdownMenuItem>
          {itemType !== "folder" && (
            <DropdownMenuItem
              onSelect={() => handleFileRenanlyze()}
              className="gap-3 cursor-pointer font-size-normal font-normal text-lightGray"
          >
              <RotateCcw className="h-[18px] w-[18px]" color="#666666" />{" "}
              Reanalyze
            </DropdownMenuItem>
          )}

          {!!handleChangeHistory && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-3 cursor-pointer font-size-normal font-normal text-lightGray">
                <History
                  style={{ height: "18px", width: "18px" }}
                  color="#CCCCCC"
                />{" "}
                Activity Timeline...
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-4 bg-inputBackground">
                <DropdownMenuItem
                  onClick={() => handleChangeHistory?.(itemId, "day")}
                >
                  Day
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleChangeHistory?.(itemId, "week")}
                >
                  Week
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleChangeHistory?.(itemId, "month")}
                >
                  Month
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleChangeHistory?.(itemId, "year")}
                >
                  Year
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}

          {!!handleChangeHistory && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-3 cursor-pointer font-size-normal font-normal text-lightGray">
                <ScanEye
                  style={{ height: "18px", width: "18px" }}
                  color="#CCCCCC"
                />{" "}
                Privacy
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-4 bg-inputBackground">
                {TEMPLATE_PRIVACY.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => handlePrivacyChange?.(item.value, itemId)}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span>{item?.label}</span>
                      {item.value === String(itemIsPrivate) && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AddTagsButton
        fetchFolders={fetchFolders}
        itemId={itemId}
        isOpen={isAddTagDialogOpen}
        onOpenChange={setIsAddTagDialogOpen}
      />
      { isReminderDialogOpen && <ReminderDialog 
        isOpen={isReminderDialogOpen}
        onOpenChange={setIsReminderDialogOpen}
        paperTitle={itemName}
        itemType={itemType}
        itemId={itemId}
        userId={userId}
        type="paper"
      />}
     

      <DeleteItemButton
        fetchFolders={fetchFolders}
        itemType={itemType}
        itemId={itemId}
        itemName={itemName}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        data={data}
      />

      <EditItemButton
        fetchFolders={fetchFolders}
        itemType={itemType}
        itemId={itemId}
        itemName={itemName}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
      <MoveItemButton
        fetchFolders={fetchFolders}
        itemType={itemType}
        data={data}
        moveData={allData}
        itemId={itemId}
        itemName={itemName}
        isOpen={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        isMoveDataLoading={isMoveDataLoading}
      />

      {isExportOpen && (
        <ExportItemButton
          data={data}
          itemId={itemId}
          itemName={itemName}
          isOpen={isExportOpen}
          onOpenChange={setIsExportOpen}
        />
      )}
    </>
  );
};
