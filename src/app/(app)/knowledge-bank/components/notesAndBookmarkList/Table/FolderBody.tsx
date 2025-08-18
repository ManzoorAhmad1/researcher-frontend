import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { File, Folder, MoreVertical, Pencil, Star, Trash } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next-nprogress-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useParams, usePathname } from "next/navigation";
import { FolderBodyProps } from "../../../utils/types";
import { useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/reducer/store";
import {
  folderAddToFavorite,
  getRefetchNotesBookmarkAllData,
  moveFile,
} from "@/reducer/notes-bookmarks/notesBookmarksSlice";
import { moveFileToFolder, notesBookmarksFolder, updateKnoledgeBankFolder } from "@/apis/notes-bookmarks";
import toast from "react-hot-toast";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { FavoriteIcon } from "../../../icons";
import Link from "next/link";
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Tooltip,
} from "@/components/ui/tooltip";
import { OptimizedImage } from "@/components/ui/optimized-image";

const Folderbody = ({
  item,
  handleEdite,
  tableColumns,
  selectedItems,
  setDeleteDialogInfo,
  setSelectedItems,
}: FolderBodyProps) => {
  const supabase: SupabaseClient = createClient();
  const router = useRouter();
  const params = useParams();
  const { slug } = params;
  const dispatch = useDispatch<AppDispatch>();
  const pathName = usePathname();
  const { workspace } = useSelector((state: RootState) => state.workspace);
  const { project } = useSelector((state: any) => state?.project);
  const [moveLoading, setMoveLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [moveProgress, setMoveProgress] = useState(0);

  const [{ isOver }, drop] = useDrop({
    accept: "noteBookmarks",
    drop: async (dropItem) => {
      const ids = Array.isArray(dropItem) && dropItem?.length > 0 && dropItem?.map((item) => item?.id);
      dispatch(moveFile(ids));
      setSelectedItems([]);

      // Start progress animation
      setMoveLoading(true);
      setIsCompleting(false);
      setMoveProgress(0);

      const startTime = Date.now();
      const animationDuration = 8000;
      let lastUpdateTime = startTime;

      const progressInterval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const timeDelta = currentTime - lastUpdateTime;
        lastUpdateTime = currentTime;

        const targetProgress = Math.min((elapsed / animationDuration) * 45, 45);

        setMoveProgress((prev) => {
          let increment;
          if (prev < 10) {
            increment = Math.min(targetProgress - prev, timeDelta * 0.007);
          } else if (prev < 25) {
            increment = Math.min(targetProgress - prev, timeDelta * 0.009);
          } else if (prev > 40) {
            increment = Math.min(targetProgress - prev, timeDelta * 0.01);
          } else {
            increment = Math.min(targetProgress - prev, timeDelta * 0.012);
          }
          return Math.min(prev + increment, targetProgress);
        });

        if (elapsed >= animationDuration) {
          clearInterval(progressInterval);
        }
      }, 40);

      try {
        const data = await moveFileToFolder(ids, item?.id);
        const body = { workspace_id: workspace?.id, project_id: project?.id };

        clearInterval(progressInterval);

        // Complete progress animation
        setMoveProgress(60);
        setTimeout(() => setMoveProgress(68), 800);
        setTimeout(() => setMoveProgress(75), 1600);
        setTimeout(() => setMoveProgress(82), 2400);
        setTimeout(() => setMoveProgress(88), 3200);
        setTimeout(() => setMoveProgress(94), 4000);
        setTimeout(() => {
          setMoveProgress(100);
          setIsCompleting(true);
        }, 5000);

        if (data.success) {
          dispatch(
            getRefetchNotesBookmarkAllData({
              id: slug?.length > 0 ? slug[slug.length - 1] : 0,
              currentPage: 1,
              perPageLimit: 10,
              body,
            })
          );
          toast.success(data?.message);

          setTimeout(() => {
            setMoveLoading(false);
            setMoveProgress(0);
          }, 600);
        }
      } catch (error: any) {
        clearInterval(progressInterval);
        setMoveProgress(75);
        setTimeout(() => setMoveProgress(85), 300);
        setTimeout(() => setMoveProgress(92), 600);
        setTimeout(() => {
          setMoveProgress(100);
          setIsCompleting(true);
        }, 900);

        setTimeout(() => {
          toast.error(error?.response?.data?.message);
          setTimeout(() => {
            setMoveLoading(false);
            setMoveProgress(0);
          }, 1000);
        }, 1800);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const handleCheckboxChange = (id: string, type: string) => {
    setSelectedItems((prev: { id: string; type: string }[]) =>
      prev.some((item) => item.id === id)
        ? prev.filter((item) => item.id !== id)
        : [...prev, { id, type }]
    );
  };

  const addToFavorite = async (id: string) => {
    try {
      
        const response = await notesBookmarksFolder(Number(id));
        const currentData = response?.data;
      if (response?.isSuccess == false) {
        console.error("Error fetching current favorite status:", response?.message);
        return;
      }

      const isCurrentlyFavorite = currentData?.favorite;

      const newFavoriteState = !isCurrentlyFavorite;

      if (newFavoriteState) {
        toast.success("Add to favorite successfully");
      }

      
        const data = await updateKnoledgeBankFolder(id.toString(), { favorite: newFavoriteState });

      if (data?.isSuccess == false) {
        console.error("Error toggling favorite status:", data?.message);
        return;
      }

      dispatch(folderAddToFavorite(id));
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div className={`relative group transition-all  rounded-lg overflow-hidden border border-transparent ${isOver ? " border-1 border-blue-500 bg-blue-100 " : ""
      }`}
      ref={drop as any}
    >
      <div className=" w-full bg-white dark:bg-[#202D32] rounded-lg shadow  border border-tableBorder px-[13px] py-[11px]">

        <div className="flex items-center justify-between w-full ">
          <div className="flex items-center gap-[7px]">
            <div className="mt-1">

              <Checkbox
                checked={selectedItems?.some((selected: any) => selected.id === item.id)}
                onCheckedChange={() => handleCheckboxChange(item.id, item.type)}
                aria-label={`Select ${item.id}`}
              />
            </div>

            <Link href={`/knowledge-bank/${item.id}`}>
              <span className=" flex items-center flex-col justify-center w-[26px] h-[26px] p-[6px] bg-[rgb(245_222_20_0.23)] rounded-[6px]  folder-col">
                <OptimizedImage
                   src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/Expfolder.svg`}
                  alt="folder icon"
                  width={15}
                  height={15}
                />

              </span>
            </Link>

            <Link href={`/knowledge-bank/${item.id}`}>
              <div className="flex flex-col flex-1 min-w-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="w-full max-w-[160px] text-[12px] font-normal text-[#333333] dark:text-white truncate">
                        {item?.folder_name || item?.name}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="border notification-break border-tableBorder text-left max-h-[150px] overflow-y-auto run  w-[300px] font-size-small z-10 mt-6 rounded-sm bg-headerBackground px-2 py-2 text-darkGray transition-opacity duration-200 group-hover:opacity-100">
                      <span className="text-[12px] font-normal text-[#333333] dark:text-white truncate">
                        {item?.folder_name || item?.name}
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </Link>
          </div>



        <div className="flex items-center gap-[2px]">
          <span className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-[10px] font-medium rounded-full shadow-lg border-2 border-white transition-all duration-200">
            {item?.folderDataLength || 0}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="h-[18px] w-[18px] border-none bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
              >
                <MoreVertical className="h-[18px] w-[18px] text-[#999999]" />
                <span className="sr-only">Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="p-2 bg-inputBackground border border-borderColor text-lightGray"
            >
              <DropdownMenuItem
                className="gap-3 font-size-normal font-normal text-lightGray cursor-pointer"
                onClick={() =>
                  setDeleteDialogInfo({
                    id: item?.id,
                    show: true,
                    name: item?.folder_name,
                    type: "folder",
                  })
                }
              >
                <Trash className="h-[18px] w-[18px]" color="#CCCCCC" /> Delete
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleEdite(item, "folder")}
                className="gap-3 font-size-normal font-normal text-lightGray cursor-pointer"
              >
                <Pencil className="h-[18px] w-[18px]" color="#CCCCCC" /> Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                className="gap-2 font-size-normal font-normal text-lightGray cursor-pointer"
                onClick={() => addToFavorite(item?.id)}
              >
                {item.favorite ? (
                  <FavoriteIcon />
                ) : (
                  <Star className="h-[18px] w-[18px]" color="#CCCCCC" />
                )}
                <span>Add to favorites</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>


        {moveLoading && (
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-800 ${isCompleting
                  ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                  : "bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.3)]"
                }`}
              style={{
                width: `${moveProgress}%`,
                transitionTimingFunction: "cubic-bezier(0.22, 0.61, 0.36, 1)",
                transition: "width 800ms, background-color 600ms",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Folderbody;
